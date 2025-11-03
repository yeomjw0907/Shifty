import { Sun, Sunset, Moon, Coffee, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { TeamMember } from '../App';

interface QuickShiftWidgetProps {
  currentUser: TeamMember;
  onAddShift: (shiftType: 'day' | 'evening' | 'night' | 'off', date: Date) => void;
}

export function QuickShiftWidget({ currentUser, onAddShift }: QuickShiftWidgetProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showGoogleCalendarInfo, setShowGoogleCalendarInfo] = useState(false);

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

  const handleGoogleCalendarSync = () => {
    setShowGoogleCalendarInfo(true);
    // 실제 구글 캘린더 연동은 백엔드에서 처리
    // 여기서는 프론트엔드 UI만 제공
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
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

      {/* Google Calendar Integration */}
      <div className="border-t border-slate-200 pt-4">
        <button
          onClick={handleGoogleCalendarSync}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
        >
          <Calendar size={18} />
          <span>Google Calendar 연동</span>
        </button>

        {showGoogleCalendarInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-blue-50 rounded-xl"
          >
            <p className="text-sm text-blue-900 mb-2">🔗 Google Calendar 연동 준비 중</p>
            <p className="text-xs text-blue-700">
              백엔드 API가 연동되면 Google Calendar와 자동으로 동기화됩니다.
              현재는 프론트엔드 UI만 구현되어 있으며, 실제 연동은 Cursor에서 백엔드 작업 시 완료될 예정입니다.
            </p>
            <div className="mt-3 space-y-1 text-xs text-blue-600">
              <p>• 일정 자동 동기화</p>
              <p>• 양방향 업데이트</p>
              <p>• 알림 설정</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
