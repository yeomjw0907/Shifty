import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, User, MessageSquare, Send, Trash2, Edit2, CheckCircle2, Download, Share2 } from 'lucide-react';
import type { Task, TeamMember } from '../App';
import { getInitials } from '../utils/helpers';
import { exportSingleTaskToICS, generateGoogleCalendarURL } from '../utils/calendar-export';

interface Comment {
  id: string;
  taskId: string;
  author: {
    id: string;
    name: string;
    color: string;
  };
  content: string;
  timestamp: Date;
}

interface TaskDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  onToggleComplete: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const STORAGE_KEY = 'nurseScheduler_comments';

export function TaskDetailDialog({
  isOpen,
  onClose,
  task,
  teamMembers,
  currentUser,
  onToggleComplete,
  onDelete,
  onEdit,
}: TaskDetailDialogProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const assignedMember = teamMembers.find(m => m.id === task.assignedTo);

  // Load comments
  useEffect(() => {
    const savedComments = localStorage.getItem(STORAGE_KEY);
    if (savedComments) {
      const parsed = JSON.parse(savedComments);
      const taskComments = parsed
        .filter((c: any) => c.taskId === task.id)
        .map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp),
        }))
        .sort((a: Comment, b: Comment) => b.timestamp.getTime() - a.timestamp.getTime());
      setComments(taskComments);
    }
  }, [task.id]);

  const saveComments = (updatedComments: Comment[]) => {
    const savedComments = localStorage.getItem(STORAGE_KEY);
    const allComments = savedComments ? JSON.parse(savedComments) : [];
    
    // Remove old comments for this task
    const otherComments = allComments.filter((c: any) => c.taskId !== task.id);
    
    // Add updated comments
    const newAllComments = [...otherComments, ...updatedComments];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAllComments));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      taskId: task.id,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        color: currentUser.color,
      },
      content: newComment.trim(),
      timestamp: new Date(),
    };

    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    saveComments(updatedComments);
    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    const updatedComments = comments.filter(c => c.id !== commentId);
    setComments(updatedComments);
    saveComments(updatedComments);
  };

  if (!isOpen) return null;

  const shiftLabels = {
    day: '데이 근무',
    evening: '이브닝 근무',
    night: '나이트 근무',
    off: '휴무',
  };

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
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden glass-card rounded-3xl toss-shadow flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  {task.shiftType && (
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                      {shiftLabels[task.shiftType]}
                    </div>
                  )}
                  {!task.shiftType && (
                    <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">
                      개인 일정
                    </div>
                  )}
                  {task.completed && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                      <CheckCircle2 size={14} />
                      <span>완료</span>
                    </div>
                  )}
                </div>
                <h2 className="text-slate-900 mb-2">{task.title}</h2>
                {task.description && (
                  <p className="text-slate-600 text-sm">{task.description}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </motion.button>
            </div>

            {/* Details */}
            <div className="mt-4 space-y-2">
              {/* Assigned To */}
              {assignedMember && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User size={16} />
                    <span>담당자</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs toss-shadow"
                      style={{ backgroundColor: assignedMember.color }}
                    >
                      {getInitials(assignedMember.name)}
                    </div>
                    <span className="text-sm text-slate-900">{assignedMember.name}</span>
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={16} />
                  <span>날짜</span>
                </div>
                <span className="text-sm text-slate-900">
                  {task.date.toLocaleDateString('ko-KR', { 
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'short'
                  })}
                  {task.endDate && task.endDate.getTime() !== task.date.getTime() && (
                    <> ~ {task.endDate.toLocaleDateString('ko-KR', { 
                      month: 'long', 
                      day: 'numeric'
                    })}</>
                  )}
                </span>
              </div>

              {/* Time */}
              {task.time && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock size={16} />
                    <span>시간</span>
                  </div>
                  <span className="text-sm text-slate-900">{task.time}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 mt-4">
              <div className="flex gap-2 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onToggleComplete}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                    task.completed
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-green-500 text-white hover:bg-green-600 toss-shadow'
                  }`}
                >
                  {task.completed ? '완료 취소' : '완료 표시'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onEdit}
                  className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 text-sm transition-colors toss-shadow"
                >
                  <Edit2 size={16} className="inline mr-1" />
                  수정
                </motion.button>

                {task.createdBy === currentUser.id && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onDelete}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 text-sm transition-colors toss-shadow ml-auto"
                  >
                    <Trash2 size={16} className="inline mr-1" />
                    삭제
                  </motion.button>
                )}
              </div>

              {/* Calendar Export */}
              <div className="space-y-2">
                <div className="text-xs text-slate-600 mb-2">📅 캘린더에 추가</div>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const url = generateGoogleCalendarURL(task, assignedMember);
                      window.open(url, '_blank');
                    }}
                    className="px-3 py-2 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-400 text-sm transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <div className="text-lg">📗</div>
                    <span className="text-xs text-slate-700">Google</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => exportSingleTaskToICS(task, assignedMember)}
                    className="px-3 py-2 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-400 text-sm transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <div className="text-lg">🍎</div>
                    <span className="text-xs text-slate-700">Apple</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => exportSingleTaskToICS(task, assignedMember)}
                    className="px-3 py-2 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-400 text-sm transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <div className="text-lg">📓</div>
                    <span className="text-xs text-slate-700">Notion</span>
                  </motion.button>
                </div>
                
                <div className="text-xs text-slate-500 text-center leading-relaxed">
                  파일 다운로드 후 해당 캘린더 앱에서 열어주세요
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-slate-600" />
              <h3 className="text-slate-900">댓글 {comments.length}개</h3>
            </div>

            {/* Add Comment */}
            <div className="mb-6">
              <div className="flex gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs toss-shadow flex-shrink-0"
                  style={{ backgroundColor: currentUser.color }}
                >
                  {getInitials(currentUser.name)}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none transition-colors bg-white"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleAddComment();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-500">Cmd/Ctrl + Enter로 등록</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-sm transition-colors flex items-center gap-2"
                    >
                      <Send size={14} />
                      등록
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">아직 댓글이 없습니다</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs toss-shadow flex-shrink-0"
                      style={{ backgroundColor: comment.author.color }}
                    >
                      {getInitials(comment.author.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="glass-card rounded-xl p-4 hover:toss-shadow transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-900">{comment.author.name}</span>
                            <span className="text-xs text-slate-500">
                              {comment.timestamp.toLocaleDateString('ko-KR', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {comment.author.id === currentUser.id && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteComment(comment.id)}
                              className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center transition-colors"
                            >
                              <Trash2 size={14} className="text-red-600" />
                            </motion.button>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
