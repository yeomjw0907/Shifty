import { Calendar as CalendarIcon, Users, User, Edit2, Check, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import type { TeamMember, Team, Task } from '../App';
import { ShiftyLogoSimple } from './ShiftyLogo';

interface HeaderProps {
  view: 'calendar' | 'list' | 'team' | 'members' | 'mypage' | 'community';
  setView: (view: 'calendar' | 'list' | 'team' | 'members' | 'mypage' | 'community') => void;
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  currentTeam: Team;
  onLogout: () => void;
  onUpdateTeamName: (newName: string) => void;
  tasks: Task[];
}

export function Header({ view, setView, teamMembers, currentUser, currentTeam, onLogout, onUpdateTeamName, tasks }: HeaderProps) {
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [editedTeamName, setEditedTeamName] = useState(currentTeam.name);

  const handleSaveTeamName = () => {
    if (editedTeamName.trim()) {
      onUpdateTeamName(editedTeamName.trim());
      setIsEditingTeamName(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedTeamName(currentTeam.name);
    setIsEditingTeamName(false);
  };

  return (
    <header className="glass-card sticky top-0 z-50 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Logo & Team Name */}
          <div className="flex items-center gap-3">
            <ShiftyLogoSimple size={48} />
            <div>
              {isEditingTeamName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedTeamName}
                    onChange={(e) => setEditedTeamName(e.target.value)}
                    className="px-3 py-1.5 border-2 border-blue-400 rounded-xl text-sm focus:outline-none bg-white"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTeamName();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSaveTeamName}
                    className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <Check size={16} className="text-green-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCancelEdit}
                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X size={16} className="text-red-600" />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-slate-900">{currentTeam.name}</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditingTeamName(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit2 size={14} className="text-slate-500" />
                  </motion.button>
                </div>
              )}
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <User size={12} />
                {currentUser.name} · {currentUser.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View Tabs - Desktop only */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
              <TabButton
                active={view === 'team'}
                onClick={() => setView('team')}
                icon={<Users size={16} />}
                label="팀 스케줄"
              />
              <TabButton
                active={view === 'calendar'}
                onClick={() => setView('calendar')}
                icon={<CalendarIcon size={16} />}
                label="마이 스케줄"
              />
              <TabButton
                active={view === 'members'}
                onClick={() => setView('members')}
                icon={<User size={16} />}
                label="팀 관리"
              />
              <TabButton
                active={view === 'community'}
                onClick={() => setView('community')}
                icon={<MessageSquare size={16} />}
                label="커뮤니티"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative px-4 py-2 rounded-lg transition-all ${
        active 
          ? 'text-blue-600' 
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-white rounded-lg toss-shadow"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative flex items-center gap-2 text-sm">
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </span>
    </motion.button>
  );
}
