import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isConfigured = Boolean(url && key);

// ใช้เฉพาะ anon key เท่านั้น ความปลอดภัยทั้งหมดอยู่ที่ RLS และฟังก์ชันฝั่งฐานข้อมูล
export const supabase = createClient(url ?? 'http://localhost:54321', key ?? 'missing-key', {
  auth: { persistSession: true, autoRefreshToken: true },
});
