import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const mode = process.argv[2] ?? 'all';
const repositoryRoot = resolve(import.meta.dirname, '..');

const maintainedPaths = [
  'package.json',
  'tsconfig.build.json',
  'scripts/source-hygiene.mjs',
  'scripts/http-check.mjs',
  'scripts/load-test.mjs',
  'apps/api/src/server.ts',
  'apps/api/src/rate-limit.ts',
  'apps/platform-control-api/src/server.ts',
  'apps/platform-control-api/src/store.ts',
  'apps/platform-admin/src/app/state-view.tsx',
  'apps/platform-admin/src/app/[section]/page.tsx',
  'services/audit',
  'services/identity',
  'services/integration',
  'services/notification',
  'services/operations',
  'services/reporting',
  'services/tenant',
  'services/workflow',
  'infrastructure/docker/api.Dockerfile',
  'infrastructure/docker/web.Dockerfile',
  'infrastructure/terraform/modules/ecs',
  'infrastructure/terraform/modules/platform-environment',
  'infrastructure/terraform/environments/prod',
  '.github/workflows/quality-matrix.yml',
  '.github/workflows/pr-quality-security.yml',
  '.github/workflows/integration-1-30.yml',
  '.github/workflows/security-gates.yml',
  '.github/workflows/dependency-lock.yml',
  '.github/workflows/promote.yml',
];

const textExtensions = new Set([
  '.ts',
  '.tsx',
  '.mjs',
  '.json',
  '.tf',
  '.yml',
  '.yaml',
  '.md',
  '.css',
]);

async function collect(path) {
  const absolutePath = resolve(repositoryRoot, path);
  const info = await stat(absolutePath);

  if (info.isFile()) return [absolutePath];

  const files = [];
  for (const entry of await readdir(absolutePath, { withFileTypes: true })) {
    const nested = resolve(absolutePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collect(nested)));
    } else if (entry.isFile()) {
      const extension = extname(entry.name);
      if (textExtensions.has(extension) || entry.name.endsWith('.Dockerfile')) {
        files.push(nested);
      }
    }
  }
  return files;
}

function relative(path) {
  return path.slice(repositoryRoot.length + 1).replaceAll('\\', '/');
}

function formatViolations(path, content) {
  const violations = [];

  if (content.includes('\r\n')) violations.push('CRLF line endings');
  if (!content.endsWith('\n')) violations.push('missing final newline');

  content.split('\n').forEach((line, index) => {
    if (/\s+$/.test(line)) {
      violations.push(`line ${index + 1}: trailing whitespace`);
    }
    if (line.includes('\t')) {
      violations.push(`line ${index + 1}: tab indentation`);
    }
  });

  if (extname(path) === '.json') {
    try {
      JSON.parse(content);
    } catch {
      violations.push('invalid JSON');
    }
  }

  return violations;
}

function lintViolations(path, content) {
  const violations = [];
  const rules = [
    [/@ts-ignore/, 'do not suppress TypeScript with @ts-ignore'],
    [/eslint-disable/, 'do not disable lint rules inline'],
    [/console\.log\(/, 'use structured application logging instead of console.log'],
    [/\bFIXME\b/, 'FIXME markers must be resolved before merge'],
  ];

  for (const [pattern, message] of rules) {
    if (pattern.test(content)) violations.push(message);
  }

  if (/\.(ts|tsx|mjs)$/.test(path) && /:\s*any\b|<any>|\bas any\b/.test(content)) {
    violations.push('avoid explicit any in hardened modules');
  }

  return violations;
}

const files = (
  await Promise.all(maintainedPaths.map((path) => collect(path)))
).flat();

const failures = [];

for (const file of files) {
  const content = await readFile(file, 'utf8');
  const checks = [];

  if (mode === 'format' || mode === 'all') {
    checks.push(...formatViolations(file, content));
  }
  if (mode === 'lint' || mode === 'all') {
    checks.push(...lintViolations(file, content));
  }

  for (const violation of checks) {
    failures.push(`${relative(file)}: ${violation}`);
  }
}

if (failures.length > 0) {
  console.error('Source hygiene checks failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Source hygiene ${mode} checks passed for ${files.length} maintained files.`,
);
