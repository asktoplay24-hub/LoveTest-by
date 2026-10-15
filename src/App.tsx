import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { Card, Spinner, StateCard } from './components/ui';
import { useAuth } from './lib/auth';
import { isConfigured } from './lib/supabase';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import AnswerQuiz from './pages/AnswerQuiz';
import QuizDetailPage from './pages/QuizDetail';
import Invite from './pages/Invite';
import Result from './pages/Result';
import Privacy from './pages/Privacy';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Spinner />;
  if (!session) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}

export default function App() {
  if (!isConfigured) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <Card>
          <h1 className="mb-2 text-lg font-bold">ยังไม่ได้ตั้งค่า Supabase</h1>
          <p className="text-sm text-slate-600">
            คัดลอก <code>.env.example</code> เป็น <code>.env</code> แล้วใส่ <code>VITE_SUPABASE_URL</code> และ{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> จากนั้นรีสตาร์ท <code>npm run dev</code> (ดูขั้นตอนใน README)
          </p>
        </Card>
      </div>
    );
  }
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/create" element={<RequireAuth><CreateQuiz /></RequireAuth>} />
        <Route path="/quiz/:id" element={<RequireAuth><QuizDetailPage /></RequireAuth>} />
        <Route path="/quiz/:id/answer" element={<RequireAuth><AnswerQuiz /></RequireAuth>} />
        <Route path="/i/:token" element={<Invite />} />
        <Route path="/r/:token" element={<Result />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<StateCard title="ไม่พบหน้านี้" text="ลิงก์อาจไม่ถูกต้อง" linkTo="/" linkLabel="กลับหน้าแรก" />} />
      </Route>
    </Routes>
  );
}
