

## Implementation Plan: AI Auto-Update Pipeline + Blog Pagination

### 6 files to create/modify:

**1. `scripts/update-comparisons.mjs`** (CREATE)
Node.js script that:
- Reads `src/data/comparisons.ts` and `src/data/tools.ts` via regex
- Calls Claude API (haiku) for each comparison with tool context
- Parses JSON response, merges back, writes updated TS file
- Skips on invalid JSON, logs progress

**2. `scripts/generate-blog-post.mjs`** (CREATE)
Node.js script that:
- Reads `src/data/posts.ts`, extracts existing titles
- Calls Claude API (sonnet) to generate a new post
- Appends to posts array, writes updated TS file
- Deduplicates slugs, exits code 1 on failure

**3. `.github/workflows/update-comparisons.yml`** (CREATE)
Weekly Monday 6am UTC cron + manual trigger. Runs update script, commits as "AppRival Bot".

**4. `.github/workflows/daily-blog-post.yml`** (CREATE)
Daily 8am UTC cron + manual trigger. Runs blog generation script, commits as "AppRival Bot".

**5. `scripts/README.md`** (CREATE)
Documents both pipelines: local run commands, GitHub secret setup, manual trigger instructions.

**6. `src/pages/Blog.tsx`** (MODIFY)
Add pagination: `useState` for page, 10 posts/page, date-descending sort, Previous/Next buttons with "Page X of Y" indicator. Buttons disabled at boundaries.

### Key details:
- Both scripts use native `fetch` for Claude API, `fs` for file I/O
- File parsing uses regex to extract array content between `[` and `];`
- File writing reconstructs full TS: interface → array → helper function
- Blog pagination sorts via `new Date(post.date).getTime()` descending

