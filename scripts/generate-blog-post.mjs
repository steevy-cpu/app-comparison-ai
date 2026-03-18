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
// 1. Parse existing posts from src/data/posts.ts
// ---------------------------------------------------------------------------
function parsePosts() {
  const raw = fs.readFileSync(path.join(ROOT, 'src/data/posts.ts'), 'utf-8');
  const match = raw.match(/export const posts:\s*Post\[\]\s*=\s*(\[[\s\S]*?\n\];)/);
  if (!match) throw new Error('Could not parse posts array');
  const fn = new Function(`return ${match[1].replace(/;\s*$/, '')}`);
  return fn();
}

// ---------------------------------------------------------------------------
// 2. Call Claude API
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
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
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
// 3. Build prompt
// ---------------------------------------------------------------------------
function buildPrompt(existingTitles) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return `You are a senior technology analyst writing for AppRival, a trusted comparison website covering both SaaS productivity tools and AI tools.

Existing post titles — do NOT repeat these topics:
${existingTitles.join('\n')}

Write a new, original blog post. Choose a topic from one of these categories, alternating between SaaS and AI topics to keep content varied:

SaaS topics:
- Tool comparison deep-dive (e.g. "Notion vs ClickUp for Remote Engineering Teams")
- Buying guide (e.g. "How to Choose a CRM for a 10-Person Startup in 2026")
- Industry analysis (e.g. "Why Project Management Tools Are Consolidating")
- Cost breakdown (e.g. "The Real Cost of Monday.com at Scale")
- Workflow tips (e.g. "5 Asana Features Most Teams Never Use")

AI topics:
- AI tool comparison (e.g. "ChatGPT vs Claude: Which AI Assistant Is Right for Your Team?")
- AI adoption guide (e.g. "How to Choose Your First AI Coding Assistant")
- AI industry analysis (e.g. "Why Every SaaS Tool Is Adding AI Features in 2026")
- AI productivity tips (e.g. "10 ChatGPT Prompts That Save Marketing Teams Hours Every Week")
- AI cost analysis (e.g. "The Hidden Costs of AI Tools: What $50/Month Actually Gets You")

Writing requirements:
- Minimum 700 words
- Specific, actionable, and genuinely useful — no filler content
- Include real tool names, real pricing, and real feature comparisons where relevant
- Written for professionals evaluating tools for their team
- SEO-optimized title with year (2026) where natural
- At least 4 sections with <h2> headings
- Use <ul>/<li> for lists, <p> for paragraphs, <strong> for emphasis
- No inline styles, no markdown, only clean HTML

Return a JSON object:
{
  "slug": "seo-friendly-url-slug-with-year-2026",
  "title": "Specific, compelling, SEO-optimized title",
  "date": "${dateStr}",
  "excerpt": "2 compelling sentences summarizing the post. Under 160 characters total.",
  "category": "one of: Guide, Deep Dive, Analysis, Tips, Cost",
  "readingTime": "X min read",
  "content": "<h2>Section 1</h2><p>...</p><h2>Section 2</h2><p>...</p>..."
}
Return only valid JSON. No markdown fences, no explanation.`;
}

// ---------------------------------------------------------------------------
// 4. Serialize post value for TS output
// ---------------------------------------------------------------------------
function serializePost(post) {
  return `  {
    slug: ${JSON.stringify(post.slug)},
    title: ${JSON.stringify(post.title)},
    date: ${JSON.stringify(post.date)},
    excerpt: ${JSON.stringify(post.excerpt)},
    category: ${JSON.stringify(post.category)},
    readingTime: ${JSON.stringify(post.readingTime)},
    content: \`
      ${post.content.trim()}
    \`,
  }`;
}

// ---------------------------------------------------------------------------
// 5. Write updated posts file
// ---------------------------------------------------------------------------
function writePostsFile(posts) {
  const lines = [];

  lines.push(`export interface Post {`);
  lines.push(`  slug: string;`);
  lines.push(`  title: string;`);
  lines.push(`  date: string;`);
  lines.push(`  excerpt: string;`);
  lines.push(`  category: string;`);
  lines.push(`  readingTime: string;`);
  lines.push(`  content: string;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const posts: Post[] = [`);

  for (const post of posts) {
    lines.push(serializePost(post) + ',');
  }

  lines.push(`];`);
  lines.push(``);
  lines.push(`export function getPostBySlug(slug: string): Post | undefined {`);
  lines.push(`  return posts.find((p) => p.slug === slug);`);
  lines.push(`}`);
  lines.push(``);

  const outPath = path.join(ROOT, 'src/data/posts.ts');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf-8');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const posts = parsePosts();
  const existingTitles = posts.map(p => p.title);
  const existingSlugs = new Set(posts.map(p => p.slug));

  console.log('Generating blog post...');

  const prompt = buildPrompt(existingTitles);
  const response = await callClaude(prompt);

  let newPost;
  try {
    newPost = JSON.parse(stripJsonFences(response));
  } catch {
    console.error('❌ Claude returned invalid JSON:');
    console.error(response);
    process.exit(1);
  }

  // Deduplicate slug
  if (existingSlugs.has(newPost.slug)) {
    newPost.slug = newPost.slug + '-2';
  }

  posts.push(newPost);
  writePostsFile(posts);

  console.log(`✓ Published: ${newPost.title}`);
}

main().catch((err) => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
