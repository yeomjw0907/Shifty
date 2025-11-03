import { useState, useEffect } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { ShiftyLogo } from './components/ShiftyLogo';
import { supabase } from './utils/supabase/client';
import { motion } from 'motion/react';
import { Shield, Lock, Loader2, AlertCircle } from 'lucide-react';

// Admin user emails - 여기에 관리자 이메일 추가
const ADMIN_EMAILS = [
  'admin@shifty.app',
  // 추가 관리자 이메일을 여기에 추가하세요
];

export default function AdminApp() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token && session?.user) {
        const userEmail = session.user.email || '';
        
        if (ADMIN_EMAILS.includes(userEmail)) {
          setUser(session.user);
          setAccessToken(session.access_token);
          setIsAdmin(true);
        } else {
          setError('접근 권한이 없습니다. 관리자 계정으로 로그인해주세요.');
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');

    try {
      // Check if email is admin
      if (!ADMIN_EMAILS.includes(email)) {
        setError('접근 권한이 없습니다. 관리자 계정이 아닙니다.');
        setAuthLoading(false);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setAuthLoading(false);
        return;
      }

      if (data?.session?.access_token) {
        setUser(data.user);
        setAccessToken(data.session.access_token);
        setIsAdmin(true);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken('');
    setIsAdmin(false);
    setEmail('');
    setPassword('');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="mb-6"
          >
            <ShiftyLogo size={96} animated={true} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-white"
          >
            <Loader2 className="animate-spin" size={20} />
            <span>관리자 인증 확인 중...</span>
          </motion.div>
        </div>
      </div>
    );
  }

  // Authenticated admin
  if (isAdmin && user) {
    return <AdminDashboard accessToken={accessToken} onBack={handleLogout} />;
  }

  // Admin login screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="mb-6 flex justify-center"
          >
            <ShiftyLogo size={80} animated={true} />
          </motion.div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="text-purple-400" size={28} />
            <h1 className="text-white">관리자 대시보드</h1>
          </div>
          <p className="text-slate-300">Shifty Admin Access</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <form onSubmit={handleLogin}>
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl flex items-start gap-3"
              >
                <AlertCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-200">{error}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  관리자 이메일
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@shifty.app"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: authLoading ? 1 : 1.02 }}
                whileTap={{ scale: authLoading ? 1 : 0.98 }}
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                style={{
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                }}
              >
                {authLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>인증 중...</span>
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    <span>관리자 로그인</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-300">
                <p className="mb-1">이 페이지는 Shifty 관리자 전용입니다.</p>
                <p>일반 사용자는 접근할 수 없습니다.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back to main */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6"
        >
          <a
            href="/"
            className="text-sm text-slate-300 hover:text-white transition-colors underline"
          >
            일반 사용자 페이지로 돌아가기
          </a>
        </motion.div>
      </div>
    </div>
  );
}
