# LoveTest by Chipon Production

เว็บไซต์ทดสอบความเข้ากันได้ของคู่รัก ธีมขาว–ชมพู ภาษาไทยทั้งหมด
React + TypeScript + Vite · Tailwind CSS · Supabase (PostgreSQL + Auth + RLS) · Netlify

## การทำงานโดยสรุป
1. ผู้สร้าง (สมัคร/เข้าสู่ระบบด้วยอีเมล) สร้างแบบทดสอบ 10–20 ข้อ (สุ่มจากคลังคำถาม 20 ข้อ) แล้วตอบคำถามของตนเอง
2. ระบบสร้างลิงก์เชิญเฉพาะ `/i/<token>` (โทเคนสุ่ม 192 บิต ใช้ได้ 7 วัน ใช้ได้ครั้งเดียว)
3. ผู้ตอบ **ไม่ต้องสมัครสมาชิก** ตอบชุดคำถามเดียวกันผ่านลิงก์ เซิร์ฟเวอร์คำนวณคะแนน = ข้อที่ตอบตรงกัน ÷ จำนวนข้อ
4. ผู้ตอบถูกส่งไป `/r/<result_token>` (โทเคนแยกจากลิงก์เชิญ) ผู้สร้างดูผลได้จาก Dashboard
5. ปุ่มแชร์ส่งเฉพาะ "คะแนน" ไม่ส่งคำตอบรายข้อ

## ติดตั้งบน Windows
1. ติดตั้ง [Node.js LTS](https://nodejs.org) (18.18 ขึ้นไป) และ VS Code
2. เปิดโฟลเดอร์โปรเจกต์ใน VS Code → เปิด Terminal (PowerShell) แล้วรัน
   ```powershell
   npm install
   copy .env.example .env
   ```
3. สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com) แล้วทำตามหัวข้อ "เชื่อม Supabase"
4. แก้ไฟล์ `.env` ใส่ `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` (Project Settings → API) ใช้ **anon key เท่านั้น**
5. `npm run dev` แล้วเปิด http://localhost:5173

## เชื่อม Supabase
**วิธี A: SQL Editor (ง่ายที่สุด)** เปิด SQL Editor แล้วรันไฟล์ตามลำดับ
`supabase/migrations/0001_schema.sql` → `0002_rls.sql` → `0003_functions.sql` → `0004_seed_questions.sql`

**วิธี B: Supabase CLI**
```powershell
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

**ตั้งค่า Auth** (Authentication → URL Configuration): ตั้ง Site URL เป็นโดเมนจริง และเพิ่ม `http://localhost:5173` ใน Redirect URLs
ถ้าเปิด "Confirm email" ผู้สมัครต้องกดยืนยันอีเมลก่อนเข้าสู่ระบบ (แนะนำให้เปิดใน production)

**ตั้งเวลาลบข้อมูลตามนโยบาย** เปิดส่วนขยาย `pg_cron` (Database → Extensions) แล้วรัน
```sql
select cron.schedule('lovetest-purge', '0 3 * * *', $$select private.purge_expired()$$);
```

## ทดสอบ
- Unit test ฝั่ง frontend (คะแนน/การตรวจข้อมูล): `npm test`
- ทดสอบ RLS และฟังก์ชันฐานข้อมูล: รัน `supabase/tests/rls_tests.sql` ใน SQL Editor
  สำเร็จเมื่อเห็นข้อความ `ALL RLS TESTS PASSED` (สคริปต์ ROLLBACK เองทุกครั้ง)
- ตรวจ build: `npm run build`

## ความปลอดภัย (สรุปการออกแบบ)
| ข้อกำหนด | วิธีทำ |
|---|---|
| RLS ทุกตาราง | เปิด RLS บน 4 ตาราง, เพิกถอนสิทธิ์เขียนตรงของ anon/authenticated, ผู้สร้างอ่าน/ลบได้เฉพาะของตนเอง |
| ไม่เปิดคำตอบก่อนส่ง | ผู้ตอบเรียกได้เฉพาะ `get_invite` (คำถามล้วน); คำตอบผู้ตอบมีผู้สร้างอ่านได้เมื่อสถานะ `completed` เท่านั้น |
| ไม่มี service-role key ใน frontend | frontend ใช้ anon key; การเขียนทั้งหมดผ่านฟังก์ชัน `SECURITY DEFINER` ที่ตรวจ `auth.uid()` |
| โทเคนเดายาก | `gen_random_bytes(24)` (hex 48 ตัว), ตรวจรูปแบบก่อน query, ลิงก์เชิญใช้ครั้งเดียว |
| กันอ่านผลโดยไม่มีสิทธิ์ | ผลเปิดได้ด้วย `result_token` แยกต่างหาก; คอลัมน์ `result_token` อ่านจาก client ตรง ๆ ไม่ได้ |
| ข้อมูลน้อยที่สุด | เก็บอีเมล ชื่อเล่น และคำตอบเท่านั้น ไม่ขอตำแหน่ง/รายชื่อติดต่อ |
| ตรวจข้อมูลสองฝั่ง | validation ใน `src/lib/validation.ts` และซ้ำใน SQL (ความยาว, จำนวนข้อ, ตัวเลือกอยู่ในช่วง, ส่งซ้ำไม่ได้, โควตา 30 ชุด/ผู้ใช้) |
| นโยบายเก็บ/ลบ | ลิงก์เชิญ 7 วัน; ลบอัตโนมัติ 30 วันหลังเสร็จ/สร้าง; ผู้สร้างลบเองได้ทันที (หน้า `/privacy`) |
| Header ความปลอดภัย | CSP, `Referrer-Policy: no-referrer`, `noindex` สำหรับ `/i/*` และ `/r/*` ใน `netlify.toml` |

ข้อควรรู้: ผู้ที่มีลิงก์ `/i/...` หรือ `/r/...` ถือว่ามีสิทธิ์ตามลิงก์นั้น จึงควรส่งให้เฉพาะคนที่ต้องการ
ฟังก์ชัน `get_invite*` ยังไม่มี rate limit ในตัว หากต้องการเพิ่มความทนต่อการยิงถี่ ให้เปิด Rate Limits ของ Supabase หรือวาง Cloudflare/WAF หน้าโดเมน

## Deploy บน Netlify
1. push โปรเจกต์ขึ้น Git แล้วเชื่อมกับ Netlify (Build command `npm run build`, Publish directory `dist` — ตั้งไว้ใน `netlify.toml` แล้ว)
2. Site settings → Environment variables: เพิ่ม `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY`
3. เพิ่มโดเมน Netlify ใน Supabase → Authentication → URL Configuration
4. หากเปลี่ยนโดเมน Supabase ให้ปรับ `connect-src` ใน CSP ของ `netlify.toml` ให้ตรง

## โครงสร้างโปรเจกต์
```
src/pages        หน้าต่าง ๆ (Home, Auth, Dashboard, CreateQuiz, AnswerQuiz, QuizDetail, Invite, Result, Privacy)
src/components   Layout, QuestionForm, ResultView, ui
src/lib          supabase client, api, auth, validation, score, errors, share
supabase/migrations  schema, RLS, functions, seed คำถาม
supabase/tests   rls_tests.sql
```
