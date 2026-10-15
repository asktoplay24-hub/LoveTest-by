import { describe, expect, it } from 'vitest';
import { calcScore, countMatches, scoreLabel } from './score';
import { isComplete, normalize, toPayload, validateCount, validateNickname, validateTitle, TOKEN_RE } from './validation';
import type { Question } from './types';

const item = (a: number, b: number) => ({ creator_answer: a, invitee_answer: b });

describe('score', () => {
  it('นับคำตอบที่ตรงกัน', () => {
    expect(countMatches([item(0, 0), item(1, 2), item(3, 3)])).toBe(2);
  });
  it('คำนวณเปอร์เซ็นต์และปัดเศษ', () => {
    expect(calcScore([item(0, 0), item(1, 2), item(3, 3)])).toBe(67);
    expect(calcScore([item(0, 0)])).toBe(100);
    expect(calcScore([])).toBe(0);
  });
  it('มีข้อความสำหรับทุกช่วงคะแนน', () => {
    for (const s of [0, 20, 40, 60, 80, 100]) expect(scoreLabel(s).length).toBeGreaterThan(0);
  });
});

describe('validation', () => {
  const qs: Question[] = [
    { id: 1, category: 'x', prompt: 'a', options: ['1', '2'], position: 1 },
    { id: 2, category: 'x', prompt: 'b', options: ['1', '2', '3'], position: 2 },
  ];
  it('ตรวจชื่อ ชื่อเล่น และจำนวนข้อ', () => {
    expect(validateTitle('  ')).not.toBeNull();
    expect(validateTitle('เราสองคน')).toBeNull();
    expect(validateTitle('ก'.repeat(61))).not.toBeNull();
    expect(validateNickname('')).not.toBeNull();
    expect(validateNickname('มิว')).toBeNull();
    expect(validateCount(9)).not.toBeNull();
    expect(validateCount(10)).toBeNull();
    expect(validateCount(21)).not.toBeNull();
  });
  it('normalize ตัดอักขระควบคุมและช่องว่างซ้ำ', () => {
    expect(normalize('  a\u0000  b \n c ')).toBe('a b c');
  });
  it('ตรวจว่าตอบครบและอยู่ในช่วงตัวเลือก', () => {
    expect(isComplete(qs, { 1: 0 })).toBe(false);
    expect(isComplete(qs, { 1: 0, 2: 3 })).toBe(false);
    expect(isComplete(qs, { 1: 1, 2: 2 })).toBe(true);
    expect(toPayload(qs, { 1: 1, 2: 2 })).toEqual([
      { question_id: 1, option_index: 1 },
      { question_id: 2, option_index: 2 },
    ]);
  });
  it('โทเคนต้องเป็น hex 48 ตัว', () => {
    expect(TOKEN_RE.test('a'.repeat(48))).toBe(true);
    expect(TOKEN_RE.test('a'.repeat(47))).toBe(false);
    expect(TOKEN_RE.test('G'.repeat(48))).toBe(false);
  });
});
