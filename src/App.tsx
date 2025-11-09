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
import { HospitalCommunity } from './components/HospitalCommunity';
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
import { supabase } from './utils/supabase/client';
import * as api from './utils/api';
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

export default function App() {
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(true);

  // App state
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState<'calendar' | 'list' | 'team' | 'members' | 'mypage' | 'community'>('team');
  const [teamViewTitle, setTeamViewTitle] = useState('팀 스케줄');
  const [boardPosts, setBoardPosts] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [showJoinTeamDialog, setShowJoinTeamDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [showScheduleUploader, setShowScheduleUploader] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
    checkInviteCodeInUrl();
  }, []);

  // Check for invite code in URL
  const checkInviteCodeInUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    
    if (inviteCode) {
      // Show join dialog after login
      if (user && accessToken) {
        handleJoinWithCode(inviteCode);
      } else {
        // Store invite code to join after login
        localStorage.setItem('pendingInviteCode', inviteCode);
      }
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        setUser(session.user);
        setAccessToken(session.access_token);
        await loadUserData(session.user, session.access_token);
        
        // Check for pending invite code after login
        const pendingInviteCode = localStorage.getItem('pendingInviteCode');
        if (pendingInviteCode) {
          localStorage.removeItem('pendingInviteCode');
          handleJoinWithCode(pendingInviteCode);
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  // Load user data after authentication
  const loadUserData = async (authUser: any, token: string) => {
    setDataLoading(true);
    try {
      // Check if user has team in localStorage first
      const savedTeamId = localStorage.getItem('currentTeamId');
      
      if (savedTeamId) {
        // Load team from Supabase
        const { data: teamData, error: teamError } = await api.getTeam(savedTeamId, token);
        
        if (teamData?.team) {
          await loadTeamData(teamData.team, token, authUser);
        }
        // If no team found, don't auto-create - show welcome screen
      }
      // If no saved team, don't auto-create - show welcome screen
    } catch (error) {
      console.error('Load user data error:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleCreateTeam = async (teamName: string) => {
    if (!user || !accessToken) return;

    try {
      console.log('🏗️ Creating team:', teamName);
      
      // Create team (backend automatically adds creator as owner)
      const { data: teamData, error: teamError } = await api.createTeam(teamName, accessToken);
      
      if (teamError || !teamData?.team) {
        console.error('❌ Create team error:', teamError);
        
        // Show user-friendly error message
        if (teamError?.includes('사용자 프로필을 찾을 수 없습니다')) {
          toast.error('로그인 세션이 만료되었습니다. 다시 로그인해주세요.', {
            duration: 5000,
          });
          // Force logout
          await supabase.auth.signOut();
          setAccessToken('');
          setUser(null);
        } else {
          toast.error(`팀 생성 실패: ${teamError || '알 수 없는 오류'}`, {
            duration: 5000,
          });
        }
        throw new Error(teamError || '팀 생성 실패');
      }

      console.log('✅ Team created:', teamData.team.id);
      console.log('📋 Team data:', teamData.team);
      console.log('🔑 Invite code:', teamData.team.inviteCode || teamData.team.invite_code);
      
      // Ensure inviteCode is set
      const teamWithInviteCode = {
        ...teamData.team,
        inviteCode: teamData.team.inviteCode || teamData.team.invite_code || '',
      };
      
      // Save team ID to localStorage
      localStorage.setItem('currentTeamId', teamWithInviteCode.id);
      
      // Load team data (which will set currentUser from members)
      await loadTeamData(teamWithInviteCode, accessToken, user);
      
      toast.success(`${teamName} 팀이 생성되었습니다!`);
      setShowCreateTeamDialog(false);
    } catch (error) {
      console.error('❌ Create team error:', error);
      throw error;
    }
  };

  const loadTeamData = async (team: Team, token: string, authUser?: any) => {
    try {
      console.log('🔄 Loading team data for team:', team.id);
      
      // Use authUser if provided, otherwise use state user
      const currentAuthUser = authUser || user;
      
      // Load members
      const { data: membersData, error: membersError } = await api.getMembers(team.id, token);
      
      console.log('👥 Members response:', membersData, 'Error:', membersError);
      
      if (membersData?.members) {
        // Validate members have required fields
        const validMembers = membersData.members.filter((m: any) => {
          if (!m.name || !m.id) {
            console.warn('⚠️ Invalid member data:', m);
            return false;
          }
          return true;
        }).map((m: any) => ({
          id: m.id,
          name: m.name || 'Unknown',
          email: m.email || '',
          role: m.role || 'member',
          color: m.color || '#3B82F6',
          avatar: m.avatar,
        }));

        console.log('✅ Valid members:', validMembers.length);
        console.log('🔍 Looking for user:', { id: currentAuthUser?.id, email: currentAuthUser?.email });
        console.log('📋 Available members:', validMembers.map(m => ({ id: m.id, email: m.email, name: m.name })));
        
        // Find current user member by ID or email
        const userMember = validMembers.find((m: TeamMember) => 
          m.id === currentAuthUser?.id || m.email === currentAuthUser?.email
        );
        
        if (userMember) {
          console.log('✅ Current user member found:', userMember.name);
          setCurrentUser(userMember);
        } else {
          console.warn('⚠️ Current user not found in members');
          console.warn('⚠️ User details:', currentAuthUser);
          console.warn('⚠️ Members:', validMembers);
        }

        // Update team with members
        // Ensure inviteCode is set (convert from invite_code if needed)
        setCurrentTeam({
          ...team,
          inviteCode: team.inviteCode || team.invite_code || '',
          members: validMembers,
        });
      } else {
        console.warn('⚠️ No members data received');
      }

      // Load tasks
      const { data: tasksData, error: tasksError } = await api.getTasks(team.id, token);
      
      if (tasksData?.tasks) {
        setTasks(tasksData.tasks.map((task: any) => ({
          ...task,
          date: new Date(task.date),
          endDate: task.endDate ? new Date(task.endDate) : undefined,
        })));
      }
    } catch (error) {
      console.error('Load team data error:', error);
    }
  };

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

    // Initial load
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
    setUser(authUser);
    setAccessToken(token);
    await loadUserData(authUser, token);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken('');
      setCurrentUser(null);
      setCurrentTeam(null);
      setTasks([]);
      localStorage.removeItem('currentTeamId');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpdateTeamName = async (newName: string) => {
    if (!currentTeam || !accessToken) return;

    try {
      const { data, error } = await api.updateTeam(currentTeam.id, newName, accessToken);
      
      if (data?.team) {
        setCurrentTeam({
          ...currentTeam,
          name: newName,
        });
      } else {
        console.error('Update team name error:', error);
      }
    } catch (error) {
      console.error('Update team name error:', error);
    }
  };

  const handleUpdateViewTitle = useCallback((newTitle: string) => {
    setTeamViewTitle(newTitle);
    localStorage.setItem(STORAGE_KEYS.TEAM_VIEW_TITLE, newTitle);
  }, []);

  const handleAddMember = async (member: Omit<TeamMember, 'id'>) => {
    if (!currentTeam || !accessToken) return;

    try {
      console.log('🔄 Adding member:', member);
      const { data, error } = await api.addMember(currentTeam.id, member, accessToken);
      
      if (data?.member) {
        console.log('✅ Member added successfully:', data.member);
        setCurrentTeam({
          ...currentTeam,
          members: [...(currentTeam.members || []), data.member],
        });
      } else {
        console.error('❌ Add member error:', error);
        alert(`팀원 추가 실패: ${error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('💥 Add member exception:', error);
      alert(`팀원 추가 중 오류: ${error}`);
    }
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
    
    // Update in team members as well
    const updatedTeam = {
      ...currentTeam,
      members: (currentTeam.members || []).map(m => 
        m.id === currentUser.id ? updatedUser : m
      ),
    };
    setCurrentTeam(updatedTeam);
  }, [currentUser, currentTeam]);

  const handleDeleteMember = async (memberId: string) => {
    if (!currentTeam || !accessToken) return;

    try {
      const { data, error } = await api.deleteMember(currentTeam.id, memberId, accessToken);
      
      if (data?.success) {
        setCurrentTeam({
          ...currentTeam,
          members: (currentTeam.members || []).filter(m => m.id !== memberId),
        });
        
        setTasks(prev => prev.filter(t => t.assignedTo !== memberId));
      } else {
        console.error('Delete member error:', error);
      }
    } catch (error) {
      console.error('Delete member error:', error);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdBy'>) => {
    if (!currentUser || !currentTeam || !accessToken) return;

    try {
      // Map task data to server format (remove fields that don't exist in DB)
      const taskData: any = {
        title: task.title,
        description: task.description || null,
        shiftType: task.shiftType || null,
        date: task.date.toISOString(),
        time: task.time || null,
        endTime: task.endTime || null,
        endDate: task.endDate?.toISOString() || null,
        completed: task.completed || false,
        assignedTo: task.assignedTo || currentUser.id,
        // Remove category and other fields that don't exist in DB
      };

      const { data, error } = await api.createTask(
        currentTeam.id,
        taskData,
        accessToken
      );
      
      console.log('📋 Create task response:', { data, error });
      
      if (data?.task) {
        console.log('✅ Task created:', data.task);
        toast.success('근무가 추가되었습니다!');
        
        // Reload tasks from server to ensure consistency
        const { data: tasksData, error: tasksError } = await api.getTasks(currentTeam.id, accessToken);
        
      if (tasksData?.tasks) {
        console.log('📋 Reloaded tasks:', tasksData.tasks.length);
        console.log('📋 Reloaded tasks data:', tasksData.tasks.map((t: any) => ({
          id: t.id,
          assignedTo: t.assignedTo,
          date: t.date,
          shiftType: t.shiftType
        })));
        setTasks(tasksData.tasks.map((task: any) => ({
          ...task,
          date: new Date(task.date),
          endDate: task.endDate ? new Date(task.endDate) : undefined,
        })));
        } else {
          // Fallback: add task directly to state if reload fails
          console.log('⚠️ Failed to reload tasks, adding directly to state');
          const newTask: Task = {
            ...data.task,
            date: data.task.date ? new Date(data.task.date) : new Date(),
            endDate: data.task.endDate ? new Date(data.task.endDate) : undefined,
            createdBy: data.task.createdBy || currentUser.id,
          };
          setTasks(prev => [...prev, newTask]);
        }
      } else {
        console.error('❌ Add task error:', error);
        console.error('❌ Response data:', data);
        toast.error(`근무 추가 실패: ${error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Add task error:', error);
    }
  };

  const toggleTask = async (id: string) => {
    if (!currentUser || !currentTeam || !accessToken) return;

    const task = tasks.find(t => t.id === id);
    if (!task || task.createdBy !== currentUser.id) return;

    try {
      const { data, error } = await api.updateTask(
        currentTeam.id,
        id,
        { completed: !task.completed },
        accessToken
      );
      
      if (data?.task) {
        setTasks(prev => prev.map(t => 
          t.id === id ? { ...t, completed: !t.completed } : t
        ));
      } else {
        console.error('Toggle task error:', error);
      }
    } catch (error) {
      console.error('Toggle task error:', error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!currentUser || !currentTeam || !accessToken) return;

    const task = tasks.find(t => t.id === id);
    if (!task || task.createdBy !== currentUser.id) return;

    try {
      const { data, error } = await api.deleteTask(currentTeam.id, id, accessToken);
      
      if (data?.success) {
        setTasks(prev => prev.filter(t => t.id !== id));
      } else {
        console.error('Delete task error:', error);
      }
    } catch (error) {
      console.error('Delete task error:', error);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    if (!currentUser || !currentTeam || !accessToken) return;
    if (updatedTask.createdBy !== currentUser.id) return;

    try {
      const { data, error } = await api.updateTask(
        currentTeam.id,
        updatedTask.id,
        {
          ...updatedTask,
          date: updatedTask.date.toISOString(),
          endDate: updatedTask.endDate?.toISOString(),
        },
        accessToken
      );
      
      if (data?.task) {
        setTasks(prev => prev.map(task => 
          task.id === updatedTask.id ? {
            ...data.task,
            date: new Date(data.task.date),
            endDate: data.task.endDate ? new Date(data.task.endDate) : undefined,
          } : task
        ));
      } else {
        console.error('Update task error:', error);
      }
    } catch (error) {
      console.error('Update task error:', error);
    }
  };

  const handleQuickAddShift = async (
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
    
    await addTask({
      title: shiftLabels[shiftType],
      date: date,
      category: 'work',
      shiftType: shiftType,
      assignedTo: currentUser.id,
      completed: false,
    });
  };

  // Join team with invite code
  const handleJoinWithCode = async (inviteCode: string) => {
    if (!accessToken) return;

    try {
      const { data, error } = await api.joinTeam(inviteCode.toUpperCase(), accessToken);

      if (error || !data?.team) {
        toast.error(error || '팀 참여에 실패했습니다');
        return;
      }

      // Reload team data (pass user from state)
      await loadTeamData(data.team, accessToken, user);
      toast.success(`${data.team.name} 팀에 참여했습니다!`);
    } catch (error) {
      console.error('Join team error:', error);
      toast.error('팀 참여 중 오류가 발생했습니다');
    }
  };

  const handleJoinTeamSuccess = async (team: Team) => {
    await loadTeamData(team, accessToken, user);
    setShowJoinTeamDialog(false);
    toast.success(`${team.name} 팀에 참여했습니다!`);
  };

  const handleScheduleUpload = async (tasks: Omit<Task, 'id' | 'createdBy'>[]) => {
    // Add all tasks
    for (const task of tasks) {
      await addTask(task);
    }
    toast.success(`${tasks.length}개의 일정이 추가되었습니다!`);
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
  if (!user || !accessToken) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Data loading screen
  if (dataLoading) {
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
            <span>데이터 동기화 중...</span>
          </motion.div>
        </div>
      </div>
    );
  }

  // Welcome screen for users without a team
  if (!currentTeam || !currentUser) {
    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || '사용자';
    
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
          accessToken={accessToken}
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
                accessToken={accessToken}
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
                accessToken={accessToken}
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
          ) : view === 'community' ? (
            <motion.div
              key="community"
              {...FADE_IN_UP}
            >
              <HospitalCommunity
                currentUser={currentUser}
                currentHospitalId={(currentUser as any)?.hospitalId}
                currentHospitalName={(currentUser as any)?.hospital}
                accessToken={accessToken}
              />
            </motion.div>
          ) : view === 'admin' ? (
            <motion.div
              key="admin"
              {...FADE_IN_UP}
            >
              <AdminDashboard
                currentUser={currentUser}
                currentHospitalId={(currentUser as any)?.hospitalId}
                accessToken={accessToken}
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
        accessToken={accessToken}
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
        inviteCode={currentTeam?.inviteCode || currentTeam?.invite_code || ''}
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
