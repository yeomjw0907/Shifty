import { useState } from 'react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
}

function formatDateKorean(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

export function DatePicker({ value, onChange, placeholder = '날짜 선택', minDate }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`w-full flex items-center justify-start text-left h-12 px-4 rounded-xl border-2 ${
            value ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 bg-white'
          } hover:border-blue-400 transition-colors`}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-600 flex-shrink-0" />
          {value ? (
            <span className="text-slate-900 text-sm">
              {formatDateKorean(value)}
            </span>
          ) : (
            <span className="text-slate-500 text-sm">{placeholder}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 glass-card border-2 border-slate-200 rounded-2xl" align="start">
        <Calendar
          mode="single"
          selected={value || undefined}
          onSelect={(date) => {
            onChange(date || null);
            setOpen(false);
          }}
          disabled={(date) => minDate ? date < minDate : false}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
