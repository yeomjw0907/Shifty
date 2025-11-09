import { motion, AnimatePresence } from 'motion/react';
import { Check, Trash2, Briefcase, User, Heart, MoreHorizontal, Sun, Sunset, Moon, Coffee } from 'lucide-react';
import type { Task, TeamMember } from '../App';

interface TaskListProps {
  tasks: Task[];
  selectedDate: Date;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  teamMembers: TeamMember[];
  currentUserId: string;
  showAllTasks?: boolean;
}

const categoryConfig = {
  work: { icon: Briefcase, color: 'violet', label: '업무' },
  personal: { icon: User, color: 'blue', label: '개인' },
  health: { icon: Heart, color: 'rose', label: '건강' },
  other: { icon: MoreHorizontal, color: 'slate', label: '기타' },
};

const shiftConfig = {
  day: { icon: Sun, label: '데이 근무', time: '07:00-15:00', color: 'amber', bgGradient: 'from-amber-50 to-yellow-50', border: 'border-amber-200' },
  evening: { icon: Sunset, label: '이브닝 근무', time: '15:00-23:00', color: 'orange', bgGradient: 'from-orange-50 to-red-50', border: 'border-orange-200' },
  night: { icon: Moon, label: '나이트 근무', time: '23:00-07:00', color: 'indigo', bgGradient: 'from-indigo-50 to-purple-50', border: 'border-indigo-200' },
  off: { icon: Coffee, label: '휴무', time: '', color: 'slate', bgGradient: 'from-slate-50 to-gray-50', border: 'border-slate-200' },
};

export function TaskList({ tasks, selectedDate, onToggleTask, onDeleteTask, teamMembers, currentUserId, showAllTasks }: TaskListProps) {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('ko-KR', options);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.time && b.time) return a.time.localeCompare(b.time);
    return 0;
  });

  const groupedTasks = showAllTasks
    ? sortedTasks.reduce((acc, task) => {
        const dateKey = task.date.toDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(task);
        return acc;
      }, {} as Record<string, Task[]>)
    : null;

  const renderTask = (task: Task) => {
    const config = task.shiftType ? shiftConfig[task.shiftType] : categoryConfig[task.category];
    const Icon = config.icon;
    const assignedMember = teamMembers.find(m => m.id === task.assignedTo);
    const canEdit = task.createdBy === currentUserId;

    return (
      <motion.div
        key={task.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`group p-4 rounded-2xl border-2 transition-all ${
          task.completed
            ? 'bg-slate-50 border-slate-200'
            : task.shiftType
            ? `bg-gradient-to-br ${config.bgGradient} ${config.border} hover:shadow-md`
            : `bg-gradient-to-br from-${config.color}-50 to-white border-${config.color}-200 hover:border-${config.color}-300`
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => canEdit && onToggleTask(task.id)}
            disabled={!canEdit}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              task.completed
                ? 'bg-emerald-500 border-emerald-500'
                : task.shiftType
                ? `${config.border} hover:border-opacity-100`
                : `border-${config.color}-400 hover:border-${config.color}-600`
            } ${!canEdit ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {task.completed && <Check size={14} className="text-white" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className={`text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                {task.title}
              </h4>
              {task.time && (
                <span className={`text-xs flex-shrink-0 ${task.completed ? 'text-slate-400' : 'text-slate-600'}`}>
                  {task.time}
                </span>
              )}
            </div>
            
            {task.description && (
              <p className={`text-xs mb-2 ${task.completed ? 'text-slate-400' : 'text-slate-600'}`}>
                {task.description}
              </p>
            )}

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${
                  task.completed
                    ? 'bg-slate-200 text-slate-500'
                    : task.shiftType
                    ? `bg-${config.color}-100 text-${config.color}-700`
                    : `bg-${config.color}-100 text-${config.color}-700`
                }`}>
                  <Icon size={12} />
                  <span>{config.label}</span>
                </div>

                {assignedMember && assignedMember.id !== 'all' && (
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: assignedMember.color }}
                    >
                      {assignedMember.name.charAt(0)}
                    </div>
                    <span className="text-xs text-slate-600">{assignedMember.name}</span>
                  </div>
                )}
              </div>

              {canEdit && (
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 sticky top-24 max-h-[calc(100vh-8rem)] overflow-auto">
      {!showAllTasks && (
        <div className="mb-6">
          <h3 className="text-slate-900 mb-1">{formatDate(selectedDate)}</h3>
          <p className="text-slate-500 text-sm">{tasks.length}개 일정</p>
        </div>
      )}

      {showAllTasks && (
        <div className="mb-6">
          <h3 className="text-slate-900">전체 일정</h3>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {showAllTasks && groupedTasks ? (
            Object.entries(groupedTasks).map(([dateKey, dateTasks]) => (
              <div key={dateKey} className="space-y-3">
                <div className="text-xs text-slate-500 mt-6 first:mt-0 mb-3">
                  {new Date(dateKey).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                {dateTasks.map(task => renderTask(task))}
              </div>
            ))
          ) : sortedTasks.length > 0 ? (
            sortedTasks.map(task => renderTask(task))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">이 날짜에 일정이 없습니다</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
