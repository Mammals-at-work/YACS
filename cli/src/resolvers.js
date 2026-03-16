import fs from 'fs';
import path from 'path';
import { parseArgs as nodeParseArgs } from 'util';
import { CLI_TARGETS, SKILLS_ROOT, HOME_DIR } from './config.js';
import { log, header, info, error, colors } from './ui.js';
import { getSkillDescription } from './discovery.js';
import { t } from './i18n.js';

export function parseArgs(argv = process.argv.slice(2)) {
  try {
    const { values } = nodeParseArgs({
      args: argv,
      options: {
        language: { type: 'string', short: 'l' },
        cli: { type: 'string', short: 'c' },
        path: { type: 'string', short: 'p' },
        skills: { type: 'string', short: 's' },
        agents: { type: 'string', short: 'a' },
        list: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
      strict: false,
      allowPositionals: true,
    });

    const unattended = !!(values.language || values.cli || values.path || values.skills || values.agents || values.list);

    return {
      unattended,
      help: !!values.help,
      list: !!values.list,
      language: values.language || null,
      cli: values.cli || null,
      path: values.path || null,
      skills: values.skills || null,
      agents: values.agents || null,
    };
  } catch (err) {
    error(`${t('error')}: ${err.message}`);
    process.exit(1);
  }
}

export function printHelp() {
  const help = `
Usage:
  yacs                                    Interactive mode (default)
  yacs [options]                          Unattended mode

Options:
  -l, --language <code>   Language code (en, es, ca, eu, gl, an, ja)
  -c, --cli <target>      Target CLI: claude, gemini, codex, copilot (default: claude)
  -p, --path <path>       Install path: 'home' or an existing directory
  -s, --skills <spec>     Skills to install (see below)
  -a, --agents <spec>     Agents to install: 'all' or comma-separated names
      --list              List all available skills and agents and exit
  -h, --help              Show this help message

Skill spec syntax:
  all                     Install all available skills
  skill1,skill2           Install specific skills by name
  @category               Install all skills in a category
  category:skill          Install a specific skill from a category
  @cat1,skill2            Mix category and individual selections

Agent spec syntax:
  all                     Install all available agents
  agent1,agent2           Install specific agents by name

Examples:
  yacs --path home --skills all
  yacs --path home --agents all
  yacs --cli gemini --path home --skills all --agents all
  yacs -c codex -p home -s @development,code-reviewer
  yacs -p home -a backend-expert,security-expert
  yacs --cli copilot --path /my/project --skills development:gamify
  yacs --list
  yacs --language es --path home --skills all
  yacs --help
`;
  console.log(help);
}

export function printList(allSkills, allAgents) {
  header('Available Skills');
  const byCategory = {};

  for (const [category, skillNames] of Object.entries(allSkills)) {
    byCategory[category] = [];
    for (const skillName of skillNames) {
      const skillPath = path.join(SKILLS_ROOT, category, skillName);
      const description = getSkillDescription(skillPath);
      byCategory[category].push({ name: skillName, description });
    }
  }

  for (const [category, skills] of Object.entries(byCategory)) {
    log(`\n${colors.yellow}${category}${colors.reset}`);
    for (const skill of skills) {
      const desc = skill.description ? ` - ${skill.description}` : '';
      log(`  • ${skill.name}${desc}`);
    }
  }

  header('Available Agents');
  for (const agent of allAgents) {
    const desc = agent.description ? ` - ${agent.description}` : '';
    log(`  • ${agent.name}${desc}`);
  }
  log('');
}

export function resolveCli(rawCli) {
  if (!rawCli) {
    return CLI_TARGETS.claude;
  }

  const key = rawCli.toLowerCase();
  if (!CLI_TARGETS[key]) {
    const validTargets = Object.keys(CLI_TARGETS).join(', ');
    throw new Error(`${t('unknownCliTarget')}: '${rawCli}'. ${t('validCliTargets')}: ${validTargets}`);
  }

  return CLI_TARGETS[key];
}

export function resolveInstallPath(rawPath, cliTarget = CLI_TARGETS.claude) {
  if (!rawPath) {
    throw new Error('--path is required in unattended mode');
  }

  const homeDir = cliTarget.homeDir;

  if (rawPath === 'home') {
    return {
      skillsPath: path.join(HOME_DIR, homeDir, 'skills'),
      agentsPath: path.join(HOME_DIR, homeDir, 'agents'),
      source: 'home',
    };
  }

  const resolvedPath = path.resolve(rawPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Path does not exist: ${resolvedPath}`);
  }

  return {
    skillsPath: path.join(resolvedPath, homeDir, 'skills'),
    agentsPath: path.join(resolvedPath, homeDir, 'agents'),
    source: 'custom',
  };
}

export function resolveSkills(rawSkills, allSkills) {
  if (!rawSkills) {
    throw new Error('--skills is required in unattended mode');
  }

  const tokens = rawSkills.split(',').map(t => t.trim());
  const selected = [];
  const unrecognized = [];
  const allSkillsList = [];

  for (const [category, skillNames] of Object.entries(allSkills)) {
    for (const skillName of skillNames) {
      const skillPath = path.join(SKILLS_ROOT, category, skillName);
      const description = getSkillDescription(skillPath);
      allSkillsList.push({
        id: `${category}/${skillName}`,
        category,
        name: skillName,
        path: skillPath,
        description,
      });
    }
  }

  for (const token of tokens) {
    if (token === 'all') {
      selected.push(...allSkillsList);
    } else if (token.startsWith('@')) {
      const categoryName = token.substring(1);
      const categorySkills = allSkillsList.filter(s => s.category === categoryName);

      if (categorySkills.length === 0) {
        unrecognized.push(`@${categoryName} (category not found)`);
      } else {
        selected.push(...categorySkills);
      }
    } else if (token.includes(':')) {
      const [category, skillName] = token.split(':', 2);
      const skill = allSkillsList.find(s => s.category === category && s.name === skillName);

      if (!skill) {
        unrecognized.push(`${token} (not found)`);
      } else {
        selected.push(skill);
      }
    } else {
      const matches = allSkillsList.filter(s => s.name === token);

      if (matches.length === 0) {
        unrecognized.push(token);
      } else {
        if (matches.length > 1) {
          info(`Skill "${token}" found in ${matches.length} categories: ${matches.map(m => m.category).join(', ')}`);
        }
        selected.push(...matches);
      }
    }
  }

  if (unrecognized.length > 0) {
    throw new Error(`Unknown skills or categories: ${unrecognized.join(', ')}`);
  }

  return Array.from(new Map(selected.map(s => [s.id, s])).values());
}

export function resolveAgents(rawAgents, allAgents) {
  if (!rawAgents) {
    throw new Error('--agents is required when installing agents');
  }

  if (rawAgents === 'all') {
    return [...allAgents];
  }

  const names = rawAgents.split(',').map(n => n.trim());
  const selected = [];
  const unrecognized = [];

  for (const name of names) {
    const agent = allAgents.find(a => a.name === name);
    if (!agent) {
      unrecognized.push(name);
    } else {
      selected.push(agent);
    }
  }

  if (unrecognized.length > 0) {
    throw new Error(`${t('unattendedUnknownAgent')}: ${unrecognized.join(', ')}`);
  }

  return Array.from(new Map(selected.map(a => [a.name, a])).values());
}
