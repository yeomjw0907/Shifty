import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Plus, X, Edit3, Trash2, Mail, CheckCircle, 
  MessageSquare, Send, Pin, Clock, User, Shield, UserPlus,
  Sparkles, Share2
} from 'lucide-react';
import type { TeamMember } from '../App';
import { AVATAR_COLORS, STORAGE_KEYS, FADE_IN, SCALE_IN } from '../utils/constants';
import { formatTimestamp, getInitials } from '../utils/helpers';
// Supabase removed - using local state only

interface BoardPost {
  id: string;
  author: TeamMember;
  content: string;
  timestamp: Date;
  isPinned: boolean;
  type: 'notice' | 'message';
}

interface MemberManagementProps {
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  currentTeam: { id: string; name: string };
  accessToken: string;
  onAddMember: (member: Omit<TeamMember, 'id'>) => void;
  onUpdateMember: (memberId: string, updates: Partial<TeamMember>) => void;
  onDeleteMember: (memberId: string) => void;
  onInviteTeam?: () => void;
}

export function MemberManagement({ 
  teamMembers, 
  currentUser,
  currentTeam,
  accessToken,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onInviteTeam
}: MemberManagementProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'board'>('members');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddOptionOpen, setIsAddOptionOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  // New member form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberColor, setNewMemberColor] = useState(AVATAR_COLORS[0]);
  
  // Board posts
  const [posts, setPosts] = useState<BoardPost[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOARD_POSTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((p: any) => ({
        ...p,
        timestamp: new Date(p.timestamp),
        author: p.author
      }));
    }
    return [];
  });
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'notice' | 'message'>('message');

  const sortedPosts = useMemo(() => 
    [...posts].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    }), [posts]
  );

  const savePosts = (updatedPosts: BoardPost[]) => {
    setPosts(updatedPosts);
    localStorage.setItem(STORAGE_KEYS.BOARD_POSTS, JSON.stringify(updatedPosts));
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('boardPostsUpdated'));
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    
    onAddMember({
      name: newMemberName.trim(),
      role: newMemberRole.trim() || '간호사',
      email: newMemberEmail.trim(),
      color: newMemberColor,
    });
    
    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberEmail('');
    setNewMemberColor(AVATAR_COLORS[0]);
    setIsAddMemberOpen(false);
  };

  const handleUpdateMember = () => {
    if (!editingMember) return;
    
    onUpdateMember(editingMember.id, {
      name: editingMember.name,
      role: editingMember.role,
      email: editingMember.email,
      color: editingMember.color,
    });
    
    setEditingMember(null);
  };

  const handleAddPost = async () => {
    if (!newPostContent.trim()) return;
    
    const newPost: BoardPost = {
      id: Date.now().toString(),
      author: currentUser,
      content: newPostContent.trim(),
      timestamp: new Date(),
      isPinned: false,
      type: newPostType,
    };
    
    savePosts([newPost, ...posts]);
    setNewPostContent('');
    setNewPostType('message');

    // Send notification if it's a notice
    if (newPostType === 'notice') {
      try {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3afd3c70/teams/${currentTeam.id}/posts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: newPostContent.trim(),
            type: 'notice',
          }),
        });
      } catch (error) {
        console.error('Send team notice notification error:', error);
        // Don't fail if notification fails
      }
    }
  };

  const handleTogglePin = (postId: string) => {
    savePosts(posts.map(p => 
      p.id === postId ? { ...p, isPinned: !p.isPinned } : p
    ));
  };

  const handleDeletePost = (postId: string) => {
    savePosts(posts.filter(p => p.id !== postId));
  };

  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 glass-card"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-slate-900">팀 관리</h1>
              <p className="text-sm text-slate-600">팀원을 관리하고 소통하세요</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs with Glass Effect */}
      <div className="flex gap-2 p-1.5 glass-card rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('members')}
          className={`relative px-6 py-3 rounded-xl transition-all ${
            activeTab === 'members'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {activeTab === 'members' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white rounded-xl toss-shadow"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            <Users size={18} />
            <span>팀원</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs">
              {teamMembers.length}
            </span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('board')}
          className={`relative px-6 py-3 rounded-xl transition-all ${
            activeTab === 'board'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {activeTab === 'board' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white rounded-xl toss-shadow"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            <MessageSquare size={18} />
            <span>게시판</span>
            {posts.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs">
                {posts.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'members' ? (
          <motion.div
            key="members"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Add Member Card */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setIsAddOptionOpen(true)}
              className="w-full p-8 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-3 text-slate-600 hover:text-blue-600 glass"
            >
              <Plus size={24} />
              <span>새 팀원 추가</span>
            </motion.button>

            {/* Members Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative glass-card rounded-2xl p-6 hover:toss-shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white flex-shrink-0 toss-shadow"
                      style={{ 
                        backgroundColor: member.color,
                        backgroundImage: `linear-gradient(135deg, ${member.color} 0%, ${member.color}dd 100%)`
                      }}
                    >
                      <span className="text-xl">{getInitials(member.name)}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-slate-900 mb-1 truncate">{member.name}</h3>
                      <div className="space-y-1.5">
                        {member.role && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Shield size={14} />
                            <span className="truncate">{member.role}</span>
                          </div>
                        )}
                        {member.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail size={14} />
                            <span className="truncate">{member.email}</span>
                          </div>
                        )}
                        {member.id === currentUser.id && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs mt-2">
                            <Sparkles size={12} />
                            <span>본인</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {member.id !== currentUser.id && (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditingMember(member)}
                        className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center toss-shadow"
                      >
                        <Edit3 size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (confirm(`${member.name}님을 팀에서 제거하시겠습니까?`)) {
                            onDeleteMember(member.id);
                          }
                        }}
                        className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center toss-shadow"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="board"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Post Input */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 toss-shadow"
                  style={{ backgroundColor: currentUser.color }}
                >
                  {getInitials(currentUser.name)}
                </div>
                <div className="flex-1 space-y-3">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="팀원들과 공유할 내용을 작성하세요..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white focus:outline-none resize-none transition-all"
                    rows={3}
                  />
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewPostType('message')}
                        className={`px-4 py-2 rounded-xl transition-all ${
                          newPostType === 'message'
                            ? 'bg-blue-50 text-blue-600 toss-shadow'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare size={14} />
                          <span className="text-sm">메시지</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setNewPostType('notice')}
                        className={`px-4 py-2 rounded-xl transition-all ${
                          newPostType === 'notice'
                            ? 'bg-amber-50 text-amber-600 toss-shadow'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Pin size={14} />
                          <span className="text-sm">공지</span>
                        </div>
                      </button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddPost}
                      disabled={!newPostContent.trim()}
                      className="px-6 py-2.5 rounded-xl gradient-blue text-white toss-shadow hover:shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <Send size={16} />
                      <span className="text-sm">게시</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-3">
              {sortedPosts.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600 mb-2">아직 게시물이 없습니다</p>
                  <p className="text-sm text-slate-500">첫 번째 메시지를 작성해보세요!</p>
                </div>
              ) : (
                sortedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative glass-card rounded-2xl p-6 hover:toss-shadow-lg transition-all ${
                      post.isPinned ? 'ring-2 ring-amber-200' : ''
                    }`}
                  >
                    {post.isPinned && (
                      <div className="absolute -top-2 left-4 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-xs flex items-center gap-1 toss-shadow">
                        <Pin size={10} />
                        <span>고정됨</span>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 toss-shadow"
                        style={{ backgroundColor: post.author.color }}
                      >
                        {getInitials(post.author.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-slate-900">{post.author.name}</span>
                          {post.type === 'notice' && (
                            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-xs">
                              공지
                            </span>
                          )}
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={12} />
                            {formatTimestamp(post.timestamp)}
                          </span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      {/* Actions */}
                      {post.author.id === currentUser.id && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleTogglePin(post.id)}
                            className={`w-9 h-9 rounded-xl transition-colors flex items-center justify-center toss-shadow ${
                              post.isPinned
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <Pin size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (confirm('이 게시물을 삭제하시겠습니까?')) {
                                handleDeletePost(post.id);
                              }
                            }}
                            className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center toss-shadow"
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Option Selection Modal */}
      <AddOptionModal
        isOpen={isAddOptionOpen}
        onClose={() => setIsAddOptionOpen(false)}
        onSelectAddMember={() => {
          setIsAddOptionOpen(false);
          setIsAddMemberOpen(true);
        }}
        onSelectInviteTeam={() => {
          setIsAddOptionOpen(false);
          onInviteTeam?.();
        }}
      />

      {/* Add/Edit Member Modals */}
      <MemberFormModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSubmit={handleAddMember}
        title="새 팀원 추가"
        submitLabel="추가"
        name={newMemberName}
        setName={setNewMemberName}
        role={newMemberRole}
        setRole={setNewMemberRole}
        email={newMemberEmail}
        setEmail={setNewMemberEmail}
        color={newMemberColor}
        setColor={setNewMemberColor}
      />

      <MemberFormModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        onSubmit={handleUpdateMember}
        title="팀원 정보 수정"
        submitLabel="저장"
        name={editingMember?.name || ''}
        setName={(name) => setEditingMember(prev => prev ? { ...prev, name } : null)}
        role={editingMember?.role || ''}
        setRole={(role) => setEditingMember(prev => prev ? { ...prev, role } : null)}
        email={editingMember?.email || ''}
        setEmail={(email) => setEditingMember(prev => prev ? { ...prev, email } : null)}
        color={editingMember?.color || AVATAR_COLORS[0]}
        setColor={(color) => setEditingMember(prev => prev ? { ...prev, color } : null)}
      />
    </div>
  );
}

// Member Form Modal Component
interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  submitLabel: string;
  name: string;
  setName: (name: string) => void;
  role: string;
  setRole: (role: string) => void;
  email: string;
  setEmail: (email: string) => void;
  color: string;
  setColor: (color: string) => void;
}

function MemberFormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitLabel,
  name,
  setName,
  role,
  setRole,
  email,
  setEmail,
  color,
  setColor,
}: MemberFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            {...FADE_IN}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            {...SCALE_IN}
            className="relative glass-card rounded-3xl toss-shadow-xl w-full max-w-md p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900">{title}</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">이름 *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">역할</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="간호사, 수간호사 등"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@hospital.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-3">프로필 색상</label>
                <div className="grid grid-cols-7 gap-2">
                  {AVATAR_COLORS.map(avatarColor => (
                    <motion.button
                      key={avatarColor}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setColor(avatarColor)}
                      className={`w-10 h-10 rounded-xl transition-all toss-shadow ${
                        color === avatarColor 
                          ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' 
                          : ''
                      }`}
                      style={{ backgroundColor: avatarColor }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSubmit}
                  disabled={!name.trim()}
                  className="flex-1 px-6 py-3 rounded-xl gradient-blue text-white toss-shadow hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitLabel === '추가' ? <UserPlus size={18} /> : <CheckCircle size={18} />}
                  <span>{submitLabel}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Add Option Selection Modal Component
interface AddOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddMember: () => void;
  onSelectInviteTeam: () => void;
}

function AddOptionModal({
  isOpen,
  onClose,
  onSelectAddMember,
  onSelectInviteTeam,
}: AddOptionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            {...FADE_IN}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            {...SCALE_IN}
            className="relative glass-card rounded-3xl toss-shadow-xl w-full max-w-md p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-900">팀원 추가 방법 선택</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSelectAddMember}
                className="w-full p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-center gap-4 text-left glass-card hover:toss-shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white flex-shrink-0 toss-shadow">
                  <UserPlus size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 font-medium mb-1">새 팀원 추가</h3>
                  <p className="text-sm text-slate-600">이름, 역할, 이메일을 직접 입력하여 팀원을 추가합니다</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSelectInviteTeam}
                className="w-full p-6 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center gap-4 text-left glass-card hover:toss-shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 toss-shadow">
                  <Share2 size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 font-medium mb-1">팀 초대하기</h3>
                  <p className="text-sm text-slate-600">초대 코드를 공유하여 팀원이 직접 참여하도록 합니다</p>
                </div>
              </motion.button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <button
                onClick={onClose}
                className="w-full px-6 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
