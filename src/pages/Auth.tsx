import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, ErrorBox, inputClass } from '../components/ui';
import { toThai } from '../lib/errors';
import { supabase } from '../lib/supabase';
import { validateEmail, validatePassword } from '../lib/validation';

export default function Auth() {
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/dashboard';
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    const v = validateEmail(email) ?? validatePassword(password);
    if (v) return setError(v);
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        nav(from, { replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        if (data.session) nav(from, { replace: true });
        else setInfo('สมัครสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบ');
      }
    } catch (err) {
      setError(toThai(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="mb-1 text-xl font-bold">{mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</h1>
        <p className="mb-5 text-sm text-slate-500">ใช้เฉพาะอีเมลและรหัสผ่าน เราไม่เก็บข้อมูลอื่นของคุณ</p>
        <form onSubmit={submit} className="space-y-3" noValidate>
          <input className={inputClass} type="email" autoComplete="email" placeholder="อีเมล" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={inputClass} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <ErrorBox message={error} />}
          {info && <p className="rounded-2xl bg-pink-50 p-3 text-sm text-pink-700" role="status">{info}</p>}
          <Button className="w-full" disabled={busy}>{busy ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</Button>
        </form>
        <button className="mt-4 text-sm text-pink-600 underline" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setInfo(''); }}>
          {mode === 'login' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
        </button>
      </Card>
    </div>
  );
}
