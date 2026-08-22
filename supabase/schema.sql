-- Run this once in your Supabase project's SQL Editor.

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  state text not null,
  cm_name text not null,
  party text,
  tenure text,
  assessment_year text,
  peers text,
  overall_score numeric not null,
  grade text not null,
  grade_interpretation text,
  category_scores jsonb default '[]'::jsonb,   -- [{category, weight, score, grade}]
  page1_image_url text not null,                -- rendered page 1 of PDF, shown on cards/profile
  pdf_url text not null,                         -- full report PDF, downloadable
  xlsx_url text,                                 -- underlying excel workbook, downloadable
  published boolean default true,
  created_at timestamptz default now()
);

create index if not exists reports_score_idx on reports (overall_score desc);
create index if not exists reports_state_idx on reports (state);

alter table reports enable row level security;

-- Anyone (anon key) can READ published reports — needed for the public site.
create policy "public read published reports"
  on reports for select
  using (published = true);

-- Only authenticated users (i.e. you, logged in via Supabase Auth) can write.
create policy "authenticated insert"
  on reports for insert
  to authenticated
  with check (true);

create policy "authenticated update"
  on reports for update
  to authenticated
  using (true);

create policy "authenticated delete"
  on reports for delete
  to authenticated
  using (true);

-- Storage buckets (create these in Supabase Dashboard -> Storage, or via SQL below
-- if the storage extension is available in your project):
-- 1. "report-files"  (public bucket)  -> stores original PDFs and XLSX files
-- 2. "page1-images"  (public bucket)  -> stores the rendered PNG of PDF page 1
--
-- After creating the buckets, add public read policies for them (Dashboard makes
-- this a checkbox: "Public bucket"). Only your authenticated admin session can
-- upload/delete, matching the policies above.
