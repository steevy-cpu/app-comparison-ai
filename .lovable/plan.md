## Goal

Make `/admin` login work reliably in both preview and production (Vercel) by checking the password against a backend secret (`ADMIN_TOKEN`) — no rebuild required when the password changes, and the password is never shipped in the frontend bundle.

## Why the current setup fails

- `VITE_ADMIN_PASSWORD` is inlined at **build time**. Setting it in Lovable doesn't take effect until the preview rebuilds; on Vercel it must also be added there and the site redeployed.
- It's also visible in the JS bundle to anyone who downloads it.

## Changes

### 1. Extend the existing edge function `admin-affiliate-urls`
Add a new `action: "verify"` branch that:
- Reads `password` from the request body
- Compares it (constant-time) against `Deno.env.get("ADMIN_TOKEN")`
- Returns `{ success: true, token: ADMIN_TOKEN }` on match, `401` otherwise

Keep the existing `upsert` / `delete` actions unchanged — they continue to require the `Bearer` token.

### 2. Update `src/pages/Admin.tsx`
- `AdminLogin`: on submit, call the edge function with `{ action: "verify", password }`. On success, store the returned token in `localStorage` as `admin_token` (replacing the boolean `admin_auth` flag).
- Authenticated state derived from presence of `admin_token`.
- `saveRow` / `saveAll`: switch from direct `supabase.from("affiliate_urls").upsert(...)` to `supabase.functions.invoke("admin-affiliate-urls", { body: { action: "upsert", ... }, headers: { Authorization: \`Bearer ${token}\` } })` so writes go through the authorized edge function. Reads (loading existing rows) stay as direct `select` since the table is public-read.
- Logout clears `admin_token`.
- Remove all references to `VITE_ADMIN_PASSWORD`.

### 3. Tighten the `affiliate_urls` RLS (technical detail)
Currently writes likely allowed via anon — verify and, if needed, restrict INSERT/UPDATE/DELETE to service role only (the edge function uses the service role key, so admin writes still work). Public SELECT stays.

## Result

- You set/change the admin password by updating the **`ADMIN_TOKEN`** secret in Lovable Cloud → Secrets. Takes effect immediately, no rebuild, works the same on Vercel.
- Password never appears in the frontend bundle.
- `VITE_ADMIN_PASSWORD` env var becomes unused and can be deleted.

## What you'll need to do after I implement this

1. Confirm `ADMIN_TOKEN` is set in Cloud → Secrets (it already exists per earlier setup). If you forgot the value, just update it to a new password you'll remember.
2. Log into `/admin` with that value.
