# HokTifyy Download Center
Static site (public/) + 2 Vercel functions (api/). No build step.

## Setup
1. Supabase: SQL Editor → run `supabase/schema.sql`.
2. Host the 4 APKs (GitHub Releases recommended, see below). Put each public URL in `public/apk-config.json` (`"url"`). Empty url = "Coming Soon".
3. Vercel env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `HASH_SALT` (random string).
4. Deploy: `vercel --prod` (or push to GitHub and import).

## Notes
- Download button → `/api/download?v=<key>` → counts via RPC (service_role stays server-side) → 302 to the APK.
- Counted = download started, not verified install. Dedupe: same client+variant 10 min; max 10/hour/client; 120/min global.
- Screenshots: none were provided, so the hero shows the logo. Add real ones later.
- Features: set `"on": true` in apk-config.json only for features the app really has.
