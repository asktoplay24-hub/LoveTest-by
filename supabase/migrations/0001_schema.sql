-- LoveTest: โครงสร้างตาราง
create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.question_bank (
  id smallint primary key,
  category text not null,
  prompt text not null check (char_length(prompt) between 3 and 200),
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 6)
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  creator_nickname text not null check (char_length(creator_nickname) between 1 and 30),
  invitee_nickname text check (invitee_nickname is null or char_length(invitee_nickname) between 1 and 30),
  status text not null default 'draft' check (status in ('draft', 'waiting', 'completed')),
  invite_token text not null unique default encode(extensions.gen_random_bytes(24), 'hex'),
  result_token text unique,
  score smallint check (score between 0 and 100),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  completed_at timestamptz,
  delete_after timestamptz not null default now() + interval '30 days'
);
create index quizzes_owner_idx on public.quizzes (owner_id, created_at desc);
create index quizzes_delete_after_idx on public.quizzes (delete_after);

create table public.quiz_questions (
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_id smallint not null references public.question_bank(id),
  position smallint not null check (position between 1 and 20),
  primary key (quiz_id, question_id),
  unique (quiz_id, position)
);

create table public.answers (
  quiz_id uuid not null,
  question_id smallint not null,
  role text not null check (role in ('creator', 'invitee')),
  option_index smallint not null check (option_index between 0 and 5),
  created_at timestamptz not null default now(),
  primary key (quiz_id, question_id, role),
  foreign key (quiz_id, question_id) references public.quiz_questions(quiz_id, question_id) on delete cascade
);
