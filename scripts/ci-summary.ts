// Writes per-job tables to $GITHUB_STEP_SUMMARY: `tsx scripts/ci-summary.ts e2e <browser> | lighthouse`.
import { appendFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';

const [kind, arg] = process.argv.slice(2);
const out: string[] = [];

interface Spec {
  title: string;
  ok: boolean;
  tests: { projectName: string; results: { status: string }[] }[];
}
interface Suite {
  title: string;
  specs?: Spec[];
  suites?: Suite[];
}
const walk = (s: Suite, path: string[] = []): { name: string; ok: boolean }[] => [
  ...(s.specs ?? []).map((sp) => ({ name: [...path, sp.title].join(' › '), ok: sp.ok })),
  ...(s.suites ?? []).flatMap((c) => walk(c, [...path, c.title])),
];

if (kind === 'e2e') {
  const file = 'test-results/results.json';
  out.push(`### E2E (${arg})`);
  if (!existsSync(file)) out.push('No results found.');
  else {
    const report = JSON.parse(readFileSync(file, 'utf8')) as { suites: Suite[] };
    const specs = report.suites.flatMap((s) => walk(s));
    const failed = specs.filter((s) => !s.ok);
    out.push(`${specs.length - failed.length} passed, ${failed.length} failed.`);
    // Axe test titles carry the route, theme and locale; their errors name the rule.
    for (const f of failed) out.push(`- ${f.name}`);
  }
} else if (kind === 'lighthouse') {
  const file = '.lighthouseci/manifest.json';
  out.push('### Lighthouse (median run per URL)');
  if (!existsSync(file)) out.push('No results found.');
  else {
    const runs = (
      JSON.parse(readFileSync(file, 'utf8')) as {
        url: string;
        isRepresentativeRun: boolean;
        summary: Record<string, number>;
      }[]
    ).filter((r) => r.isRepresentativeRun);
    out.push(
      '| URL | Performance | Accessibility | Best practices | SEO |',
      '|---|---|---|---|---|',
    );
    for (const r of runs) {
      const s = r.summary;
      const pct = (n: number) => Math.round(n * 100);
      out.push(
        `| ${new URL(r.url).pathname} | ${pct(s.performance)} | ${pct(s.accessibility)} | ${pct(s['best-practices'])} | ${pct(s.seo)} |`,
      );
    }
  }
  if (existsSync('.lighthouseci'))
    out.push(
      '',
      `Reports: ${readdirSync('.lighthouseci').length} files in the lighthouse-report artifact.`,
    );
}

const text = out.join('\n') + '\n';
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
else console.log(text);
