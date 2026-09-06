import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const fixture = readFileSync(join(process.cwd(), 'e2e/fixtures/syntax-fixtures.md'), 'utf8');

describe('documentation syntax fixtures', () => {
  it.each(['javascript', 'typescript', 'html', 'css', 'json', 'bash', 'powershell', 'mermaid'])(
    'contains an executable %s fixture',
    (language) => {
      expect(fixture).toContain(`\`\`\`${language}\n`);
      expect(fixture.match(new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``))?.[1].trim().length).toBeGreaterThan(0);
    }
  );
});
