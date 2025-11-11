import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, LogIn, UserPlus, Sparkles, Building2, Briefcase, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
// Supabase and API removed - using local state only
import { ShiftyLogo } from './ShiftyLogo';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TossInput } from './TossInput';
import { HospitalSearchInput } from './HospitalSearchInput';
import { toast } from 'sonner';

interface AuthScreenProps {
  onAuthSuccess: (user: any, accessToken: string) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [hospital, setHospital] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [hospitalAuthCode, setHospitalAuthCode] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loadingRef = useRef(false);

  // Real-time validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [nameError, setNameError] = useState('');
  const [hospitalError, setHospitalError] = useState('');

  // Validation functions
  const validateEmail = (value: string) => {
    if (!value.trim()) return '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return '올바른 이메일 형식이 아닙니다';
    }
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return '';
    if (value.length < 6) {
      return '비밀번호는 최소 6자 이상이어야 합니다';
    }
    return '';
  };

  const validatePasswordConfirm = (value: string) => {
    if (!value) return '';
    if (value !== password) {
      return '비밀번호가 일치하지 않습니다';
    }
    return '';
  };

  // Handle input changes with validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) setEmailError(validateEmail(value));
    else setEmailError('');
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (mode === 'signup' && value) {
      setPasswordError(validatePassword(value));
      // Re-validate password confirm if it has a value
      if (passwordConfirm) {
        setPasswordConfirmError(value !== passwordConfirm ? '비밀번호가 일치하지 않습니다' : '');
      }
    } else {
      setPasswordError('');
    }
  };

  const handlePasswordConfirmChange = (value: string) => {
    setPasswordConfirm(value);
    if (value) setPasswordConfirmError(validatePasswordConfirm(value));
    else setPasswordConfirmError('');
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (mode === 'signup' && !value.trim() && name !== '') {
      setNameError('이름을 입력해주세요');
    } else {
      setNameError('');
    }
  };

  const handleHospitalChange = (value: string) => {
    setHospital(value);
    if (mode === 'signup' && !value.trim() && hospital !== '') {
      setHospitalError('근무 병원을 입력해주세요');
    } else {
      setHospitalError('');
    }
  };

  const validateSignUp = () => {
    if (!name.trim()) {
      toast.error('이름을 입력해주세요', {
        icon: <AlertCircle size={18} />,
      });
      return false;
    }
    if (!email.trim()) {
      toast.error('이메일을 입력해주세요', {
        icon: <AlertCircle size={18} />,
      });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('올바른 이메일 형식이 아닙니다', {
        icon: <AlertCircle size={18} />,
      });
      return false;
    }
    if (password.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다', {
        icon: <AlertCircle size={18} />,
      });
      return false;
    }
    if (password !== passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다', {
        icon: <AlertCircle size={18} />,
      });
      return false;
    }
    if (!hospital.trim()) {
      toast.error('근무 병원을 입력해주세요', {
        icon: <AlertCircle size={18} />,
      });
      return false;
    }
    if (!privacyAgreed) {
      toast.error('개인정보 처리방침에 동의해주세요', {
        icon: <AlertCircle size={18} />,
      });
      return false;
    }
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear validation errors on signin mode
    if (mode === 'signin') {
      setEmailError('');
      setPasswordError('');
    }
    
    setLoading(true);
    loadingRef.current = true;
    setError('');

    console.log('🔐 로그인 시도:', { email, passwordLength: password.length });

    // 타임아웃 추가 (30초)
    let timeoutId: NodeJS.Timeout | null = null;
    let isTimedOut = false;
    
    timeoutId = setTimeout(() => {
      if (loadingRef.current) {
        isTimedOut = true;
        console.error('❌ 로그인 타임아웃');
        toast.error('로그인 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.', {
          icon: <AlertCircle size={18} />,
        });
        setLoading(false);
        loadingRef.current = false;
      }
    }, 30000);

    try {
      // 간단한 로컬 인증 (실제로는 백엔드 연동 필요)
      // 로컬 스토리지에서 사용자 확인
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const user = savedUsers.find((u: any) => u.email === email && u.password === password);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (isTimedOut) {
        return;
      }

      if (!user) {
        toast.error('이메일 또는 비밀번호가 올바르지 않습니다', {
          icon: <AlertCircle size={18} />,
        });
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      // 로그인 성공
      const userData = {
        id: user.id,
        email: user.email,
        user_metadata: { name: user.name },
      };
      
      toast.success('로그인 성공!', {
        icon: <CheckCircle2 size={18} />,
      });
      onAuthSuccess(userData, 'local-token');
    } catch (err: any) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      console.error('💥 Sign in error:', err);
      
      let errorMessage = '로그인 중 오류가 발생했습니다';
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        errorMessage = '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage, {
        icon: <AlertCircle size={18} />,
      });
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUp()) {
      return;
    }

    setLoading(true);
    loadingRef.current = true;
    setError('');

    console.log('🔐 회원가입 시도:', { email, name, hospital });

    // 타임아웃 추가 (60초 - 회원가입은 더 오래 걸릴 수 있음)
    let timeoutId: NodeJS.Timeout | null = null;
    let isTimedOut = false;
    
    timeoutId = setTimeout(() => {
      if (loadingRef.current) {
        isTimedOut = true;
        console.error('❌ 회원가입 타임아웃');
        toast.error('회원가입 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.', {
          icon: <AlertCircle size={18} />,
        });
        setLoading(false);
        loadingRef.current = false;
      }
    }, 60000);

    try {
      // 간단한 로컬 회원가입
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      // 중복 확인
      if (savedUsers.find((u: any) => u.email === email)) {
        toast.error('이미 사용 중인 이메일입니다', {
          icon: <AlertCircle size={18} />,
        });
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      // 새 사용자 생성
      const newUser = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        password, // 실제로는 해시화해야 함
        name,
        hospital,
        department,
        position,
        phone,
        createdAt: new Date().toISOString(),
      };

      savedUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(savedUsers));

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (isTimedOut) {
        return;
      }

      // 자동 로그인
      const userData = {
        id: newUser.id,
        email: newUser.email,
        user_metadata: { name: newUser.name },
      };
      
      toast.success('회원가입이 완료되었습니다!', {
        icon: <CheckCircle2 size={18} />,
      });
      onAuthSuccess(userData, 'local-token');
    } catch (err: any) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      console.error('💥 Sign up error:', err);
      
      let errorMessage = '회원가입 중 오류가 발생했습니다';
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        errorMessage = '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage, {
        icon: <AlertCircle size={18} />,
      });
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver') => {
    toast.info('소셜 로그인은 백엔드 연동이 필요합니다', {
      icon: <AlertCircle size={18} />,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="fixed inset-0 gradient-mesh opacity-40 pointer-events-none" />
      
      <div className="relative w-full max-w-md flex flex-col items-center justify-center">
        {/* Logo & Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="mb-6"
          >
            <ShiftyLogo size={96} animated={true} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-900 mb-2 text-center"
          >
            Shifty
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-600 text-center"
          >
            교대근무, 이제 쉬프티하게
          </motion.p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full glass-card rounded-3xl p-8 toss-shadow-xl"
        >
          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => {
                setMode('signin');
                setError('');
                setEmailError('');
                setPasswordError('');
                setPasswordConfirmError('');
                setNameError('');
                setHospitalError('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all text-center ${
                mode === 'signin'
                  ? 'bg-white text-blue-600 toss-shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError('');
                setEmailError('');
                setPasswordError('');
                setPasswordConfirmError('');
                setNameError('');
                setHospitalError('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all text-center ${
                mode === 'signup'
                  ? 'bg-white text-blue-600 toss-shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}>
            <div className="space-y-4">
              {/* Signup Fields */}
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {/* Name */}
                    <TossInput
                      label="이름"
                      icon={User}
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="홍길동"
                      required
                      error={nameError}
                      success={!!name && !nameError}
                    />

                    {/* Hospital */}
                    <HospitalSearchInput
                      label="근무 병원"
                      value={hospital}
                      onChange={handleHospitalChange}
                      onSelect={(hospital) => {
                        setSelectedHospital(hospital);
                        setHospital(hospital.name_kr || hospital.name);
                      }}
                      placeholder="병원명을 검색하세요"
                      required
                      error={hospitalError}
                      success={!!hospital && !hospitalError}
                      helperText="병원명을 입력하면 자동완성됩니다"
                    />

                    {/* Hospital Auth Code (Optional) */}
                    {selectedHospital && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <TossInput
                          label="병원 인증 코드 (선택사항)"
                          type="text"
                          value={hospitalAuthCode}
                          onChange={(e) => setHospitalAuthCode(e.target.value)}
                          placeholder="병원에서 제공한 인증 코드를 입력하세요"
                          helperText="병원에서 제공한 인증 코드가 있으면 입력하세요"
                        />
                      </motion.div>
                    )}

                    {/* Department & Position */}
                    <div className="grid grid-cols-2 gap-3">
                      <TossInput
                        label="부서/병동"
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="내과병동"
                        success={!!department}
                      />
                      <TossInput
                        label="직책"
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="간호사"
                        success={!!position}
                      />
                    </div>

                    {/* Phone */}
                    <TossInput
                      label="연락처"
                      icon={Phone}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010-1234-5678"
                      success={!!phone}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <TossInput
                label="이메일"
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="shifty@example.com"
                required
                error={emailError}
                success={!!email && !emailError && email.includes('@')}
              />

              {/* Password */}
              <TossInput
                label="비밀번호"
                icon={Lock}
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="••••••••"
                required
                error={passwordError}
                success={mode === 'signin' ? !!password : (!!password && password.length >= 6 && !passwordError)}
                helperText={mode === 'signup' && !passwordError ? '최소 6자 이상 입력해주세요' : undefined}
              />

              {/* Password Confirm (Signup only) */}
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <TossInput
                      label="비밀번호 확인"
                      icon={Lock}
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => handlePasswordConfirmChange(e.target.value)}
                      placeholder="••••••••"
                      required
                      error={passwordConfirmError}
                      success={!!passwordConfirm && password === passwordConfirm && !passwordConfirmError}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Privacy Policy Agreement (Signup only) */}
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2"
                  >
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={privacyAgreed}
                          onChange={(e) => setPrivacyAgreed(e.target.checked)}
                          className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-blue-500 checked:border-blue-500 transition-colors cursor-pointer"
                        />
                        <CheckCircle2 
                          size={20} 
                          className="absolute pointer-events-none text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                        />
                      </div>
                      <div className="flex-1 text-sm">
                        <span className="text-slate-700">
                          <span className="text-red-500">*</span> 개인정보 처리방침에 동의합니다
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPrivacy(true)}
                          className="block text-blue-600 hover:text-blue-700 underline mt-1 text-xs"
                        >
                          전문 보러가기 →
                        </button>
                      </div>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 shifty-gradient text-white rounded-xl toss-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles size={20} />
                    </motion.div>
                    <span>처리 중...</span>
                  </>
                ) : mode === 'signin' ? (
                  <>
                    <LogIn size={20} />
                    <span>로그인</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>회원가입</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-500">또는</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Kakao Login */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin('kakao')}
              disabled={loading}
              className="w-full py-3 bg-[#FEE500] hover:bg-[#FDD835] border-2 border-[#FDD835] text-[#000000] rounded-xl toss-shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C6.477 3 2 6.477 2 10.75C2 13.584 4.206 16.019 7.375 17.125L6.5 20.5C6.447 20.676 6.512 20.867 6.662 20.976C6.742 21.033 6.837 21.062 6.933 21.062C7.016 21.062 7.099 21.042 7.173 21.001L11.459 18.354C11.636 18.368 11.817 18.375 12 18.375C17.523 18.375 22 14.898 22 10.625C22 6.352 17.523 3 12 3Z" fill="#000000"/>
              </svg>
              <span>카카오로 계속하기</span>
            </motion.button>

            {/* Google Login */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl toss-shadow hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13998 18.63 6.70998 16.7 5.83998 14.1H2.17998V16.94C3.98998 20.53 7.69998 23 12 23Z" fill="#34A853"/>
                <path d="M5.84 14.1C5.62 13.44 5.49 12.73 5.49 12C5.49 11.27 5.62 10.56 5.84 9.9V7.06H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.94L5.84 14.1Z" fill="#FBBC05"/>
                <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.69998 1 3.98998 3.47 2.17998 7.06L5.83998 9.9C6.70998 7.3 9.13998 5.38 12 5.38Z" fill="#EA4335"/>
              </svg>
              <span>Google로 계속하기</span>
            </motion.button>

            {/* Naver Login */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin('naver')}
              disabled={loading}
              className="w-full py-3 bg-[#03C75A] hover:bg-[#02B350] border-2 border-[#02B350] text-white rounded-xl toss-shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M16.273 12.845L7.376 0H0V24H7.727V11.155L16.624 24H24V0H16.273V12.845Z" fill="white"/>
              </svg>
              <span>네이버로 계속하기</span>
            </motion.button>
          </div>

          {/* Features */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-xs text-slate-500 text-center mb-3">
              Shifty로 시작하세요
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-blue-50 rounded-xl">
                <div className="text-2xl mb-1">🔄</div>
                <div className="text-xs text-slate-700">교대근무</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-xs text-slate-700">팀 협업</div>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <div className="text-2xl mb-1">📅</div>
                <div className="text-xs text-slate-700">캘린더 연동</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-slate-500 mt-6 space-y-1"
        >
          <p>팀 일정 관리 협업 도구 · 개인정보 보호</p>
          <p className="text-slate-400">Made by 주식회사 98점7도</p>
        </motion.div>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyPolicy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
}
