// Neon Leonida — entry program for make.fun competition gta6-trophy-guide-01.
// Node 22, standard library only. Copies app/ and screenshots/ from this repository
// into the output directory and writes /output/dossier.json with the kit's
// buildDossier library (vendor/makefun-frontend.ts, copied from the kit unchanged).
// Deterministic: the same repository always writes the same bytes — no clock,
// no randomness, no environment-dependent ordering.

import { buildDossier } from './vendor/makefun-frontend.ts';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTree(name: string): void {
  const src = join(repoRoot, name);
  const dest = join(outDir, name);
  rmSync(dest, { recursive: true, force: true });
  cpSync(src, dest, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyTree('app');
copyTree('screenshots');

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
});

writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log('Neon Leonida dossier written to ' + join(outDir, 'dossier.json'));
