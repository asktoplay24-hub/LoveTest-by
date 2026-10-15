import { supabase } from './supabase';
import { AppError } from './errors';
import { TOKEN_RE } from './validation';
import type { Answer, InviteView, Question, QuizRow, ResultData, ResultItem } from './types';

const QUIZ_COLS =
  'id, title, creator_nickname, invitee_nickname, status, invite_token, score, created_at, expires_at, completed_at, delete_after';

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new AppError(error.message);
  return data as T;
}

export async function listQuizzes(): Promise<QuizRow[]> {
  const { data, error } = await supabase.from('quizzes').select(QUIZ_COLS).order('created_at', { ascending: false });
  if (error) throw new AppError(error.message);
  return (data ?? []) as QuizRow[];
}

export interface QuizDetail {
  quiz: QuizRow;
  questions: Question[];
  answers: { question_id: number; role: 'creator' | 'invitee'; option_index: number }[];
}

export async function getQuizDetail(id: string): Promise<QuizDetail | null> {
  const { data: quiz, error } = await supabase.from('quizzes').select(QUIZ_COLS).eq('id', id).maybeSingle();
  if (error) throw new AppError(error.message);
  if (!quiz) return null;
  const [qs, ans] = await Promise.all([
    supabase.from('quiz_questions').select('position, question_bank(id, category, prompt, options)').eq('quiz_id', id).order('position'),
    supabase.from('answers').select('question_id, role, option_index').eq('quiz_id', id),
  ]);
  if (qs.error) throw new AppError(qs.error.message);
  if (ans.error) throw new AppError(ans.error.message);
  type Row = { position: number; question_bank: Omit<Question, 'position'> | Omit<Question, 'position'>[] };
  const questions = ((qs.data ?? []) as unknown as Row[]).map((r) => {
    const qb = Array.isArray(r.question_bank) ? r.question_bank[0] : r.question_bank;
    return { ...qb, position: r.position } as Question;
  });
  return { quiz: quiz as QuizRow, questions, answers: (ans.data ?? []) as QuizDetail['answers'] };
}

export const createQuiz = (title: string, nickname: string, count: number) =>
  rpc<string>('create_quiz', { p_title: title, p_nickname: nickname, p_count: count });

export const submitCreatorAnswers = (quizId: string, answers: Answer[]) =>
  rpc<null>('submit_creator_answers', { p_quiz_id: quizId, p_answers: answers });

export async function deleteQuiz(id: string): Promise<void> {
  const { error } = await supabase.from('quizzes').delete().eq('id', id);
  if (error) throw new AppError(error.message);
}

export async function getInvite(token: string): Promise<InviteView> {
  if (!TOKEN_RE.test(token)) return { state: 'invalid' };
  return rpc<InviteView>('get_invite', { p_token: token });
}

export const submitInvite = (token: string, nickname: string, answers: Answer[]) =>
  rpc<{ result_token: string; score: number }>('submit_invite_answers', { p_token: token, p_nickname: nickname, p_answers: answers });

export async function getResult(token: string): Promise<ResultData | null> {
  if (!TOKEN_RE.test(token)) return null;
  const r = await rpc<{ state: string } & Partial<ResultData>>('get_invite_result', { p_result_token: token });
  return r.state === 'ok' ? (r as ResultData) : null;
}

export function buildResult(d: QuizDetail): ResultData | null {
  if (d.quiz.status !== 'completed' || d.quiz.score === null) return null;
  const items: ResultItem[] = d.questions.map((q) => ({
    position: q.position,
    prompt: q.prompt,
    options: q.options,
    creator_answer: d.answers.find((a) => a.question_id === q.id && a.role === 'creator')?.option_index ?? -1,
    invitee_answer: d.answers.find((a) => a.question_id === q.id && a.role === 'invitee')?.option_index ?? -1,
  }));
  return {
    title: d.quiz.title,
    creator_nickname: d.quiz.creator_nickname,
    invitee_nickname: d.quiz.invitee_nickname ?? '',
    score: d.quiz.score,
    items,
  };
}
