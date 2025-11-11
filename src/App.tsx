import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar } from './components/Calendar';
import { TaskList } from './components/TaskList';
import { AddTaskDialog } from './components/AddTaskDialog';
import { TeamScheduleView } from './components/TeamScheduleView';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { AuthScreen } from './components/AuthScreen';
import { JoinTeamDialog } from './components/JoinTeamDialog';
import { TeamInviteDialog } from './components/TeamInviteDialog';
import { QuickShiftWidget } from './components/QuickShiftWidget';
import { MemberManagement } from './components/MemberManagement';
import { NoticeBar } from './components/NoticeBar';
import { ShiftyLogo } from './components/ShiftyLogo';
import { MyPage } from './components/MyPage';
import { FloatingMenu } from './components/FloatingMenu';
import { CalendarSyncDialog } from './components/CalendarSyncDialog';
import { ExportDialog } from './components/ExportDialog';
import { TeamCreateDialog } from './components/TeamCreateDialog';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ScheduleUploader } from './components/ScheduleUploader';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { STORAGE_KEYS, FADE_IN_UP } from './utils/constants';
import { isDateInRange } from './utils/helpers';
import { downloadICS } from './utils/calendar-export';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  color: string;
  email: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  time?: string;
  category: 'work' | 'personal' | 'health' | 'other';
  shiftType?: 'day' | 'evening' | 'night' | 'off';
  assignedTo: string;
  completed: boolean;
  createdBy: string;
}

export interface Team {
  id: string;
  name: string;
  inviteCode: string;
  members?: TeamMember[];
  memberIds?: string[];
  createdBy?: string;
  createdAt?: string;
}

// Helper: Generate ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper: Generate invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function App() {
  // Auth state (로컬 상태)
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App state
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState<'calendar' | 'list' | 'team' | 'members' | 'mypage'>('team');
  const [teamViewTitle, setTeamViewTitle] = useState('팀 스케줄');
  const [boardPosts, setBoardPosts] = useState<any[]>([]);
  const [showJoinTeamDialog, setShowJoinTeamDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [showScheduleUploader, setShowScheduleUploader] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    // Check for saved user
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // Load team
        const savedTeam = localStorage.getItem('currentTeam');
        if (savedTeam) {
          const teamData = JSON.parse(savedTeam);
          setCurrentTeam(teamData);
          
          // Load current user from team members
          if (teamData.members && userData.id) {
            const userMember = teamData.members.find((m: TeamMember) => m.id === userData.id || m.email === userData.email);
            if (userMember) {
              setCurrentUser(userMember);
            }
          }
        }
        
        // Load tasks
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
          const tasksData = JSON.parse(savedTasks);
          setTasks(tasksData.map((t: any) => ({
            ...t,
            date: new Date(t.date),
            endDate: t.endDate ? new Date(t.endDate) : undefined,
          })));
        }
      } catch (error) {
        console.error('Load from localStorage error:', error);
      }
    }
    setAuthLoading(false);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (currentTeam) {
      localStorage.setItem('currentTeam', JSON.stringify(currentTeam));
    }
  }, [currentTeam]);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Sync board posts from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedPosts = localStorage.getItem(STORAGE_KEYS.BOARD_POSTS);
      if (savedPosts) {
        const parsedPosts = JSON.parse(savedPosts);
        setBoardPosts(parsedPosts.map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp),
        })));
      }
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('boardPostsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('boardPostsUpdated', handleStorageChange);
    };
  }, []);

  // Team members with "all" option
  const teamMembers: TeamMember[] = useMemo(() => 
    currentTeam?.members || [],
    [currentTeam]
  );

  // Filtered tasks for calendar view (current user only)
  const filteredTasks = useMemo(() => 
    tasks.filter(task => task.assignedTo === currentUser?.id),
    [tasks, currentUser?.id]
  );

  // Handlers
  const handleAuthSuccess = async (authUser: any, token: string) => {
    const userData = {
      id: authUser.id || generateId(),
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '사용자',
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUser(null);
    setCurrentTeam(null);
    setTasks([]);
    localStorage.removeItem('user');
    localStorage.removeItem('currentTeam');
    localStorage.removeItem('tasks');
    localStorage.removeItem('currentTeamId');
  };

  const handleUpdateTeamName = (newName: string) => {
    if (!currentTeam) return;
    setCurrentTeam({
      ...currentTeam,
      name: newName,
    });
  };

  const handleUpdateViewTitle = useCallback((newTitle: string) => {
    setTeamViewTitle(newTitle);
    localStorage.setItem(STORAGE_KEYS.TEAM_VIEW_TITLE, newTitle);
  }, []);

  const handleCreateTeam = async (teamName: string) => {
    if (!user) return;

    try {
      const teamId = generateId();
      const inviteCode = generateInviteCode();
      const userId = user.id || generateId();
      
      const newTeam: Team = {
        id: teamId,
        name: teamName,
        inviteCode: inviteCode,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        members: [{
          id: userId,
          name: user.name || '사용자',
          email: user.email || '',
          role: 'owner',
          color: '#3B82F6',
        }],
      };

      setCurrentTeam(newTeam);
      setCurrentUser(newTeam.members![0]);
      localStorage.setItem('currentTeam', JSON.stringify(newTeam));
      localStorage.setItem('currentTeamId', teamId);
      
      toast.success(`${teamName} 팀이 생성되었습니다!`);
      setShowCreateTeamDialog(false);
    } catch (error) {
      console.error('Create team error:', error);
      toast.error('팀 생성에 실패했습니다');
    }
  };

  const handleAddMember = async (member: Omit<TeamMember, 'id'>) => {
    if (!currentTeam) return;

    const newMember: TeamMember = {
      ...member,
      id: generateId(),
    };

    setCurrentTeam({
      ...currentTeam,
      members: [...(currentTeam.members || []), newMember],
    });
    
    toast.success('팀원이 추가되었습니다!');
  };

  const handleUpdateMember = useCallback((memberId: string, updates: Partial<TeamMember>) => {
    if (!currentTeam) return;
    
    const updatedTeam = {
      ...currentTeam,
      members: (currentTeam.members || []).map(m => 
        m.id === memberId ? { ...m, ...updates } : m
      ),
    };
    
    setCurrentTeam(updatedTeam);
    
    if (currentUser?.id === memberId) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  }, [currentTeam, currentUser]);

  const handleUpdateCurrentUser = useCallback((updates: Partial<TeamMember>) => {
    if (!currentUser || !currentTeam) return;
    
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    
    const updatedTeam = {
      ...currentTeam,
      members: (currentTeam.members || []).map(m => 
        m.id === currentUser.id ? updatedUser : m
      ),
    };
    setCurrentTeam(updatedTeam);
  }, [currentUser, currentTeam]);

  const handleDeleteMember = (memberId: string) => {
    if (!currentTeam) return;

    setCurrentTeam({
      ...currentTeam,
      members: (currentTeam.members || []).filter(m => m.id !== memberId),
    });
    
    setTasks(prev => prev.filter(t => t.assignedTo !== memberId));
    toast.success('팀원이 제거되었습니다');
  };

  const addTask = (task: Omit<Task, 'id' | 'createdBy'>) => {
    if (!currentUser || !currentTeam) return;

    const newTask: Task = {
      ...task,
      id: generateId(),
      createdBy: currentUser.id,
    };

    setTasks(prev => [...prev, newTask]);
    toast.success('근무가 추가되었습니다!');
  };

  const toggleTask = (id: string) => {
    if (!currentUser) return;

    const task = tasks.find(t => t.id === id);
    if (!task || task.createdBy !== currentUser.id) return;

    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    if (!currentUser) return;

    const task = tasks.find(t => t.id === id);
    if (!task || task.createdBy !== currentUser.id) return;

    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('일정이 삭제되었습니다');
  };

  const updateTask = (updatedTask: Task) => {
    if (!currentUser) return;
    if (updatedTask.createdBy !== currentUser.id) return;

    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    toast.success('일정이 수정되었습니다');
  };

  const handleQuickAddShift = (
    shiftType: 'day' | 'evening' | 'night' | 'off', 
    date: Date
  ) => {
    if (!currentUser) return;
    
    const shiftLabels = {
      day: '데이 근무',
      evening: '이브닝 근무',
      night: '나이트 근무',
      off: '휴무',
    };
    
    addTask({
      title: shiftLabels[shiftType],
      date: date,
      category: 'work',
      shiftType: shiftType,
      assignedTo: currentUser.id,
      completed: false,
    });
  };

  // Join team with invite code (로컬에서만 처리)
  const handleJoinWithCode = (inviteCode: string) => {
    // 로컬에서는 간단한 처리만
    toast.info('팀 참여 기능은 백엔드 연동이 필요합니다');
  };

  const handleJoinTeamSuccess = (team: Team) => {
    setCurrentTeam(team);
    if (team.members && user) {
      const userMember = team.members.find(m => m.id === user.id || m.email === user.email);
      if (userMember) {
        setCurrentUser(userMember);
      }
    }
    setShowJoinTeamDialog(false);
    toast.success(`${team.name} 팀에 참여했습니다!`);
  };

  const handleScheduleUpload = (newTasks: Omit<Task, 'id' | 'createdBy'>[]) => {
    newTasks.forEach(task => addTask(task));
    toast.success(`${newTasks.length}개의 일정이 추가되었습니다!`);
    setShowScheduleUploader(false);
  };

  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="mb-6"
          >
            <ShiftyLogo size={96} animated={true} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-slate-600"
          >
            <Loader2 className="animate-spin" size={20} />
            <span>Shifty 로딩 중...</span>
          </motion.div>
        </div>
      </div>
    );
  }

  // Auth screen
  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Welcome screen for users without a team
  if (!currentTeam || !currentUser) {
    const userName = user?.name || user?.email?.split('@')[0] || '사용자';
    
    return (
      <>
        <WelcomeScreen
          userName={userName}
          onCreateTeam={() => setShowCreateTeamDialog(true)}
          onJoinTeam={() => setShowJoinTeamDialog(true)}
        />
        
        <TeamCreateDialog
          isOpen={showCreateTeamDialog}
          onClose={() => setShowCreateTeamDialog(false)}
          onCreateTeam={handleCreateTeam}
        />

        <JoinTeamDialog
          isOpen={showJoinTeamDialog}
          onClose={() => setShowJoinTeamDialog(false)}
          accessToken=""
          onJoinSuccess={handleJoinTeamSuccess}
        />

        <Toaster position="top-center" richColors />
      </>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-background gradient-mesh pb-20 md:pb-8">
      <Header 
        view={view} 
        setView={setView}
        teamMembers={teamMembers}
        currentUser={currentUser}
        currentTeam={currentTeam}
        onLogout={handleLogout}
        onUpdateTeamName={handleUpdateTeamName}
        tasks={tasks}
      />
      
      {/* Notice Bar */}
      <div className="py-4">
        <NoticeBar notices={boardPosts} />
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {view === 'mypage' ? (
            <motion.div
              key="mypage"
              {...FADE_IN_UP}
            >
              <MyPage
                currentUser={currentUser}
                currentTeam={currentTeam}
                accessToken=""
                onUpdateUser={handleUpdateCurrentUser}
                onLogout={handleLogout}
              />
            </motion.div>
          ) : view === 'members' ? (
            <motion.div
              key="members"
              {...FADE_IN_UP}
            >
              <MemberManagement 
                teamMembers={currentTeam.members || []}
                currentUser={currentUser}
                currentTeam={currentTeam}
                accessToken=""
                onAddMember={handleAddMember}
                onUpdateMember={handleUpdateMember}
                onDeleteMember={handleDeleteMember}
                onInviteTeam={() => setShowInviteDialog(true)}
              />
            </motion.div>
          ) : view === 'team' ? (
            <motion.div
              key="team"
              {...FADE_IN_UP}
            >
              <TeamScheduleView 
                tasks={tasks}
                teamMembers={currentTeam.members || []}
                selectedDate={selectedDate}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                currentUserId={currentUser.id}
                viewTitle={teamViewTitle}
                onUpdateViewTitle={handleUpdateViewTitle}
                onAddTask={addTask}
                onUpdateTask={updateTask}
                currentUser={currentUser}
                onAddMember={handleAddMember}
              />
            </motion.div>
          ) : view === 'calendar' ? (
            <motion.div
              key="calendar"
              {...FADE_IN_UP}
              className="grid gap-8"
            >
              <div className="grid lg:grid-cols-[1fr,400px] gap-8">
                <Calendar 
                  selectedDate={selectedDate} 
                  setSelectedDate={setSelectedDate}
                  tasks={filteredTasks}
                  teamMembers={teamMembers}
                />
                <div className="space-y-6 pb-20 md:pb-0">
                  <TaskList 
                    tasks={filteredTasks.filter(task => 
                      isDateInRange(selectedDate, task.date, task.endDate)
                    )}
                    selectedDate={selectedDate}
                    onToggleTask={toggleTask}
                    onDeleteTask={deleteTask}
                    teamMembers={teamMembers}
                    currentUserId={currentUser.id}
                  />
                  <QuickShiftWidget 
                    currentUser={currentUser}
                    onAddShift={handleQuickAddShift}
                    onSync={() => setShowSyncDialog(true)}
                    onExport={() => setShowExportDialog(true)}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              {...FADE_IN_UP}
              className="grid lg:grid-cols-[1fr,350px] gap-8"
            >
              <TaskList 
                tasks={filteredTasks}
                selectedDate={selectedDate}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                teamMembers={teamMembers}
                currentUserId={currentUser.id}
                showAllTasks
              />
              <QuickShiftWidget 
                currentUser={currentUser}
                onAddShift={handleQuickAddShift}
                onSync={() => setShowSyncDialog(true)}
                onExport={() => setShowExportDialog(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Menu */}
      <FloatingMenu
        onAddTask={() => setIsDialogOpen(true)}
        onInviteTeam={() => setShowInviteDialog(true)}
        onJoinTeam={() => setShowJoinTeamDialog(true)}
        onSync={() => setShowSyncDialog(true)}
        onExport={() => setShowExportDialog(true)}
        onCreateTeam={() => setShowCreateTeamDialog(true)}
        onUploadSchedule={() => setShowScheduleUploader(true)}
        onMyPage={() => setView('mypage')}
        showAddTask={view !== 'members' && view !== 'mypage'}
      />

      {/* Dialogs */}
      <AddTaskDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddTask={addTask}
        selectedDate={selectedDate}
        teamMembers={currentTeam.members || []}
        currentUser={currentUser}
      />

      <JoinTeamDialog
        isOpen={showJoinTeamDialog}
        onClose={() => setShowJoinTeamDialog(false)}
        accessToken=""
        onJoinSuccess={handleJoinTeamSuccess}
      />

      <TeamCreateDialog
        isOpen={showCreateTeamDialog}
        onClose={() => setShowCreateTeamDialog(false)}
        onCreateTeam={handleCreateTeam}
      />

      <TeamInviteDialog
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        inviteCode={currentTeam?.inviteCode || ''}
        teamName={currentTeam?.name || ''}
      />

      <CalendarSyncDialog
        isOpen={showSyncDialog}
        onClose={() => setShowSyncDialog(false)}
        onEnableSync={() => {
          toast.info('동기화 기능은 추후 업데이트될 예정입니다.');
          setShowSyncDialog(false);
        }}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        tasks={tasks}
        teamMembers={teamMembers}
      />

      <ScheduleUploader
        isOpen={showScheduleUploader}
        onClose={() => setShowScheduleUploader(false)}
        onScheduleParsed={handleScheduleUpload}
        teamMembers={currentTeam.members || []}
        currentUserId={currentUser.id}
      />

      {/* Toast Notifications */}
      <Toaster position="top-center" richColors />
    </div>
    
    {/* Bottom Navigation - Mobile only */}
    <BottomNavigation view={view} setView={setView} />
    </>
  );
}
