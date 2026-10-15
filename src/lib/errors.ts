export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

const MESSAGES: Record<string, string> = {
  not_authenticated: 'กรุณาเข้าสู่ระบบก่อน',
  invalid_title: 'ชื่อแบบทดสอบต้องมี 1–60 ตัวอักษร',
  invalid_nickname: 'ชื่อเล่นต้องมี 1–30 ตัวอักษร',
  invalid_count: 'จำนวนคำถามต้องอยู่ระหว่าง 10–20 ข้อ',
  quota_exceeded: 'คุณสร้างแบบทดสอบครบจำนวนสูงสุดแล้ว (30 ชุด) กรุณาลบชุดเก่าก่อน',
  not_found: 'ไม่พบแบบทดสอบนี้',
  already_submitted: 'ส่งคำตอบไปแล้ว ไม่สามารถส่งซ้ำได้',
  invalid_answers: 'คำตอบไม่ครบหรือไม่ถูกต้อง กรุณาตอบให้ครบทุกข้อ',
  invalid_link: 'ลิงก์ไม่ถูกต้อง',
  expired: 'ลิงก์นี้หมดอายุแล้ว',
  not_ready: 'แบบทดสอบนี้ยังไม่พร้อมให้ตอบ',
};

export function toThai(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  if (MESSAGES[msg]) return MESSAGES[msg];
  if (/Invalid login credentials/i.test(msg)) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
  if (/already registered|already been registered/i.test(msg)) return 'อีเมลนี้ถูกใช้สมัครแล้ว';
  if (/Failed to fetch|NetworkError/i.test(msg)) return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่';
  return 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
}
