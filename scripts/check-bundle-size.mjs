/**
 * @fileoverview Checks the compressed production bundle against its size budget.
 * @module scripts/check-bundle-size
 */

import { gzipSync } from 'node:zlib';
import { existsSync, readFileSync } from 'node:fs';

const bundlePath = 'dist/typeflow/dist/typeflow.min.js';
const maxGzipBytes = 10 * 1024;

if (!existsSync(bundlePath)) {
  console.warn(`Bundle file ${bundlePath} does not exist yet. Run build first.`);
  process.exit(0);
}

const bundle = readFileSync(bundlePath);
const gzipBytes = gzipSync(bundle).byteLength;

console.log(`${bundlePath}: ${bundle.byteLength} bytes, ${gzipBytes} bytes gzip`);

if (gzipBytes > maxGzipBytes) {
  throw new Error(`Bundle exceeds the ${maxGzipBytes}-byte gzip budget.`);
}
