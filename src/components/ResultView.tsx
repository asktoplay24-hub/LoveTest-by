import { useState } from 'react';
import type { ResultData } from '../lib/types';
import { countMatches, scoreLabel } from '../lib/score';
import { shareOrCopy } from '../lib/share';
import { Button, Card } from './ui';

export default function ResultView({ data }: { data: ResultData }) {
  const [msg, setMsg] = useState('');
  const matches = countMatches(data.items);

  // แชร์เฉพาะคะแนน ไม่แชร์คำตอบรายข้อ
  const share = async () => {
    const r = await shareOrCopy({
      title: 'LoveTest',
      text: `${data.creator_nickname} & ${data.invitee_nickname} เข้ากันได้ ${data.score}% จาก LoveTest 💗`,
      url: window.location.origin,
    });
    setMsg(r === 'copied' ? 'คัดลอกข้อความแล้ว' : r === 'failed' ? 'แชร์ไม่สำเร็จ' : '');
  };

  return (
    <div className="space-y-5">
      <Card className="text-center">
        <p className="text-sm text-slate-500">{data.title}</p>
        <p className="mt-1 text-sm">{data.creator_nickname} ♥ {data.invitee_nickname}</p>
        <p className="my-3 text-6xl font-bold text-pink-500">{data.score}%</p>
        <p className="font-medium">{scoreLabel(data.score)}</p>
        <p className="mt-1 text-sm text-slate-500">ตอบตรงกัน {matches} จาก {data.items.length} ข้อ</p>
        <Button className="mt-4" onClick={share}>แชร์คะแนน</Button>
        {msg && <p className="mt-2 text-xs text-slate-500" role="status">{msg}</p>}
      </Card>
      <div className="space-y-3">
        {data.items.map((it) => {
          const same = it.creator_answer === it.invitee_answer;
          return (
            <Card key={it.position} className="!p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="font-medium">{it.position}. {it.prompt}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${same ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-500'}`}>
                  {same ? 'ตรงกัน' : 'ต่างกัน'}
                </span>
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex gap-2"><dt className="w-24 shrink-0 text-slate-500">{data.creator_nickname}</dt><dd>{it.options[it.creator_answer] ?? '-'}</dd></div>
                <div className="flex gap-2"><dt className="w-24 shrink-0 text-slate-500">{data.invitee_nickname}</dt><dd>{it.options[it.invitee_answer] ?? '-'}</dd></div>
              </dl>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
