import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuestionForm from '../components/QuestionForm';
import { Card, ErrorBox, inputClass, Spinner, StateCard } from '../components/ui';
import { getInvite, submitInvite } from '../lib/api';
import { toThai } from '../lib/errors';
import type { Answer, InviteView } from '../lib/types';
import { normalize, validateNickname } from '../lib/validation';

export default function Invite() {
  const { token = '' } = useParams();
  const nav = useNavigate();
  const [v, setV] = useState<InviteView | null>(null);
  const [error, setError] = useState('');
  const [nick, setNick] = useState('');
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getInvite(token).then(setV).catch((e) => setError(toThai(e)));
  }, [token]);

  const submit = async (answers: Answer[]) => {
    setBusy(true);
    setError('');
    try {
      const r = await submitInvite(token, normalize(nick), answers);
      nav(`/r/${r.result_token}`, { replace: true });
    } catch (e) {
      setError(toThai(e));
      setBusy(false);
    }
  };

  if (error && !v) return <ErrorBox message={error} />;
  if (!v) return <Spinner />;
  if (v.state === 'expired') return <StateCard title="ลิงก์หมดอายุแล้ว" text="ขอให้เจ้าของแบบทดสอบสร้างลิงก์ใหม่ให้คุณ" />;
  if (v.state === 'completed') return <StateCard title="ลิงก์นี้ถูกใช้ไปแล้ว" text="มีการส่งคำตอบสำหรับแบบทดสอบนี้เรียบร้อยแล้ว" />;
  if (v.state === 'not_ready') return <StateCard title="ยังไม่พร้อมให้ตอบ" text="เจ้าของแบบทดสอบยังตอบไม่เสร็จ กรุณาลองใหม่ภายหลัง" />;
  if (v.state !== 'open' || !v.questions) return <StateCard title="ลิงก์ไม่ถูกต้อง" text="กรุณาตรวจสอบลิงก์ที่ได้รับอีกครั้ง" linkTo="/" linkLabel="ไปหน้าแรก" />;

  return (
    <Card>
      <p className="text-sm text-pink-500">{v.creator_nickname} ชวนคุณทำแบบทดสอบ</p>
      <h1 className="mb-4 text-xl font-bold">{v.title}</h1>
      {!started ? (
        <form
          className="space-y-3"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const m = validateNickname(nick);
            if (m) return setError(m);
            setError('');
            setStarted(true);
          }}
        >
          <p className="text-sm text-slate-600">ตอบตามความรู้สึกจริงของคุณ คำตอบของ {v.creator_nickname} จะยังไม่แสดงจนกว่าคุณจะส่งคำตอบ</p>
          <input className={inputClass} maxLength={30} placeholder="ชื่อเล่นของคุณ" value={nick} onChange={(e) => setNick(e.target.value)} />
          {error && <ErrorBox message={error} />}
          <button className="w-full rounded-full bg-pink-500 py-3 font-medium text-white hover:bg-pink-600">เริ่มตอบ</button>
        </form>
      ) : (
        <>
          {error && <div className="mb-4"><ErrorBox message={error} /></div>}
          <QuestionForm questions={v.questions} busy={busy} submitLabel="ส่งคำตอบและดูผล" onSubmit={submit} />
        </>
      )}
    </Card>
  );
}
