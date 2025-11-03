import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, LucideIcon } from 'lucide-react';
import { InputHTMLAttributes, ReactNode } from 'react';

interface TossInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  success?: boolean;
  helperText?: string;
  required?: boolean;
  rightElement?: ReactNode;
}

export function TossInput({
  label,
  icon: Icon,
  error,
  success,
  helperText,
  required,
  rightElement,
  ...inputProps
}: TossInputProps) {
  const hasError = Boolean(error);
  const showSuccess = success && !hasError && inputProps.value;

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm mb-2 text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <Icon 
            size={20} 
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
              hasError 
                ? 'text-red-400' 
                : showSuccess 
                ? 'text-green-400' 
                : 'text-slate-400'
            }`} 
          />
        )}

        {/* Input Field */}
        <motion.input
          {...inputProps}
          className={`
            w-full px-4 py-3.5 
            ${Icon ? 'pl-12' : 'px-4'}
            ${showSuccess || rightElement ? 'pr-12' : 'pr-4'}
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
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <AnimatePresence mode="wait">
            {hasError && (
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
            {showSuccess && (
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
            {rightElement && !hasError && !showSuccess && (
              <motion.div
                key="custom-element"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {rightElement}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
        {helperText && !hasError && (
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
      </AnimatePresence>
    </div>
  );
}
