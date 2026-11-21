-- Run once in Supabase SQL Editor.
create table if not exists public.download_stats (
  id smallint primary key default 1 check (id = 1),
  total_downloads bigint not null default 0,
  updated_at timestamptz not null default now()
);
insert into public.download_stats (id) values (1) on conflict do nothing;

create table if not exists public.download_events (
  id bigint generated always as identity primary key,
  variant text not null check (variant in ('arm64-v8a','armeabi-v7a','universal','x86_64')),
  client_hash text not null,           -- salted SHA-256 of IP+UA, never the raw IP
  downloaded_at timestamptz not null default now()
);
create index if not exists de_client_idx on public.download_events (client_hash, downloaded_at desc);
create index if not exists de_time_idx on public.download_events (downloaded_at desc);

alter table public.download_stats enable row level security;
alter table public.download_events enable row level security;
revoke all on public.download_stats, public.download_events from anon, authenticated;
grant select on public.download_stats to anon, authenticated;
create policy "public read stats" on public.download_stats for select to anon, authenticated using (true);
-- download_events: RLS on, no policy => invisible to anon.

create or replace function public.record_download(p_variant text, p_client_hash text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_total bigint;
begin
  if p_variant not in ('arm64-v8a','armeabi-v7a','universal','x86_64') or coalesce(length(p_client_hash),0) <> 64 then
    return jsonb_build_object('counted', false, 'reason', 'invalid');
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_client_hash, 0));     -- serialize per client
  if exists (select 1 from download_events where client_hash = p_client_hash and variant = p_variant
             and downloaded_at > now() - interval '10 minutes') then
    return jsonb_build_object('counted', false, 'reason', 'duplicate');
  end if;
  if (select count(*) from download_events where client_hash = p_client_hash
      and downloaded_at > now() - interval '1 hour') >= 10 then
    return jsonb_build_object('counted', false, 'reason', 'rate_limited');
  end if;
  if (select count(*) from download_events where downloaded_at > now() - interval '1 minute') >= 120 then
    return jsonb_build_object('counted', false, 'reason', 'global_limit');
  end if;
  insert into download_events (variant, client_hash) values (p_variant, p_client_hash);
  update download_stats set total_downloads = total_downloads + 1, updated_at = now()
    where id = 1 returning total_downloads into v_total;                 -- row lock = atomic
  return jsonb_build_object('counted', true, 'total', v_total);
end $$;
revoke all on function public.record_download(text, text) from public, anon, authenticated;
grant execute on function public.record_download(text, text) to service_role;

alter publication supabase_realtime add table public.download_stats;
