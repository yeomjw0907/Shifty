import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sun, Sunset, Moon, Coffee, Check, Edit2, X, Upload, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import type { Task, TeamMember } from '../App';
import { AddTaskDialog } from './AddTaskDialog';
import { TaskDetailDialog } from './TaskDetailDialog';
import { isDateInRange, getInitials } from '../utils/helpers';
import { SHIFT_COLORS } from '../utils/constants';

interface TeamScheduleViewProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  selectedDate: Date;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  currentUserId: string;
  viewTitle: string;
  onUpdateViewTitle: (newTitle: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdBy'>) => void;
  onUpdateTask: (task: Task) => void;
  currentUser: TeamMember;
  onAddMember: (member: Omit<TeamMember, 'id'>) => void;
}

const shiftConfig = {
  day: { 
    icon: Sun, 
    label: '데이', 
    shortLabel: 'D',
    time: '07:00-15:00',
    ...SHIFT_COLORS.day
  },
  evening: { 
    icon: Sunset, 
    label: '이브닝',
    shortLabel: 'E', 
    time: '15:00-23:00',
    ...SHIFT_COLORS.evening
  },
  night: { 
    icon: Moon, 
    label: '나이트',
    shortLabel: 'N', 
    time: '23:00-07:00',
    ...SHIFT_COLORS.night
  },
  off: { 
    icon: Coffee, 
    label: '휴무',
    shortLabel: 'OFF', 
    time: '',
    ...SHIFT_COLORS.off
  },
};

type ViewMode = 'week' | 'month' | 'year';

export function TeamScheduleView({ tasks, teamMembers, selectedDate, onToggleTask, onDeleteTask, currentUserId, viewTitle, onUpdateViewTitle, onAddTask, onUpdateTask, currentUser, onAddMember }: TeamScheduleViewProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(viewTitle);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogDate, setDialogDate] = useState<Date>(new Date());
  const [dialogMemberId, setDialogMemberId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [editTask, setEditTask] = useState<Task | undefined>(undefined);

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onUpdateViewTitle(editedTitle.trim());
      setIsEditingTitle(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedTitle(viewTitle);
    setIsEditingTitle(false);
  };

  const handleCellClick = (memberId: string, date: Date, task?: Task) => {
    if (task) {
      // Show task detail
      setSelectedTask(task);
      setIsDetailOpen(true);
    } else {
      // Add new task
      setDialogMemberId(memberId);
      setDialogDate(date);
      setEditTask(undefined);
      setIsDialogOpen(true);
    }
  };

  const handleEditTask = () => {
    if (selectedTask) {
      setEditTask(selectedTask);
      setIsDetailOpen(false);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      onDeleteTask(selectedTask.id);
      setIsDetailOpen(false);
      setSelectedTask(null);
    }
  };

  const handleToggleComplete = () => {
    if (selectedTask) {
      onToggleTask(selectedTask.id);
      // Update local state
      setSelectedTask({ ...selectedTask, completed: !selectedTask.completed });
    }
  };

  const handleScheduleUpload = (parsedTasks: Omit<Task, 'id' | 'createdBy'>[]) => {
    parsedTasks.forEach(task => onAddTask(task));
  };

  const [weekStart, setWeekStart] = useState(() => {
    const date = new Date(selectedDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  });

  const [monthStart, setMonthStart] = useState(() => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  });

  const [yearStart, setYearStart] = useState(() => {
    return new Date(selectedDate.getFullYear(), 0, 1);
  });

  const prevPeriod = () => {
    if (viewMode === 'week') {
      const newDate = new Date(weekStart);
      newDate.setDate(weekStart.getDate() - 7);
      setWeekStart(newDate);
    } else if (viewMode === 'month') {
      const newDate = new Date(monthStart);
      newDate.setMonth(monthStart.getMonth() - 1);
      setMonthStart(newDate);
    } else {
      const newDate = new Date(yearStart);
      newDate.setFullYear(yearStart.getFullYear() - 1);
      setYearStart(newDate);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'week') {
      const newDate = new Date(weekStart);
      newDate.setDate(weekStart.getDate() + 7);
      setWeekStart(newDate);
    } else if (viewMode === 'month') {
      const newDate = new Date(monthStart);
      newDate.setMonth(monthStart.getMonth() + 1);
      setMonthStart(newDate);
    } else {
      const newDate = new Date(yearStart);
      newDate.setFullYear(yearStart.getFullYear() + 1);
      setYearStart(newDate);
    }
  };

  const getPeriodLabel = () => {
    if (viewMode === 'week') {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${weekStart.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} - ${weekEnd.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    } else if (viewMode === 'month') {
      return `${monthStart.getFullYear()}년 ${monthStart.getMonth() + 1}월`;
    } else {
      return `${yearStart.getFullYear()}년`;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Card */}
        <div className="glass-card rounded-3xl p-6 toss-shadow">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="px-3 py-1.5 border-2 border-blue-400 rounded-xl focus:outline-none bg-white"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSaveTitle}
                    className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <Check size={18} className="text-green-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCancelEdit}
                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X size={18} className="text-red-600" />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group mb-1">
                  <h2 className="text-slate-900 truncate">{viewTitle}</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditingTitle(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded-lg flex-shrink-0"
                  >
                    <Edit2 size={16} className="text-slate-500" />
                  </motion.button>
                </div>
              )}
              <p className="text-slate-600 text-sm">{getPeriodLabel()}</p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              {/* View Mode Toggle */}
              <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1">
                {(['week', 'month', 'year'] as ViewMode[]).map((mode) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      viewMode === mode
                        ? 'bg-white text-blue-600 toss-shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode === 'week' ? '주간' : mode === 'month' ? '월간' : '연간'}
                  </motion.button>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevPeriod}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <ChevronLeft size={20} className="text-slate-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextPeriod}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <ChevronRight size={20} className="text-slate-600" />
              </motion.button>
            </div>
          </div>

          {/* Shift Legend */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(shiftConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-xl ${config.bg} flex items-center justify-center border ${config.border} toss-shadow`}>
                    <Icon size={14} className={config.text} />
                  </div>
                  <div className="text-xs text-slate-700">{config.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Filter (주간/월간 뷰에서만 표시) */}
        {(viewMode === 'week' || viewMode === 'month') && (
          <div className="glass-card rounded-2xl p-4 toss-shadow">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMemberId('all')}
                className={`px-4 py-2 rounded-xl flex-shrink-0 transition-all ${
                  selectedMemberId === 'all'
                    ? 'bg-blue-500 text-white toss-shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="text-sm">전체</span>
              </motion.button>
              {teamMembers.filter(m => m.id !== 'all' && m.name).map((member) => (
                <motion.button
                  key={member.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 flex-shrink-0 transition-all ${
                    selectedMemberId === member.id
                      ? 'text-white toss-shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  style={selectedMemberId === member.id ? { backgroundColor: member.color } : {}}
                >
                  <div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs"
                    style={{ 
                      backgroundColor: selectedMemberId === member.id ? 'rgba(255,255,255,0.3)' : member.color 
                    }}
                  >
                    {getInitials(member.name)}
                  </div>
                  <span className="text-sm">{member.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'week' && (
            <motion.div
              key="week"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <WeekView
                weekStart={weekStart}
                tasks={tasks}
                teamMembers={teamMembers}
                selectedMemberId={selectedMemberId}
                onCellClick={handleCellClick}
              />
            </motion.div>
          )}
          
          {viewMode === 'month' && (
            <motion.div
              key="month"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MonthView
                monthStart={monthStart}
                tasks={tasks}
                teamMembers={teamMembers}
                selectedMemberId={selectedMemberId}
                onCellClick={handleCellClick}
              />
            </motion.div>
          )}
          
          {viewMode === 'year' && (
            <motion.div
              key="year"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <YearView
                yearStart={yearStart}
                tasks={tasks}
                teamMembers={teamMembers}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Task Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <AddTaskDialog
            isOpen={isDialogOpen}
            onClose={() => {
              setIsDialogOpen(false);
              setEditTask(undefined);
            }}
            onAddTask={(task) => {
              onAddTask({
                ...task,
                assignedTo: dialogMemberId,
              });
              setIsDialogOpen(false);
              setEditTask(undefined);
            }}
            onUpdateTask={(task) => {
              onUpdateTask(task);
              setIsDialogOpen(false);
              setEditTask(undefined);
            }}
            selectedDate={dialogDate}
            teamMembers={teamMembers}
            currentUser={teamMembers.find(m => m.id === dialogMemberId) || currentUser}
            editTask={editTask}
          />
        )}
      </AnimatePresence>

      {/* Task Detail Dialog */}
      <AnimatePresence>
        {isDetailOpen && selectedTask && (
          <TaskDetailDialog
            isOpen={isDetailOpen}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
            teamMembers={teamMembers}
            currentUser={currentUser}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Week View (주간 뷰 - 월간처럼 한 줄로 표시)
function WeekView({ weekStart, tasks, teamMembers, selectedMemberId, onCellClick }: any) {
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task: Task) => isDateInRange(date, task.date, task.endDate));
  };

  const filteredMembers = selectedMemberId === 'all' 
    ? teamMembers 
    : teamMembers.filter((m: TeamMember) => m.id === selectedMemberId);

  return (
    <div className="glass-card rounded-3xl overflow-hidden toss-shadow">
      {/* Header - Days */}
      <div className="grid grid-cols-8 gap-px bg-slate-200">
        <div className="bg-white p-3">
          <div className="text-sm text-slate-600">팀원</div>
        </div>
        {weekDays.map((date, i) => {
          const isToday = date.toDateString() === today.toDateString();
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          return (
            <div 
              key={i} 
              className={`p-3 ${
                isToday 
                  ? 'bg-blue-50' 
                  : isWeekend 
                  ? 'bg-slate-50' 
                  : 'bg-white'
              }`}
            >
              <div className="text-center">
                <div className={`text-xs mb-1 ${
                  isToday 
                    ? 'text-blue-600' 
                    : isWeekend 
                    ? 'text-red-600' 
                    : 'text-slate-600'
                }`}>
                  {dayNames[date.getDay()]}
                </div>
                <div className={`text-lg ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>
                  {date.getDate()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rows - Members */}
      <div className="grid grid-cols-8 gap-px bg-slate-200">
        {filteredMembers.map((member: TeamMember, memberIndex: number) => (
          <Fragment key={member.id}>
            {/* Member Info */}
            <div 
              className="bg-white p-3 flex items-center gap-2"
            >
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs toss-shadow flex-shrink-0"
                style={{ backgroundColor: member.color }}
              >
                {getInitials(member.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-slate-900 truncate">{member.name}</div>
                <div className="text-xs text-slate-500 truncate">{member.role}</div>
              </div>
            </div>

            {/* Days for this member */}
            {weekDays.map((date, dayIndex) => {
              const isToday = date.toDateString() === today.toDateString();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const dayTasks = getTasksForDate(date).filter((t: Task) => t.assignedTo === member.id);
              const shiftTask = dayTasks.find((t: Task) => t.shiftType);
              const personalTasks = dayTasks.filter((t: Task) => !t.shiftType);
              const allTasks = [...(shiftTask ? [shiftTask] : []), ...personalTasks];

              return (
                <div
                  key={`${member.id}-${dayIndex}`}
                  className={`relative p-2 min-h-[80px] transition-all ${
                    isToday 
                      ? 'bg-blue-50/50' 
                      : isWeekend 
                      ? 'bg-slate-50' 
                      : 'bg-white'
                  } ${
                    shiftTask ? shiftConfig[shiftTask.shiftType!].bg : ''
                  }`}
                >
                  <div className="flex flex-col gap-1.5 h-full">
                    {/* Show all tasks */}
                    {allTasks.map((task) => (
                      <motion.button
                        key={task.id}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCellClick(member.id, date, task);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          task.shiftType
                            ? `${shiftConfig[task.shiftType].text} bg-white/90 backdrop-blur-sm border border-white/50`
                            : task.completed
                            ? 'bg-green-100 text-green-700 line-through'
                            : 'bg-blue-100 text-blue-700'
                        } hover:toss-shadow`}
                        title={task.title}
                      >
                        <div className="truncate">
                          {task.shiftType ? shiftConfig[task.shiftType].shortLabel : task.title}
                        </div>
                      </motion.button>
                    ))}

                    {/* Empty state - Add button */}
                    {allTasks.length === 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCellClick(member.id, date)}
                        className="w-full h-full min-h-[60px] rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center opacity-0 hover:opacity-100 hover:border-blue-400 transition-all group"
                      >
                        <Plus size={16} className="text-slate-400 group-hover:text-blue-500" />
                      </motion.button>
                    )}

                    {/* If there are tasks, show add button on hover */}
                    {allTasks.length > 0 && allTasks.length < 3 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCellClick(member.id, date)}
                        className="w-full px-2.5 py-1 rounded-lg border border-dashed border-slate-300 opacity-0 hover:opacity-100 hover:border-blue-400 transition-all text-slate-400 hover:text-blue-500 text-xs flex items-center justify-center gap-1"
                      >
                        <Plus size={12} />
                      </motion.button>
                    )}
                  </div>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// Month View (개선된 월간 뷰)
function MonthView({ monthStart, tasks, teamMembers, selectedMemberId, onCellClick }: any) {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task: Task) => isDateInRange(date, task.date, task.endDate));
  };

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();

  const filteredMembers = selectedMemberId === 'all' 
    ? teamMembers 
    : teamMembers.filter((m: TeamMember) => m.id === selectedMemberId);

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-6 toss-shadow">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {dayNames.map((day, i) => (
          <div 
            key={i} 
            className={`text-center text-sm py-2 ${
              i === 0 ? 'text-red-600' : i === 6 ? 'text-blue-600' : 'text-slate-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-28" />;
          }

          const dayTasks = getTasksForDate(date);
          const isToday = date.toDateString() === today.toDateString();
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`h-28 border-2 rounded-xl p-2 overflow-hidden transition-all ${
                isToday 
                  ? 'border-blue-400 bg-blue-50/50' 
                  : 'border-slate-200 hover:border-blue-300 bg-white'
              }`}
            >
              <div className={`text-sm mb-2 ${
                isToday 
                  ? 'text-blue-600' 
                  : isWeekend 
                  ? 'text-red-600' 
                  : 'text-slate-900'
              }`}>
                {date.getDate()}
              </div>
              
              <div className="space-y-1 overflow-y-auto scrollbar-hide h-[calc(100%-28px)]">
                {filteredMembers.map((member: TeamMember) => {
                  const memberTasks = dayTasks.filter((t: Task) => t.assignedTo === member.id);
                  const shiftTask = memberTasks.find((t: Task) => t.shiftType);
                  const personalTasks = memberTasks.filter((t: Task) => !t.shiftType);
                  
                  if (!shiftTask && personalTasks.length === 0) return null;

                  return (
                    <motion.button
                      key={member.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onCellClick(member.id, date)}
                      className="w-full text-left"
                    >
                      <div 
                        className="text-xs rounded-lg px-2 py-1 flex items-center justify-between gap-1 truncate"
                        style={{ 
                          backgroundColor: shiftTask 
                            ? `${member.color}20` 
                            : '#e0e7ff',
                          color: shiftTask ? member.color : '#4f46e5',
                          border: `1px solid ${shiftTask ? member.color : '#c7d2fe'}40`
                        }}
                      >
                        <span className="truncate">
                          {getInitials(member.name)}
                          {shiftTask && `·${shiftConfig[shiftTask.shiftType!].shortLabel}`}
                        </span>
                        {personalTasks.length > 0 && (
                          <span className="flex-shrink-0">+{personalTasks.length}</span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Year View (연간 뷰)
function YearView({ yearStart, tasks, teamMembers }: any) {
  const months = Array.from({ length: 12 }, (_, i) => {
    return new Date(yearStart.getFullYear(), i, 1);
  });

  const getMonthStats = (month: Date) => {
    const year = month.getFullYear();
    const monthNum = month.getMonth();
    
    const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
    const stats = {
      day: 0,
      evening: 0,
      night: 0,
      off: 0,
      personal: 0,
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, monthNum, day);
      const dayTasks = tasks.filter((task: Task) => 
        isDateInRange(currentDate, task.date, task.endDate)
      );

      const uniqueShifts = new Set<string>();
      dayTasks.forEach((task: Task) => {
        if (task.shiftType) {
          uniqueShifts.add(task.shiftType);
        } else {
          stats.personal++;
        }
      });

      uniqueShifts.forEach(shiftType => {
        if (shiftType === 'day') stats.day++;
        else if (shiftType === 'evening') stats.evening++;
        else if (shiftType === 'night') stats.night++;
        else if (shiftType === 'off') stats.off++;
      });
    }

    return stats;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {months.map((month, index) => {
        const stats = getMonthStats(month);
        const total = stats.day + stats.evening + stats.night + stats.off;

        return (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card rounded-2xl p-5 hover:toss-shadow-lg transition-all"
          >
            <div className="text-center mb-4">
              <div className="text-xl text-slate-900 mb-1">{month.getMonth() + 1}월</div>
              <div className="text-xs text-slate-600">총 {total}일 근무</div>
            </div>

            <div className="space-y-2.5">
              {stats.day > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${SHIFT_COLORS.day.bg}`} />
                    <span className="text-sm text-slate-700">데이</span>
                  </div>
                  <span className="text-sm text-slate-900">{stats.day}일</span>
                </div>
              )}
              {stats.evening > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${SHIFT_COLORS.evening.bg}`} />
                    <span className="text-sm text-slate-700">이브닝</span>
                  </div>
                  <span className="text-sm text-slate-900">{stats.evening}일</span>
                </div>
              )}
              {stats.night > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${SHIFT_COLORS.night.bg}`} />
                    <span className="text-sm text-slate-700">나이트</span>
                  </div>
                  <span className="text-sm text-slate-900">{stats.night}일</span>
                </div>
              )}
              {stats.off > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${SHIFT_COLORS.off.bg}`} />
                    <span className="text-sm text-slate-700">휴무</span>
                  </div>
                  <span className="text-sm text-slate-900">{stats.off}일</span>
                </div>
              )}
              {stats.personal > 0 && (
                <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 mt-2.5">
                  <span className="text-sm text-blue-600">개인일정</span>
                  <span className="text-sm text-slate-900">{stats.personal}개</span>
                </div>
              )}
              {total === 0 && stats.personal === 0 && (
                <div className="text-center text-sm text-slate-400 py-3">일정 없음</div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
