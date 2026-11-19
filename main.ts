// Neon Leonida — entry program for make.fun competition gta6-trophy-guide-01.
// Hands the guide in: copies app/ and screenshots/ from this repository to the
// output directory and writes /output/dossier.json with buildDossier from the
// kit's vendor library. Node 22, standard library only, fully deterministic:
// the same repository always writes the same bytes (no clock, no randomness).
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Start from a clean output directory so stale files can never leak in.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// The guide itself (static files) and its screenshots, copied as-is.
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

// The dossier: the scorer's own library, with this competition's caps from its
// gate (text 163,840 bytes; 3–4 screenshots of at most 256 KiB; app at most
// 993 entries and 48 MiB; paths at most 1,000 bytes).
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log('Neon Leonida: wrote dossier.json (' + dossier.length + ' bytes) to ' + outDir);
