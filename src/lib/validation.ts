import type { Answer, Question } from './types';

export const TOKEN_RE = /^[0-9a-f]{48}$/;

export const normalize = (s: string): string => s.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim();

export function validateTitle(v: string): string | null {
  const n = normalize(v);
  return n.length >= 1 && n.length <= 60 ? null : 'ชื่อแบบทดสอบต้องมี 1–60 ตัวอักษร';
}

export function validateNickname(v: string): string | null {
  const n = normalize(v);
  return n.length >= 1 && n.length <= 30 ? null : 'ชื่อเล่นต้องมี 1–30 ตัวอักษร';
}

export function validateCount(n: number): string | null {
  return Number.isInteger(n) && n >= 10 && n <= 20 ? null : 'จำนวนคำถามต้องอยู่ระหว่าง 10–20 ข้อ';
}

export function validateEmail(v: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) && v.length <= 254 ? null : 'รูปแบบอีเมลไม่ถูกต้อง';
}

export function validatePassword(v: string): string | null {
  return v.length >= 8 && v.length <= 72 ? null : 'รหัสผ่านต้องมี 8–72 ตัวอักษร';
}

export function isComplete(questions: Question[], picked: Record<number, number>): boolean {
  return questions.every((q) => Number.isInteger(picked[q.id]) && picked[q.id] >= 0 && picked[q.id] < q.options.length);
}

export function toPayload(questions: Question[], picked: Record<number, number>): Answer[] {
  return questions.map((q) => ({ question_id: q.id, option_index: picked[q.id] }));
}
