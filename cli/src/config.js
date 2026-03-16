import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SKILLS_ROOT = path.join(__dirname, '../skills');
export const AGENTS_ROOT = path.join(__dirname, '../agents');
export const HOME_DIR = process.env.HOME || process.env.USERPROFILE;

export const CLI_TARGETS = {
  claude: { name: 'Claude Code', homeDir: '.claude' },
  gemini: { name: 'Gemini CLI', homeDir: '.gemini' },
  codex: { name: 'Codex CLI', homeDir: '.codex' },
  copilot: { name: 'GitHub Copilot', homeDir: '.copilot' },
};
