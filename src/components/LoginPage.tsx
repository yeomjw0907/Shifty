import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, Link as LinkIcon, Mail, User, Briefcase } from 'lucide-react';
import type { TeamMember, Team } from '../App';

interface LoginPageProps {
  onLogin: (user: TeamMember, team: Team) => void;
}

const TEAM_COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'create' | 'join'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('RN');
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleCreateTeam = () => {
    if (!name.trim() || !email.trim() || !teamName.trim()) return;

    const userId = Date.now().toString();
    const teamId = Date.now().toString();
    const code = generateInviteCode();

    const newUser: TeamMember = {
      id: userId,
      name: name.trim(),
      email: email.trim(),
      role: role,
      color: TEAM_COLORS[0],
    };

    const newTeam: Team = {
      id: teamId,
      name: teamName.trim(),
      inviteCode: code,
      members: [newUser],
    };

    // Save team to localStorage for others to join
    const existingTeams = JSON.parse(localStorage.getItem('nurseScheduler_teams') || '[]');
    existingTeams.push(newTeam);
    localStorage.setItem('nurseScheduler_teams', JSON.stringify(existingTeams));

    onLogin(newUser, newTeam);
  };

  const handleJoinTeam = () => {
    if (!name.trim() || !email.trim() || !inviteCode.trim()) return;

    const existingTeams: Team[] = JSON.parse(localStorage.getItem('nurseScheduler_teams') || '[]');
    const team = existingTeams.find(t => t.inviteCode === inviteCode.toUpperCase());

    if (!team) {
      alert('유효하지 않은 초대 코드입니다.');
      return;
    }

    const userId = Date.now().toString();
    const colorIndex = team.members.length % TEAM_COLORS.length;

    const newUser: TeamMember = {
      id: userId,
      name: name.trim(),
      email: email.trim(),
      role: role,
      color: TEAM_COLORS[colorIndex],
    };

    // Add user to team
    team.members.push(newUser);
    const updatedTeams = existingTeams.map(t => t.id === team.id ? team : t);
    localStorage.setItem('nurseScheduler_teams', JSON.stringify(updatedTeams));

    onLogin(newUser, team);
  };

  const handleQuickLogin = () => {
    // 데모용 빠른 로그인
    const demoUser: TeamMember = {
      id: '1',
      name: '김재영',
      email: 'demo@example.com',
      role: 'RN',
      color: '#8b5cf6',
    };

    const demoTeam: Team = {
      id: 'demo',
      name: '아주대병원 간호팀',
      inviteCode: 'DEMO2024',
      members: [
        demoUser,
        { id: '2', name: '염정원', role: 'RN', color: '#ec4899', email: 'demo2@example.com' },
        { id: '3', name: '유하리', role: 'RN', color: '#06b6d4', email: 'demo3@example.com' },
        { id: '4', name: '정하늘', role: 'CN', color: '#10b981', email: 'demo4@example.com' },
        { id: '5', name: '최영희', role: 'RN', color: '#f59e0b', email: 'demo5@example.com' },
      ],
    };

    onLogin(demoUser, demoTeam);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl mb-4">
            <Calendar className="text-white" size={32} />
          </div>
          <h1 className="text-slate-900 mb-2">NurseScheduler</h1>
          <p className="text-slate-600">간호사 교대 근무 협업 플랫폼</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-8">
          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6 bg-slate-100 rounded-2xl p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-xl text-sm transition-all flex items-center justify-center ${
                mode === 'login'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              빠른 시작
            </button>
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-3 rounded-xl text-sm transition-all flex items-center justify-center ${
                mode === 'create'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              팀 생성
            </button>
            <button
              onClick={() => setMode('join')}
              className={`flex-1 py-3 rounded-xl text-sm transition-all flex items-center justify-center ${
                mode === 'join'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              팀 참여
            </button>
          </div>

          {mode === 'login' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 mb-4">
                데모 계정으로 빠르게 시작할 수 있습니다. 실제 데이터는 브라우저에 저장됩니다.
              </div>
              <button
                onClick={handleQuickLogin}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-500/30 transition-all flex items-center justify-center"
              >
                데모로 시작하기
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">이름</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">이메일</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nurse@hospital.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">직급</label>
                <div className="relative">
                  <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none transition-colors appearance-none"
                  >
                    <option value="RN">간호사 (RN)</option>
                    <option value="CN">수간호사 (CN)</option>
                    <option value="AN">보조간호사 (AN)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">팀 이름</label>
                <div className="relative">
                  <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="아주대병원 간호팀"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateTeam}
                disabled={!name.trim() || !email.trim() || !teamName.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                팀 생성하기
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">이름</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">이메일</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nurse@hospital.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">직급</label>
                <div className="relative">
                  <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none transition-colors appearance-none"
                  >
                    <option value="RN">간호사 (RN)</option>
                    <option value="CN">수간호사 (CN)</option>
                    <option value="AN">보조간호사 (AN)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">초대 코드</label>
                <div className="relative">
                  <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="ABCD1234"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none transition-colors uppercase"
                  />
                </div>
              </div>

              <button
                onClick={handleJoinTeam}
                disabled={!name.trim() || !email.trim() || !inviteCode.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                팀 참여하기
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
