import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sun, Sunset, Moon, Coffee } from 'lucide-react';
import { motion } from 'motion/react';
import type { Task, TeamMember } from '../App';

interface CalendarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  tasks: Task[];
  teamMembers: TeamMember[];
}

export function Calendar({ selectedDate, setSelectedDate, tasks, teamMembers }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      // 연속된 일정 처리
      if (task.endDate) {
        const taskStart = new Date(task.date);
        const taskEnd = new Date(task.endDate);
        taskStart.setHours(0, 0, 0, 0);
        taskEnd.setHours(23, 59, 59, 999);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate >= taskStart && checkDate <= taskEnd;
      }
      return task.date.toDateString() === date.toDateString();
    });
  };

  const getShiftIcon = (shiftType?: string) => {
    switch (shiftType) {
      case 'day': return Sun;
      case 'evening': return Sunset;
      case 'night': return Moon;
      case 'off': return Coffee;
      default: return null;
    }
  };

  const getShiftColor = (shiftType?: string) => {
    switch (shiftType) {
      case 'day': return 'bg-amber-400';
      case 'evening': return 'bg-orange-400';
      case 'night': return 'bg-indigo-400';
      case 'off': return 'bg-slate-400';
      default: return 'bg-violet-600';
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const dayTasks = getTasksForDate(date);
      const shiftTasks = dayTasks.filter(t => t.shiftType);

      // 팀원별로 그룹화
      const tasksByMember = new Map<string, Task[]>();
      dayTasks.forEach(task => {
        const existing = tasksByMember.get(task.assignedTo) || [];
        tasksByMember.set(task.assignedTo, [...existing, task]);
      });

      days.push(
        <motion.button
          key={day}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedDate(date)}
          className={`aspect-square rounded-2xl transition-all relative p-1 ${
            isSelected
              ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
              : isToday
              ? 'bg-slate-100 text-slate-900'
              : 'hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="flex flex-col h-full">
            <span className="text-sm mb-1">{day}</span>
            {dayTasks.length > 0 && (
              <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                {/* 교대 근무 표시 */}
                {shiftTasks.slice(0, 3).map((task, idx) => {
                  const member = teamMembers.find(m => m.id === task.assignedTo);
                  return (
                    <div
                      key={idx}
                      className={`h-1 rounded-full ${isSelected ? 'bg-white/80' : getShiftColor(task.shiftType)}`}
                      style={!isSelected && member ? { backgroundColor: member.color } : {}}
                      title={`${member?.name}: ${task.title}`}
                    />
                  );
                })}
                {/* 개인 일정 표시 */}
                {dayTasks.filter(t => !t.shiftType).length > 0 && (
                  <div className={`h-1 rounded-full ${isSelected ? 'bg-white/50' : 'bg-violet-400'}`} />
                )}
              </div>
            )}
          </div>
        </motion.button>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-slate-900">
          {currentMonth.getFullYear()}년 {monthNames[currentMonth.getMonth()]}
        </h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevMonth}
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextMonth}
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </motion.button>
        </div>
      </div>

      {/* Team Members Legend */}
      <div className="mb-6 flex flex-wrap gap-3">
        {teamMembers.filter(m => m.id !== 'all').map(member => (
          <div key={member.id} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: member.color }}
            />
            <span className="text-xs text-slate-600">{member.name}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="text-center text-slate-500 text-xs py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {renderCalendarDays()}
      </div>
    </div>
  );
}
