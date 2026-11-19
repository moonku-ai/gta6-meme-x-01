// TDD test FIRST (RED before main.ts exists): main.ts must copy POST.json
// from the bot dir to the output dir byte-for-byte, and fail loudly when absent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const mainTs = join(repoRoot, 'main.ts');

function runMain(botDir, outDir) {
  return spawnSync('node', [mainTs], {
    env: { ...process.env, MAKEFUN_BOT_DIR: botDir, MAKEFUN_OUTPUT_DIR: outDir },
    encoding: 'utf8',
  });
}

test('copies POST.json byte-for-byte to the output dir', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'meme-test-'));
  try {
    const botDir = join(tmp, 'bot');
    const outDir = join(tmp, 'out');
    mkdirSync(botDir, { recursive: true });
    const fixture = '{"url": "https://x.com/moonkuai/status/1234567890123456789"}\n';
    writeFileSync(join(botDir, 'POST.json'), fixture);
    const res = runMain(botDir, outDir);
    assert.equal(res.status, 0, `main.ts failed: ${res.stderr}`);
    assert.equal(readFileSync(join(outDir, 'POST.json'), 'utf8'), fixture);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('exits non-zero when POST.json is missing', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'meme-test-'));
  try {
    const botDir = join(tmp, 'bot');
    mkdirSync(botDir, { recursive: true });
    const res = runMain(botDir, join(tmp, 'out'));
    assert.notEqual(res.status, 0, 'should fail without POST.json');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
