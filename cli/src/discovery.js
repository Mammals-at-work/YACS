import fs from 'fs';
import path from 'path';
import { SKILLS_ROOT, AGENTS_ROOT } from './config.js';
import { error } from './ui.js';

// Get all skills organized by category
export function getSkills() {
  const skills = {};

  if (!fs.existsSync(SKILLS_ROOT)) {
    error(`Skills directory not found: ${SKILLS_ROOT}`);
    process.exit(1);
  }

  const categories = fs.readdirSync(SKILLS_ROOT).filter((f) => {
    return fs.statSync(path.join(SKILLS_ROOT, f)).isDirectory();
  });

  categories.forEach((category) => {
    const categoryPath = path.join(SKILLS_ROOT, category);
    const skillDirs = fs.readdirSync(categoryPath).filter((f) => {
      return fs.statSync(path.join(categoryPath, f)).isDirectory();
    });

    skills[category] = skillDirs;
  });

  return skills;
}

// Get all agents as a flat list
export function getAgents() {
  const agents = [];

  if (!fs.existsSync(AGENTS_ROOT)) {
    return agents;
  }

  const agentDirs = fs.readdirSync(AGENTS_ROOT).filter((f) => {
    return fs.statSync(path.join(AGENTS_ROOT, f)).isDirectory();
  });

  agentDirs.forEach((agentName) => {
    const agentPath = path.join(AGENTS_ROOT, agentName);
    const description = getAgentDescription(agentPath);
    agents.push({ name: agentName, path: agentPath, description });
  });

  return agents;
}

// Read skill description from SKILL.md
export function getSkillDescription(skillPath) {
  const skillMdPath = path.join(skillPath, 'SKILL.md');
  if (fs.existsSync(skillMdPath)) {
    const content = fs.readFileSync(skillMdPath, 'utf-8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('# ')) {
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim() && !lines[j].startsWith('#')) {
            return lines[j].trim().substring(0, 60);
          }
        }
      }
    }
  }
  return '';
}

// Read agent description from AGENT.md frontmatter
export function getAgentDescription(agentPath) {
  const agentMdPath = path.join(agentPath, 'AGENT.md');
  if (fs.existsSync(agentMdPath)) {
    const content = fs.readFileSync(agentMdPath, 'utf-8');
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (match) {
      const frontmatter = match[1];
      const descLine = frontmatter.split('\n').find(l => l.startsWith('description:'));
      if (descLine) {
        return descLine.replace('description:', '').trim().substring(0, 60);
      }
    }
  }
  return '';
}
