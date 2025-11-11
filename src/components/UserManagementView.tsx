import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, User, Building2, Mail, Phone, Briefcase, ChevronRight,
  Users, Plus, Calendar, FileText, MessageCircle, Edit2, Trash2, Save, X
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FADE_IN, SCALE_IN } from '../utils/constants';
// API removed - using local state only

interface AdminUser {
  id: string;
  name: string;
  email: string;
  hospital?: string;
  department?: string;
  position?: string;
  createdAt: string;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  hospital?: string;
  department?: string;
  position?: string;
  phone?: string;
  createdAt: string;
}

export function UserManagementView({ accessToken }: { accessToken: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    hospital: '',
    department: '',
    position: '',
    phone: '',
    hospital_id: '',
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      // 로컬 스토리지에서 사용자 불러오기
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const filtered = searchQuery 
          ? users.filter((u: AdminUser) => 
              u.name.includes(searchQuery) || u.email.includes(searchQuery)
            )
          : users;
        setUsers(filtered.slice((page - 1) * 50, page * 50));
        setTotal(filtered.length);
      } else {
        setUsers([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Load users error:', error);
      toast.error('사용자 목록을 불러오는데 실패했습니다');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, accessToken]);

  const loadUserDetails = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      // 로컬 스토리지에서 사용자 상세 정보 불러오기
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const user = users.find((u: AdminUser) => u.id === userId);
        if (user) {
          setUserDetails(user as UserDetails);
          setSelectedUserId(userId);
        }
      }
    } catch (error) {
      console.error('Load user details error:', error);
      toast.error('사용자 정보를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      hospital: user.hospital || '',
      department: user.department || '',
      position: user.position || '',
      phone: user.phone || '',
      hospital_id: user.hospital_id || '',
    });
    setShowEditDialog(true);
  };

  const handleSaveUser = useCallback(async () => {
    if (!editingUser) return;

    setLoading(true);
    try {
      // 로컬 스토리지에서 사용자 정보 수정
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const index = users.findIndex((u: AdminUser) => u.id === editingUser.id);
        if (index !== -1) {
          users[index] = { ...users[index], ...editForm };
          localStorage.setItem('users', JSON.stringify(users));
        }
      }
      toast.success('사용자 정보가 수정되었습니다');
      setShowEditDialog(false);
      setEditingUser(null);
      await loadUsers();
      if (selectedUserId === editingUser.id) {
        await loadUserDetails(editingUser.id);
      }
    } catch (error) {
      console.error('Update user error:', error);
      toast.error('사용자 정보 수정에 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [editingUser, editForm, accessToken, loadUsers, selectedUserId, loadUserDetails]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    if (!confirm('정말 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    setLoading(true);
    try {
      // 로컬 스토리지에서 사용자 삭제
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const filtered = users.filter((u: AdminUser) => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(filtered));
      }
      toast.success('사용자가 삭제되었습니다');
      await loadUsers();
      if (selectedUserId === userId) {
        setSelectedUserId(null);
        setUserDetails(null);
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error('사용자 삭제에 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [accessToken, loadUsers, selectedUserId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <motion.div
      key="users"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900">사용자 관리</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="이름, 이메일, 병원으로 검색..."
              className="pl-10 pr-4 py-2 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white focus:outline-none transition-all w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[400px,1fr] gap-6">
        {/* Users List */}
        <div className="space-y-3">
          {loading ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-600">로딩 중...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Users size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600 mb-2">사용자가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <motion.button
                  key={user.id}
                  onClick={() => loadUserDetails(user.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-xl glass-card toss-shadow text-left transition-all ${
                    selectedUserId === user.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User size={16} className="text-slate-400" />
                        <span className="font-semibold text-slate-900">{user.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={14} />
                        <span>{user.email}</span>
                      </div>
                      {user.hospital && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                          <Building2 size={14} />
                          <span>{user.hospital}</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 50 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
              >
                이전
              </button>
              <span className="text-sm text-slate-600">
                {page} / {Math.ceil(total / 50)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 50)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
              >
                다음
              </button>
            </div>
          )}
        </div>

        {/* User Details */}
        {selectedUserId && userDetails ? (
          <div className="space-y-4">
            <Card className="p-6 toss-shadow">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{userDetails.user.name}</h3>
                  <div className="flex items-center gap-2 text-slate-600 mb-1">
                    <Mail size={16} />
                    <span>{userDetails.user.email}</span>
                  </div>
                  {userDetails.user.hospital && (
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Building2 size={16} />
                      <span>{userDetails.user.hospital}</span>
                    </div>
                  )}
                  {userDetails.user.department && (
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Briefcase size={16} />
                      <span>{userDetails.user.department}</span>
                      {userDetails.user.position && <span>· {userDetails.user.position}</span>}
                    </div>
                  )}
                  {userDetails.user.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={16} />
                      <span>{userDetails.user.phone}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditUser(userDetails.user)}
                    className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-2"
                  >
                    <Edit2 size={18} />
                    <span>수정</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteUser(userDetails.user.id)}
                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    <span>삭제</span>
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200">
                {/* Teams */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Users size={18} />
                    <span>소속 팀 ({userDetails.teams.length})</span>
                  </h4>
                  {userDetails.teams.length === 0 ? (
                    <p className="text-sm text-slate-500">소속된 팀이 없습니다</p>
                  ) : (
                    <div className="space-y-2">
                      {userDetails.teams.map((tm) => (
                        <div key={tm.team_id} className="p-3 rounded-xl bg-slate-50">
                          <div className="font-medium text-slate-900">{tm.teams.name}</div>
                          <div className="text-sm text-slate-600">
                            {tm.teams.hospital && `${tm.teams.hospital} · `}
                            {tm.teams.department && `${tm.teams.department} · `}
                            역할: {tm.role}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Created Teams */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Plus size={18} />
                    <span>생성한 팀 ({userDetails.createdTeams.length})</span>
                  </h4>
                  {userDetails.createdTeams.length === 0 ? (
                    <p className="text-sm text-slate-500">생성한 팀이 없습니다</p>
                  ) : (
                    <div className="space-y-2">
                      {userDetails.createdTeams.map((team) => (
                        <div key={team.id} className="p-3 rounded-xl bg-slate-50">
                          <div className="font-medium text-slate-900">{team.name}</div>
                          <div className="text-sm text-slate-600">
                            초대 코드: {team.invite_code}
                            {team.hospital && ` · ${team.hospital}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tasks */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Calendar size={18} />
                    <span>작성한 근무 ({userDetails.tasks.length})</span>
                  </h4>
                  {userDetails.tasks.length === 0 ? (
                    <p className="text-sm text-slate-500">작성한 근무가 없습니다</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userDetails.tasks.map((task) => (
                        <div key={task.id} className="p-3 rounded-xl bg-slate-50">
                          <div className="font-medium text-slate-900">{task.title}</div>
                          <div className="text-sm text-slate-600">
                            {task.teams.name} · {task.shift_type} · {new Date(task.date).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Posts */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText size={18} />
                    <span>작성한 게시글 ({userDetails.posts.length})</span>
                  </h4>
                  {userDetails.posts.length === 0 ? (
                    <p className="text-sm text-slate-500">작성한 게시글이 없습니다</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userDetails.posts.map((post) => (
                        <div key={post.id} className="p-3 rounded-xl bg-slate-50">
                          <div className="font-medium text-slate-900">{post.title}</div>
                          <div className="text-sm text-slate-600">
                            {post.hospital_communities.hospitals.name_kr || post.hospital_communities.hospitals.name} · 
                            {post.is_anonymous ? ' 익명' : ''} · 
                            조회 {post.view_count} · 좋아요 {post.like_count}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <MessageCircle size={18} />
                    <span>작성한 댓글 ({userDetails.comments.length})</span>
                  </h4>
                  {userDetails.comments.length === 0 ? (
                    <p className="text-sm text-slate-500">작성한 댓글이 없습니다</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {userDetails.comments.map((comment) => (
                        <div key={comment.id} className="p-3 rounded-xl bg-slate-50">
                          <div className="text-sm text-slate-900 mb-1">{comment.content}</div>
                          <div className="text-xs text-slate-600">
                            {comment.community_posts.title} · 
                            {comment.is_anonymous ? ' 익명' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Info */}
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-2">계정 정보</h4>
                  <div className="space-y-1 text-sm text-slate-600">
                    <div>가입일: {new Date(userDetails.user.createdAt).toLocaleDateString('ko-KR')}</div>
                    <div>최종 수정: {new Date(userDetails.user.updatedAt).toLocaleDateString('ko-KR')}</div>
                    <div>사용자 ID: {userDetails.user.id}</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-12 text-center toss-shadow">
            <Users size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">사용자를 선택하여 상세 정보를 확인하세요</p>
          </Card>
        )}
      </div>

      {/* Edit User Dialog */}
      <AnimatePresence>
        {showEditDialog && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              {...FADE_IN}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowEditDialog(false)}
            />
            <motion.div
              {...SCALE_IN}
              className="relative glass-card rounded-3xl toss-shadow-xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">사용자 정보 수정</h2>
                <button
                  onClick={() => setShowEditDialog(false)}
                  className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="block text-sm mb-2 text-slate-700">이름</Label>
                  <Input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm mb-2 text-slate-700">이메일</Label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm mb-2 text-slate-700">병원</Label>
                  <Input
                    type="text"
                    value={editForm.hospital}
                    onChange={(e) => setEditForm({ ...editForm, hospital: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm mb-2 text-slate-700">부서</Label>
                  <Input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm mb-2 text-slate-700">직책</Label>
                  <Input
                    type="text"
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm mb-2 text-slate-700">전화번호</Label>
                  <Input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveUser}
                    disabled={loading}
                    className="flex-1 gradient-blue text-white"
                  >
                    <Save size={18} className="mr-2" />
                    저장
                  </Button>
                  <Button
                    onClick={() => setShowEditDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    취소
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

