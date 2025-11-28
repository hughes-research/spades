#!/usr/bin/env node
/**
 * Clean build script that suppresses informational warnings
 * Works cross-platform (Windows, macOS, Linux)
 */

const { execSync } = require('child_process');
const { EOL } = require('os');

function runCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      ...options,
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, output: error.stdout || error.message, error };
  }
}

// Filter out unwanted warnings
function filterOutput(output) {
  const lines = output.split(EOL);
  return lines
    .filter(line => {
      // Filter out baseline-browser-mapping warnings
      if (line.includes('baseline-browser-mapping')) return false;
      // Filter out empty lines at start/end
      if (line.trim() === '' && lines.indexOf(line) < 3) return false;
      return true;
    })
    .join(EOL);
}

console.log('Generating Prisma Client...');
const prismaResult = runCommand('prisma generate --no-hints');
if (!prismaResult.success) {
  console.error('Prisma generation failed:', prismaResult.output);
  process.exit(1);
}
console.log(filterOutput(prismaResult.output));

console.log('\nBuilding Next.js application...');
const buildResult = runCommand('next build', { stdio: 'pipe' });
if (!buildResult.success) {
  console.error('Build failed:', buildResult.output);
  process.exit(1);
}
console.log(filterOutput(buildResult.output));

console.log('\n✓ Build completed successfully!');

