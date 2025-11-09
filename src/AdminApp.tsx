import { useState, useEffect } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { ShiftyLogo } from './components/ShiftyLogo';
import { supabase } from './utils/supabase/client';
import { motion } from 'motion/react';
import { Shield, Lock, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// 관리자 이메일 화이트리스트
const ADMIN_EMAILS = [
  'yeomjw0907@onecation.co.kr',
  'yeomjw0907@naver.com',
  'admin@shifty.app'
];

export default function AdminApp() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentHospitalId, setCurrentHospitalId] = useState<string | null>(null);
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
          
          // 사용자의 hospital_id 가져오기
          await loadUserHospitalId(session.access_token);
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

  const loadUserHospitalId = async (token: string) => {
    try {
      // Get user data from Supabase directly
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        // Get user profile from database
        const { data: userProfile } = await supabase
          .from('users')
          .select('hospital_id')
          .eq('auth_id', authUser.id)
          .single();
        
        if (userProfile?.hospital_id) {
          setCurrentHospitalId(userProfile.hospital_id);
        }
      }
    } catch (error) {
      console.error('Load user hospital ID error:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        return;
      }

      if (data?.user?.email && ADMIN_EMAILS.includes(data.user.email)) {
        setUser(data.user);
        setAccessToken(data.session?.access_token || '');
        setIsAdmin(true);
        await loadUserHospitalId(data.session?.access_token || '');
        toast.success('관리자 로그인 성공');
      } else {
        setError('접근 권한이 없습니다. 관리자 계정으로 로그인해주세요.');
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Login error:', error);
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
    setCurrentHospitalId(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Authenticated admin
  if (isAdmin && user && accessToken) {
    return (
      <div className="min-h-screen bg-background gradient-mesh">
        <AdminDashboard
          currentUser={{
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || '관리자',
            email: user.email || '',
            role: 'admin',
            color: '#8B5CF6',
          }}
          currentHospitalId={currentHospitalId || undefined}
          accessToken={accessToken}
        />
      </div>
    );
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
          className="glass-card rounded-3xl p-8 toss-shadow-xl"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600"
              >
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-purple-400 focus:bg-white focus:outline-none transition-all"
                placeholder="admin@shifty.app"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-purple-400 focus:bg-white focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              disabled={authLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl gradient-purple text-white font-semibold toss-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>로그인 중...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>관리자 로그인</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              관리자 전용 페이지입니다
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
