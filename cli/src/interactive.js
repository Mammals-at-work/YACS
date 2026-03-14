import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { CLI_TARGETS, SKILLS_ROOT, HOME_DIR } from './config.js';
import { log, header, colors } from './ui.js';
import { getSkillDescription, getAgentDescription } from './discovery.js';
import { t } from './i18n.js';

// Interactive CLI target selection
export async function selectCli() {
  header(t('selectCli'));

  const choices = Object.entries(CLI_TARGETS).map(([key, target]) => ({
    name: `${target.name} (~/${target.homeDir})`,
    value: key,
  }));

  try {
    const result = await inquirer.prompt({
      type: 'rawlist',
      name: 'cli',
      message: t('selectCliMessage'),
      choices,
    });

    const selected = result.cli;
    if (typeof selected === 'number') {
      const keys = Object.keys(CLI_TARGETS);
      return CLI_TARGETS[keys[selected]] || CLI_TARGETS.claude;
    }

    return CLI_TARGETS[selected] || CLI_TARGETS.claude;
  } catch (err) {
    if (err.isTtyError || err.message?.includes('force closed')) {
      log(`\n❌ ${t('installationCancelled')}`);
      process.exit(0);
    }
    throw err;
  }
}

// Interactive skill selection
export async function selectSkills(skills) {
  const allSkills = [];
  const choices = [];

  header(t('selectSkills'));
  log(`${colors.dim}${t('selectSkillsHint')}${colors.reset}\n`);

  let skillIndex = 0;
  for (const [category, skillNames] of Object.entries(skills)) {
    for (const skillName of skillNames) {
      const skillPath = path.join(SKILLS_ROOT, category, skillName);
      const description = getSkillDescription(skillPath);

      const skill = {
        id: `${category}/${skillName}`,
        category,
        name: skillName,
        path: skillPath,
        description,
      };

      allSkills.push(skill);

      const displayName = `${skillName} (${category})`;
      const descDisplay = description ? ` - ${description}` : '';

      choices.push({
        name: displayName + descDisplay,
        value: skillIndex,
      });

      skillIndex++;
    }
  }

  try {
    const result = await inquirer.prompt({
      type: 'checkbox',
      name: 'skills',
      message: t('selectSkillsMessage'),
      choices: choices,
      pageSize: 15,
    });

    const selectedIndices = result.skills || [];

    if (Array.isArray(selectedIndices)) {
      return selectedIndices
        .map(idx => allSkills[idx])
        .filter(skill => skill && skill.category && skill.name);
    }

    return [];
  } catch (err) {
    if (err.isTtyError || err.message?.includes('force closed')) {
      log(`\n❌ ${t('installationCancelled')}`);
      process.exit(0);
    }
    throw err;
  }
}

// Interactive agent selection
export async function selectAgents(agents) {
  header(t('selectAgents'));
  log(`${colors.dim}${t('selectAgentsHint')}${colors.reset}\n`);

  const choices = agents.map((agent, idx) => {
    const descDisplay = agent.description ? ` - ${agent.description}` : '';
    return { name: agent.name + descDisplay, value: idx };
  });

  try {
    const result = await inquirer.prompt({
      type: 'checkbox',
      name: 'agents',
      message: t('selectAgentsMessage'),
      choices,
      pageSize: 15,
    });

    const selectedIndices = result.agents || [];
    return selectedIndices.map(idx => agents[idx]).filter(Boolean);
  } catch (err) {
    if (err.isTtyError || err.message?.includes('force closed')) {
      log(`\n❌ ${t('installationCancelled')}`);
      process.exit(0);
    }
    throw err;
  }
}

// Get installation path from user (interactive)
export async function getInstallPath(cliTarget = CLI_TARGETS.claude) {
  header(t('selectLocation'));

  const homeDir = cliTarget.homeDir;

  const locChoice = await inquirer.prompt({
    type: 'rawlist',
    name: 'location',
    message: t('selectLocationMessage'),
    choices: [
      { name: `${t('homeDirectory')} (~/${homeDir})`, value: 'home' },
      { name: t('customRepository'), value: 'custom' },
    ],
  });

  const location = locChoice.location;
  const isHome = location === 'home' || location === 0 || location === '0';
  const isCustom = location === 'custom' || location === 1 || location === '1';

  if (isHome) {
    return {
      skillsPath: path.join(HOME_DIR, homeDir, 'skills'),
      agentsPath: path.join(HOME_DIR, homeDir, 'agents'),
      source: 'home',
    };
  } else if (isCustom) {
    const pathChoice = await inquirer.prompt({
      type: 'input',
      name: 'customPath',
      message: t('enterCustomPath'),
      validate(value) {
        if (!value.trim()) {
          return t('pathEmpty');
        }
        if (!fs.existsSync(value)) {
          return `${t('pathNotExists')}: ${value}`;
        }
        return true;
      },
    });

    return {
      skillsPath: path.join(pathChoice.customPath, homeDir, 'skills'),
      agentsPath: path.join(pathChoice.customPath, homeDir, 'agents'),
      source: 'custom',
    };
  }

  throw new Error(`${t('invalidSelection')}: ${location}`);
}

// Review and confirm selection before installing
export async function reviewSelection(selectedSkills, selectedAgents, installPath, cliTarget) {
  header(t('review'));

  if (cliTarget) {
    log(`${colors.bright}${t('targetCli')}:${colors.reset} ${cliTarget.name}`);
  }
  log(`${colors.bright}${t('destination')}:${colors.reset}`);
  if (selectedSkills.length > 0) {
    log(`  skills → ${installPath.skillsPath}`);
  }
  if (selectedAgents.length > 0) {
    log(`  agents → ${installPath.agentsPath}`);
  }

  if (selectedSkills.length > 0) {
    log(`\n${colors.bright}${t('totalSkills')}:${colors.reset} ${selectedSkills.length}`);

    const byCategory = {};
    selectedSkills.forEach((skill) => {
      if (!byCategory[skill.category]) byCategory[skill.category] = [];
      byCategory[skill.category].push(skill.name);
    });

    for (const [category, names] of Object.entries(byCategory)) {
      log(`${colors.yellow}${category}${colors.reset}`);
      names.forEach((name) => log(`  • ${name}`));
    }
  }

  if (selectedAgents.length > 0) {
    log(`\n${colors.bright}${t('totalAgents')}:${colors.reset} ${selectedAgents.length}`);
    selectedAgents.forEach((agent) => log(`  • ${agent.name}`));
  }

  const confirmation = await inquirer.prompt({
    type: 'confirm',
    name: 'proceed',
    message: t('proceedInstallation'),
    default: true,
  });

  return confirmation.proceed;
}
