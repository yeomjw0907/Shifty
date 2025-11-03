import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Users, Key } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner@2.0.3';

interface TeamInviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
  teamName: string;
}

export function TeamInviteDialog({ isOpen, onClose, inviteCode, teamName }: TeamInviteDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('초대 코드가 복사되었습니다');
      } else {
        // Fallback for browsers that don't support Clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = inviteCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          toast.success('초대 코드가 복사되었습니다');
        } catch (err) {
          console.error('Fallback copy failed:', err);
          toast.error('복사에 실패했습니다. 직접 선택해서 복사해주세요');
        } finally {
          textArea.remove();
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('복사에 실패했습니다. 직접 선택해서 복사해주세요');
    }
  };

  const shareUrl = `${window.location.origin}?invite=${inviteCode}`;

  const handleCopyUrl = async () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('공유 링크가 복사되었습니다');
      } else {
        // Fallback for browsers that don't support Clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          toast.success('공유 링크가 복사되었습니다');
        } catch (err) {
          console.error('Fallback copy failed:', err);
          toast.error('복사에 실패했습니다. 직접 선택해서 복사해주세요');
        } finally {
          textArea.remove();
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('복사에 실패했습니다. 직접 선택해서 복사해주세요');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="text-blue-600" size={24} />
            팀 초대하기
          </DialogTitle>
          <DialogDescription>
            초대 코드를 복사해서 팀원에게 전달하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Team Name */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
              <span className="text-sm text-blue-700">{teamName}</span>
            </div>
          </div>

          {/* Invite Code */}
          <div>
            <label className="block text-sm text-slate-700 mb-2">
              <Key size={16} className="inline mr-1" />
              초대 코드
            </label>
            <div className="relative">
              <input
                type="text"
                value={inviteCode}
                readOnly
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono text-xl text-center tracking-widest"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1.5"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-1"
                    >
                      <Check size={14} />
                      <span>복사됨!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-1"
                    >
                      <Copy size={14} />
                      <span>복사</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Share Link */}
          <div>
            <label className="block text-sm text-slate-700 mb-2">
              공유 링크
            </label>
            <div className="relative">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="w-full px-4 py-3 pr-20 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-600 truncate"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyUrl}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-600 text-white rounded-lg text-sm flex items-center gap-1.5"
              >
                <Copy size={14} />
                <span>복사</span>
              </motion.button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <h4 className="text-sm text-blue-900 mb-2">💡 초대 방법</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>1. 위의 초대 코드를 복사해서 팀원에게 전달하세요</li>
              <li>2. 팀원이 Shifty에 로그인 후 "팀 참여" 메뉴에서 코드 입력</li>
              <li>3. 또는 공유 링크를 전달하면 자동으로 참여됩니다</li>
            </ul>
          </div>

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-center"
          >
            닫기
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
