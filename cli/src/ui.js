export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

export function log(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

export function header(text) {
  log('\n' + '═'.repeat(60), 'cyan');
  log(`  ${text}`, 'bright');
  log('═'.repeat(60) + '\n', 'cyan');
}

export function success(text) {
  log(`✓ ${text}`, 'green');
}

export function error(text) {
  log(`✗ ${text}`, 'red');
}

export function info(text) {
  log(`ℹ ${text}`, 'blue');
}
