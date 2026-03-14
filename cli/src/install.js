#!/usr/bin/env node

import inquirer from 'inquirer';
import { t, setLanguage, getSupportedLanguages, detectSystemLanguage } from './i18n.js';
import { log, header, info, error, colors } from './ui.js';
import { getSkills, getAgents } from './discovery.js';
import { parseArgs, printHelp, resolveCli, resolveInstallPath, resolveSkills, resolveAgents, printList } from './resolvers.js';
import { selectCli, selectSkills, selectAgents, getInstallPath, reviewSelection } from './interactive.js';
import { installSkills, installAgents } from './filesystem.js';

// ============================================================================
// UNATTENDED MODE EXECUTION
// ============================================================================

async function runUnattended(args) {
  setLanguage(args.language || detectSystemLanguage());

  header(t('title'));

  const cliTarget = resolveCli(args.cli);
  info(`${t('selectedCli')}: ${cliTarget.name}\n`);

  const skills = getSkills();
  const agents = getAgents();

  if (args.list) {
    printList(skills, agents);
    process.exit(0);
  }

  if (!args.path) {
    error(t('unattendedMissingPath'));
    process.exit(1);
  }

  if (!args.skills && !args.agents) {
    error(t('unattendedMissingSkills'));
    process.exit(1);
  }

  const installPath = resolveInstallPath(args.path, cliTarget);

  let selectedSkills = [];
  if (args.skills) {
    selectedSkills = resolveSkills(args.skills, skills);
    if (selectedSkills.length === 0) {
      error(t('unattendedNoSkillsMatched'));
      process.exit(1);
    }
  }

  let selectedAgents = [];
  if (args.agents) {
    selectedAgents = resolveAgents(args.agents, agents);
    if (selectedAgents.length === 0) {
      error(t('unattendedNoAgentsMatched'));
      process.exit(1);
    }
  }

  // Display summary
  if (selectedSkills.length > 0) {
    log(`${colors.bright}${t('destination')}:${colors.reset} ${installPath.skillsPath}`);
    log(`${colors.bright}${t('totalSkills')}:${colors.reset} ${selectedSkills.length}\n`);

    const byCategory = {};
    selectedSkills.forEach((skill) => {
      if (!byCategory[skill.category]) byCategory[skill.category] = [];
      byCategory[skill.category].push(skill.name);
    });
    for (const [category, names] of Object.entries(byCategory)) {
      log(`${colors.yellow}${category}${colors.reset}`);
      names.forEach((name) => log(`  • ${name}`));
    }
    log('');
  }

  if (selectedAgents.length > 0) {
    log(`${colors.bright}${t('destination')}:${colors.reset} ${installPath.agentsPath}`);
    log(`${colors.bright}${t('totalAgents')}:${colors.reset} ${selectedAgents.length}\n`);
    selectedAgents.forEach((agent) => log(`  • ${agent.name}`));
    log('');
  }

  if (selectedSkills.length > 0) {
    await installSkills(selectedSkills, installPath.skillsPath);
  }
  if (selectedAgents.length > 0) {
    await installAgents(selectedAgents, installPath.agentsPath);
  }

  header(t('completed'));
  process.exit(0);
}

// ============================================================================
// INTERACTIVE MODE EXECUTION
// ============================================================================

async function runInteractive() {
  const detectedLang = detectSystemLanguage();
  const langChoices = Object.entries(getSupportedLanguages()).map(([code, langData]) => ({
    name: `${langData.flag}  ${langData.name}`,
    value: code,
  }));

  const langChoice = await inquirer.prompt({
    type: 'rawlist',
    name: 'language',
    message: '\nSelect language / Selecciona idioma / Aukeratu hizkuntza:',
    choices: langChoices,
    default: langChoices.findIndex(c => c.value === detectedLang),
  });

  setLanguage(langChoice.language);

  header(t('title'));

  // Step 1: Select target CLI
  const cliTarget = await selectCli();
  info(`${t('selectedCli')}: ${cliTarget.name}\n`);

  // Step 2: What to install?
  const modeChoice = await inquirer.prompt({
    type: 'rawlist',
    name: 'mode',
    message: t('installMode'),
    choices: [
      { name: t('installSkills'), value: 'skills' },
      { name: t('installAgents'), value: 'agents' },
      { name: t('installBoth'), value: 'both' },
    ],
  });

  const doSkills = modeChoice.mode === 'skills' || modeChoice.mode === 'both';
  const doAgents = modeChoice.mode === 'agents' || modeChoice.mode === 'both';

  // Step 3: Show available counts
  const skills = getSkills();
  const agents = getAgents();

  if (doSkills) {
    const totalSkills = Object.values(skills).reduce((sum, arr) => sum + arr.length, 0);
    log(`${colors.bright}${t('availableSkills')}:${colors.reset} ${totalSkills}`);
    log(`${colors.bright}${t('categories')}:${colors.reset} ${Object.keys(skills).length}`);
  }
  if (doAgents) {
    log(`${colors.bright}${t('availableAgents')}:${colors.reset} ${agents.length}`);
  }
  log('');

  // Step 4: Install path
  const installPath = await getInstallPath(cliTarget);

  // Step 5: Select skills if needed
  let selectedSkills = [];
  if (doSkills) {
    selectedSkills = await selectSkills(skills);
    if (selectedSkills.length === 0 && !doAgents) {
      error(t('noSkillsSelected'));
      process.exit(1);
    }
  }

  // Step 6: Select agents if needed
  let selectedAgents = [];
  if (doAgents) {
    selectedAgents = await selectAgents(agents);
    if (selectedAgents.length === 0 && !doSkills) {
      error(t('noAgentsSelected'));
      process.exit(1);
    }
  }

  if (selectedSkills.length === 0 && selectedAgents.length === 0) {
    error(t('noSkillsSelected'));
    process.exit(1);
  }

  // Step 7: Review and confirm
  const proceed = await reviewSelection(selectedSkills, selectedAgents, installPath, cliTarget);

  if (!proceed) {
    log(`\n❌ ${t('installationCancelled')}`);
    process.exit(0);
  }

  // Step 8: Install
  if (selectedSkills.length > 0) {
    await installSkills(selectedSkills, installPath.skillsPath);
  }
  if (selectedAgents.length > 0) {
    await installAgents(selectedAgents, installPath.agentsPath);
  }

  header(t('completed'));
  process.exit(0);
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

async function main() {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  try {
    if (args.unattended) {
      await runUnattended(args);
    } else {
      await runInteractive();
    }
  } catch (err) {
    if (err.isTtyError || err.message?.includes('force closed') || err.message?.includes('User cancelled')) {
      log(`\n❌ ${t('operationCancelled')}`);
      process.exit(0);
    }
    error(`${t('error')}: ${err.message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  error(`${t('error')}: ${err.message}`);
  process.exit(1);
});
