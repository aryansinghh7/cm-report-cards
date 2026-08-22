# CM Report Cards — @suryanshi_tyagi_

A private, link-only website for publishing CM Performance Report Cards.

- **Landing page**: your Instagram (@suryanshi_tyagi_)
- **Scroll down**: grid of every published CM report card (photo = page 1 of your PDF, name, party, tenure, score, grade)
- **Leaderboard**: auto-ranked by overall score
- **Click a CM**: full page-1 view + Download PDF + Download Excel buttons
- **Admin page (`/admin`)**: only you can log in; upload a PDF (+ optional Excel), the site auto-reads the CM's name, state, tenure, score, grade and category table from the PDF, renders page 1 as the cover image, and publishes it live — no coding needed after setup.
- Not indexed by Google (`robots.txt` + `noindex` headers) — reachable only via the link you share.

Total cost: **$0**, using Supabase's free tier (database + file storage + login) and Vercel's free tier (hosting).

---

## 1. One-time setup (~15 minutes)

### A. Create a free Supabase project
1. Go to https://supabase.com → New project (free tier).
2. In the SQL Editor, paste and run everything in `supabase/schema.sql` (in this folder).
3. Go to **Storage** → create two buckets:
   - `report-files` → toggle **Public bucket** ON
   - `page1-images` → toggle **Public bucket** ON
4. Go to **Authentication → Users** → **Add user** → create yourself an admin login (your email + a strong password). This is the *only* account allowed to publish — that's what keeps `/admin` secure.
5. Go to **Project Settings → API** → copy your **Project URL** and **anon public key**.

### B. Configure the project
1. Copy `.env.example` to `.env.local` and paste in your Supabase URL + anon key.

### C. Deploy for free on Vercel
1. Push this folder to a new **private** GitHub repo.
2. Go to https://vercel.com → New Project → import that repo (free Hobby plan).
3. In Vercel's project settings → Environment Variables, add the same two variables from `.env.local`.
4. Deploy. Vercel gives you a URL like `cm-report-cards.vercel.app` — put that in your Instagram bio.

That's it — the site is live, private (unlisted, not indexed), and free.

---

## 2. Publishing a new report card (from now on)

1. Go to `yoursite.vercel.app/admin` and log in.
2. Upload the CM's report PDF (and the Excel workbook, if you want it downloadable).
3. The page auto-renders page 1 as the cover image and auto-fills: State, CM Name, Tenure, Assessment Period, Peers, Overall Score, Grade and the full category scorecard table — straight from the PDF text.
4. Review the auto-filled fields (add the CM's Party, since that's only shown as a logo image in the PDF and can't be auto-read), fix anything that looks off, then hit **Publish**.
5. It's instantly live on the homepage, the leaderboard, and gets its own `/cm/<slug>` profile page.

If a future report card's layout differs slightly from the current template, the auto-fill may miss a field or two — you can just type it in manually before publishing; nothing blocks you.

---

## 3. Notes on "privacy"

This site is **unlisted**, not password-protected for visitors (per your brief — reachable only via the link). `robots.txt` and `noindex` headers stop it from appearing in search engines. The `/admin` route itself *is* protected — only your one Supabase login can publish, edit, or delete.

If you later want visitor-level privacy too (e.g. a shared password to view the site at all), that's a small addition — just ask.

---

## 4. Local development

```bash
npm install
npm run dev
```
Visit http://localhost:3000
