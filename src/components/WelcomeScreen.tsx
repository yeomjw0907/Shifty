import { motion } from 'motion/react';
import { Users, UserPlus, Sparkles } from 'lucide-react';
import { ShiftyLogo } from './ShiftyLogo';

interface WelcomeScreenProps {
  userName: string;
  onCreateTeam: () => void;
  onJoinTeam: () => void;
}

export function WelcomeScreen({ userName, onCreateTeam, onJoinTeam }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="mb-8"
        >
          <ShiftyLogo size={120} animated={true} />
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h1 className="text-slate-900 mb-3">
            환영합니다, <span className="text-blue-500">{userName}</span>님! 👋
          </h1>
          <p className="text-slate-600 text-lg">
            Shifty와 함께 간호사 근무 일정을 스마트하게 관리하세요
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Create Team Card */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateTeam}
            className="glass-card p-8 rounded-3xl toss-shadow hover:shadow-xl transition-all text-left group"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users size={32} className="text-white" />
            </div>
            <h3 className="text-slate-900 mb-2">새 팀 생성</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              새로운 팀을 만들고 팀원들을 초대하세요. 고유한 초대 코드가 발급됩니다.
            </p>
            <div className="mt-4 flex items-center gap-2 text-blue-500 text-sm">
              <Sparkles size={16} />
              <span>추천</span>
            </div>
          </motion.button>

          {/* Join Team Card */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onJoinTeam}
            className="glass-card p-8 rounded-3xl toss-shadow hover:shadow-xl transition-all text-left group"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UserPlus size={32} className="text-white" />
            </div>
            <h3 className="text-slate-900 mb-2">기존 팀 참여</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              이미 팀이 있나요? 초대 코드를 입력하여 기존 팀에 참여하세요.
            </p>
            <div className="mt-4 text-indigo-500 text-sm">
              초대 코드 필요 →
            </div>
          </motion.button>
        </div>

        {/* Features Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 rounded-2xl"
        >
          <p className="text-sm text-slate-600 mb-3">
            ✨ <strong>Shifty</strong>로 무엇을 할 수 있나요?
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">✓</span>
              <span>3교대 근무 관리</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">✓</span>
              <span>팀 협업 기능</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">✓</span>
              <span>캘린더 연동</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
