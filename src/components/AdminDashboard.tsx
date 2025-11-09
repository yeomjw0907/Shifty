import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, Utensils, FileText, Settings, Shield, Users, BarChart3,
  Plus, Edit2, Trash2, Save, X, Calendar, Clock, Eye, Heart, MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FADE_IN, SCALE_IN } from '../utils/constants';
import { formatTimestamp } from '../utils/helpers';
import type { TeamMember } from '../App';
import * as api from '../utils/api';

interface AdminDashboardProps {
  currentUser: TeamMember;
  currentHospitalId?: string;
  accessToken: string;
}


export function AdminDashboard({
  currentUser,
  currentHospitalId,
  accessToken
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'notice' | 'menu' | 'settings'>('notice');
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(false);
  
  // New post form
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [menuDate, setMenuDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');

  // Load posts
  const loadPosts = useCallback(async () => {
    if (!currentHospitalId) return;
    
    setLoading(true);
    try {
      if (!currentHospitalId) {
        setPosts([]);
        return;
      }

      const { data, error } = await api.getAdminPosts(
        currentHospitalId,
        activeTab,
        accessToken
      );

      if (error) {
        console.error('Load admin posts error:', error);
        toast.error('게시글을 불러오는데 실패했습니다');
        setPosts([]);
        return;
      }

      if (data?.posts) {
        setPosts(data.posts.map((post: any) => ({
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
        })));
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Load posts error:', error);
      toast.error('게시글을 불러오는데 실패했습니다');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentHospitalId, activeTab]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleCreatePost = useCallback(async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('제목과 내용을 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      if (!currentHospitalId) {
        toast.error('병원을 선택해주세요');
        return;
      }

      const { data, error } = await api.createAdminPost(
        currentHospitalId,
        {
          title: newPostTitle,
          content: newPostContent,
          postType: activeTab,
          menuDate: activeTab === 'menu' ? menuDate : undefined,
          mealType: activeTab === 'menu' ? mealType : undefined,
        },
        accessToken
      );

      if (error) {
        console.error('Create admin post error:', error);
        toast.error('게시글 작성에 실패했습니다');
        return;
      }

      toast.success(activeTab === 'notice' ? '공지사항이 작성되었습니다' : '식단표가 등록되었습니다');
      setShowNewPostDialog(false);
      setNewPostTitle('');
      setNewPostContent('');
      await loadPosts();
    } catch (error) {
      console.error('Create post error:', error);
      toast.error('게시글 작성에 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [newPostTitle, newPostContent, activeTab, loadPosts]);

  const handleDeletePost = useCallback(async (postId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setLoading(true);
    try {
      if (!currentHospitalId) {
        toast.error('병원을 선택해주세요');
        return;
      }

      const { error } = await api.deleteAdminPost(
        currentHospitalId,
        postId,
        accessToken
      );

      if (error) {
        console.error('Delete admin post error:', error);
        toast.error('게시글 삭제에 실패했습니다');
        return;
      }

      toast.success('게시글이 삭제되었습니다');
      await loadPosts();
    } catch (error) {
      console.error('Delete post error:', error);
      toast.error('게시글 삭제에 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [loadPosts]);

  const filteredPosts = useMemo(() => posts, [posts]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">관리자 대시보드</h1>
        <p className="text-sm text-slate-600">공지사항과 식단표를 관리하세요</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 glass-card rounded-2xl">
        <button
          onClick={() => setActiveTab('notice')}
          className={`relative px-6 py-3 rounded-xl transition-all flex-1 ${
            activeTab === 'notice'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {activeTab === 'notice' && (
            <motion.div
              layoutId="adminActiveTab"
              className="absolute inset-0 bg-white rounded-xl toss-shadow"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative flex flex-col items-center gap-1">
            <Bell size={20} />
            <span className="text-xs">공지사항</span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`relative px-6 py-3 rounded-xl transition-all flex-1 ${
            activeTab === 'menu'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {activeTab === 'menu' && (
            <motion.div
              layoutId="adminActiveTab"
              className="absolute inset-0 bg-white rounded-xl toss-shadow"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative flex flex-col items-center gap-1">
            <Utensils size={20} />
            <span className="text-xs">식단표</span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`relative px-6 py-3 rounded-xl transition-all flex-1 ${
            activeTab === 'settings'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {activeTab === 'settings' && (
            <motion.div
              layoutId="adminActiveTab"
              className="absolute inset-0 bg-white rounded-xl toss-shadow"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative flex flex-col items-center gap-1">
            <Settings size={20} />
            <span className="text-xs">설정</span>
          </span>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'notice' && (
          <motion.div
            key="notice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">공지사항 관리</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingPost(null);
                  setNewPostTitle('');
                  setNewPostContent('');
                  setShowNewPostDialog(true);
                }}
                className="px-4 py-2 rounded-xl gradient-blue text-white toss-shadow flex items-center gap-2"
              >
                <Plus size={18} />
                <span>새 공지사항</span>
              </motion.button>
            </div>

            {/* Posts List */}
            {loading ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-slate-600">로딩 중...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600 mb-2">아직 공지사항이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="p-6 toss-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{post.title}</h3>
                        <p className="text-slate-700 mb-4 whitespace-pre-wrap">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatTimestamp(post.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={14} />
                            {post.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart size={14} />
                            {post.likeCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={14} />
                            {post.commentCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setEditingPost(post);
                            setNewPostTitle(post.title);
                            setNewPostContent(post.content);
                            setShowNewPostDialog(true);
                          }}
                          className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"
                        >
                          <Edit2 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeletePost(post.id)}
                          className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        ) : activeTab === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">식단표 관리</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingPost(null);
                  setNewPostTitle('');
                  setNewPostContent('');
                  setMenuDate(new Date().toISOString().split('T')[0]);
                  setMealType('lunch');
                  setShowNewPostDialog(true);
                }}
                className="px-4 py-2 rounded-xl gradient-blue text-white toss-shadow flex items-center gap-2"
              >
                <Plus size={18} />
                <span>새 식단표</span>
              </motion.button>
            </div>

            {/* Posts List */}
            {loading ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-slate-600">로딩 중...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <Utensils size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600 mb-2">아직 식단표가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="p-6 toss-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{post.title}</h3>
                        <p className="text-slate-700 mb-4 whitespace-pre-wrap">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatTimestamp(post.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={14} />
                            {post.viewCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setEditingPost(post);
                            setNewPostTitle(post.title);
                            setNewPostContent(post.content);
                            setShowNewPostDialog(true);
                          }}
                          className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"
                        >
                          <Edit2 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeletePost(post.id)}
                          className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="p-6 toss-shadow">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">커뮤니티 설정</h2>
              <p className="text-slate-600">설정 기능은 추후 구현 예정입니다.</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New/Edit Post Dialog */}
      <AnimatePresence>
        {showNewPostDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              {...FADE_IN}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowNewPostDialog(false)}
            />
            <motion.div
              {...SCALE_IN}
              className="relative glass-card rounded-3xl toss-shadow-xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-slate-900">
                  {editingPost ? '수정하기' : activeTab === 'notice' ? '새 공지사항' : '새 식단표'}
                </h2>
                <button
                  onClick={() => setShowNewPostDialog(false)}
                  className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              <div className="space-y-4">
                {activeTab === 'menu' && (
                  <>
                    <div>
                      <Label className="block text-sm mb-2 text-slate-700">날짜</Label>
                      <Input
                        type="date"
                        value={menuDate}
                        onChange={(e) => setMenuDate(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm mb-2 text-slate-700">식사 종류</Label>
                      <div className="flex gap-2">
                        {(['breakfast', 'lunch', 'dinner'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setMealType(type)}
                            className={`px-4 py-2 rounded-xl text-sm transition-all ${
                              mealType === type
                                ? 'bg-blue-50 text-blue-600 toss-shadow'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {type === 'breakfast' ? '아침' : type === 'lunch' ? '점심' : '저녁'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label className="block text-sm mb-2 text-slate-700">
                    제목 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder={activeTab === 'notice' ? '공지사항 제목' : '식단표 제목'}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="block text-sm mb-2 text-slate-700">
                    내용 <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={activeTab === 'notice' ? '공지사항 내용' : '식단표 내용'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white focus:outline-none resize-none transition-all min-h-[200px]"
                    rows={8}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCreatePost}
                    disabled={loading || !newPostTitle.trim() || !newPostContent.trim()}
                    className="flex-1 gradient-blue text-white"
                  >
                    <Save size={18} className="mr-2" />
                    {editingPost ? '수정하기' : '작성하기'}
                  </Button>
                  <Button
                    onClick={() => setShowNewPostDialog(false)}
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
    </div>
  );
}
