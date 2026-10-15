import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { btnClass, Card, EmptyState, ErrorBox, Spinner } from '../components/ui';
import { listQuizzes } from '../lib/api';
import { toThai } from '../lib/errors';
import type { QuizRow } from '../lib/types';

export function statusInfo(q: QuizRow): { label: string; cls: string } {
  if (q.status === 'completed') return { label: 'เสร็จสมบูรณ์', cls: 'bg-pink-100 text-pink-700' };
  if (q.status === 'draft') return { label: 'ยังตอบไม่ครบ', cls: 'bg-slate-100 text-slate-600' };
  if (new Date(q.expires_at) < new Date()) return { label: 'ลิงก์หมดอายุ', cls: 'bg-red-50 text-red-600' };
  return { label: 'รอคู่ของคุณตอบ', cls: 'bg-amber-50 text-amber-700' };
}

export default function Dashboard() {
  const [rows, setRows] = useState<QuizRow[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    setRows(null);
    listQuizzes().then(setRows).catch((e) => setError(toThai(e)));
  }, []);
  useEffect(load, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">แบบทดสอบของฉัน</h1>
        <Link to="/create" className={btnClass()}>+ สร้างใหม่</Link>
      </div>
      {error ? <ErrorBox message={error} onRetry={load} /> : rows === null ? <Spinner /> : rows.length === 0 ? (
        <Card>
          <EmptyState title="ยังไม่มีแบบทดสอบ" text="สร้างแบบทดสอบแรกแล้วส่งให้คนพิเศษของคุณ" action={<Link to="/create" className={btnClass()}>สร้างแบบทดสอบ</Link>} />
        </Card>
      ) : (
        <ul className="space-y-3">
          {rows.map((q) => {
            const s = statusInfo(q);
            return (
              <li key={q.id}>
                <Link to={q.status === 'draft' ? `/quiz/${q.id}/answer` : `/quiz/${q.id}`} className="block">
                  <Card className="!p-4 transition hover:border-pink-300">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-bold">{q.title}</h2>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${s.cls}`}>{s.label}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      สร้างเมื่อ {new Date(q.created_at).toLocaleDateString('th-TH')}
                      {q.score !== null && ` • ความเข้ากัน ${q.score}%`}
                    </p>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
