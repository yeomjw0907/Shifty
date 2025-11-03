import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Loader2 } from 'lucide-react';
import { TossInput } from './TossInput';

interface TeamCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTeam: (teamName: string) => Promise<void>;
}

export function TeamCreateDialog({ isOpen, onClose, onCreateTeam }: TeamCreateDialogProps) {
  const [teamName, setTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setError('팀 이름을 입력해주세요');
      return;
    }

    setIsCreating(true);
    setError('');
    
    try {
      await onCreateTeam(teamName.trim());
      setTeamName('');
      onClose();
    } catch (err) {
      setError('팀 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCreating(false);
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
          className="relative w-full max-w-md glass-card rounded-3xl toss-shadow p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <Users size={24} className="text-white" />
              </div>
              <h2 className="text-slate-900">새 팀 생성</h2>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <TossInput
              label="팀 이름"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                setError('');
              }}
              placeholder="예: 간호1팀, 서울대병원 A팀"
              error={error}
              disabled={isCreating}
              autoFocus
            />

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-slate-700 mb-2">
                💡 <strong>팁:</strong>
              </p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• 팀을 생성하면 고유한 초대 코드가 발급됩니다</li>
                <li>• 초대 코드로 팀원들을 초대할 수 있습니다</li>
                <li>• 팀 이름은 나중에 변경할 수 있습니다</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                disabled={isCreating}
              >
                취소
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors toss-shadow flex items-center justify-center gap-2"
                disabled={isCreating || !teamName.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    생성 중...
                  </>
                ) : (
                  '팀 생성'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
