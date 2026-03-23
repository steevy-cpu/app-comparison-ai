# AppRival Automation Scripts

## Overview

This directory contains AI-powered automation scripts that keep AppRival content fresh using the Claude API. All three pipelines cover both **SaaS tools** and **AI tools**.

---

## 1. Comparison Updater (`update-comparisons.mjs`)

**What it does:** Reads all comparisons from `src/data/comparisons.ts`, calls the Claude API (Haiku) to regenerate summaries, verdicts, and criteria scores, then writes the updated data back. Covers both SaaS and AI tool comparisons.

**Schedule:** Every Monday at 6am UTC (via GitHub Actions)

**Run locally:**

```bash
ANTHROPIC_API_KEY=your_key node scripts/update-comparisons.mjs
```

---

## 2. Blog Post Generator (`generate-blog-post.mjs`)

**What it does:** Generates a new blog post using the Claude API (Sonnet), avoids duplicate topics, and appends the post to `src/data/posts.ts`. Alternates between SaaS and AI topics automatically.

**Schedule:** Every day at 8am UTC (via GitHub Actions)

**Run locally:**

```bash
ANTHROPIC_API_KEY=your_key node scripts/generate-blog-post.mjs
```

---

## 3. Tool Discovery Pipeline (`discover-tools.mjs`)

**What it does:** Discovers 3 new tools via Claude AI, generates 2 comparisons per tool against existing database entries, and updates the sitemap — all automatically. Discovers both SaaS and AI tools, alternating categories each run.

**Schedule:** Every Wednesday at 7am UTC (via GitHub Actions) — chosen to avoid conflicts with Monday comparison updates and daily blog posts.

**Run locally:**

```bash
ANTHROPIC_API_KEY=your_key node scripts/discover-tools.mjs
```

**⚠️ Warning:** Each run adds permanent data to `src/data/tools.ts`, `src/data/comparisons.ts`, and `public/sitemap.xml`. Do not run repeatedly without checking the database first.

---

## 4. IndexNow Ping (`indexnow.mjs`)

**What it does:** Submits new or updated URLs to the [IndexNow](https://www.indexnow.org/) protocol, instantly notifying Bing, Yandex, and other compatible search engines about content changes. This dramatically speeds up indexing compared to waiting for crawlers.

**How it works:**
- A verification key file is hosted at `https://apprival.net/b64ae64acba449c1.txt`
- The script sends a batch POST request to `api.indexnow.org` with the list of changed URLs
- Each automation workflow calls this script automatically after committing changes

**Integrated into:**
- `daily-blog-post.yml` — pings the new blog post URL + `/blog` listing
- `discover-tools.yml` — pings new tool + comparison URLs + listing pages
- `update-comparisons.yml` — pings updated comparison URLs + `/compare` listing

**Run manually:**

```bash
node scripts/indexnow.mjs https://apprival.net/blog/my-new-post https://apprival.net/tools/new-tool
```

No API key or secret is needed — the IndexNow key is public by design (it's hosted on the domain for verification).

---

## Setting Up the GitHub Secret

Both workflows share the same secret — you only need to set it once.

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Name: `ANTHROPIC_API_KEY`
5. Value: Your Anthropic API key
6. Click **Add secret**

---

## Manual Trigger

To run either workflow manually:

1. Go to your GitHub repository
2. Click the **Actions** tab
3. Select the workflow (**Update Comparisons** or **Daily Blog Post**)
4. Click **Run workflow**
5. Select the branch and click **Run workflow**

---

## Automated Schedule

| Time | What happens | Coverage | IndexNow |
|------|-------------|----------|----------|
| Every day 8am UTC | New blog post generated and published | SaaS & AI topics (alternating) | ✓ Pings new post URL |
| Every Monday 6am UTC | All comparisons refreshed with updated content | SaaS & AI comparisons | ✓ Pings updated comparisons |
| Every Wednesday 7am UTC | 3 new tools discovered + comparisons generated | SaaS & AI tools (alternating) | ✓ Pings new tool + comparison URLs |
| Every push to GitHub | Lovable auto-deploys the changes live | — | — |
