import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Search, CheckCircle2, AlertCircle, X, Edit3, Info } from 'lucide-react';
import { searchHospitals, type Hospital } from '../utils/api';

interface HospitalSearchInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (hospital: Hospital) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export function HospitalSearchInput({
  label,
  value,
  onChange,
  onSelect,
  placeholder = '병원명을 검색하세요',
  required,
  error,
  success,
  helperText,
}: HospitalSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setHospitals([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(false);
    searchTimeoutRef.current = setTimeout(async () => {
      const { data, error } = await searchHospitals(searchQuery, 10);
      
      if (error) {
        console.error('Hospital search error:', error);
        setHospitals([]);
      } else {
        setHospitals(data?.hospitals || []);
        setIsOpen(true);
      }
      setIsSearching(false);
      setHasSearched(true);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange(newValue);
    setSelectedHospital(null);
    setSelectedIndex(-1);
    
    // 직접 입력 모드에서는 검색 결과를 표시하지 않음
    if (isManualMode) {
      setIsOpen(false);
      return;
    }
    
    if (newValue.trim().length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setHasSearched(false);
    }
  };

  const handleSelectHospital = (hospital: Hospital) => {
    const displayName = hospital.name_kr || hospital.name;
    setSearchQuery(displayName);
    onChange(displayName);
    setSelectedHospital(hospital);
    setIsOpen(false);
    onSelect?.(hospital);
  };

  const handleClear = () => {
    setSearchQuery('');
    onChange('');
    setSelectedHospital(null);
    setHospitals([]);
    setIsOpen(false);
    setIsManualMode(false);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleEnableManualMode = () => {
    setIsManualMode(true);
    setIsOpen(false);
    setHospitals([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || hospitals.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < hospitals.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < hospitals.length) {
          handleSelectHospital(hospitals[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const hasError = Boolean(error);
  const showSuccess = success && !hasError && value;
  const displayValue = selectedHospital ? (selectedHospital.name_kr || selectedHospital.name) : value;

  return (
    <div className="w-full" ref={containerRef}>
      {/* Label */}
      <label className="block text-sm mb-2 text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        <Building2 
          size={20} 
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${
            hasError 
              ? 'text-red-400' 
              : showSuccess 
              ? 'text-green-400' 
              : 'text-slate-400'
          }`} 
        />

        {/* Input Field */}
        <motion.input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchQuery.trim().length >= 2 && hospitals.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3.5 pl-12 pr-12
            bg-white
            border-2 rounded-xl
            transition-all duration-200
            placeholder:text-slate-400
            hover:border-slate-300
            focus:outline-none
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${
              hasError
                ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50'
                : showSuccess
                ? 'border-green-300 focus:border-green-400 focus:ring-4 focus:ring-green-50'
                : 'border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50'
            }
          `}
          animate={{
            scale: hasError ? [1, 1.01, 1] : 1,
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Right Elements */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <AnimatePresence mode="wait">
            {isSearching && (
              <motion.div
                key="searching"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"
              />
            )}
            {hasError && !isSearching && (
              <motion.div
                key="error-icon"
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle size={20} className="text-red-400" />
              </motion.div>
            )}
            {showSuccess && !hasError && !isSearching && (
              <motion.div
                key="success-icon"
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle2 size={20} className="text-green-400" />
              </motion.div>
            )}
          </AnimatePresence>
          {value && !isSearching && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </motion.button>
          )}
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && !isManualMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 glass-card rounded-2xl p-2 toss-shadow z-50 max-h-64 overflow-y-auto scrollbar-hide"
            >
              {hospitals.length > 0 ? (
                hospitals.map((hospital, index) => {
                  const displayName = hospital.name_kr || hospital.name;
                  const isSelected = selectedIndex === index;
                  
                  return (
                    <motion.button
                      key={hospital.id}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectHospital(hospital)}
                      className={`
                        w-full text-left px-4 py-3 rounded-xl transition-all mb-1
                        ${isSelected 
                          ? 'bg-blue-50 border-2 border-blue-200' 
                          : 'hover:bg-slate-50 border-2 border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 
                          size={18} 
                          className={`flex-shrink-0 ${
                            isSelected ? 'text-blue-600' : 'text-slate-400'
                          }`} 
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium truncate ${
                            isSelected ? 'text-blue-900' : 'text-slate-900'
                          }`}>
                            {displayName}
                          </div>
                          {(hospital.city || hospital.type) && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              {[hospital.city, hospital.district, hospital.type].filter(Boolean).join(' · ')}
                            </div>
                          )}
                        </div>
                        {selectedHospital?.id === hospital.id && (
                          <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  );
                })
              ) : (
                // 검색 결과가 없을 때 직접 입력 옵션 표시
                hasSearched && !isSearching && searchQuery.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="px-4 py-3"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Info size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-600 mb-2">
                          검색 결과가 없습니다.
                        </p>
                        <p className="text-xs text-slate-500 mb-3">
                          병원이 없으실 경우 직접 입력해주세요.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleEnableManualMode}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Edit3 size={16} />
                          직접 입력하기
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper Text / Error Message */}
      <AnimatePresence mode="wait">
        {hasError && (
          <motion.div
            key="error-message"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 mt-2 ml-1"
          >
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-600">{error}</span>
          </motion.div>
        )}
        {helperText && !hasError && !isManualMode && (
          <motion.p
            key="helper-text"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="text-sm text-slate-500 mt-2 ml-1"
          >
            {helperText}
          </motion.p>
        )}
        {isManualMode && !hasError && (
          <motion.div
            key="manual-mode-hint"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 mt-2 ml-1"
          >
            <Info size={14} className="text-blue-500 flex-shrink-0" />
            <span className="text-sm text-blue-600">직접 입력 모드입니다. 병원명을 자유롭게 입력해주세요.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

