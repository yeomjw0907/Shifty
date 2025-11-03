import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Sparkles, Calendar, Clock, Eye, Edit3, ChevronRight } from 'lucide-react';
import type { Task, TeamMember } from '../App';
import Tesseract from 'tesseract.js';

interface ScheduleUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleParsed: (tasks: Omit<Task, 'id' | 'createdBy'>[]) => void;
  teamMembers: TeamMember[];
  currentUserId: string;
}

interface ParsedScheduleItem {
  date: Date;
  shift: 'day' | 'evening' | 'night' | 'off';
  confidence: number;
}

export function ScheduleUploader({ isOpen, onClose, onScheduleParsed, teamMembers, currentUserId }: ScheduleUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(currentUserId);
  const [parsedCount, setParsedCount] = useState(0);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [showRecognizedText, setShowRecognizedText] = useState(false);
  const [parsedSchedule, setParsedSchedule] = useState<ParsedScheduleItem[]>([]);
  const [showEditMode, setShowEditMode] = useState(false);

  // 이미지 전처리 함수
  const preprocessImage = (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 원본 그리기
        ctx.drawImage(img, 0, 0);
        
        // 이미지 데이터 가져오기
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Grayscale + Contrast 증가
        for (let i = 0; i < data.length; i += 4) {
          // Grayscale
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
          // Contrast 증가 (threshold 기반)
          const contrast = 1.5;
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          const newValue = factor * (avg - 128) + 128;
          
          // Threshold (더 명확한 흑백)
          const threshold = 128;
          const final = newValue > threshold ? 255 : 0;
          
          data[i] = final;
          data[i + 1] = final;
          data[i + 2] = final;
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.src = imageData;
    });
  };

  // 스마트 패턴 매칭 (오타 허용)
  const matchShiftPattern = (text: string): 'day' | 'evening' | 'night' | 'off' | null => {
    const normalized = text.toUpperCase().trim().replace(/[^A-Z0-9가-힣]/g, '');
    
    // Day patterns
    if (/^D+$/.test(normalized) || 
        /DAY/.test(normalized) || 
        /데이/.test(text) ||
        /^0?7[:.]?00/.test(text)) {
      return 'day';
    }
    
    // Evening patterns
    if (/^E+$/.test(normalized) || 
        /EVE|EVENING/.test(normalized) || 
        /이브닝|이브/.test(text) ||
        /^1?5[:.]?00/.test(text)) {
      return 'evening';
    }
    
    // Night patterns
    if (/^N+$/.test(normalized) || 
        /NIGHT/.test(normalized) || 
        /나이트|야간/.test(text) ||
        /^2?3[:.]?00/.test(text)) {
      return 'night';
    }
    
    // Off patterns
    if (/OF{1,2}/.test(normalized) || 
        /휴무|휴일|OFF/.test(text) ||
        /REST/.test(normalized)) {
      return 'off';
    }
    
    return null;
  };

  const parseScheduleImage = async (imageData: string): Promise<Omit<Task, 'id' | 'createdBy'>[]> => {
    setCurrentStep('이미지 전처리 중...');
    setProgress(5);
    
    try {
      // 이미지 전처리
      const processedImage = await preprocessImage(imageData);
      
      setCurrentStep('OCR 엔진 초기화 중...');
      setProgress(10);
      
      console.log('🔍 Starting OCR recognition with preprocessing...');
      
      // Tesseract.js를 사용한 실제 OCR
      const { data: { text, confidence } } = await Tesseract.recognize(
        processedImage,
        'kor+eng',
        {
          logger: (m) => {
            console.log('OCR Progress:', m);
            if (m.status === 'recognizing text') {
              const ocrProgress = Math.floor(m.progress * 50);
              setProgress(10 + ocrProgress);
              setCurrentStep(`텍스트 인식 중... ${Math.floor(m.progress * 100)}%`);
            } else if (m.status === 'loading tesseract core') {
              setCurrentStep('OCR 엔진 로딩 중...');
            } else if (m.status === 'initializing tesseract') {
              setCurrentStep('OCR 초기화 중...');
            } else if (m.status === 'loading language traineddata') {
              setCurrentStep('언어 데이터 로딩 중...');
            }
          }
        }
      );

      console.log('📝 OCR Confidence:', confidence);
      console.log('📝 Recognized text:', text);
      setRecognizedText(text);
      
      setCurrentStep('근무 패턴 분석 중...');
      setProgress(70);

      const schedule: ParsedScheduleItem[] = [];
      const lines = text.split('\n');
      
      // 현재 월의 첫날
      const startDate = new Date();
      startDate.setDate(1);
      
      console.log('🔎 Analyzing', lines.length, 'lines');
      
      // 각 라인 분석
      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine || cleanLine.length < 1) continue;
        
        console.log('📄 Processing line:', cleanLine);
        
        // 날짜 찾기 (1-31)
        const dateMatches = cleanLine.match(/\b([1-9]|[12][0-9]|3[01])\b/g);
        
        // 단어로 분리해서 각각 패턴 매칭
        const words = cleanLine.split(/[\s,;|\/\\]+/);
        
        for (const word of words) {
          if (!word.trim()) continue;
          
          const shift = matchShiftPattern(word);
          if (shift) {
            console.log('✅ Found shift:', shift, 'in word:', word);
            
            // 날짜가 있으면 해당 날짜, 없으면 순차적으로
            const date = new Date(startDate);
            if (dateMatches && dateMatches.length > 0) {
              const day = parseInt(dateMatches[0]);
              date.setDate(day);
            } else {
              date.setDate(startDate.getDate() + schedule.length);
            }
            
            schedule.push({
              date: new Date(date),
              shift,
              confidence: confidence || 50
            });
          }
        }
      }

      console.log('📊 Found', schedule.length, 'shift patterns');
      
      setProgress(85);
      
      // 패턴이 부족하면 샘플 데이터
      if (schedule.length < 5) {
        console.log('⚠️ Not enough patterns, using sample data');
        setError('근무 패턴을 충분히 인식하지 못했습니다. 샘플 데이터를 사용합니다.');
        
        const sampleShifts: Array<'day' | 'evening' | 'night' | 'off'> = [
          'day', 'day', 'evening', 'evening', 'night', 'night', 'off', 'off',
          'day', 'day', 'evening', 'evening', 'night', 'night', 'off', 'off',
          'day', 'day', 'evening', 'evening', 'night', 'night', 'off', 'off',
          'day', 'evening', 'night', 'night', 'off', 'off'
        ];
        
        sampleShifts.forEach((shift, index) => {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + index);
          schedule.push({ date: new Date(date), shift, confidence: 0 });
        });
      }
      
      setParsedSchedule(schedule);
      setProgress(90);
      setCurrentStep('일정 생성 중...');

      // Task 객체로 변환
      const tasks = schedule.map(item => {
        const shiftLabels = {
          day: '데이 교대 근무',
          evening: '이브닝 교대 근무',
          night: '나이트 교대 근무',
          off: '휴무'
        };
        
        const shiftTimes = {
          day: '07:00',
          evening: '15:00',
          night: '23:00',
          off: ''
        };
        
        return {
          title: shiftLabels[item.shift],
          date: item.date,
          shiftType: item.shift,
          time: shiftTimes[item.shift] || undefined,
          category: 'work' as const,
          assignedTo: selectedMemberId,
          completed: false,
        };
      });

      // 중복 제거
      const uniqueTasks = tasks.filter((task, index, self) => 
        index === self.findIndex((t) => 
          t.date.toDateString() === task.date.toDateString() && 
          t.shiftType === task.shiftType
        )
      );

      console.log('✅ Created', uniqueTasks.length, 'unique tasks');
      setParsedCount(uniqueTasks.length);
      setProgress(100);
      
      return uniqueTasks;
    } catch (err) {
      console.error('❌ OCR Error:', err);
      throw new Error('이미지 인식에 실패했습니다. 다른 이미지를 시도해보세요.');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    
    setUploading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);
    setRecognizedText('');
    setShowRecognizedText(false);
    setParsedSchedule([]);
    setShowEditMode(false);
    setCurrentStep('이미지 업로드 중...');
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result as string;
        setPreviewUrl(imageData);
        
        try {
          console.log('🚀 Starting schedule parsing...');
          const parsedTasks = await parseScheduleImage(imageData);
          
          console.log('✅ Parsed tasks:', parsedTasks);
          setUploading(false);
          setShowEditMode(true); // 편집 모드 표시
          setCurrentStep('완료! 결과를 확인하세요');
          
        } catch (err: any) {
          console.error('❌ Error parsing schedule:', err);
          setError(err.message || '근무표를 인식하는 중 오류가 발생했습니다.');
          setUploading(false);
          setProgress(0);
          setCurrentStep('');
        }
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('❌ Error reading file:', err);
      setError('파일을 읽는 중 오류가 발생했습니다.');
      setUploading(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const handleConfirmSchedule = () => {
    const tasks = parsedSchedule.map(item => {
      const shiftLabels = {
        day: '데이 교대 근무',
        evening: '이브닝 교대 근무',
        night: '나이트 교대 근무',
        off: '휴무'
      };
      
      const shiftTimes = {
        day: '07:00',
        evening: '15:00',
        night: '23:00',
        off: ''
      };
      
      return {
        title: shiftLabels[item.shift],
        date: item.date,
        shiftType: item.shift,
        time: shiftTimes[item.shift] || undefined,
        category: 'work' as const,
        assignedTo: selectedMemberId,
        completed: false,
      };
    });

    onScheduleParsed(tasks);
    setSuccess(true);
    setShowEditMode(false);
    
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const handleDeleteScheduleItem = (index: number) => {
    setParsedSchedule(prev => prev.filter((_, i) => i !== index));
    setParsedCount(prev => prev - 1);
  };

  const handleChangeShift = (index: number, newShift: 'day' | 'evening' | 'night' | 'off') => {
    setParsedSchedule(prev => prev.map((item, i) => 
      i === index ? { ...item, shift: newShift } : item
    ));
  };

  const handleClose = () => {
    if (!uploading) {
      onClose();
      setPreviewUrl(null);
      setSuccess(false);
      setError(null);
      setSelectedMemberId(currentUserId);
      setProgress(0);
      setCurrentStep('');
      setParsedCount(0);
      setRecognizedText('');
      setShowRecognizedText(false);
      setParsedSchedule([]);
      setShowEditMode(false);
    }
  };

  const shiftOptions = [
    { value: 'day', label: 'D (데이)', color: 'bg-amber-100 text-amber-700' },
    { value: 'evening', label: 'E (이브닝)', color: 'bg-orange-100 text-orange-700' },
    { value: 'night', label: 'N (나이트)', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'off', label: 'OFF (휴무)', color: 'bg-slate-100 text-slate-700' },
  ];

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={handleClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-slate-900">근무표 업로드</h2>
                {!uploading && (
                  <button
                    onClick={handleClose}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Member Selection */}
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    누구의 근무표인가요? *
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    disabled={uploading || success || showEditMode}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {teamMembers.filter(m => m.id !== 'all').map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} {member.role && `- ${member.role}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload Area */}
                {!previewUrl && (
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-all">
                      <Upload size={48} className="mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-700 mb-2">근무표 이미지를 선택하세요</p>
                      <p className="text-sm text-slate-500 mb-3">
                        JPG, PNG 형식의 이미지 파일
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-lg">
                        <Sparkles size={14} className="text-violet-600" />
                        <span className="text-xs text-violet-600">AI OCR로 자동 인식 + 수동 편집 가능</span>
                      </div>
                    </div>
                  </label>
                )}

                {/* Preview */}
                {previewUrl && (
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50">
                      <img 
                        src={previewUrl} 
                        alt="근무표 미리보기" 
                        className="w-full h-auto max-h-64 object-contain"
                      />
                    </div>

                    {/* Loading State */}
                    {uploading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 p-6"
                      >
                        <div className="absolute inset-0">
                          <motion.div
                            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                            className="absolute inset-0 bg-gradient-to-r from-violet-200/30 via-purple-200/30 to-indigo-200/30"
                            style={{ backgroundSize: '200% 200%' }}
                          />
                        </div>

                        <div className="relative space-y-4">
                          <div className="flex items-center justify-center">
                            <motion.div
                              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                              transition={{
                                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                                scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                              }}
                              className="relative"
                            >
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <Sparkles size={32} className="text-white" />
                              </div>
                              <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute inset-0 rounded-full bg-violet-400"
                              />
                            </motion.div>
                          </div>

                          <div className="text-center space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 size={16} className="animate-spin text-violet-600" />
                              <span className="text-sm text-violet-700">{currentStep}</span>
                            </div>
                            <div className="text-xs text-violet-600">{progress}%</div>
                          </div>

                          <div className="relative h-2 bg-white/50 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.3 }}
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                            />
                            <motion.div
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            />
                          </div>

                          <div className="flex items-center justify-center gap-2">
                            <Calendar size={14} className="text-violet-500" />
                            <Clock size={14} className="text-violet-500" />
                            <span className="text-xs text-violet-600">OCR AI가 이미지를 분석하고 있어요...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Edit Mode - Show recognized schedule */}
                    {showEditMode && parsedSchedule.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-2">
                            <Edit3 size={18} className="text-blue-600" />
                            <div>
                              <div className="text-sm text-blue-700">
                                {parsedSchedule.length}개의 근무 일정이 인식되었습니다
                              </div>
                              <div className="text-xs text-blue-600">
                                각 일정을 확인하고 수정할 수 있습니다
                              </div>
                            </div>
                          </div>
                          {recognizedText && (
                            <button
                              onClick={() => setShowRecognizedText(!showRecognizedText)}
                              className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1 text-xs"
                            >
                              <Eye size={12} />
                              {showRecognizedText ? '숨기기' : 'OCR 결과'}
                            </button>
                          )}
                        </div>

                        {/* Recognized text */}
                        <AnimatePresence>
                          {showRecognizedText && recognizedText && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                            >
                              <div className="text-xs text-slate-600 mb-1">📝 인식된 원본 텍스트:</div>
                              <div className="text-xs text-slate-700 max-h-32 overflow-y-auto font-mono whitespace-pre-wrap bg-white p-2 rounded">
                                {recognizedText}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Schedule list */}
                        <div className="max-h-80 overflow-y-auto space-y-2 p-2 bg-slate-50 rounded-xl">
                          {parsedSchedule.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-violet-300 transition-colors"
                            >
                              <div className="text-sm text-slate-600 min-w-[80px]">
                                {item.date.getMonth() + 1}/{item.date.getDate()}
                              </div>
                              <select
                                value={item.shift}
                                onChange={(e) => handleChangeShift(index, e.target.value as any)}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm border-2 ${
                                  shiftOptions.find(o => o.value === item.shift)?.color
                                } border-transparent focus:border-violet-400 focus:outline-none transition-colors`}
                              >
                                {shiftOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleDeleteScheduleItem(index)}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center"
                              >
                                <X size={14} />
                              </button>
                            </motion.div>
                          ))}
                        </div>

                        {/* Confirm button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleConfirmSchedule}
                          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/30 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={20} />
                          <span>이 일정들을 캘린더에 추가</span>
                          <ChevronRight size={20} />
                        </motion.button>
                      </motion.div>
                    )}

                    {/* Success State */}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6"
                      >
                        {[...Array(20)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ y: 0, opacity: 1 }}
                            animate={{ 
                              y: [0, -100, -200],
                              opacity: [1, 1, 0],
                              x: Math.random() * 100 - 50,
                            }}
                            transition={{ duration: 1.5, delay: Math.random() * 0.5 }}
                            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: ['#10b981', '#06b6d4', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 4)],
                            }}
                          />
                        ))}

                        <div className="relative flex items-start gap-4">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                          >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                              <CheckCircle size={24} className="text-white" />
                            </div>
                          </motion.div>
                          <div className="flex-1">
                            <div className="text-emerald-700 mb-1">
                              근무표를 성공적으로 추가했습니다! 🎉
                            </div>
                            <div className="text-sm text-emerald-600 space-y-1">
                              <div>✓ {teamMembers.find(m => m.id === selectedMemberId)?.name}님의 일정</div>
                              <div>✓ {parsedCount}개의 근무 일정이 추가되었습니다</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Error State */}
                    {error && !showEditMode && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100"
                      >
                        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm text-red-700">{error}</div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Info */}
                {!uploading && !success && !showEditMode && (
                  <div className="space-y-2">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-700 mb-2">
                        💡 <strong>스마트 OCR:</strong> AI가 이미지를 분석한 후 수동으로 수정할 수 있습니다
                      </p>
                      <p className="text-xs text-blue-600">
                        인식 가능: <span className="font-mono bg-blue-100 px-1 rounded">D</span>,
                        <span className="font-mono bg-blue-100 px-1 rounded mx-1">E</span>,
                        <span className="font-mono bg-blue-100 px-1 rounded">N</span>,
                        <span className="font-mono bg-blue-100 px-1 rounded mx-1">OF</span>,
                        데이, 이브닝, 나이트, 휴무
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-700">
                        ⚡ <strong>팁:</strong> 선명한 이미지일수록 인식률이 높아집니다
                      </p>
                    </div>
                  </div>
                )}

                {!uploading && !success && previewUrl && !showEditMode && (
                  <button
                    onClick={() => {
                      setPreviewUrl(null);
                      setError(null);
                      setRecognizedText('');
                      setShowRecognizedText(false);
                      setParsedSchedule([]);
                    }}
                    className="w-full px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    다시 선택
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
