import type { ResultItem } from './types';

export function countMatches(items: Pick<ResultItem, 'creator_answer' | 'invitee_answer'>[]): number {
  return items.filter((i) => i.creator_answer === i.invitee_answer).length;
}

export function calcScore(items: Pick<ResultItem, 'creator_answer' | 'invitee_answer'>[]): number {
  if (items.length === 0) return 0;
  return Math.round((countMatches(items) / items.length) * 100);
}

export function scoreLabel(score: number): string {
  if (score >= 90) return 'ใจตรงกันสุด ๆ';
  if (score >= 70) return 'เข้ากันได้ดีมาก';
  if (score >= 50) return 'เข้ากันได้ดี มีความต่างที่น่ารัก';
  if (score >= 30) return 'ต่างกันพอสมควร ลองคุยกันเพิ่มนะ';
  return 'คนละแนว แต่เติมเต็มกันได้';
}
