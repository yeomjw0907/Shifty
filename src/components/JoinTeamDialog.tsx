import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Key, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
// API removed - using local state only

interface JoinTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
  onJoinSuccess: (team: any) => void;
}

export function JoinTeamDialog({ isOpen, onClose, accessToken, onJoinSuccess }: JoinTeamDialogProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setError('초대 코드를 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 로컬에서 팀 찾기 (실제로는 백엔드 연동 필요)
      const savedTeams = JSON.parse(localStorage.getItem('teams') || '[]');
      const team = savedTeams.find((t: any) => t.inviteCode === inviteCode.trim().toUpperCase());

      if (!team) {
        setError('초대 코드가 올바르지 않습니다');
        setLoading(false);
        return;
      }

      onJoinSuccess(team);
      onClose();
    } catch (err) {
      console.error('Join team error:', err);
      setError('팀 참여 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="text-blue-600" size={24} />
            팀 참여하기
          </DialogTitle>
          <DialogDescription>
            초대 코드를 입력하여 팀에 참여하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700">
              팀장으로부터 받은 초대 코드를 입력하여 팀에 참여하세요. 초대 코드는 대소문자를 구분하지 않습니다.
            </p>
          </div>

          {/* Invite Code Input */}
          <div>
            <label className="block text-sm text-slate-700 mb-2">
              <Key size={16} className="inline mr-1" />
              초대 코드
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="ABC123"
              maxLength={6}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono text-xl text-center tracking-widest uppercase focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              취소
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={loading || !inviteCode.trim()}
              className="flex-1 py-3 shifty-gradient text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>참여 중...</span>
                </>
              ) : (
                <>
                  <Users size={20} />
                  <span>팀 참여</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
