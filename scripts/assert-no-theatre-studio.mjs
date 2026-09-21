/**
 * Regression guard: fails if the Theatre.js editor leaked into a production build.
 *
 * Run after `next build`. Scans the emitted client and server output for strings
 * that only exist inside @theatre/studio, and asserts @theatre/core is present
 * so a passing run cannot be a false negative from scanning the wrong directory.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

const BUILD_DIRS = ['.next/static', '.next/server'];

/** Strings that appear only in @theatre/studio. */
const STUDIO_MARKERS = ['theatrejs-studio-root', 'Theatre.js Studio'];

/** Present whenever @theatre/core is bundled -- proves the scan can find things. */
const CORE_MARKER = 'Theatre_Sheet_PublicAPI';

async function collectFiles(dir) {
  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);

      if (entry.isDirectory()) return collectFiles(path);
      if (entry.name.endsWith('.map')) return [];

      return [path];
    }),
  );

  return nested.flat();
}

const files = (await Promise.all(BUILD_DIRS.map(collectFiles))).flat();

if (files.length === 0) {
  console.error('No build output found. Run `yarn build` first.');
  process.exit(1);
}

const contents = await Promise.all(
  files.map(async (file) => ({ file, text: await readFile(file, 'utf8') })),
);

const leaks = contents.filter(({ text }) => STUDIO_MARKERS.some((m) => text.includes(m)));
const coreFound = contents.some(({ text }) => text.includes(CORE_MARKER));

if (!coreFound) {
  console.error(
    `Scanned ${files.length} files but found no @theatre/core marker. The scan is ` +
      'not looking where Theatre code lands -- fix this script before trusting it.',
  );
  process.exit(1);
}

if (leaks.length > 0) {
  console.error('@theatre/studio leaked into the production build:');
  leaks.forEach(({ file }) => console.error(`  - ${file}`));
  process.exit(1);
}

console.log(`OK: @theatre/studio absent from ${files.length} build files (@theatre/core present).`);
