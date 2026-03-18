import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY environment variable is required');
  process.exit(1);
}

function stripJsonFences(text) {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

// ---------------------------------------------------------------------------
// 1. Parse tools from src/data/tools.ts
// ---------------------------------------------------------------------------
function parseTools() {
  const raw = fs.readFileSync(path.join(ROOT, 'src/data/tools.ts'), 'utf-8');
  const match = raw.match(/export const tools:\s*Tool\[\]\s*=\s*(\[[\s\S]*?\n\];)/);
  if (!match) throw new Error('Could not parse tools array');
  // Convert to valid JSON-ish by evaluating with Function (safe here – our own repo file)
  const fn = new Function(`return ${match[1].replace(/;\s*$/, '')}`);
  return fn();
}

// ---------------------------------------------------------------------------
// 2. Parse comparisons from src/data/comparisons.ts
// ---------------------------------------------------------------------------
function parseComparisons() {
  const raw = fs.readFileSync(path.join(ROOT, 'src/data/comparisons.ts'), 'utf-8');
  const match = raw.match(/export const comparisons:\s*Comparison\[\]\s*=\s*(\[[\s\S]*?\n\];)/);
  if (!match) throw new Error('Could not parse comparisons array');
  const fn = new Function(`return ${match[1].replace(/;\s*$/, '')}`);
  return fn();
}

// ---------------------------------------------------------------------------
// 3. Call Claude API
// ---------------------------------------------------------------------------
async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

// ---------------------------------------------------------------------------
// 4. Build prompt for a single comparison
// ---------------------------------------------------------------------------
function buildPrompt(comparison, toolA, toolB) {
  return `You are updating a SaaS comparison website. Given these two tools:

Tool A: ${toolA.name}
- Description: ${toolA.description}
- Pricing: ${toolA.pricing}
- Features: ${toolA.features.join(', ')}
- Pros: ${toolA.pros.join(', ')}
- Cons: ${toolA.cons.join(', ')}

Tool B: ${toolB.name}
- Description: ${toolB.description}
- Pricing: ${toolB.pricing}
- Features: ${toolB.features.join(', ')}
- Pros: ${toolB.pros.join(', ')}
- Cons: ${toolB.cons.join(', ')}

Current comparison criteria labels: ${comparison.criteria.map(c => c.label).join(', ')}

Return a JSON object with exactly these fields:
{
  "summary": "2-3 sentence objective overview of both tools",
  "verdict": "3-4 sentence clear recommendation of which tool wins and for whom",
  "criteria": [
    { "label": "same label as input", "toolA": "one of: Excellent/Good/Moderate/Limited/Basic/Steep/Easy/Fast/None", "toolB": "same options" }
  ],
  "updatedAt": "${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}"
}
Return only valid JSON, no markdown, no explanation.`;
}

// ---------------------------------------------------------------------------
// 5. Serialize comparisons back to TypeScript
// ---------------------------------------------------------------------------
function serializeComparisons(comparisons) {
  const lines = [];

  lines.push(`export interface Comparison {`);
  lines.push(`  slug: string;`);
  lines.push(`  toolA: string;`);
  lines.push(`  toolB: string;`);
  lines.push(`  category: string;`);
  lines.push(`  summary: string;`);
  lines.push(`  verdict: string;`);
  lines.push(`  updatedAt: string;`);
  lines.push(`  criteria: { label: string; toolA: string; toolB: string }[];`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const comparisons: Comparison[] = [`);

  for (const c of comparisons) {
    lines.push(`  {`);
    lines.push(`    slug: ${JSON.stringify(c.slug)},`);
    lines.push(`    toolA: ${JSON.stringify(c.toolA)},`);
    lines.push(`    toolB: ${JSON.stringify(c.toolB)},`);
    lines.push(`    category: ${JSON.stringify(c.category)},`);
    lines.push(`    summary: ${JSON.stringify(c.summary)},`);
    lines.push(`    verdict: ${JSON.stringify(c.verdict)},`);
    lines.push(`    updatedAt: ${JSON.stringify(c.updatedAt)},`);
    lines.push(`    criteria: [`);
    for (const cr of c.criteria) {
      lines.push(`      { label: ${JSON.stringify(cr.label)}, toolA: ${JSON.stringify(cr.toolA)}, toolB: ${JSON.stringify(cr.toolB)} },`);
    }
    lines.push(`    ],`);
    lines.push(`  },`);
  }

  lines.push(`];`);
  lines.push(``);
  lines.push(`export function getComparisonBySlug(slug: string): Comparison | undefined {`);
  lines.push(`  return comparisons.find((c) => c.slug === slug);`);
  lines.push(`}`);
  lines.push(``);

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const tools = parseTools();
  const comparisons = parseComparisons();
  const toolMap = Object.fromEntries(tools.map(t => [t.slug, t]));

  let updated = 0;
  const total = comparisons.length;

  for (let i = 0; i < comparisons.length; i++) {
    const comp = comparisons[i];
    const label = `[${i + 1}/${total}]`;
    process.stdout.write(`Updating ${label}: ${comp.slug}... `);

    const toolA = toolMap[comp.toolA];
    const toolB = toolMap[comp.toolB];

    if (!toolA || !toolB) {
      console.log('⚠ Skipped (tool not found)');
      continue;
    }

    try {
      const prompt = buildPrompt(comp, toolA, toolB);
      const response = await callClaude(prompt);
      const parsed = JSON.parse(stripJsonFences(response));

      comp.summary = parsed.summary;
      comp.verdict = parsed.verdict;
      comp.criteria = parsed.criteria;
      comp.updatedAt = parsed.updatedAt;
      updated++;
      console.log('✓ Done');
    } catch (err) {
      console.log(`⚠ Skipped (${err.message})`);
    }
  }

  const outPath = path.join(ROOT, 'src/data/comparisons.ts');
  fs.writeFileSync(outPath, serializeComparisons(comparisons), 'utf-8');
  console.log(`\nUpdated ${updated}/${total} comparisons. File written to src/data/comparisons.ts`);
}

main().catch((err) => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
