import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';

interface TimePickerProps {
  value: string; // HH:MM format
  onChange: (value: string) => void;
  label?: string;
}

export function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [hour, setHour] = useState('07');
  const [minute, setMinute] = useState('00');
  const isInitialMount = useRef(true);
  
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value && isInitialMount.current) {
      const [h, m] = value.split(':');
      if (h) setHour(h.padStart(2, '0'));
      if (m) setMinute(m.padStart(2, '0'));
      isInitialMount.current = false;
    }
  }, [value]);

  // Update parent when time changes (but not on initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      const newValue = `${hour}:${minute}`;
      if (newValue !== value) {
        onChange(newValue);
      }
    }
  }, [hour, minute]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  const handleScroll = useCallback((ref: HTMLDivElement, setter: (value: string) => void, items: string[]) => {
    const scrollTop = ref.scrollTop;
    const itemHeight = 40;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
    setter(items[clampedIndex]);
    
    // Snap to position
    setTimeout(() => {
      ref.scrollTop = clampedIndex * itemHeight;
    }, 10);
  }, []);

  return (
    <div>
      {label && (
        <label className="block text-sm text-slate-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2 items-center justify-center bg-slate-50 rounded-xl p-4">
        {/* Hour Picker */}
        <div className="relative w-20 h-40 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="h-12" />
            <div className="h-10 border-y-2 border-blue-400 bg-blue-50/50 rounded-lg" />
            <div className="h-12" />
          </div>
          <div
            ref={hourRef}
            className="h-full overflow-y-scroll scrollbar-hide"
            onScroll={(e) => handleScroll(e.currentTarget, setHour, hours)}
            style={{ scrollSnapType: 'y mandatory' }}
          >
            <div className="h-12" />
            {hours.map((h) => (
              <div
                key={h}
                className="h-10 flex items-center justify-center text-slate-700 scroll-snap-align-start cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => {
                  setHour(h);
                  if (hourRef.current) {
                    hourRef.current.scrollTop = hours.indexOf(h) * 40;
                  }
                }}
                style={{ scrollSnapAlign: 'start' }}
              >
                {h}
              </div>
            ))}
            <div className="h-12" />
          </div>
        </div>

        <div className="text-2xl text-slate-400">:</div>

        {/* Minute Picker */}
        <div className="relative w-20 h-40 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="h-12" />
            <div className="h-10 border-y-2 border-blue-400 bg-blue-50/50 rounded-lg" />
            <div className="h-12" />
          </div>
          <div
            ref={minuteRef}
            className="h-full overflow-y-scroll scrollbar-hide"
            onScroll={(e) => handleScroll(e.currentTarget, setMinute, minutes)}
            style={{ scrollSnapType: 'y mandatory' }}
          >
            <div className="h-12" />
            {minutes.map((m) => (
              <div
                key={m}
                className="h-10 flex items-center justify-center text-slate-700 scroll-snap-align-start cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => {
                  setMinute(m);
                  if (minuteRef.current) {
                    minuteRef.current.scrollTop = minutes.indexOf(m) * 40;
                  }
                }}
                style={{ scrollSnapAlign: 'start' }}
              >
                {m}
              </div>
            ))}
            <div className="h-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DatePickerProps {
  value: Date;
  onChange: (value: Date) => void;
  label?: string;
  minDate?: Date;
}

export function DatePicker({ value, onChange, label, minDate }: DatePickerProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(value.getFullYear());
  const [month, setMonth] = useState(value.getMonth() + 1);
  const [day, setDay] = useState(value.getDate());
  const isInitialMount = useRef(true);

  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Adjust day if it's invalid for the selected month
  useEffect(() => {
    const maxDay = new Date(year, month, 0).getDate();
    if (day > maxDay) {
      setDay(maxDay);
    }
  }, [year, month, day]);

  // Update parent when date changes (but not on initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      const newDate = new Date(year, month - 1, day);
      // Only call onChange if the date actually changed
      if (newDate.getTime() !== value.getTime()) {
        onChange(newDate);
      }
    } else {
      isInitialMount.current = false;
    }
  }, [year, month, day]);

  const handleScroll = useCallback((ref: HTMLDivElement, setter: (value: number) => void, items: number[]) => {
    const scrollTop = ref.scrollTop;
    const itemHeight = 40;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
    setter(items[clampedIndex]);
    
    // Snap to position
    setTimeout(() => {
      ref.scrollTop = clampedIndex * itemHeight;
    }, 10);
  }, []);

  return (
    <div>
      {label && (
        <label className="block text-sm text-slate-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2 items-center justify-center bg-slate-50 rounded-xl p-4">
        {/* Year Picker */}
        <div className="relative w-20 h-40 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="h-12" />
            <div className="h-10 border-y-2 border-blue-400 bg-blue-50/50 rounded-lg" />
            <div className="h-12" />
          </div>
          <div
            ref={yearRef}
            className="h-full overflow-y-scroll scrollbar-hide"
            onScroll={(e) => handleScroll(e.currentTarget, setYear, years)}
            style={{ scrollSnapType: 'y mandatory' }}
          >
            <div className="h-12" />
            {years.map((y) => (
              <div
                key={y}
                className="h-10 flex items-center justify-center text-slate-700 scroll-snap-align-start cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => {
                  setYear(y);
                  if (yearRef.current) {
                    yearRef.current.scrollTop = years.indexOf(y) * 40;
                  }
                }}
                style={{ scrollSnapAlign: 'start' }}
              >
                {y}
              </div>
            ))}
            <div className="h-12" />
          </div>
        </div>

        <div className="text-xl text-slate-400">년</div>

        {/* Month Picker */}
        <div className="relative w-16 h-40 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="h-12" />
            <div className="h-10 border-y-2 border-blue-400 bg-blue-50/50 rounded-lg" />
            <div className="h-12" />
          </div>
          <div
            ref={monthRef}
            className="h-full overflow-y-scroll scrollbar-hide"
            onScroll={(e) => handleScroll(e.currentTarget, setMonth, months)}
            style={{ scrollSnapType: 'y mandatory' }}
          >
            <div className="h-12" />
            {months.map((m) => (
              <div
                key={m}
                className="h-10 flex items-center justify-center text-slate-700 scroll-snap-align-start cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => {
                  setMonth(m);
                  if (monthRef.current) {
                    monthRef.current.scrollTop = months.indexOf(m) * 40;
                  }
                }}
                style={{ scrollSnapAlign: 'start' }}
              >
                {m}
              </div>
            ))}
            <div className="h-12" />
          </div>
        </div>

        <div className="text-xl text-slate-400">월</div>

        {/* Day Picker */}
        <div className="relative w-16 h-40 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="h-12" />
            <div className="h-10 border-y-2 border-blue-400 bg-blue-50/50 rounded-lg" />
            <div className="h-12" />
          </div>
          <div
            ref={dayRef}
            className="h-full overflow-y-scroll scrollbar-hide"
            onScroll={(e) => handleScroll(e.currentTarget, setDay, days)}
            style={{ scrollSnapType: 'y mandatory' }}
          >
            <div className="h-12" />
            {days.map((d) => (
              <div
                key={d}
                className="h-10 flex items-center justify-center text-slate-700 scroll-snap-align-start cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => {
                  setDay(d);
                  if (dayRef.current) {
                    dayRef.current.scrollTop = days.indexOf(d) * 40;
                  }
                }}
                style={{ scrollSnapAlign: 'start' }}
              >
                {d}
              </div>
            ))}
            <div className="h-12" />
          </div>
        </div>

        <div className="text-xl text-slate-400">일</div>
      </div>
    </div>
  );
}
