/**
 * @fileoverview Fails the build if any internal link in the built Hugo site
 * is missing the site's baseURL subpath (e.g. "/typeflow"). Root-relative
 * markdown links like `/playground/?...` render correctly in local dev
 * (baseURL has no subpath there) but 404 once deployed unless a template or
 * render hook prefixes them - this is exactly what
 * docs/layouts/_default/_markup/render-link.html does for markdown links.
 * Run after a Hugo build using the real hugo.toml baseURL (not a dev-server
 * override) to catch any link that bypassed it.
 * @module scripts/validate-doc-links
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const hugoConfig = readFileSync('docs/hugo.toml', 'utf8');
const baseURLMatch = hugoConfig.match(/^baseURL\s*=\s*['"]([^'"]+)['"]/m);
if (!baseURLMatch) {
  throw new Error('Could not find baseURL in docs/hugo.toml');
}
const basePath = new URL(baseURLMatch[1]).pathname.replace(/\/$/, '');

const publicDir = 'public';
if (!existsSync(publicDir)) {
  console.warn(`${publicDir} does not exist yet. Run the Hugo build first.`);
  process.exit(0);
}

if (!basePath) {
  console.log('Site baseURL has no subpath; nothing for this check to validate.');
  process.exit(0);
}

const hrefRe = /href="(\/[^"]*)"/g;
const errors = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      walk(full);
    } else if (entry.endsWith('.html')) {
      const html = readFileSync(full, 'utf8');
      let match;
      while ((match = hrefRe.exec(html))) {
        const href = match[1];
        if (href.startsWith(`${basePath}/`) || href === basePath) continue;
        errors.push(`${full}: href="${href}" is missing the "${basePath}" base path`);
      }
    }
  }
}

walk(publicDir);

if (errors.length > 0) {
  const shown = errors.slice(0, 30);
  console.error(
    `Found ${errors.length} internal link(s) missing the "${basePath}" base path:\n- ${shown.join('\n- ')}` +
      (errors.length > shown.length ? `\n...and ${errors.length - shown.length} more.` : '')
  );
  process.exitCode = 1;
} else {
  console.log(`All internal links correctly include the "${basePath}" base path.`);
}
