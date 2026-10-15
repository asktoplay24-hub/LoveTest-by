-- LoveTest: Row Level Security
-- หลักการ: ผู้สร้าง (authenticated) อ่าน/ลบได้เฉพาะของตัวเอง
-- การเขียนข้อมูลทั้งหมดและทุกอย่างของผู้ตอบ (anon) ผ่านฟังก์ชัน SECURITY DEFINER เท่านั้น

alter table public.question_bank enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.answers enable row level security;

revoke all on public.question_bank, public.quizzes, public.quiz_questions, public.answers from anon, authenticated;

grant select on public.question_bank to anon, authenticated;
-- ไม่ให้ client อ่าน result_token โดยตรง
grant select (id, owner_id, title, creator_nickname, invitee_nickname, status, invite_token,
              score, created_at, expires_at, completed_at, delete_after) on public.quizzes to authenticated;
grant delete on public.quizzes to authenticated;
grant select on public.quiz_questions to authenticated;
grant select on public.answers to authenticated;

create policy question_bank_read on public.question_bank
  for select to anon, authenticated using (true);

create policy quizzes_owner_select on public.quizzes
  for select to authenticated using (owner_id = (select auth.uid()));

create policy quizzes_owner_delete on public.quizzes
  for delete to authenticated using (owner_id = (select auth.uid()));

create policy quiz_questions_owner_select on public.quiz_questions
  for select to authenticated
  using (exists (select 1 from public.quizzes q where q.id = quiz_questions.quiz_id and q.owner_id = (select auth.uid())));

-- คำตอบของผู้สร้างอ่านได้เสมอ, คำตอบของผู้ตอบอ่านได้เมื่อแบบทดสอบเสร็จสมบูรณ์เท่านั้น
create policy answers_owner_select on public.answers
  for select to authenticated
  using (exists (
    select 1 from public.quizzes q
    where q.id = answers.quiz_id
      and q.owner_id = (select auth.uid())
      and (answers.role = 'creator' or q.status = 'completed')
  ));
