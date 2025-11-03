import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface DrumTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
}

export function DrumTimePicker({ value, onChange, placeholder = '시간 선택' }: DrumTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(value ? parseInt(value.split(':')[0]) : 9);
  const [minute, setMinute] = useState(value ? parseInt(value.split(':')[1]) : 0);
  
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const scrollToSelected = (ref: HTMLDivElement | null, value: number) => {
    if (ref) {
      const itemHeight = 40;
      ref.scrollTop = value * itemHeight - itemHeight * 2;
    }
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        scrollToSelected(hourRef.current, hour);
        scrollToSelected(minuteRef.current, minute);
      }, 100);
    }
  }, [open, hour, minute]);

  const handleConfirm = () => {
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onChange(timeString);
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`w-full flex items-center justify-start text-left h-12 px-4 rounded-xl border-2 ${
            value ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 bg-white'
          } hover:border-blue-400 transition-colors`}
        >
          <Clock className="mr-2 h-4 w-4 text-slate-600 flex-shrink-0" />
          {value ? (
            <span className="text-slate-900 text-sm">{value}</span>
          ) : (
            <span className="text-slate-500 text-sm">{placeholder}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 glass-card border-2 border-slate-200 rounded-2xl overflow-hidden" align="start">
        <div className="p-4">
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <div className="text-xs text-slate-600 text-center mb-1">시</div>
              <div 
                ref={hourRef}
                className="h-[200px] overflow-y-auto scrollbar-hide relative"
                style={{ scrollSnapType: 'y mandatory' }}
              >
                {/* Top gradient */}
                <div className="sticky top-0 h-20 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
                
                {/* Center highlight */}
                <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 bg-blue-100/50 rounded-lg border-2 border-blue-300 pointer-events-none" />
                
                <div className="py-20">
                  {hours.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHour(h)}
                      className={`w-full h-10 flex items-center justify-center transition-all ${
                        hour === h 
                          ? 'text-blue-600 scale-110' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      style={{ scrollSnapAlign: 'center' }}
                    >
                      {h.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
                
                {/* Bottom gradient */}
                <div className="sticky bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              </div>
            </div>
            
            <div className="flex items-center text-2xl text-slate-400 pb-8">:</div>
            
            <div className="flex-1">
              <div className="text-xs text-slate-600 text-center mb-1">분</div>
              <div 
                ref={minuteRef}
                className="h-[200px] overflow-y-auto scrollbar-hide relative"
                style={{ scrollSnapType: 'y mandatory' }}
              >
                {/* Top gradient */}
                <div className="sticky top-0 h-20 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
                
                {/* Center highlight */}
                <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 bg-blue-100/50 rounded-lg border-2 border-blue-300 pointer-events-none" />
                
                <div className="py-20">
                  {minutes.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMinute(m)}
                      className={`w-full h-10 flex items-center justify-center transition-all ${
                        minute === m 
                          ? 'text-blue-600 scale-110' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      style={{ scrollSnapAlign: 'center' }}
                    >
                      {m.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
                
                {/* Bottom gradient */}
                <div className="sticky bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClear}
              className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm"
            >
              지우기
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              className="flex-1 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm"
            >
              확인
            </motion.button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
