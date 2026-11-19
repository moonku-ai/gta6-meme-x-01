// gta6-meme-x-01 entry (Node 22, standard library only).
// The entry is the X post itself: this program hands the house the post's
// address by copying POST.json from the repository root to /output/POST.json,
// where the gate reads it. Nothing else is written; the two runs of this
// program must produce the same bytes, so there is no network, no clock and
// no file access outside the repository.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const source = join(BOT_DIR, 'POST.json');

if (!existsSync(source)) {
  console.error(`POST.json not found in ${BOT_DIR}; the post's address must be in POST.json before submit.`);
  process.exit(1);
}

// The gate reads the address this program copies, so a placeholder or
// malformed address must fail loudly here instead of reaching the grader.
const X_STATUS_URL = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/\d+$/;
let address;
try {
  address = JSON.parse(readFileSync(source, 'utf8')).url;
} catch {
  address = undefined;
}
if (typeof address !== 'string' || !X_STATUS_URL.test(address)) {
  console.error(`POST.json must name a real X post URL (https://x.com/<handle>/status/<id>); got: ${String(address)}.`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(source, join(OUTPUT_DIR, 'POST.json'));
