import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 disabled:opacity-50 disabled:cursor-not-allowed';
const variants = {
  primary: 'bg-pink-500 text-white hover:bg-pink-600 shadow-sm',
  ghost: 'bg-white text-pink-600 border border-pink-200 hover:bg-pink-50',
  danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
};
type Variant = keyof typeof variants;

export const btnClass = (v: Variant = 'primary', extra = '') => `${base} ${variants[v]} ${extra}`;

export function Button({ variant = 'primary', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...p} className={btnClass(variant, className)} />;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-pink-100 bg-white p-5 shadow-sm sm:p-7 ${className}`}>{children}</div>;
}

export function Spinner({ label = 'กำลังโหลด...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-pink-500" role="status">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 font-medium underline">
          ลองอีกครั้ง
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <div className="text-4xl text-pink-300">♡</div>
      <h2 className="text-lg font-bold">{title}</h2>
      {text && <p className="max-w-sm text-sm text-slate-500">{text}</p>}
      {action}
    </div>
  );
}

export function StateCard({ title, text, linkTo, linkLabel }: { title: string; text: string; linkTo?: string; linkLabel?: string }) {
  return (
    <Card>
      <EmptyState
        title={title}
        text={text}
        action={linkTo ? <Link to={linkTo} className={btnClass()}>{linkLabel}</Link> : undefined}
      />
    </Card>
  );
}

export const inputClass =
  'w-full rounded-2xl border border-pink-200 bg-white px-4 py-3 text-base outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100';
