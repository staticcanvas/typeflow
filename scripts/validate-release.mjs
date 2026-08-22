/**
 * @fileoverview Validates release bundles, archives, download metadata, and URLs.
 * @module scripts/validate-release
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const packageName = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'))
  .name.split('/')
  .pop();
const packageRoot = resolve(projectRoot, process.argv[2] || `dist/${packageName}`);
const bundleRoot = join(packageRoot, 'dist');

const requiredBundles = [
  `${packageName}.js`,
  `${packageName}.min.js`,
  `${packageName}.cjs`,
  `${packageName}.mjs`,
  `${packageName}.esm.js`,
];
const files = existsSync(bundleRoot) ? readdirSync(bundleRoot) : [];
const missingBundles = requiredBundles.filter((file) => !files.includes(file));
const archives = files.filter((file) => file.endsWith('.zip') || file.endsWith('.tar.gz'));

if (missingBundles.length) {
  throw new Error(
    `Release artifact validation failed: missing bundles [${missingBundles.join(', ')}].`
  );
}

const downloadsPagePath = join(projectRoot, 'docs/content/downloads.md');
if (existsSync(downloadsPagePath)) {
  const downloadsPage = readFileSync(downloadsPagePath, 'utf8');
  for (const marker of ['Release Packages', 'Distribution Archives', 'CDN Direct Links']) {
    if (!downloadsPage.includes(marker)) {
      throw new Error(`Downloads page is missing metadata section: ${marker}`);
    }
  }
}

const releaseDataPath = join(projectRoot, 'docs/data/releases.json');
if (existsSync(releaseDataPath)) {
  const releaseData = JSON.parse(readFileSync(releaseDataPath, 'utf8'));
  if (!Array.isArray(releaseData.versions)) {
    throw new Error('Release metadata must contain a versions array.');
  }
  for (const version of releaseData.versions) {
    if (!version.version || !version.release_url || !Array.isArray(version.assets)) {
      throw new Error('Each release metadata entry requires version, release_url, and assets.');
    }
    for (const asset of version.assets) {
      if (!asset.name || !/^https:\/\//.test(asset.url)) {
        throw new Error(`Invalid release asset URL for ${version.version}.`);
      }
    }
  }
}

console.log(
  `Release validation passed: ${requiredBundles.length} required bundles and ${archives.length} archives.`
);
