import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, ErrorBox, inputClass } from '../components/ui';
import { createQuiz } from '../lib/api';
import { toThai } from '../lib/errors';
import { normalize, validateCount, validateNickname, validateTitle } from '../lib/validation';

export default function CreateQuiz() {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [nick, setNick] = useState('');
  const [count, setCount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validateTitle(title) ?? validateNickname(nick) ?? validateCount(count);
    if (v) return setError(v);
    setBusy(true);
    setError('');
    try {
      const id = await createQuiz(normalize(title), normalize(nick), count);
      nav(`/quiz/${id}/answer`, { replace: true });
    } catch (err) {
      setError(toThai(err));
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="mb-4 text-xl font-bold">สร้างแบบทดสอบความเข้ากัน</h1>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <label className="block text-sm">ชื่อแบบทดสอบ
            <input className={`${inputClass} mt-1`} maxLength={60} placeholder="เช่น เราสองคน" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block text-sm">ชื่อเล่นของคุณ
            <input className={`${inputClass} mt-1`} maxLength={30} placeholder="ชื่อที่จะแสดงในผลลัพธ์" value={nick} onChange={(e) => setNick(e.target.value)} />
          </label>
          <fieldset>
            <legend className="mb-1 text-sm">จำนวนคำถาม</legend>
            <div className="flex gap-2">
              {[10, 15, 20].map((n) => (
                <button key={n} type="button" onClick={() => setCount(n)} aria-pressed={count === n}
                  className={`flex-1 rounded-2xl border py-2.5 text-sm ${count === n ? 'border-pink-500 bg-pink-50 font-medium text-pink-700' : 'border-pink-100 bg-white'}`}>
                  {n} ข้อ
                </button>
              ))}
            </div>
          </fieldset>
          {error && <ErrorBox message={error} />}
          <Button className="w-full" disabled={busy}>{busy ? 'กำลังสร้าง...' : 'สร้างและเริ่มตอบ'}</Button>
        </form>
      </Card>
    </div>
  );
}
