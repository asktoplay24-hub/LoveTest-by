export type QuizStatus = 'draft' | 'waiting' | 'completed';

export interface Question {
  id: number;
  category: string;
  prompt: string;
  options: string[];
  position: number;
}

export interface Answer {
  question_id: number;
  option_index: number;
}

export interface QuizRow {
  id: string;
  title: string;
  creator_nickname: string;
  invitee_nickname: string | null;
  status: QuizStatus;
  invite_token: string;
  score: number | null;
  created_at: string;
  expires_at: string;
  completed_at: string | null;
  delete_after: string;
}

export interface ResultItem {
  position: number;
  prompt: string;
  options: string[];
  creator_answer: number;
  invitee_answer: number;
}

export interface ResultData {
  title: string;
  creator_nickname: string;
  invitee_nickname: string;
  score: number;
  items: ResultItem[];
}

export type InviteState = 'invalid' | 'expired' | 'completed' | 'not_ready' | 'open';
export interface InviteView {
  state: InviteState;
  title?: string;
  creator_nickname?: string;
  questions?: Question[];
}
