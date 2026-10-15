import { Link } from 'react-router-dom';
import { btnClass, Card } from '../components/ui';

const steps = [
  ['1', 'สร้างแบบทดสอบ', 'ตั้งชื่อ เลือกจำนวนคำถาม 10–20 ข้อ แล้วตอบคำถามของคุณ'],
  ['2', 'ส่งลิงก์ให้คนพิเศษ', 'ลิงก์เฉพาะที่ใช้ได้ครั้งเดียว คำตอบของคุณจะถูกซ่อนไว้'],
  ['3', 'ดูผลความเข้ากัน', 'เมื่อเขาตอบครบ จะเห็นคะแนนและคำตอบเทียบกันทีละข้อ'],
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="py-6 text-center sm:py-12">
        <p className="mb-2 text-sm font-medium text-pink-500">LoveTest by Chipon Production</p>
        <h1 className="mb-3 text-3xl font-bold leading-tight sm:text-4xl">เรา “เข้ากัน” แค่ไหนนะ?</h1>
        <p className="mx-auto mb-6 max-w-md text-slate-600">ตอบชุดคำถามเดียวกันกับคนที่คุณรัก แล้วมาดูกันว่าใจตรงกันกี่เปอร์เซ็นต์</p>
        <Link to="/create" className={btnClass('primary', '!px-8 !py-3 text-base')}>เริ่มต้นเลย ♥</Link>
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        {steps.map(([n, t, d]) => (
          <Card key={n} className="!p-5">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 font-bold text-pink-600">{n}</div>
            <h2 className="mb-1 font-bold">{t}</h2>
            <p className="text-sm text-slate-600">{d}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
