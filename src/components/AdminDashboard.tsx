import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Activity,
  BarChart3,
  PieChart,
  Clock,
  UserCheck,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { getAdminStats } from '../utils/api';

interface AdminDashboardProps {
  accessToken: string;
  onBack: () => void; // 로그아웃 함수
}

interface AdminStats {
  totalUsers: number;
  totalTeams: number;
  totalTasks: number;
  activeUsersToday: number;
  userGrowth: {
    week: number;
    month: number;
  };
  tasksByType: {
    day: number;
    evening: number;
    night: number;
    off: number;
  };
  recentUsers: Array<{
    email: string;
    name: string;
    createdAt: string;
  }>;
  teamSizes: {
    small: number; // 1-5 members
    medium: number; // 6-15 members
    large: number; // 16+ members
  };
}

export function AdminDashboard({ accessToken, onBack }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await getAdminStats(accessToken);
      
      if (data?.stats) {
        setStats(data.stats);
      } else {
        console.error('Failed to load admin stats:', error);
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-slate-600">통계 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Activity className="mx-auto mb-4 text-red-600" size={48} />
            <p className="text-slate-700 mb-4">통계를 불러올 수 없습니다</p>
            <button
              onClick={loadStats}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalShifts = stats.tasksByType.day + stats.tasksByType.evening + 
                      stats.tasksByType.night + stats.tasksByType.off;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-slate-900">관리자 대시보드</h1>
                <p className="text-sm text-slate-600">Shifty 운영 현황 및 통계</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadStats}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={16} />
                새로고침
              </button>
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <ArrowLeft size={16} />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">전체 사용자</CardTitle>
                <Users className="text-blue-600" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-slate-900 mb-1">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-green-600">
                  +{stats.userGrowth.week} 이번 주
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">전체 팀</CardTitle>
                <UserCheck className="text-purple-600" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-slate-900 mb-1">{stats.totalTeams.toLocaleString()}</div>
                <p className="text-xs text-slate-600">
                  활성 팀 수
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">등록된 일정</CardTitle>
                <Calendar className="text-orange-600" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-slate-900 mb-1">{stats.totalTasks.toLocaleString()}</div>
                <p className="text-xs text-slate-600">
                  전체 교대근무 및 일정
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">오늘 활성 사용자</CardTitle>
                <Activity className="text-green-600" size={20} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-slate-900 mb-1">{stats.activeUsersToday.toLocaleString()}</div>
                <p className="text-xs text-slate-600">
                  오늘 접속한 사용자
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Shift Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart size={20} className="text-blue-600" />
                  교대근무 유형별 분포
                </CardTitle>
                <CardDescription>
                  전체 {totalShifts.toLocaleString()}개의 교대근무
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-700 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        데이 근무
                      </span>
                      <span className="text-sm text-slate-900">
                        {stats.tasksByType.day.toLocaleString()} ({totalShifts > 0 ? Math.round((stats.tasksByType.day / totalShifts) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400"
                        style={{ width: `${totalShifts > 0 ? (stats.tasksByType.day / totalShifts) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-700 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-400" />
                        이브닝 근무
                      </span>
                      <span className="text-sm text-slate-900">
                        {stats.tasksByType.evening.toLocaleString()} ({totalShifts > 0 ? Math.round((stats.tasksByType.evening / totalShifts) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-400"
                        style={{ width: `${totalShifts > 0 ? (stats.tasksByType.evening / totalShifts) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-700 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-400" />
                        나이트 근무
                      </span>
                      <span className="text-sm text-slate-900">
                        {stats.tasksByType.night.toLocaleString()} ({totalShifts > 0 ? Math.round((stats.tasksByType.night / totalShifts) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-400"
                        style={{ width: `${totalShifts > 0 ? (stats.tasksByType.night / totalShifts) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-700 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-400" />
                        휴무
                      </span>
                      <span className="text-sm text-slate-900">
                        {stats.tasksByType.off.toLocaleString()} ({totalShifts > 0 ? Math.round((stats.tasksByType.off / totalShifts) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-400"
                        style={{ width: `${totalShifts > 0 ? (stats.tasksByType.off / totalShifts) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Size Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 size={20} className="text-purple-600" />
                  팀 규모별 분포
                </CardTitle>
                <CardDescription>
                  팀 크기에 따른 분류
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-700">
                        소규모 팀 (1-5명)
                      </span>
                      <span className="text-sm text-slate-900">
                        {stats.teamSizes.small.toLocaleString()}팀
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-400"
                        style={{ 
                          width: `${stats.totalTeams > 0 ? (stats.teamSizes.small / stats.totalTeams) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-700">
                        중규모 팀 (6-15명)
                      </span>
                      <span className="text-sm text-slate-900">
                        {stats.teamSizes.medium.toLocaleString()}팀
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-400"
                        style={{ 
                          width: `${stats.totalTeams > 0 ? (stats.teamSizes.medium / stats.totalTeams) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-700">
                        대규모 팀 (16명+)
                      </span>
                      <span className="text-sm text-slate-900">
                        {stats.teamSizes.large.toLocaleString()}팀
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-400"
                        style={{ 
                          width: `${stats.totalTeams > 0 ? (stats.teamSizes.large / stats.totalTeams) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-blue-600" />
                    <span className="text-sm text-blue-900">성장 추세</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    이번 주: +{stats.userGrowth.week}명 / 이번 달: +{stats.userGrowth.month}명
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} className="text-green-600" />
                최근 가입 사용자
              </CardTitle>
              <CardDescription>
                최근 10명의 신규 사용자
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm text-slate-700">이름</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-700">이메일</th>
                      <th className="text-left py-3 px-4 text-sm text-slate-700">가입일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((user, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm text-slate-900">{user.name}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
