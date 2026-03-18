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

function robustJsonParse(text) {
  let cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch (e) {
    const objMatch = cleaned.match(/\{[\s\S]*\}/)
    const arrMatch = cleaned.match(/\[[\s\S]*\]/)
    const match = objMatch || arrMatch
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch (e2) {
        const fixed = match[0]
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
        try {
          return JSON.parse(fixed)
        } catch (e3) {
          throw new Error(`Could not parse JSON after all attempts: ${e3.message}`)
        }
      }
    }
    throw new Error(`No JSON object found in response: ${e.message}`)
  }
}

// ---------------------------------------------------------------------------
// 1. Parsers (same pattern as existing scripts)
// ---------------------------------------------------------------------------
function parseTools() {
  const raw = fs.readFileSync(path.join(ROOT, 'src/data/tools.ts'), 'utf-8');
  const match = raw.match(/export const tools:\s*Tool\[\]\s*=\s*(\[[\s\S]*?\n\];)/);
  if (!match) throw new Error('Could not parse tools array');
  const fn = new Function(`return ${match[1].replace(/;\s*$/, '')}`);
  return fn();
}

function parseComparisons() {
  const raw = fs.readFileSync(path.join(ROOT, 'src/data/comparisons.ts'), 'utf-8');
  const match = raw.match(/export const comparisons:\s*Comparison\[\]\s*=\s*(\[[\s\S]*?\n\];)/);
  if (!match) throw new Error('Could not parse comparisons array');
  const fn = new Function(`return ${match[1].replace(/;\s*$/, '')}`);
  return fn();
}

function parsePosts() {
  const raw = fs.readFileSync(path.join(ROOT, 'src/data/posts.ts'), 'utf-8');
  const match = raw.match(/export const posts:\s*Post\[\]\s*=\s*(\[[\s\S]*?\n\];)/);
  if (!match) throw new Error('Could not parse posts array');
  const fn = new Function(`return ${match[1].replace(/;\s*$/, '')}`);
  return fn();
}

// ---------------------------------------------------------------------------
// 2. Claude API helper
// ---------------------------------------------------------------------------
async function callClaude(prompt, maxTokens = 2048) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
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
// 3. Discover new tools
// ---------------------------------------------------------------------------
function buildToolDiscoveryPrompt(existingToolNames) {
  return `You are a SaaS and AI tools research analyst for AppRival, a tool comparison website covering both traditional SaaS products and AI tools.

These tools are already in our database — do NOT suggest any of these:
${existingToolNames.join(', ')}

Suggest exactly 3 new tools to add to our database. Alternate between SaaS and AI tools — do not suggest 3 tools from the same category. Choose from these categories:

SaaS categories: Project Management, CRM, Communication, Productivity, Collaboration
AI categories: AI Writing, AI Image, AI Coding, AI Productivity, AI Video & Audio

Selection criteria:
- Actively used and well-known in 2026
- Has clear competitors already in our database (for comparison pages)
- High search volume for "[tool name] vs [competitor]" queries
- Has an affiliate or referral program

Return a JSON array of exactly 3 tool objects:
[
  {
    "slug": "url-friendly-slug-lowercase-hyphens",
    "name": "Exact Tool Name",
    "category": "one of the categories listed above",
    "description": "2-3 sentences describing what the tool does and who uses it",
    "website": "domain.com without https://",
    "pricing": "Accurate pricing description including free plan if available, paid tiers with prices",
    "rating": <number between 4.0 and 4.9>,
    "features": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5", "feature 6"],
    "pros": ["specific pro 1", "specific pro 2", "specific pro 3"],
    "cons": ["specific con 1", "specific con 2"],
    "bestFor": "1-2 sentences describing the ideal user or team for this tool"
  }
]
Return only valid JSON array. No markdown fences, no explanation, no comments.`;
}

const REQUIRED_TOOL_FIELDS = ['slug', 'name', 'category', 'description', 'website', 'pricing', 'rating', 'features', 'pros', 'cons', 'bestFor'];

function validateTool(tool) {
  for (const field of REQUIRED_TOOL_FIELDS) {
    if (tool[field] === undefined || tool[field] === null) return false;
  }
  if (!Array.isArray(tool.features) || !Array.isArray(tool.pros) || !Array.isArray(tool.cons)) return false;
  if (typeof tool.rating !== 'number') return false;
  return true;
}

// ---------------------------------------------------------------------------
// 4. Generate comparisons for a new tool
// ---------------------------------------------------------------------------
function findRelevantTools(newTool, existingTools) {
  // Priority 1: same category
  // Priority 2: adjacent category (e.g. AI Writing pairs well with AI Coding, CRM pairs with Project Management)
  // Priority 3: most popular tools (Notion, Asana, ChatGPT etc — hardcode top 6 slugs as fallback)
  const POPULAR_FALLBACKS = ['notion', 'asana', 'clickup', 'chatgpt', 'claude-ai', 'github-copilot'];
  const sameCategory = existingTools.filter(t => t.category === newTool.category && t.slug !== newTool.slug);
  const relevantTools = sameCategory.length >= 2
    ? sameCategory.slice(0, 4) // pass up to 4 for Claude to choose from
    : [
        ...sameCategory,
        ...existingTools.filter(t => POPULAR_FALLBACKS.includes(t.slug) && t.slug !== newTool.slug)
      ].slice(0, 4);
  return relevantTools;
}

function buildComparisonPrompt(newTool, relevantTools) {
  return `You are writing comparison data for AppRival, a tool comparison website covering SaaS and AI tools.

New tool being added:
Name: ${newTool.name}
Category: ${newTool.category}
Description: ${newTool.description}
Pricing: ${newTool.pricing}
Features: ${newTool.features.join(', ')}
Pros: ${newTool.pros.join(', ')}
Cons: ${newTool.cons.join(', ')}

Existing tools to compare against (pick the 2 most relevant based on category and use case overlap):
${relevantTools.map(t => `- ${t.name} (${t.category}): ${t.description}`).join('\n')}

Generate exactly 2 comparison objects. For each comparison, think carefully about real differences users care about — pricing model, ease of use, feature depth, integrations, and ideal use case.

Return a JSON array of exactly 2 objects:
[
  {
    "slug": "${newTool.slug}-vs-[competitor-slug]",
    "toolA": "${newTool.slug}",
    "toolB": "[competitor-slug]",
    "category": "[shared or closest category]",
    "summary": "2-3 sentence objective overview comparing the two tools — what they share and where they differ",
    "verdict": "3-4 sentence clear recommendation. State which tool wins for which use case. Be specific and opinionated.",
    "criteria": [
      { "label": "Ease of Use", "toolA": "[Excellent|Good|Moderate|Limited|Basic|Steep|Easy|Fast|None]", "toolB": "[same options]" },
      { "label": "Feature Depth", "toolA": "...", "toolB": "..." },
      { "label": "Pricing Value", "toolA": "...", "toolB": "..." },
      { "label": "Integrations", "toolA": "...", "toolB": "..." },
      { "label": "Best For Teams", "toolA": "...", "toolB": "..." }
    ],
    "updatedAt": "${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}"
  }
]
Return only valid JSON array. No markdown fences, no explanation, no comments.`;
}

// ---------------------------------------------------------------------------
// 5. Sitemap updater
// ---------------------------------------------------------------------------
function updateSitemap(newToolSlugs, newComparisonSlugs) {
  const sitemapPath = path.join(ROOT, 'public/sitemap.xml');
  let xml = fs.readFileSync(sitemapPath, 'utf-8');

  const today = new Date().toISOString().split('T')[0];
  let entries = '';

  for (const slug of newToolSlugs) {
    entries += `  <url>
    <loc>https://apprival.net/tools/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  for (const slug of newComparisonSlugs) {
    entries += `  <url>
    <loc>https://apprival.net/compare/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
  }

  xml = xml.replace('</urlset>', entries + '</urlset>');
  fs.writeFileSync(sitemapPath, xml, 'utf-8');
}

// ---------------------------------------------------------------------------
// 6. File serializers
// ---------------------------------------------------------------------------
function serializeTools(tools) {
  const lines = [];
  lines.push(`export interface Tool {`);
  lines.push(`  slug: string;`);
  lines.push(`  name: string;`);
  lines.push(`  category: string;`);
  lines.push(`  description: string;`);
  lines.push(`  website: string;`);
  lines.push(`  pricing: string;`);
  lines.push(`  rating: number;`);
  lines.push(`  features: string[];`);
  lines.push(`  pros: string[];`);
  lines.push(`  cons: string[];`);
  lines.push(`  bestFor: string;`);
  lines.push(`  affiliateUrl?: string;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const tools: Tool[] = [`);

  for (const t of tools) {
    lines.push(`  {`);
    lines.push(`    slug: ${JSON.stringify(t.slug)},`);
    lines.push(`    name: ${JSON.stringify(t.name)},`);
    lines.push(`    category: ${JSON.stringify(t.category)},`);
    lines.push(`    description: ${JSON.stringify(t.description)},`);
    lines.push(`    website: ${JSON.stringify(t.website)},`);
    lines.push(`    pricing: ${JSON.stringify(t.pricing)},`);
    lines.push(`    rating: ${t.rating},`);
    lines.push(`    features: ${JSON.stringify(t.features)},`);
    lines.push(`    pros: ${JSON.stringify(t.pros)},`);
    lines.push(`    cons: ${JSON.stringify(t.cons)},`);
    lines.push(`    bestFor: ${JSON.stringify(t.bestFor)},`);
    if (t.affiliateUrl) {
      lines.push(`    affiliateUrl: ${JSON.stringify(t.affiliateUrl)},`);
    }
    lines.push(`  },`);
  }

  lines.push(`];`);
  lines.push(``);
  lines.push(`export function getToolBySlug(slug: string): Tool | undefined {`);
  lines.push(`  return tools.find((t) => t.slug === slug);`);
  lines.push(`}`);
  lines.push(``);

  return lines.join('\n');
}

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
  // Step 1: Read existing data
  console.log('Reading existing database...');
  const tools = parseTools();
  const comparisons = parseComparisons();
  const posts = parsePosts();

  const toolSlugs = new Set(tools.map(t => t.slug));
  const toolNames = tools.map(t => t.name);
  const compSlugs = new Set(comparisons.map(c => c.slug));

  console.log(`→ ${tools.length} tools, ${comparisons.length} comparisons found`);
  console.log(`→ ${posts.length} blog posts (for reference)\n`);

  // Step 2: Discover new tools
  console.log('Discovering new tools...');
  const toolPrompt = buildToolDiscoveryPrompt(toolNames);
  const toolResponse = await callClaude(toolPrompt);

  let suggestedTools;
  try {
    suggestedTools = robustJsonParse(toolResponse);
  } catch {
    console.error('❌ Claude returned invalid JSON for tool discovery');
    console.error(toolResponse);
    process.exit(1);
  }

  if (!Array.isArray(suggestedTools)) {
    console.error('❌ Expected JSON array from Claude');
    process.exit(1);
  }

  console.log(`→ Suggested: ${suggestedTools.map(t => t.name).join(', ')}`);

  const newTools = [];
  for (const tool of suggestedTools) {
    if (!validateTool(tool)) {
      console.log(`→ Skipping ${tool.name || 'unknown'}: missing required fields`);
      continue;
    }
    if (toolSlugs.has(tool.slug)) {
      console.log(`→ Skipping ${tool.name}: already exists`);
      continue;
    }
    newTools.push(tool);
    toolSlugs.add(tool.slug);
  }

  console.log(`→ Adding ${newTools.length} new tools\n`);

  if (newTools.length === 0) {
    console.log('No new tools to add. Exiting.');
    return;
  }

  // Step 3: Generate comparisons
  console.log('Generating comparisons...');
  const allTools = [...tools, ...newTools];
  const newComparisons = [];

  for (const newTool of newTools) {
    try {
      const relevant = findRelevantTools(newTool, tools);
      if (relevant.length < 2) {
        console.log(`⚠ Not enough existing tools to compare ${newTool.name} against`);
        continue;
      }

      const compPrompt = buildComparisonPrompt(newTool, relevant);
      const compResponse = await callClaude(compPrompt, 2048);

      let parsedComps;
      try {
        parsedComps = robustJsonParse(compResponse);
      } catch {
        console.log(`⚠ Invalid JSON for ${newTool.name} comparisons, skipping`);
        continue;
      }

      if (!Array.isArray(parsedComps)) continue;

      for (const comp of parsedComps) {
        const reverseSlug = `${comp.toolB}-vs-${comp.toolA}`;
        if (compSlugs.has(comp.slug)) {
          console.log(`→ ${comp.slug} — skipped (already exists)`);
          continue;
        }
        if (compSlugs.has(reverseSlug)) {
          console.log(`→ ${comp.slug} — skipped (reverse exists)`);
          continue;
        }
        compSlugs.add(comp.slug);
        newComparisons.push(comp);
        console.log(`→ ${comp.slug} ✓`);
      }
    } catch (err) {
      console.log(`⚠ Failed comparisons for ${newTool.name}: ${err.message}`);
    }
  }

  console.log('');

  // Step 4: Update sitemap
  console.log('Updating sitemap...');
  const newToolSlugs = newTools.map(t => t.slug);
  const newCompSlugs = newComparisons.map(c => c.slug);
  updateSitemap(newToolSlugs, newCompSlugs);
  console.log(`→ Added ${newToolSlugs.length} tool URLs + ${newCompSlugs.length} comparison URLs\n`);

  // Step 5: Write data files
  console.log('Writing files...');
  const finalTools = [...tools, ...newTools];
  const finalComparisons = [...comparisons, ...newComparisons];

  fs.writeFileSync(path.join(ROOT, 'src/data/tools.ts'), serializeTools(finalTools), 'utf-8');
  fs.writeFileSync(path.join(ROOT, 'src/data/comparisons.ts'), serializeComparisons(finalComparisons), 'utf-8');

  console.log(`→ src/data/tools.ts updated (${tools.length} → ${finalTools.length} tools)`);
  console.log(`→ src/data/comparisons.ts updated (${comparisons.length} → ${finalComparisons.length} comparisons)`);
  console.log(`→ public/sitemap.xml updated\n`);

  console.log(`Done. AppRival grew by ${newTools.length} tools and ${newComparisons.length} comparisons this week.`);
}

main().catch((err) => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
