# AppRival Automation Scripts

## Overview

This directory contains AI-powered automation scripts that keep AppRival content fresh using the Claude API.

---

## 1. Comparison Updater (`update-comparisons.mjs`)

**What it does:** Reads all comparisons from `src/data/comparisons.ts`, calls the Claude API (Haiku) to regenerate summaries, verdicts, and criteria scores, then writes the updated data back.

**Schedule:** Every Monday at 6am UTC (via GitHub Actions)

**Run locally:**

```bash
ANTHROPIC_API_KEY=your_key node scripts/update-comparisons.mjs
```

---

## 2. Blog Post Generator (`generate-blog-post.mjs`)

**What it does:** Generates a new blog post using the Claude API (Sonnet), avoids duplicate topics, and appends the post to `src/data/posts.ts`.

**Schedule:** Every day at 8am UTC (via GitHub Actions)

**Run locally:**

```bash
ANTHROPIC_API_KEY=your_key node scripts/generate-blog-post.mjs
```

---

## 3. Tool Discovery Pipeline (`discover-tools.mjs`)

**What it does:** Discovers 3 new SaaS tools via Claude AI, generates 2 comparisons per tool against existing database entries, and updates the sitemap — all automatically.

**Schedule:** Every Wednesday at 7am UTC (via GitHub Actions) — chosen to avoid conflicts with Monday comparison updates and daily blog posts.

**Run locally:**

```bash
ANTHROPIC_API_KEY=your_key node scripts/discover-tools.mjs
```

**⚠️ Warning:** Each run adds permanent data to `src/data/tools.ts`, `src/data/comparisons.ts`, and `public/sitemap.xml`. Do not run repeatedly without checking the database first.

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

| Time | What happens |
|------|-------------|
| Every day 8am UTC | New blog post generated and published |
| Every Monday 6am UTC | All comparisons refreshed with updated content |
| Every push to GitHub | Lovable auto-deploys the changes live |
