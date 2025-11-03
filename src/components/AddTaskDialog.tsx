import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Sunset, Moon, Coffee, User, AlignLeft } from 'lucide-react';
import type { Task, TeamMember } from '../App';
import { getInitials } from '../utils/helpers';
import { SHIFT_COLORS } from '../utils/constants';
import { DatePicker } from './DatePicker';
import { DrumTimePicker } from './DrumTimePicker';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdBy'>) => void;
  selectedDate: Date;
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  editTask?: Task;
  onUpdateTask?: (task: Task) => void;
}

const shiftTypes = [
  { value: 'day', label: '데이 근무', icon: Sun, ...SHIFT_COLORS.day },
  { value: 'evening', label: '이브닝 근무', icon: Sunset, ...SHIFT_COLORS.evening },
  { value: 'night', label: '나이트 근무', icon: Moon, ...SHIFT_COLORS.night },
  { value: 'off', label: '휴무', icon: Coffee, ...SHIFT_COLORS.off },
];

export function AddTaskDialog({
  isOpen,
  onClose,
  onAddTask,
  selectedDate,
  teamMembers,
  currentUser,
  editTask,
  onUpdateTask,
}: AddTaskDialogProps) {
  const [mode, setMode] = useState<'shift' | 'personal'>('shift');
  const [selectedShift, setSelectedShift] = useState<'day' | 'evening' | 'night' | 'off'>('day');
  
  // Personal task fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(selectedDate);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<'work' | 'personal' | 'health' | 'other'>('personal');
  const [assignedTo, setAssignedTo] = useState(currentUser.id);

  useEffect(() => {
    if (isOpen) {
      if (editTask) {
        if (editTask.shiftType) {
          setMode('shift');
          setSelectedShift(editTask.shiftType);
        } else {
          setMode('personal');
          setTitle(editTask.title);
          setDescription(editTask.description || '');
          setStartDate(editTask.date);
          setEndDate(editTask.endDate || null);
          setTime(editTask.time || '');
          setCategory(editTask.category);
        }
        setAssignedTo(editTask.assignedTo);
      } else {
        // Reset to defaults
        setMode('shift');
        setSelectedShift('day');
        setTitle('');
        setDescription('');
        setStartDate(selectedDate);
        setEndDate(null);
        setTime('');
        setCategory('personal');
        setAssignedTo(currentUser.id);
      }
    }
  }, [isOpen, selectedDate, editTask, currentUser.id]);

  const handleSubmit = () => {
    if (mode === 'shift') {
      if (!startDate) return;
      
      const shiftLabels = {
        day: '데이 근무',
        evening: '이브닝 근무',
        night: '나이트 근무',
        off: '휴무',
      };

      const task = {
        title: shiftLabels[selectedShift],
        date: startDate,
        category: 'work' as const,
        shiftType: selectedShift,
        assignedTo,
        completed: false,
      };

      if (editTask && onUpdateTask) {
        onUpdateTask({ ...editTask, ...task });
      } else {
        onAddTask(task);
      }
    } else {
      if (!title.trim() || !startDate) return;

      const task = {
        title: title.trim(),
        description: description.trim() || undefined,
        date: startDate,
        endDate: endDate || undefined,
        time: time || undefined,
        category,
        assignedTo,
        completed: false,
      };

      if (editTask && onUpdateTask) {
        onUpdateTask({ ...editTask, ...task, shiftType: undefined });
      } else {
        onAddTask(task);
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col glass-card rounded-3xl toss-shadow"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-900">{editTask ? '일정 수정' : '일정 추가'}</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </motion.button>
            </div>

            {/* Mode Toggle */}
            <div className="relative bg-slate-100 rounded-xl p-1">
              {/* Sliding Background */}
              <motion.div
                layout
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-500 rounded-lg toss-shadow"
                animate={{ x: mode === 'shift' ? 0 : 'calc(100% + 8px)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              
              {/* Buttons */}
              <div className="relative flex gap-2">
                <button
                  onClick={() => setMode('shift')}
                  className={`flex-1 py-3 rounded-lg text-sm transition-colors z-10 ${
                    mode === 'shift' ? 'text-white' : 'text-slate-700'
                  }`}
                >
                  교대 근무
                </button>
                <button
                  onClick={() => setMode('personal')}
                  className={`flex-1 py-3 rounded-lg text-sm transition-colors z-10 ${
                    mode === 'personal' ? 'text-white' : 'text-slate-700'
                  }`}
                >
                  개인 일정
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {mode === 'shift' ? (
              <div className="space-y-5">
                {/* Shift Type Selection */}
                <div>
                  <div className="text-sm text-slate-600 mb-3 text-center">근무 타입</div>
                  <div className="grid grid-cols-2 gap-3">
                    {shiftTypes.map((shift) => {
                      const Icon = shift.icon;
                      return (
                        <motion.button
                          key={shift.value}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedShift(shift.value as any)}
                          className={`p-4 rounded-2xl border-2 transition-all ${
                            selectedShift === shift.value
                              ? `${shift.border} ${shift.bg} toss-shadow`
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-12 h-12 rounded-xl ${shift.bg} flex items-center justify-center border ${shift.border}`}>
                              <Icon size={24} className={shift.text} />
                            </div>
                            <span className="text-sm text-slate-900">{shift.label}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <div className="text-sm text-slate-600 mb-2 text-center">날짜</div>
                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="날짜 선택"
                  />
                </div>

                {/* Assigned To */}
                <div>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-2">
                    <User size={16} />
                    <span>담당자</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {teamMembers.map((member) => (
                      <motion.button
                        key={member.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAssignedTo(member.id)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          assignedTo === member.id
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs toss-shadow flex-shrink-0"
                            style={{ backgroundColor: member.color }}
                          >
                            {getInitials(member.name)}
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <div className="text-sm text-slate-900 truncate">{member.name}</div>
                            <div className="text-xs text-slate-500 truncate">{member.role}</div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="일정 제목을 입력하세요"
                    className="w-full px-0 py-3 text-xl border-0 border-b-2 border-slate-200 focus:outline-none focus:border-blue-400 transition-colors bg-transparent placeholder:text-slate-400"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-2">
                    <AlignLeft size={16} />
                    <span>설명 (선택)</span>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="일정에 대한 설명을 입력하세요"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none transition-colors bg-white"
                    rows={3}
                  />
                </div>

                {/* Date Range */}
                <div>
                  <div className="text-sm text-slate-600 mb-2 text-center">날짜</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1.5 block text-center">시작</label>
                      <DatePicker
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="시작일"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1.5 block text-center">종료 (선택)</label>
                      <DatePicker
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="종료일"
                        minDate={startDate || undefined}
                      />
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div>
                  <div className="text-sm text-slate-600 mb-2 text-center">시간 (선택)</div>
                  <DrumTimePicker
                    value={time}
                    onChange={setTime}
                    placeholder="시간 선택"
                  />
                </div>

                {/* Category */}
                <div>
                  <div className="text-sm text-slate-600 mb-2 text-center">카테고리</div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {[
                      { value: 'personal', label: '개인', color: 'bg-purple-500' },
                      { value: 'work', label: '업무', color: 'bg-blue-500' },
                      { value: 'health', label: '건강', color: 'bg-green-500' },
                      { value: 'other', label: '기타', color: 'bg-gray-500' },
                    ].map((cat) => (
                      <motion.button
                        key={cat.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCategory(cat.value as any)}
                        className={`px-4 py-2 rounded-xl text-sm transition-all ${
                          category === cat.value
                            ? `${cat.color} text-white toss-shadow`
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Assigned To */}
                <div>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600 mb-2">
                    <User size={16} />
                    <span>담당자</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {teamMembers.map((member) => (
                      <motion.button
                        key={member.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAssignedTo(member.id)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          assignedTo === member.id
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs toss-shadow flex-shrink-0"
                            style={{ backgroundColor: member.color }}
                          >
                            {getInitials(member.name)}
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <div className="text-sm text-slate-900 truncate">{member.name}</div>
                            <div className="text-xs text-slate-500 truncate">{member.role}</div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 flex gap-3 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-center"
            >
              취소
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={mode === 'personal' && (!title.trim() || !startDate)}
              className="flex-1 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors toss-shadow text-center"
            >
              {editTask ? '수정' : '추가'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
