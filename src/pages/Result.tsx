import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ResultView from '../components/ResultView';
import { ErrorBox, Spinner, StateCard } from '../components/ui';
import { getResult } from '../lib/api';
import { toThai } from '../lib/errors';
import type { ResultData } from '../lib/types';

export default function Result() {
  const { token = '' } = useParams();
  const [data, setData] = useState<ResultData | null | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    getResult(token).then(setData).catch((e) => setError(toThai(e)));
  }, [token]);

  if (error) return <ErrorBox message={error} />;
  if (data === undefined) return <Spinner />;
  if (data === null) return <StateCard title="ไม่พบผลลัพธ์" text="ลิงก์ไม่ถูกต้อง หรือผลลัพธ์ถูกลบไปแล้ว" linkTo="/" linkLabel="ไปหน้าแรก" />;
  return (
    <div className="space-y-4">
      <p className="rounded-2xl bg-pink-50 p-3 text-xs text-pink-700">ลิงก์นี้คือผลลัพธ์ของคุณ ใครมีลิงก์จะเห็นคำตอบทั้งสองฝ่าย แนะนำให้บันทึกไว้และอย่าแชร์สู่สาธารณะ (ปุ่มแชร์จะส่งเฉพาะคะแนน)</p>
      <ResultView data={data} />
    </div>
  );
}
