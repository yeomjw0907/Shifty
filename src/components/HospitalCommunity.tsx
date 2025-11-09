import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Send, Pin, Clock, Eye, Heart, Search, 
  Building2, Bookmark, BookmarkCheck, Filter, X, AlertCircle,
  Bell, Utensils, FileText, Users, ChevronLeft, ChevronRight, Plus, MessageCircle, Flag, ChevronUp, ChevronDown, Shield
} from 'lucide-react';
import type { TeamMember } from '../App';
import { FADE_IN, SCALE_IN } from '../utils/constants';
import { formatTimestamp } from '../utils/helpers';
import { toast } from 'sonner';

interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  authorName?: string;
  title: string;
  content: string;
  postType: 'notice' | 'message' | 'blind';
  category?: 'complaint' | 'info' | 'advice' | 'job' | 'welfare' | 'general';
  isAnonymous: boolean;
  isPinned: boolean;
  isOfficial: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName?: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Hospital {
  id: string;
  name: string;
  name_kr?: string;
  city?: string;
  district?: string;
  type?: string;
}

interface HospitalCommunityProps {
  currentUser: TeamMember;
  currentHospitalId?: string;
  currentHospitalName?: string;
  accessToken: string;
}

export function HospitalCommunity({ 
  currentUser, 
  currentHospitalId,
  currentHospitalName,
  accessToken 
}: HospitalCommunityProps) {
  const [activeTab, setActiveTab] = useState<'notice' | 'menu' | 'blind'>('blind');
  
  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'Admin';
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(currentHospitalId || null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isViewingOtherHospital, setIsViewingOtherHospital] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHospitalSearch, setShowHospitalSearch] = useState(false);
  const [bookmarkedHospitals, setBookmarkedHospitals] = useState<string[]>([]);
  
  // Posts
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  
  // Comments
  const [comments, setComments] = useState<Map<string, CommunityComment[]>>(new Map());
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState<Map<string, string>>(new Map());
  
  // Report
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDescription, setReportDescription] = useState<string>('');
  
  // Post detail view
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  // New post
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<'complaint' | 'info' | 'advice' | 'job' | 'welfare' | 'general'>('general');
  
  // Loading
  const [loading, setLoading] = useState(false);
  
  // Infinite scroll
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load posts
  useEffect(() => {
    if (selectedHospitalId) {
      loadPosts(selectedHospitalId);
    } else {
      setPosts([]);
    }
  }, [selectedHospitalId, activeTab, loadPosts]);

  // Filter and sort posts - Memoized for performance
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    // Sort
    if (sortBy === 'latest') {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.likeCount - a.likeCount;
      });
    }
    
    return filtered;
  }, [posts, selectedCategory, sortBy]);

  // Update displayed posts for infinite scroll - Memoized
  const displayedPosts = useMemo(() => {
    const endIndex = currentPage * pageSize;
    return filteredPosts.slice(0, endIndex);
  }, [filteredPosts, currentPage, pageSize]);

  // Infinite scroll handler - Memoized callback
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    const endIndex = currentPage * pageSize;

    if (isNearBottom && endIndex < filteredPosts.length) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, pageSize, filteredPosts.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const loadPosts = useCallback(async (hospitalId: string) => {
    setLoading(true);
    try {
      const postType = activeTab === 'blind' ? 'blind' : activeTab === 'notice' ? 'notice' : 'message';
      const { data, error } = await api.getCommunityPosts(hospitalId, postType, accessToken);
      
      if (error) {
        // API가 아직 구현되지 않았을 수 있으므로 에러를 무시하고 빈 배열로 설정
        console.log('Community posts API not yet implemented:', error);
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
      // API가 아직 구현되지 않았을 수 있으므로 에러를 무시하고 빈 배열로 설정
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, accessToken]);

  const handleSearchHospitals = async (query: string) => {
    if (query.length < 2) {
      setHospitals([]);
      return;
    }
    
    try {
      const { data, error } = await api.searchHospitals(query);
      
      if (error) {
        // API가 아직 구현되지 않았을 수 있으므로 에러를 무시
        console.log('Hospital search API not yet implemented:', error);
        setHospitals([]);
        return;
      }
      
      if (data?.hospitals) {
        setHospitals(data.hospitals);
      } else {
        setHospitals([]);
      }
    } catch (error) {
      console.error('Search hospitals error:', error);
      setHospitals([]);
    }
  };

  const handleSelectHospital = useCallback((hospital: Hospital) => {
    setSelectedHospital(hospital);
    setSelectedHospitalId(hospital.id);
    setIsViewingOtherHospital(hospital.id !== currentHospitalId);
    setShowHospitalSearch(false);
    setSearchQuery('');
  }, [currentHospitalId]);

  const handleBackToMyHospital = useCallback(() => {
    if (currentHospitalId) {
      setSelectedHospitalId(currentHospitalId);
      setSelectedHospital(null);
      setIsViewingOtherHospital(false);
    }
  }, [currentHospitalId]);

  const handleToggleBookmark = useCallback((hospitalId: string) => {
    setBookmarkedHospitals(prev => {
      if (prev.includes(hospitalId)) {
        return prev.filter(id => id !== hospitalId);
      } else {
        return [...prev, hospitalId];
      }
    });
  }, []);

  const handleCreatePost = useCallback(async () => {
    if (!newPostTitle.trim()) {
      toast.error('제목을 입력해주세요');
      return;
    }
    
    if (!newPostContent.trim()) {
      toast.error('내용을 입력해주세요');
      return;
    }
    
    if (!selectedHospitalId) {
      toast.error('병원을 선택해주세요');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await api.createCommunityPost({
        communityId: selectedHospitalId,
        title: newPostTitle,
        content: newPostContent,
        postType: activeTab === 'blind' ? 'blind' : 'message',
        category: newPostCategory,
        isAnonymous: true, // 블라인드는 항상 익명
      }, accessToken);
      
      if (error) {
        // API가 아직 구현되지 않았을 수 있으므로 임시로 성공 메시지 표시
        console.log('Create post API not yet implemented:', error);
        toast.success('게시글이 작성되었습니다 (임시)');
        setShowNewPostDialog(false);
        setNewPostTitle('');
        setNewPostContent('');
        setNewPostCategory('general');
        return;
      }
      
      toast.success('게시글이 작성되었습니다');
      setShowNewPostDialog(false);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostCategory('general');
      
      // Reload posts
      await loadPosts(selectedHospitalId);
    } catch (error) {
      console.error('Create post error:', error);
      toast.error('게시글 작성에 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [newPostTitle, newPostContent, selectedHospitalId, activeTab, newPostCategory, accessToken, loadPosts]);

  const handleLikePost = useCallback(async (postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent navigation to detail page
    try {
      const { error } = await api.likeCommunityPost(postId, accessToken);
      
      if (error) {
        // API가 아직 구현되지 않았을 수 있으므로 로컬 상태만 업데이트
        console.log('Like post API not yet implemented:', error);
      }
      
      // Update posts state
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, likeCount: post.likeCount + 1 }
          : post
      ));
    } catch (error) {
      console.error('Like post error:', error);
    }
  }, [accessToken]);

  const handleToggleComments = useCallback((postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      // TODO: Load comments from API if not loaded
      if (!comments.has(postId)) {
        // Load comments from API
        // For now, set empty array
        setComments(prev => new Map(prev).set(postId, []));
      }
    }
  }, [expandedPostId, comments]);

  const handleAddComment = useCallback((postId: string) => {
    const content = newCommentContent.get(postId) || '';
    if (!content.trim()) {
      toast.error('댓글 내용을 입력해주세요');
      return;
    }

    const newComment: CommunityComment = {
      id: `comment-${postId}-${Date.now()}`,
      postId,
      authorId: '',
      authorName: '익명',
      content: content.trim(),
      isAnonymous: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const currentComments = comments.get(postId) || [];
    setComments(prev => new Map(prev).set(postId, [...currentComments, newComment]));
    setNewCommentContent(prev => {
      const newMap = new Map(prev);
      newMap.set(postId, '');
      return newMap;
    });

    // Update comment count
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, commentCount: post.commentCount + 1 }
        : post
    ));

    toast.success('댓글이 작성되었습니다');
  }, [newCommentContent, comments]);

  const handleViewPostDetail = useCallback((postId: string) => {
    setSelectedPostId(postId);
  }, []);

  const handleClosePostDetail = useCallback(() => {
    setSelectedPostId(null);
  }, []);

  const getPreviousPost = useCallback((currentPostId: string) => {
    const currentIndex = filteredPosts.findIndex(p => p.id === currentPostId);
    if (currentIndex > 0) {
      return filteredPosts[currentIndex - 1];
    }
    return null;
  }, [filteredPosts]);

  const getNextPost = useCallback((currentPostId: string) => {
    const currentIndex = filteredPosts.findIndex(p => p.id === currentPostId);
    if (currentIndex < filteredPosts.length - 1) {
      return filteredPosts[currentIndex + 1];
    }
    return null;
  }, [filteredPosts]);

  const handleReportPostFromDetail = (postId: string) => {
    handleReportPost(postId);
    // Don't close detail view when reporting
  };

  // Memoized categories to prevent recreation
  const categories = useMemo(() => [
    { id: 'all', label: '전체' },
    { id: 'complaint', label: '불만/건의' },
    { id: 'info', label: '정보 공유' },
    { id: 'advice', label: '조언/질문' },
    { id: 'job', label: '이직 정보' },
    { id: 'welfare', label: '복지/문화' },
    { id: 'general', label: '일반' },
  ], []);

  return (
    <div className="max-w-6xl mx-auto pt-2 pb-20 md:pt-4 md:pb-8 px-4 md:px-6 space-y-3">
      {/* Banner Ad Space (for admin control) */}
      <div className="w-full h-24 md:h-32 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
        <p className="text-sm text-slate-400 opacity-0">배너 광고 공간 (관리자 페이지에서 관리)</p>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          {isViewingOtherHospital && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackToMyHospital}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft size={18} />
              <span className="text-sm">내 병원으로</span>
            </motion.button>
          )}
          
          <div>
            <h1 className="text-slate-900 mb-0.5">
              {selectedHospital?.name_kr || selectedHospital?.name || currentHospitalName || '병원 커뮤니티'}
            </h1>
            <p className="text-sm text-slate-600">
              {isViewingOtherHospital 
                ? '다른 병원 커뮤니티 (읽기 전용)' 
                : `${selectedHospital?.name_kr || selectedHospital?.name || currentHospitalName || '우리 병원'} 커뮤니티`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Hospital Search */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHospitalSearch(!showHospitalSearch)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Search size={18} />
            <span className="text-sm">다른 병원 보기</span>
          </motion.button>

          {/* Bookmarked Hospitals */}
          {bookmarkedHospitals.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
            >
              <BookmarkCheck size={18} />
              <span className="text-sm">{bookmarkedHospitals.length}</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Hospital Search Dropdown */}
      <AnimatePresence>
        {showHospitalSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card rounded-2xl p-4 toss-shadow"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearchHospitals(e.target.value);
                }}
                placeholder="병원명을 검색하세요..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            {hospitals.length > 0 && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {hospitals.map((hospital) => (
                  <motion.button
                    key={hospital.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectHospital(hospital)}
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-slate-900">
                        {hospital.name_kr || hospital.name}
                      </div>
                      {hospital.city && (
                        <div className="text-xs text-slate-500 mt-1">
                          {hospital.city} {hospital.district}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {bookmarkedHospitals.includes(hospital.id) ? (
                        <BookmarkCheck size={18} className="text-amber-600" />
                      ) : (
                        <Bookmark 
                          size={18} 
                          className="text-slate-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBookmark(hospital.id);
                          }}
                        />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 glass-card rounded-2xl w-full max-w-4xl mx-auto justify-center">
        <button
          onClick={() => setActiveTab('notice')}
          className={`relative px-6 py-3 rounded-xl transition-all ${
            activeTab === 'notice'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {activeTab === 'notice' && (
            <motion.div
              layoutId="activeTab"
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
          className={`relative px-6 py-3 rounded-xl transition-all ${
            activeTab === 'menu'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {activeTab === 'menu' && (
            <motion.div
              layoutId="activeTab"
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
          onClick={() => setActiveTab('blind')}
          className={`relative px-6 py-3 rounded-xl transition-all ${
            activeTab === 'blind'
              ? 'text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {activeTab === 'blind' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white rounded-xl toss-shadow"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative flex flex-col items-center gap-1">
            <MessageSquare size={20} />
            <span className="text-xs">블라인드</span>
          </span>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'blind' ? (
          <motion.div
            key="blind"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {selectedPostId ? (
              // Post Detail View
              (() => {
                const selectedPost = posts.find(p => p.id === selectedPostId);
                if (!selectedPost) {
                  handleClosePostDetail();
                  return null;
                }
                return (
                  <PostDetailView
                    post={selectedPost}
                    previousPost={getPreviousPost(selectedPostId)}
                    nextPost={getNextPost(selectedPostId)}
                    onClose={handleClosePostDetail}
                    onNavigate={(postId) => setSelectedPostId(postId)}
                    onReport={handleReportPostFromDetail}
                  />
                );
              })()
            ) : (
              <>
            {/* Filters */}
            <div className="space-y-3">
              {/* Category Filter - Horizontal Scroll */}
              <div className="relative">
                <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                  <div className="flex items-center gap-2 min-w-max">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-xl text-sm transition-all whitespace-nowrap ${
                          selectedCategory === category.id
                            ? 'bg-blue-50 text-blue-600 toss-shadow'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Scroll indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-transparent via-slate-300 to-transparent animate-pulse" />
                </div>
              </div>

              {/* Sort Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortBy('latest')}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${
                    sortBy === 'latest'
                      ? 'bg-blue-50 text-blue-600 toss-shadow'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  최신순
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${
                    sortBy === 'popular'
                      ? 'bg-blue-50 text-blue-600 toss-shadow'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  인기순
                </button>
              </div>
            </div>

            {/* Posts */}
            {loading ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-slate-600">게시글을 불러오는 중...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600 mb-2">아직 게시물이 없습니다</p>
                <p className="text-sm text-slate-500">
                  {isViewingOtherHospital ? '이 병원에는 아직 게시물이 없습니다' : '첫 번째 게시물을 작성해보세요!'}
                </p>
              </div>
            ) : (
              <div 
                ref={scrollContainerRef}
                className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-hide"
              >
                {displayedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative glass-card rounded-2xl p-6 hover:toss-shadow-lg transition-all cursor-pointer ${
                      post.isPinned ? 'ring-2 ring-amber-200' : ''
                    }`}
                    onClick={() => handleViewPostDetail(post.id)}
                  >
                    {post.isPinned && (
                      <div className="absolute -top-2 left-4 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-xs flex items-center gap-1 toss-shadow">
                        <Pin size={10} />
                        <span>고정됨</span>
                      </div>
                    )}

                    <div className="flex items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-slate-500 text-sm">익명</span>
                          {post.category && (
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-xs">
                              {categories.find(c => c.id === post.category)?.label || '일반'}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={12} />
                            {formatTimestamp(post.createdAt)}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Eye size={12} />
                            {post.viewCount}
                          </span>
                        </div>
                        
                        {post.title && (
                          <h3 className="text-slate-900 font-medium mb-2">{post.title}</h3>
                        )}
                        
                        <p className="text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
                          {post.content}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleLikePost(post.id, e)}
                            className="flex items-center gap-2 text-slate-600 hover:text-red-500 transition-colors"
                          >
                            <Heart size={18} />
                            <span className="text-sm">{post.likeCount}</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent navigation to detail page
                              handleToggleComments(post.id);
                            }}
                            className="flex items-center gap-2 text-slate-600 hover:text-blue-500 transition-colors"
                          >
                            <MessageCircle size={18} />
                            <span className="text-sm">{post.commentCount}</span>
                          </motion.button>
                        </div>

                        {/* Comments Section */}
                        <AnimatePresence>
                          {expandedPostId === post.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: -10 }}
                              animate={{ opacity: 1, height: 'auto', y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -10 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="mt-4 pt-4 border-t border-slate-200 overflow-hidden"
                            >
                            {/* Comments List */}
                            <div className="space-y-3 mb-4">
                              {(comments.get(post.id) || []).map((comment) => (
                                <div key={comment.id} className="flex items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs text-slate-500">익명</span>
                                      <span className="text-xs text-slate-400">
                                        {formatTimestamp(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                                      {comment.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Add Comment Form */}
                            <div className="relative mt-3 pt-3 border-t border-slate-200">
                              <textarea
                                value={newCommentContent.get(post.id) || ''}
                                onChange={(e) => {
                                  const newMap = new Map(newCommentContent);
                                  newMap.set(post.id, e.target.value);
                                  setNewCommentContent(newMap);
                                }}
                                placeholder=""
                                className="w-full px-3 py-2 pr-14 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white focus:outline-none resize-none transition-all text-sm"
                                rows={3}
                              />
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAddComment(post.id)}
                                disabled={!newCommentContent.get(post.id)?.trim()}
                                className="absolute bottom-2 right-2 px-2 py-1.5 rounded-lg gradient-blue text-white toss-shadow hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                <Send size={12} />
                                <span className="text-xs">작성</span>
                              </motion.button>
                            </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
              </>
            )}
          </motion.div>
        ) : activeTab === 'notice' ? (
          <motion.div
            key="notice"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {selectedPostId ? (
              // Post Detail View
              (() => {
                const selectedPost = posts.find(p => p.id === selectedPostId);
                if (!selectedPost) {
                  handleClosePostDetail();
                  return null;
                }
                return (
                  <PostDetailView
                    post={selectedPost}
                    previousPost={getPreviousPost(selectedPostId)}
                    nextPost={getNextPost(selectedPostId)}
                    onClose={handleClosePostDetail}
                    onNavigate={(postId) => setSelectedPostId(postId)}
                    onReport={handleReportPostFromDetail}
                  />
                );
              })()
            ) : (
              // Notice List View
              <>
                {loading ? (
                  <div className="glass-card rounded-2xl p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-600">게시글을 불러오는 중...</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="glass-card rounded-2xl p-12 text-center">
                    <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-600 mb-2">아직 공지사항이 없습니다</p>
                  </div>
                ) : (
                  <div 
                    ref={scrollContainerRef}
                    className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-hide"
                  >
                    {displayedPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`group relative glass-card rounded-2xl p-6 hover:toss-shadow-lg transition-all cursor-pointer ${
                          post.isPinned ? 'ring-2 ring-amber-200' : ''
                        }`}
                        onClick={() => handleViewPostDetail(post.id)}
                      >
                        {post.isPinned && (
                          <div className="absolute -top-2 left-4 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-xs flex items-center gap-1 toss-shadow">
                            <Pin size={10} />
                            <span>고정됨</span>
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0 toss-shadow">
                            <Bell size={20} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-slate-900 font-medium">{post.authorName || '관리자'}</span>
                              {post.isOfficial && (
                                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-xs">
                                  공식
                                </span>
                              )}
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock size={12} />
                                {formatTimestamp(post.createdAt)}
                              </span>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Eye size={12} />
                                {post.viewCount}
                              </span>
                            </div>
                            
                            <h3 className="text-slate-900 font-semibold mb-2">{post.title}</h3>
                            <p className="text-slate-700 line-clamp-2 leading-relaxed">
                              {post.content}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-slate-600">식단표를 불러오는 중...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <Utensils size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600 mb-2">아직 식단표가 없습니다</p>
              </div>
            ) : (
              <div 
                ref={scrollContainerRef}
                className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-hide"
              >
                {displayedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative glass-card rounded-2xl p-6 hover:toss-shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white flex-shrink-0 toss-shadow">
                        <Utensils size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-slate-900 font-medium">{post.title}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={12} />
                            {formatTimestamp(post.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
                          {post.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Post Dialog */}
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
                <h2 className="text-slate-900">익명 게시글 작성</h2>
                <button
                  onClick={() => setShowNewPostDialog(false)}
                  className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-slate-700">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="제목을 입력하세요..."
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-slate-700">카테고리</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(1).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setNewPostCategory(category.id as any)}
                        className={`px-4 py-2 rounded-xl text-sm transition-all ${
                          newPostCategory === category.id
                            ? 'bg-blue-50 text-blue-600 toss-shadow'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-slate-700">내용</label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="익명으로 작성할 내용을 입력하세요..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white focus:outline-none resize-none transition-all"
                    rows={8}
                  />
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-800 font-medium mb-1">커뮤니티 이용 규정</p>
                    <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside">
                      <li>허위 정보, 선동성 내용, 특정인에 대한 비방은 금지됩니다</li>
                      <li>커뮤니티 규정에 준수하여 작성해주세요</li>
                      <li>건전한 소통과 정보 공유를 위해 노력해주세요</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreatePost}
                    disabled={loading || !newPostTitle.trim() || !newPostContent.trim()}
                    className="flex-1 px-6 py-3 rounded-xl gradient-blue text-white toss-shadow hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '작성 중...' : '게시하기'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowNewPostDialog(false)}
                    className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    취소
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button - Write Post */}
      {!isViewingOtherHospital && activeTab === 'blind' && !selectedPostId && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowNewPostDialog(true)}
          className="fixed bottom-20 md:bottom-20 right-6 md:right-8 w-14 h-14 rounded-full gradient-blue text-white toss-shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center z-50"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <Plus size={24} />
        </motion.button>
      )}

      {/* Report Dialog */}
      <AnimatePresence>
        {showReportDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              {...FADE_IN}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowReportDialog(false)}
            />

            <motion.div
              {...SCALE_IN}
              className="relative glass-card rounded-3xl toss-shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-900 font-semibold">신고하기</h2>
                <button
                  onClick={() => setShowReportDialog(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X size={18} className="text-slate-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-slate-700">신고 사유</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['스팸', '욕설/비방', '허위정보', '성적표현', '기타'].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setReportReason(reason)}
                        className={`px-4 py-2 rounded-xl text-sm transition-all ${
                          reportReason === reason
                            ? 'bg-blue-50 text-blue-600 toss-shadow border-2 border-blue-300'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-2 border-transparent'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-slate-700">상세 설명 (선택사항)</label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="신고 사유를 자세히 설명해주세요..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white focus:outline-none resize-none transition-all text-sm"
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitReport}
                    disabled={!reportReason}
                    className="flex-1 px-4 py-2.5 rounded-xl gradient-red text-white toss-shadow hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    신고하기
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowReportDialog(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    취소
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Post Detail View Component
interface PostDetailViewProps {
  post: CommunityPost;
  previousPost: CommunityPost | null;
  nextPost: CommunityPost | null;
  onClose: () => void;
  onNavigate: (postId: string) => void;
  onReport: (postId: string) => void;
}

function PostDetailView({ post, previousPost, nextPost, onClose, onNavigate, onReport }: PostDetailViewProps) {
  const [detailComments, setDetailComments] = useState<CommunityComment[]>([]);
  const [newDetailComment, setNewDetailComment] = useState('');

  // Load comments for this post
  useEffect(() => {
    // Generate dummy comments
    const dummyComments: CommunityComment[] = [
      {
        id: `comment-${post.id}-1`,
        postId: post.id,
        authorId: 'user-1',
        authorName: '익명',
        content: '좋은 정보 감사합니다!',
        isAnonymous: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: `comment-${post.id}-2`,
        postId: post.id,
        authorId: 'user-2',
        authorName: '익명',
        content: '도움이 되었어요.',
        isAnonymous: true,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ];
    setDetailComments(dummyComments);
  }, [post.id]);

  const handleAddDetailComment = () => {
    if (!newDetailComment.trim()) return;
    
    const newComment: CommunityComment = {
      id: `comment-${post.id}-${Date.now()}`,
      postId: post.id,
      authorId: 'current-user',
      authorName: '익명',
      content: newDetailComment.trim(),
      isAnonymous: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setDetailComments([...detailComments, newComment]);
    setNewDetailComment('');
  };

  return (
    <div className="space-y-4 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="glass-card rounded-2xl p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onReport(post.id)}
            className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center"
          >
            <Flag size={18} />
          </motion.button>
        </div>

      {/* Post Content */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {post.isPinned && (
            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-xs flex items-center gap-1">
              <Pin size={10} />
              고정됨
            </span>
          )}
          {post.isOfficial && (
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-xs">
              공식 공지
            </span>
          )}
          <span className="text-sm text-slate-500">{post.authorName || '관리자'}</span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock size={12} />
            {formatTimestamp(post.createdAt)}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Eye size={12} />
            {post.viewCount}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">{post.title}</h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
            {post.content}
          </p>
        </div>
      </div>

        {/* Comments Section */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">댓글 {detailComments.length}</h3>
          
          {/* Comments List */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
            {detailComments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-700">{comment.authorName || '익명'}</span>
                    <span className="text-xs text-slate-400">
                      {formatTimestamp(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation - Vertical */}
        <div className="space-y-2 pt-4 border-t border-slate-200">
          {previousPost && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onNavigate(previousPost.id)}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ChevronUp size={16} />
              <div className="text-left flex-1">
                <div className="text-xs text-slate-500">이전글</div>
                <div className="text-sm font-medium truncate">{previousPost.title || '제목 없음'}</div>
              </div>
            </motion.button>
          )}

          {nextPost && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onNavigate(nextPost.id)}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ChevronDown size={16} />
              <div className="text-left flex-1">
                <div className="text-xs text-slate-500">다음글</div>
                <div className="text-sm font-medium truncate">{nextPost.title || '제목 없음'}</div>
              </div>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Fixed Comment Input (Instagram style) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={newDetailComment}
                onChange={(e) => setNewDetailComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="w-full px-4 py-3 pr-14 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white focus:outline-none resize-none transition-all text-sm min-h-[44px] max-h-[120px]"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddDetailComment();
                  }
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddDetailComment}
                disabled={!newDetailComment.trim()}
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg gradient-blue text-white toss-shadow hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Send size={14} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

