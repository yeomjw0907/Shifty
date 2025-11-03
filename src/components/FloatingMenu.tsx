import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Plus, Share2, UserPlus, RefreshCw, Download, Users, Upload, UserCircle } from 'lucide-react';

interface FloatingMenuProps {
  onAddTask: () => void;
  onInviteTeam: () => void;
  onJoinTeam: () => void;
  onSync: () => void;
  onExport: () => void;
  onCreateTeam?: () => void;
  onUploadSchedule?: () => void;
  onMyPage?: () => void;
  showAddTask?: boolean;
}

export function FloatingMenu({
  onAddTask,
  onInviteTeam,
  onJoinTeam,
  onSync,
  onExport,
  onCreateTeam,
  onUploadSchedule,
  onMyPage,
  showAddTask = true,
}: FloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  type MenuItem = {
    type: 'item';
    icon: any;
    label: string;
    onClick: () => void;
    color: string;
    iconSize: number;
  } | {
    type: 'divider';
    label: string;
  };

  const menuItems: MenuItem[] = [
    ...(showAddTask ? [{
      type: 'item' as const,
      icon: Plus,
      label: '일정 추가',
      onClick: () => {
        onAddTask();
        setIsOpen(false);
      },
      color: 'from-blue-500 to-blue-600',
      iconSize: 22,
    }] : []),
    ...(onMyPage ? [{
      type: 'item' as const,
      icon: UserCircle,
      label: '마이페이지',
      onClick: () => {
        onMyPage();
        setIsOpen(false);
      },
      color: 'from-violet-500 to-violet-600',
      iconSize: 20,
    }] : []),
    { type: 'divider' as const, label: '팀 관리' },
    ...(onCreateTeam ? [{
      type: 'item' as const,
      icon: Users,
      label: '팀 생성',
      onClick: () => {
        onCreateTeam();
        setIsOpen(false);
      },
      color: 'from-blue-500 to-blue-600',
      iconSize: 20,
    }] : []),
    {
      type: 'item' as const,
      icon: Share2,
      label: '팀원 초대',
      onClick: () => {
        onInviteTeam();
        setIsOpen(false);
      },
      color: 'from-blue-600 to-indigo-600',
      iconSize: 20,
    },
    {
      type: 'item' as const,
      icon: UserPlus,
      label: '팀 참여',
      onClick: () => {
        onJoinTeam();
        setIsOpen(false);
      },
      color: 'from-indigo-600 to-indigo-700',
      iconSize: 20,
    },
    ...(onUploadSchedule ? [{
      type: 'item' as const,
      icon: Upload,
      label: '근무표 업로드',
      onClick: () => {
        onUploadSchedule();
        setIsOpen(false);
      },
      color: 'from-emerald-500 to-emerald-600',
      iconSize: 20,
    }] : []),
    { type: 'divider' as const, label: '캘린더 연동' },
    {
      type: 'item' as const,
      icon: RefreshCw,
      label: '동기화',
      onClick: () => {
        onSync();
        setIsOpen(false);
      },
      color: 'from-sky-500 to-blue-600',
      iconSize: 20,
    },
    {
      type: 'item' as const,
      icon: Download,
      label: '내보내기',
      onClick: () => {
        onExport();
        setIsOpen(false);
      },
      color: 'from-slate-600 to-slate-700',
      iconSize: 20,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[48]"
          />
        )}
      </AnimatePresence>

      {/* Menu Container */}
      <div className="fixed top-6 right-6 z-50">
        <div className="flex flex-col items-end gap-2.5">
          {/* Main Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0
              shadow-sm hover:shadow-md transition-all duration-300 ${
                isOpen
                  ? 'bg-slate-700 text-white'
                  : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white'
              }`}
            title={isOpen ? '닫기' : '메뉴'}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={20} strokeWidth={2} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={20} strokeWidth={2} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Menu Items */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="flex flex-col gap-2 relative z-50"
              >
                {menuItems.map((item, index) => {
                  if (item.type === 'divider') {
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.04 }}
                        className="px-3 pt-3 pb-1"
                      >
                        <div className="text-xs text-slate-500 tracking-wide">
                          {item.label}
                        </div>
                      </motion.div>
                    );
                  }

                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.04 }}
                      whileHover={{ scale: 1.02, x: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={item.onClick}
                      className="flex items-center gap-3 glass-card px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      {/* Icon Button */}
                      <div
                        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} 
                        flex items-center justify-center text-white flex-shrink-0
                        shadow-sm`}
                      >
                        <Icon size={item.iconSize} strokeWidth={2.5} />
                      </div>

                      {/* Label */}
                      <span className="text-sm text-slate-800 whitespace-nowrap pr-1">
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
