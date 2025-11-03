import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pin, Megaphone, AlertCircle } from 'lucide-react';

interface Notice {
  id: string;
  author: {
    name: string;
    color: string;
  };
  content: string;
  timestamp: Date;
  isPinned: boolean;
  type: 'notice' | 'message';
}

interface NoticeBarProps {
  notices: Notice[];
}

const STORAGE_KEY = 'nurseScheduler_dismissedNotices';

export function NoticeBar({ notices }: NoticeBarProps) {
  const [dismissedNotices, setDismissedNotices] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // 공지사항만 필터링 (일반 메시지 제외)
  const pinnedNotices = notices
    .filter(n => n.type === 'notice' && n.isPinned && !dismissedNotices.has(n.id))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const handleDismiss = (noticeId: string) => {
    const newDismissed = new Set(dismissedNotices);
    newDismissed.add(noticeId);
    setDismissedNotices(newDismissed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...newDismissed]));
  };

  if (pinnedNotices.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {pinnedNotices.map((notice) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative glass-card rounded-2xl p-4 border-l-4 border-amber-500 toss-shadow">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 toss-shadow">
                    <Megaphone className="text-white" size={18} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-lg text-xs">
                        공지사항
                      </span>
                      <span className="text-xs text-slate-600">
                        {notice.author.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(notice.timestamp).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-900 text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {notice.content}
                    </p>
                  </div>

                  {/* Dismiss Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDismiss(notice.id)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                      title="다시 보지 않기"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
