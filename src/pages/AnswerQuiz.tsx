import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import QuestionForm from '../components/QuestionForm';
import { Card, ErrorBox, Spinner, StateCard } from '../components/ui';
import { getQuizDetail, submitCreatorAnswers, type QuizDetail } from '../lib/api';
import { toThai } from '../lib/errors';
import type { Answer } from '../lib/types';

export default function AnswerQuiz() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const [d, setD] = useState<QuizDetail | null | undefined>(undefined);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError('');
    getQuizDetail(id).then(setD).catch((e) => setError(toThai(e)));
  }, [id]);
  useEffect(load, [load]);

  const submit = async (answers: Answer[]) => {
    setBusy(true);
    setError('');
    try {
      await submitCreatorAnswers(id, answers);
      nav(`/quiz/${id}`, { replace: true });
    } catch (e) {
      setError(toThai(e));
      setBusy(false);
    }
  };

  if (error && d === undefined) return <ErrorBox message={error} onRetry={load} />;
  if (d === undefined) return <Spinner />;
  if (d === null) return <StateCard title="ไม่พบแบบทดสอบ" text="อาจถูกลบไปแล้ว" linkTo="/dashboard" linkLabel="กลับแดชบอร์ด" />;
  if (d.quiz.status !== 'draft') return <Navigate to={`/quiz/${id}`} replace />;

  return (
    <Card>
      <h1 className="mb-1 text-xl font-bold">{d.quiz.title}</h1>
      <p className="mb-5 text-sm text-slate-500">ตอบตามความรู้สึกจริงของคุณ คำตอบจะถูกซ่อนจนกว่าอีกฝ่ายจะตอบครบ</p>
      {error && <div className="mb-4"><ErrorBox message={error} /></div>}
      <QuestionForm questions={d.questions} busy={busy} submitLabel="ส่งคำตอบและรับลิงก์เชิญ" onSubmit={submit} />
    </Card>
  );
}
