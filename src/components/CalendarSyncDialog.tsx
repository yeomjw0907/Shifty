import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RefreshCw, AlertCircle, Check, ExternalLink } from 'lucide-react';

interface CalendarSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEnableSync?: () => void;
}

export function CalendarSyncDialog({ isOpen, onClose, onEnableSync }: CalendarSyncDialogProps) {
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'apple' | 'notion' | null>(null);

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
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col glass-card rounded-3xl toss-shadow overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <RefreshCw size={24} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-slate-900">양방향 캘린더 동기화</h2>
                  <p className="text-sm text-slate-600">외부 캘린더와 자동 동기화</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Current Status */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-900 leading-relaxed">
                    <strong>현재 단방향 내보내기만 지원됩니다.</strong><br />
                    양방향 동기화를 사용하려면 Supabase 백엔드 연동이 필요합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* What is Two-way Sync */}
            <div className="mb-6">
              <h3 className="text-slate-900 mb-3">🔄 양방향 동기화란?</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                  <Check size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">
                      <strong>자동 내보내기:</strong> 앱에서 일정을 추가하면 자동으로 외부 캘린더에 반영
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                  <Check size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">
                      <strong>자동 가져오기:</strong> 외부 캘린더에서 추가/수정한 일정이 앱에 자동 반영
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                  <Check size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">
                      <strong>실시간 동기화:</strong> 어디서든 일정을 관리하면 모든 곳에서 자동 업데이트
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supported Providers */}
            <div className="mb-6">
              <h3 className="text-slate-900 mb-3">🔗 지원 가능한 캘린더</h3>
              <div className="grid gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedProvider('google')}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedProvider === 'google'
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">📗</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">Google Calendar</div>
                      <div className="text-xs text-slate-600">Google Calendar API 사용</div>
                    </div>
                    {selectedProvider === 'google' && (
                      <Check size={20} className="text-blue-600" />
                    )}
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedProvider('apple')}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedProvider === 'apple'
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🍎</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">Apple Calendar (iCloud)</div>
                      <div className="text-xs text-slate-600">CalDAV 프로토콜 사용</div>
                    </div>
                    {selectedProvider === 'apple' && (
                      <Check size={20} className="text-blue-600" />
                    )}
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedProvider('notion')}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedProvider === 'notion'
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">📓</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">Notion Calendar</div>
                      <div className="text-xs text-slate-600">Notion API 사용</div>
                    </div>
                    {selectedProvider === 'notion' && (
                      <Check size={20} className="text-blue-600" />
                    )}
                  </div>
                </motion.button>
              </div>
            </div>

            {/* How to Enable */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-5">
              <h3 className="text-slate-900 mb-3">🚀 동기화 활성화 방법</h3>
              <ol className="space-y-3 text-sm text-slate-700">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</span>
                  <div className="flex-1">
                    <strong>Supabase 프로젝트 연결</strong>
                    <p className="text-xs text-slate-600 mt-1">무료 백엔드 서비스로 데이터베이스와 인증 제공</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">2</span>
                  <div className="flex-1">
                    <strong>캘린더 API 연동</strong>
                    <p className="text-xs text-slate-600 mt-1">OAuth 인증으로 외부 캘린더 접근 권한 획득</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">3</span>
                  <div className="flex-1">
                    <strong>자동 동기화 설정</strong>
                    <p className="text-xs text-slate-600 mt-1">주기적으로 양방향 데이터 동기화 실행</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 flex gap-3 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              닫기
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (onEnableSync) {
                  onEnableSync();
                }
                // This will trigger Supabase connection
              }}
              className="flex-1 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors toss-shadow flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              <span>Supabase 연결하기</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
