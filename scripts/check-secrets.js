#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const patterns = [
  ['Google API key', /AIza[0-9A-Za-z_-]{35}/g],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/g],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9_]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/g],
  ['Pinecone API key', /\bpcsk_[A-Za-z0-9_-]{20,}\b/g],
  ['OpenAI API key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/g],
  ['Private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
];

const files = execFileSync('git', ['ls-files', '-z'], { cwd: root })
  .toString('utf8')
  .split('\0')
  .filter(Boolean);
const findings = [];

for (const file of files) {
  const absolutePath = path.join(root, file);
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) continue;
  const content = fs.readFileSync(absolutePath);
  if (content.includes(0)) continue;
  const lines = content.toString('utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const [name, pattern] of patterns) {
      pattern.lastIndex = 0;
      if (pattern.test(line)) findings.push(`${file}:${index + 1}: possible ${name}`);
    }
  });
}

if (findings.length > 0) {
  console.error('Potential credentials found in tracked files:');
  findings.forEach((finding) => console.error(`  ${finding}`));
  process.exitCode = 1;
} else {
  console.log(`Secret scan passed (${files.length} tracked files checked).`);
}
