import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import ResultView from '../components/ResultView';
import { Button, Card, ErrorBox, Spinner, StateCard } from '../components/ui';
import { buildResult, deleteQuiz, getQuizDetail, type QuizDetail } from '../lib/api';
import { toThai } from '../lib/errors';
import { copyText, shareOrCopy } from '../lib/share';
import { statusInfo } from './Dashboard';

export default function QuizDetailPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const [d, setD] = useState<QuizDetail | null | undefined>(undefined);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError('');
    getQuizDetail(id).then(setD).catch((e) => setError(toThai(e)));
  }, [id]);
  useEffect(load, [load]);

  if (error && d === undefined) return <ErrorBox message={error} onRetry={load} />;
  if (d === undefined) return <Spinner />;
  if (d === null) return <StateCard title="ไม่พบแบบทดสอบ" text="อาจถูกลบไปแล้ว" linkTo="/dashboard" linkLabel="กลับแดชบอร์ด" />;
  if (d.quiz.status === 'draft') return <Navigate to={`/quiz/${id}/answer`} replace />;

  const q = d.quiz;
  const s = statusInfo(q);
  const link = `${window.location.origin}/i/${q.invite_token}`;
  const expired = q.status === 'waiting' && new Date(q.expires_at) < new Date();
  const result = buildResult(d);

  const remove = async () => {
    if (!window.confirm('ลบแบบทดสอบและคำตอบทั้งหมดถาวร? ไม่สามารถกู้คืนได้')) return;
    setBusy(true);
    try {
      await deleteQuiz(id);
      nav('/dashboard', { replace: true });
    } catch (e) {
      setError(toThai(e));
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold">{q.title}</h1>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${s.cls}`}>{s.label}</span>
        </div>

        {q.status === 'waiting' && !expired && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-600">ส่งลิงก์นี้ให้คู่ของคุณ (ใช้ได้จนถึง {new Date(q.expires_at).toLocaleDateString('th-TH')}) ใครมีลิงก์ก็ตอบได้ จึงควรส่งให้เฉพาะคนที่ต้องการ</p>
            <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-2xl border border-pink-200 bg-pink-50/50 px-3 py-2 text-xs" aria-label="ลิงก์เชิญ" />
            <div className="flex gap-2">
              <Button onClick={async () => setNote((await copyText(link)) ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกไม่สำเร็จ')}>คัดลอกลิงก์</Button>
              <Button variant="ghost" onClick={async () => {
                const r = await shareOrCopy({ title: 'LoveTest', text: `${q.creator_nickname} ชวนคุณทำแบบทดสอบความเข้ากัน`, url: link });
                setNote(r === 'copied' ? 'คัดลอกลิงก์แล้ว' : r === 'failed' ? 'แชร์ไม่สำเร็จ' : '');
              }}>แชร์</Button>
              <Button variant="ghost" onClick={load}>รีเฟรชสถานะ</Button>
            </div>
            {note && <p className="text-xs text-slate-500" role="status">{note}</p>}
          </div>
        )}
        {expired && <p className="mt-4 text-sm text-red-600">ลิงก์เชิญหมดอายุแล้ว กรุณาลบแล้วสร้างแบบทดสอบใหม่</p>}
        {error && <div className="mt-3"><ErrorBox message={error} /></div>}
      </Card>

      {result && <ResultView data={result} />}

      <div className="flex justify-between">
        <Link to="/dashboard" className="text-sm text-pink-600 underline">← กลับแดชบอร์ด</Link>
        <Button variant="danger" disabled={busy} onClick={remove}>ลบแบบทดสอบ</Button>
      </div>
    </div>
  );
}
