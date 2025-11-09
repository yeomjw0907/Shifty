import { Sun, Sunset, Moon, Coffee, Calendar, RefreshCw, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import type { TeamMember } from '../App';

interface QuickShiftWidgetProps {
  currentUser: TeamMember;
  onAddShift: (shiftType: 'day' | 'evening' | 'night' | 'off', date: Date) => void;
  onSync?: () => void;
  onExport?: () => void;
}

export function QuickShiftWidget({ currentUser, onAddShift, onSync, onExport }: QuickShiftWidgetProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);

  const shifts = [
    { type: 'day' as const, label: '데이', icon: Sun, color: 'from-amber-400 to-orange-400', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
    { type: 'evening' as const, label: '이브닝', icon: Sunset, color: 'from-orange-400 to-red-400', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
    { type: 'night' as const, label: '나이트', icon: Moon, color: 'from-indigo-400 to-purple-400', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
    { type: 'off' as const, label: '휴무', icon: Coffee, color: 'from-slate-400 to-slate-500', bgColor: 'bg-slate-50', textColor: 'text-slate-700' },
  ];

  const handleShiftClick = (shiftType: 'day' | 'evening' | 'night' | 'off') => {
    const date = new Date(selectedDate);
    onAddShift(shiftType, date);
    
    // 다음 날짜로 자동 이동
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate.toISOString().split('T')[0]);
  };

  const handleCalendarSync = () => {
    setShowCalendarOptions(false);
    onSync?.();
  };

  const handleExport = () => {
    setShowCalendarOptions(false);
    onExport?.();
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 mb-20 md:mb-0">
      <h3 className="text-slate-900 mb-4">빠른 교대 근무 추가</h3>
      
      {/* Date Picker */}
      <div className="mb-4">
        <label className="block text-sm text-slate-600 mb-2">날짜 선택</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none transition-colors"
        />
      </div>

      {/* Quick Shift Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {shifts.map((shift) => {
          const Icon = shift.icon;
          return (
            <motion.button
              key={shift.type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShiftClick(shift.type)}
              className={`${shift.bgColor} ${shift.textColor} rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:shadow-md`}
            >
              <Icon size={24} />
              <span className="text-sm">{shift.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Calendar Integration */}
      <div className="border-t border-slate-200 pt-4">
        <button
          onClick={() => setShowCalendarOptions(true)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
        >
          <Calendar size={18} />
          <span>캘린더 연동</span>
        </button>

        {/* Calendar Options Modal */}
        <AnimatePresence>
          {showCalendarOptions && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCalendarOptions(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-slate-900 font-semibold">캘린더 연동</h3>
                    <button
                      onClick={() => setShowCalendarOptions(false)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <X size={18} className="text-slate-600" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCalendarSync}
                      className="w-full p-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-3"
                    >
                      <RefreshCw size={20} />
                      <span>동기화</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleExport}
                      className="w-full p-4 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:shadow-lg hover:shadow-slate-500/30 transition-all flex items-center gap-3"
                    >
                      <Download size={20} />
                      <span>내보내기</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
