import { Calendar as CalendarIcon, Users, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useIsMobile } from './ui/use-mobile';

interface BottomNavigationProps {
  view: 'calendar' | 'list' | 'team' | 'members' | 'mypage';
  setView: (view: 'calendar' | 'list' | 'team' | 'members' | 'mypage') => void;
}

export function BottomNavigation({ view, setView }: BottomNavigationProps) {
  const isMobile = useIsMobile();
  
  // Only render on mobile
  if (!isMobile) return null;
  const navItems = [
    {
      id: 'team' as const,
      icon: Users,
      label: '팀 스케줄',
    },
    {
      id: 'calendar' as const,
      icon: CalendarIcon,
      label: '마이 스케줄',
    },
    {
      id: 'members' as const,
      icon: User,
      label: '팀 관리',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-card border-t border-slate-200/50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex gap-1 px-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1 py-2 px-1 flex-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-slate-600'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBottomNav"
                    className="absolute inset-0 bg-blue-50 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon 
                  size={22} 
                  className={`relative z-10 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}
                />
                <span className={`relative z-10 text-xs font-medium ${isActive ? 'text-blue-600' : 'text-slate-600'}`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

