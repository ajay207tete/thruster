#!/usr/bin/env node

/**
 * Final Test Runner Script
 * Runs comprehensive tests with fixed Jest configuration
 */

const { spawn } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    log(`Running: ${command} ${args.join(' ')}`, 'cyan');

    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runTests() {
  const startTime = Date.now();

  log('🧪 Starting Comprehensive Test Suite', 'bright');
  log('=====================================', 'bright');

  try {
    // Install dependencies
    log('\n📦 Installing dependencies...', 'blue');
    await runCommand('npm', ['install', '--legacy-peer-deps']);

    // Run Jest tests with fixed configuration
    log('\n🃏 Running Jest Tests...', 'magenta');
    await runCommand('npm', ['test', '--', '--config', 'jest.config.fixed.js', '--verbose', '--coverage', '--passWithNoTests']);

    // Run smart contract tests
    log('\n🔗 Running Smart Contract Tests...', 'magenta');
    await runCommand('python', ['-m', 'pytest', '../smart-contracts/tests/test_shopping_contract_comprehensive.py', '-v']);

    // Run linting
    log('\n🔍 Running Linting...', 'yellow');
    await runCommand('npm', ['run', 'lint']);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    log('\n✅ All tests completed successfully!', 'green');
    log(`⏱️  Total execution time: ${duration}s`, 'cyan');
    log('\n📊 Test Results Summary:', 'bright');
    log('======================', 'bright');
    log('• Frontend Tests: ✅ Passed', 'green');
    log('• Smart Contract Tests: ✅ Passed', 'green');
    log('• Linting: ✅ Passed', 'green');
    log('• Code Coverage: ✅ Generated', 'green');

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    log('\n❌ Test suite failed!', 'red');
    log(`⏱️  Total execution time: ${duration}s`, 'cyan');
    log(`\n🔍 Error Details:`, 'red');
    log(error.message, 'red');

    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  log('Test Runner Help', 'bright');
  log('================', 'bright');
  log('Usage: node run-tests-final.js [options]', '');
  log('Options:', 'yellow');
  log('  --help, -h    Show this help message', 'cyan');
  log('  --watch       Run tests in watch mode', 'cyan');
  log('  --coverage    Generate coverage report', 'cyan');
  log('  --verbose     Show detailed test output', 'cyan');
  process.exit(0);
}

if (args.includes('--watch')) {
  log('👀 Running tests in watch mode...', 'yellow');
  runCommand('npm', ['test', '--', '--config', 'jest.config.fixed.js', '--watch']);
} else {
  runTests();
}
