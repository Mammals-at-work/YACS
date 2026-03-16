import fs from 'fs';
import path from 'path';
import { header, success, error, log, colors } from './ui.js';
import { t } from './i18n.js';

// Copy skill folder to destination
export function copySkill(skillPath, destPath) {
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }

  const skillName = path.basename(skillPath);
  const skillDestPath = path.join(destPath, skillName);

  if (fs.existsSync(skillDestPath)) {
    fs.rmSync(skillDestPath, { recursive: true, force: true });
  }

  fs.cpSync(skillPath, skillDestPath, { recursive: true });

  return skillDestPath;
}

// Copy agent AGENT.md to destination as <agentname>.md
export function copyAgent(agentPath, destPath) {
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }

  const agentName = path.basename(agentPath);
  const srcFile = path.join(agentPath, 'AGENT.md');
  const destFile = path.join(destPath, `${agentName}.md`);

  fs.copyFileSync(srcFile, destFile);
  return destFile;
}

// Install skills to destination
export async function installSkills(selected, skillsPath) {
  header(t('installing'));

  for (const skill of selected) {
    try {
      copySkill(skill.path, skillsPath);
      success(`${skill.category}/${skill.name}`);
    } catch (err) {
      error(`${skill.category}/${skill.name}: ${err.message}`);
    }
  }

  log(`${t('installedAt')}:`);
  log(`  ${colors.bright}${skillsPath}${colors.reset}\n`);
}

// Install agents to destination
export async function installAgents(selected, agentsPath) {
  header(t('installingAgents'));

  for (const agent of selected) {
    try {
      copyAgent(agent.path, agentsPath);
      success(agent.name);
    } catch (err) {
      error(`${agent.name}: ${err.message}`);
    }
  }

  log(`${t('agentsInstalledAt')}:`);
  log(`  ${colors.bright}${agentsPath}${colors.reset}\n`);
}
