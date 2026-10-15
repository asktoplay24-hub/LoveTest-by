-- ทดสอบ RLS และฟังก์ชัน LoveTest
-- วิธีใช้: รันทั้งไฟล์ใน Supabase SQL Editor (หลังรัน migrations ครบ)
-- สำเร็จ = เห็น NOTICE "ALL RLS TESTS PASSED"; ล้มเหลว = เกิด exception พร้อมชื่อข้อที่ล้ม
-- ทุกอย่างถูก ROLLBACK ไม่ทิ้งข้อมูลทดสอบ
begin;

create or replace function pg_temp.act(p_role text, p_uid uuid default null) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims',
    case when p_uid is null then json_build_object('role', p_role)::text
         else json_build_object('sub', p_uid, 'role', p_role)::text end, true);
  if p_role <> 'postgres' then execute format('set local role %I', p_role); end if;
end $$;

create or replace function pg_temp.expect_error(p_sql text, p_like text) returns void language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if sqlerrm like p_like then return; end if;
    raise exception 'FAIL: error ไม่ตรงที่คาด (ได้: %, คาด: %)', sqlerrm, p_like;
  end;
  raise exception 'FAIL: ควรเกิด error % แต่สำเร็จ', p_like;
end $$;

do $$
declare
  a uuid := '00000000-0000-0000-0000-0000000000a1';
  b uuid := '00000000-0000-0000-0000-0000000000b2';
  qid uuid; tok text; ans jsonb; inv jsonb; sub jsonb; res jsonb; n int;
begin
  perform pg_temp.act('postgres');
  insert into auth.users (id, aud, role, email) values
    (a, 'authenticated', 'authenticated', 'a@test.local'),
    (b, 'authenticated', 'authenticated', 'b@test.local');

  -- 1) A สร้างแบบทดสอบ 10 ข้อ
  perform pg_temp.act('authenticated', a);
  qid := public.create_quiz('ทดสอบ', 'เอ', 10);
  perform pg_temp.expect_error($q$select public.create_quiz('x','y',5)$q$, 'invalid_count');
  perform pg_temp.expect_error($q$select public.create_quiz('','y',10)$q$, 'invalid_title');
  select count(*) into n from public.quiz_questions where quiz_id = qid;
  if n <> 10 then raise exception 'FAIL 1: จำนวนคำถามต้องเป็น 10 (ได้ %)', n; end if;

  -- 2) client เขียนตารางตรง ๆ ไม่ได้
  perform pg_temp.expect_error(format($q$insert into public.answers values (%L, 1, 'creator', 0)$q$, qid), 'permission denied%');
  perform pg_temp.expect_error(format($q$update public.quizzes set status='completed' where id=%L$q$, qid), 'permission denied%');
  perform pg_temp.expect_error($q$select result_token from public.quizzes$q$, 'permission denied%');

  -- 3) A ตอบ (ส่งคำตอบไม่ครบต้องถูกปฏิเสธ)
  perform pg_temp.act('postgres');
  select jsonb_agg(jsonb_build_object('question_id', question_id, 'option_index', 0)) into ans from public.quiz_questions where quiz_id = qid;
  perform pg_temp.act('authenticated', a);
  perform pg_temp.expect_error(format($q$select public.submit_creator_answers(%L, '[]'::jsonb)$q$, qid), 'invalid_answers');
  perform public.submit_creator_answers(qid, ans);
  perform pg_temp.expect_error(format($q$select public.submit_creator_answers(%L, %L::jsonb)$q$, qid, ans::text), 'already_submitted');
  select invite_token into tok from public.quizzes where id = qid;

  -- 4) B (ผู้ใช้อื่น) มองไม่เห็นและลบไม่ได้
  perform pg_temp.act('authenticated', b);
  select count(*) into n from public.quizzes; if n <> 0 then raise exception 'FAIL 4a: B เห็นแบบทดสอบของ A'; end if;
  select count(*) into n from public.answers; if n <> 0 then raise exception 'FAIL 4b: B เห็นคำตอบของ A'; end if;
  select count(*) into n from public.quiz_questions; if n <> 0 then raise exception 'FAIL 4c: B เห็นคำถามของ A'; end if;
  delete from public.quizzes where id = qid; get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL 4d: B ลบของ A ได้'; end if;
  perform pg_temp.expect_error(format($q$select public.submit_creator_answers(%L, %L::jsonb)$q$, qid, ans::text), 'not_found');

  -- 5) anon (ผู้ตอบ) อ่านตารางไม่ได้ ได้แค่คำถามผ่านโทเคน และไม่เห็นคำตอบผู้สร้าง
  perform pg_temp.act('anon');
  perform pg_temp.expect_error($q$select * from public.quizzes$q$, 'permission denied%');
  perform pg_temp.expect_error($q$select * from public.answers$q$, 'permission denied%');
  perform pg_temp.expect_error($q$select public.create_quiz('x','y',10)$q$, 'permission denied%');
  inv := public.get_invite(tok);
  if inv->>'state' <> 'open' then raise exception 'FAIL 5a: ลิงก์เชิญควรเปิดได้'; end if;
  if inv::text like '%option_index%' or inv::text like '%creator_answer%' then raise exception 'FAIL 5b: ข้อมูลเชิญรั่วคำตอบ'; end if;
  if public.get_invite('zzzz')->>'state' <> 'invalid' then raise exception 'FAIL 5c: โทเคนผิดรูปแบบต้อง invalid'; end if;
  if public.get_invite(repeat('0', 48))->>'state' <> 'invalid' then raise exception 'FAIL 5d: โทเคนที่ไม่มีอยู่ต้อง invalid'; end if;

  -- 6) ผู้ตอบส่งคำตอบ: ตรวจความถูกต้องฝั่งเซิร์ฟเวอร์
  perform pg_temp.expect_error(format($q$select public.submit_invite_answers(%L, 'บี', '[]'::jsonb)$q$, tok), 'invalid_answers');
  perform pg_temp.expect_error(format($q$select public.submit_invite_answers(%L, '', '[]'::jsonb)$q$, tok), 'invalid_nickname');
  perform pg_temp.act('postgres');
  select jsonb_agg(jsonb_build_object('question_id', (x->>'id')::int, 'option_index', 9)) into sub from jsonb_array_elements(inv->'questions') x;
  perform pg_temp.act('anon');
  perform pg_temp.expect_error(format($q$select public.submit_invite_answers(%L, 'บี', %L::jsonb)$q$, tok, sub::text), 'invalid_answers');

  perform pg_temp.act('postgres');
  select jsonb_agg(jsonb_build_object('question_id', (x->>'id')::int, 'option_index', 0)) into sub from jsonb_array_elements(inv->'questions') x;
  perform pg_temp.act('anon');
  res := public.submit_invite_answers(tok, 'บี', sub);
  if (res->>'score')::int <> 100 then raise exception 'FAIL 6a: ตอบเหมือนกันทุกข้อต้องได้ 100 (ได้ %)', res->>'score'; end if;
  perform pg_temp.expect_error(format($q$select public.submit_invite_answers(%L, 'บี', %L::jsonb)$q$, tok, sub::text), 'already_submitted');
  if public.get_invite(tok)->>'state' <> 'completed' then raise exception 'FAIL 6b: ลิงก์เชิญควรใช้ซ้ำไม่ได้'; end if;

  -- 7) ผลลัพธ์เปิดได้ด้วย result_token เท่านั้น (ลิงก์เชิญอ่านผลไม่ได้)
  if public.get_invite_result(tok)->>'state' <> 'invalid' then raise exception 'FAIL 7a: ลิงก์เชิญอ่านผลได้'; end if;
  if public.get_invite_result(res->>'result_token')->>'state' <> 'ok' then raise exception 'FAIL 7b: result_token ควรอ่านผลได้'; end if;
  if jsonb_array_length(public.get_invite_result(res->>'result_token')->'items') <> 10 then raise exception 'FAIL 7c: ต้องมี 10 รายการ'; end if;

  -- 8) หลังเสร็จ A เห็นคำตอบของผู้ตอบ แต่ B ยังไม่เห็น
  perform pg_temp.act('authenticated', a);
  select count(*) into n from public.answers where quiz_id = qid and role = 'invitee';
  if n <> 10 then raise exception 'FAIL 8a: A ควรเห็นคำตอบผู้ตอบ 10 ข้อ (ได้ %)', n; end if;
  perform pg_temp.act('authenticated', b);
  select count(*) into n from public.answers; if n <> 0 then raise exception 'FAIL 8b: B เห็นคำตอบ'; end if;

  -- 9) A ลบแบบทดสอบ -> คำถาม/คำตอบถูกลบตาม
  perform pg_temp.act('authenticated', a);
  delete from public.quizzes where id = qid; get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL 9a: A ควรลบของตัวเองได้'; end if;
  perform pg_temp.act('postgres');
  select count(*) into n from public.answers where quiz_id = qid;
  if n <> 0 then raise exception 'FAIL 9b: คำตอบไม่ถูกลบ'; end if;

  raise notice 'ALL RLS TESTS PASSED';
end $$;

rollback;
