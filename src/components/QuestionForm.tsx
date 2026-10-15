import { useState } from 'react';
import type { Answer, Question } from '../lib/types';
import { isComplete, toPayload } from '../lib/validation';
import { Button } from './ui';

interface Props {
  questions: Question[];
  busy?: boolean;
  submitLabel: string;
  onSubmit: (answers: Answer[]) => void;
}

export default function QuestionForm({ questions, busy, submitLabel, onSubmit }: Props) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const q = questions[idx];
  const answered = Object.keys(picked).length;
  const last = idx === questions.length - 1;

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-500">
        <span>ข้อ {idx + 1} / {questions.length}</span>
        <span>{q.category}</span>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-pink-100" aria-hidden>
        <div className="h-full rounded-full bg-pink-500 transition-all" style={{ width: `${(answered / questions.length) * 100}%` }} />
      </div>
      <h2 className="mb-4 text-lg font-bold leading-snug">{q.prompt}</h2>
      <div role="radiogroup" aria-label={q.prompt} className="space-y-2">
        {q.options.map((opt, i) => {
          const on = picked[q.id] === i;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setPicked((p) => ({ ...p, [q.id]: i }))}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                on ? 'border-pink-500 bg-pink-50 font-medium text-pink-700' : 'border-pink-100 bg-white hover:border-pink-300'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex justify-between gap-3">
        <Button variant="ghost" type="button" disabled={idx === 0 || busy} onClick={() => setIdx(idx - 1)}>ย้อนกลับ</Button>
        {last ? (
          <Button type="button" disabled={busy || !isComplete(questions, picked)} onClick={() => onSubmit(toPayload(questions, picked))}>
            {busy ? 'กำลังส่ง...' : submitLabel}
          </Button>
        ) : (
          <Button type="button" disabled={picked[q.id] === undefined} onClick={() => setIdx(idx + 1)}>ถัดไป</Button>
        )}
      </div>
    </div>
  );
}
