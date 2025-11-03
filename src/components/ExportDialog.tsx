import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Calendar, FileText, Check } from 'lucide-react';
import type { Task, TeamMember } from '../App';
import { downloadICS, generateGoogleCalendarURL } from '../utils/calendar-export';
import { toast } from 'sonner@2.0.3';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  teamMembers: TeamMember[];
}

export function ExportDialog({ isOpen, onClose, tasks, teamMembers }: ExportDialogProps) {
  const handleExportICS = () => {
    try {
      downloadICS(tasks, teamMembers, `shifty-schedule-${new Date().toISOString().split('T')[0]}.ics`);
      toast.success('일정을 성공적으로 내보냈습니다!');
      onClose();
    } catch (error) {
      toast.error('내보내기에 실패했습니다.');
      console.error('Export error:', error);
    }
  };

  const handleExportJSON = () => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        tasks: tasks.map(task => ({
          ...task,
          date: task.date.toISOString(),
          endDate: task.endDate?.toISOString(),
        })),
        teamMembers,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `shifty-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast.success('백업 파일을 성공적으로 내보냈습니다!');
      onClose();
    } catch (error) {
      toast.error('백업에 실패했습니다.');
      console.error('Backup error:', error);
    }
  };

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
          className="relative w-full max-w-lg max-h-[85vh] flex flex-col glass-card rounded-3xl toss-shadow overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <Download size={24} className="text-orange-600" />
                </div>
                <div>
                  <h2 className="text-slate-900">일정 내보내기</h2>
                  <p className="text-sm text-slate-600">캘린더 형식으로 내보내기</p>
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
            {/* Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <Calendar size={24} className="text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600">총 일정</p>
                  <p className="text-2xl text-slate-900">{tasks.length}개</p>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-3">
              <h3 className="text-slate-900 mb-3">내보내기 형식 선택</h3>

              {/* ICS Format */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleExportICS}
                className="w-full p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Calendar size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-900">iCalendar 형식 (.ics)</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">추천</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Google Calendar, Apple Calendar, Outlook 등 모든 캘린더 앱에서 가져오기 가능
                    </p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-green-600" />
                        <span>모든 일정 및 교대 근무 정보 포함</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-green-600" />
                        <span>표준 캘린더 형식</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.button>

              {/* JSON Backup */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleExportJSON}
                className="w-full p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50 transition-all text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <FileText size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-900">JSON 백업 파일</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Shifty에서 다시 가져올 수 있는 백업 파일
                    </p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-green-600" />
                        <span>모든 데이터 완벽 보존</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-green-600" />
                        <span>팀원 정보 포함</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-600 leading-relaxed">
                💡 <strong>팁:</strong> iCalendar 파일(.ics)을 다운로드한 후 다른 캘린더 앱에서 
                "가져오기" 기능을 사용하여 일정을 불러올 수 있습니다.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              닫기
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
