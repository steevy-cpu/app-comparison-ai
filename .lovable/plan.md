

# Plan: Add IndexNow to AppRival

## What is IndexNow?
IndexNow is a protocol that lets you instantly notify Bing (and Yandex, Naver, etc.) when pages are added or updated on your site. Instead of waiting for crawlers to discover changes, you push URLs directly. This speeds up indexing significantly.

## Implementation

### 1. Generate and host the API key file
- Create `public/<key>.txt` containing the key string itself. IndexNow requires a verification file at your domain root.
- Use a standard UUID-style key, e.g. `a1b2c3d4e5f6g7h8` (will generate a proper one).
- File: `public/a1b2c3d4e5f6g7h8.txt` containing just the key.

### 2. Create `scripts/indexnow.mjs`
A reusable utility script that submits URLs to the IndexNow API:
- Reads the API key from an env var `INDEXNOW_API_KEY` or hardcoded constant (since the key is public anyway — it's hosted at the domain root).
- Accepts a list of URLs as arguments or reads changed files from git diff to determine which URLs to submit.
- Calls `https://api.indexnow.org/indexnow` with the key, host, and URL list.
- Logs success/failure for each batch.

### 3. Add IndexNow ping step to all 3 workflow files
After each commit+push step, add a new step that determines which URLs changed and pings IndexNow:

**daily-blog-post.yml** — submit the new blog post URL + `/blog` listing page.

**discover-tools.yml** — submit new tool URLs + new comparison URLs + `/tools` and `/compare` listing pages.

**update-comparisons.yml** — submit all comparison URLs that were updated + `/compare` listing page.

Each workflow step will:
1. Parse the script output or git diff to find new/changed slugs
2. Call `node scripts/indexnow.mjs <url1> <url2> ...`

### 4. Update `scripts/README.md`
Add a section explaining IndexNow integration and the API key setup.

## Files to create/modify
| File | Action |
|------|--------|
| `public/b64ae64acba449c1.txt` | Create — IndexNow verification key file |
| `scripts/indexnow.mjs` | Create — IndexNow URL submission utility |
| `.github/workflows/daily-blog-post.yml` | Add IndexNow ping step |
| `.github/workflows/discover-tools.yml` | Add IndexNow ping step |
| `.github/workflows/update-comparisons.yml` | Add IndexNow ping step |
| `scripts/README.md` | Add IndexNow documentation section |

No existing pages, components, data files, or scripts are modified.

