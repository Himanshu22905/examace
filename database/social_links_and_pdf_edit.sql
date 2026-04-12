-- Run once in Supabase SQL Editor

alter table public.study_materials
add column if not exists logo_url text;

create table if not exists public.site_social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  icon_text text null default '🔗',
  display_order int not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.site_social_links enable row level security;

drop policy if exists site_social_links_read on public.site_social_links;
create policy site_social_links_read
on public.site_social_links
for select
to anon, authenticated
using (is_active = true or (auth.role() = 'authenticated' and public.is_admin_user()));

drop policy if exists site_social_links_write on public.site_social_links;
create policy site_social_links_write
on public.site_social_links
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

insert into public.site_social_links (platform, url, icon_text, display_order, is_active)
values
  ('Instagram', 'https://instagram.com/', '📸', 10, true),
  ('YouTube', 'https://youtube.com/', '▶️', 20, true),
  ('Telegram', 'https://t.me/', '✈️', 30, true)
on conflict do nothing;

-- Optional: enable direct PDF upload from admin panel via Supabase Storage
insert into storage.buckets (id, name, public)
values ('study-materials', 'study-materials', true)
on conflict (id) do nothing;

drop policy if exists "Public read study-materials" on storage.objects;
create policy "Public read study-materials"
on storage.objects
for select
to public
using (bucket_id = 'study-materials');

drop policy if exists "Admin write study-materials" on storage.objects;
create policy "Admin write study-materials"
on storage.objects
for all
to authenticated
using (bucket_id = 'study-materials' and public.is_admin_user())
with check (bucket_id = 'study-materials' and public.is_admin_user());
