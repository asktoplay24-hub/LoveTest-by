import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { btnClass } from './ui';

export default function Layout() {
  const { session } = useAuth();
  const nav = useNavigate();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-pink-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-pink-600">
            LoveTest <span aria-hidden>♥</span>
          </Link>
          <nav className="flex items-center gap-2">
            {session ? (
              <>
                <Link to="/dashboard" className="px-2 text-sm text-slate-600 hover:text-pink-600">แดชบอร์ด</Link>
                <button
                  className="px-2 text-sm text-slate-500 hover:text-pink-600"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    nav('/');
                  }}
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <Link to="/login" className={btnClass('ghost', '!px-4 !py-1.5')}>เข้าสู่ระบบ</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-10">
        <Outlet />
      </main>
      <footer className="border-t border-pink-100 bg-white py-5 text-center text-xs text-slate-500">
        <p>LoveTest by Chipon Production</p>
        <Link to="/privacy" className="underline">นโยบายข้อมูลส่วนบุคคล</Link>
      </footer>
    </div>
  );
}
