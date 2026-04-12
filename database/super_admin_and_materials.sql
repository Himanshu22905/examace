-- Run in Supabase SQL Editor (once)
-- Purpose:
-- 1) Super admin / admin role management
-- 2) Category management
-- 3) Study material PDF management
-- 4) UTF-8-safe text storage (default in PostgreSQL)

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(email)
);

create table if not exists public.exam_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text null,
  logo_url text null,
  color_hex text null default '#38BDF8',
  sort_order int not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.study_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text null,
  category_name text not null,
  language text not null default 'English',
  pdf_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_users_email on public.admin_users (lower(email));
create index if not exists idx_exam_categories_sort on public.exam_categories (sort_order);
create index if not exists idx_study_materials_category on public.study_materials (category_name);

-- Helper functions (security definer to avoid recursive RLS checks)
create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and is_active = true
  );
$$;

create or replace function public.is_super_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role = 'super_admin'
      and is_active = true
  );
$$;

alter table public.admin_users enable row level security;
alter table public.exam_categories enable row level security;
alter table public.study_materials enable row level security;

drop policy if exists admin_users_select_for_admins on public.admin_users;
create policy admin_users_select_for_admins
on public.admin_users
for select
to authenticated
using (public.is_admin_user());

drop policy if exists admin_users_write_for_super_admin on public.admin_users;
create policy admin_users_write_for_super_admin
on public.admin_users
for all
to authenticated
using (public.is_super_admin_user())
with check (public.is_super_admin_user());

drop policy if exists exam_categories_read on public.exam_categories;
create policy exam_categories_read
on public.exam_categories
for select
to authenticated
using (is_active = true or public.is_admin_user());

drop policy if exists exam_categories_write on public.exam_categories;
create policy exam_categories_write
on public.exam_categories
for all
to authenticated
using (public.is_super_admin_user())
with check (public.is_super_admin_user());

drop policy if exists study_materials_read on public.study_materials;
create policy study_materials_read
on public.study_materials
for select
to authenticated
using (is_active = true or public.is_admin_user());

drop policy if exists study_materials_write on public.study_materials;
create policy study_materials_write
on public.study_materials
for all
to authenticated
using (public.is_super_admin_user())
with check (public.is_super_admin_user());

-- Seed default categories (safe upsert)
insert into public.exam_categories (name, description, logo_url, color_hex, sort_order, is_active)
values
  ('SSC', 'Staff Selection Commission', 'https://ssc.nic.in/Content/img/newLogo.png', '#E8B84B', 10, true),
  ('Banking', 'IBPS / SBI Exams', 'https://www.ibps.in/wp-content/themes/ibps/images/logo.png', '#34D399', 20, true),
  ('UPSC', 'Civil Services', 'https://www.upsc.gov.in/sites/default/files/logo.png', '#38BDF8', 30, true),
  ('JEE', 'Engineering Entrance', 'https://www.nta.ac.in/img/placeholder-logo.png', '#A78BFA', 40, true),
  ('RRB', 'Railway Recruitment', 'https://www.rrbcdg.gov.in/images/logo.png', '#FB923C', 50, true),
  ('Other', 'Other Competitive Exams', null, '#7090B0', 999, true)
on conflict (name) do update
set description = excluded.description,
    logo_url = excluded.logo_url,
    color_hex = excluded.color_hex,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active;

-- IMPORTANT:
-- Replace with your real super admin email before running.
insert into public.admin_users (email, role, is_active)
values ('himanshu.mzn2019@gmail.com', 'super_admin', true)
on conflict (email) do update
set role = 'super_admin',
    is_active = true;
