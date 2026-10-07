import { Link } from "react-router";
import { Layout } from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  BookOpen,
  Clock,
  Trophy,
  Heart,
  Database,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Mock profile data for static deployment fallback
const mockStats = {
  totalSessions: 12,
  totalDuration: 3600,
  avgScore: 85,
};
const mockRecords = [
  { id: 1, mode: "flashcard", targetType: "term", targetId: 1, createdAt: "2024-06-08T10:00:00Z" },
  { id: 2, mode: "quiz", targetType: "term", targetId: 2, createdAt: "2024-06-08T09:30:00Z" },
  { id: 3, mode: "flashcard", targetType: "term", targetId: 3, createdAt: "2024-06-07T14:00:00Z" },
  { id: 4, mode: "quiz", targetType: "term", targetId: 4, createdAt: "2024-06-07T11:00:00Z" },
  { id: 5, mode: "flashcard", targetType: "term", targetId: 5, createdAt: "2024-06-06T16:00:00Z" },
];
const mockFavorites = [
  { id: 1, targetType: "term", targetId: 1, createdAt: "2024-06-08T08:00:00Z" },
  { id: 2, targetType: "term", targetId: 3, createdAt: "2024-06-07T10:00:00Z" },
  { id: 3, targetType: "term", targetId: 7, createdAt: "2024-06-06T09:00:00Z" },
];

export default function Profile() {
  const { user } = useAuth();
  const { data: apiStats, isLoading: statsLoading, isError: statsError } = trpc.learn.stats.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: apiRecords, isLoading: recordsLoading, isError: recordsError } = trpc.learn.myRecords.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: apiFavorites, isLoading: favLoading, isError: favError } = trpc.favorite.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Fallback to mock data when API fails
  const stats = statsError || !apiStats ? mockStats : apiStats;
  const records = recordsError || !apiRecords ? mockRecords : apiRecords;
  const favorites = favError || !apiFavorites ? mockFavorites : apiFavorites;

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            请先登录
          </h2>
          <p className="text-gray-500 mb-6">
            登录后可以查看学习记录和收藏内容
          </p>
          <Link to="/login">
            <Button className="bg-[#1a6b4f] hover:bg-[#145a42]">登录</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-[#1a6b4f]/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-[#1a6b4f]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.name || user.username || "用户"}
            </h1>
            <p className="text-sm text-gray-500">{user.email || `@${user.username}`}</p>
            <Badge
              variant="secondary"
              className="mt-1 bg-[#1a6b4f]/10 text-[#1a6b4f]"
            >
              {user.role === "admin" ? "管理员" : "普通用户"}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="border-gray-200">
            <CardContent className="p-4 text-center">
              <GraduationCap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? "-" : stats?.totalSessions || 0}
              </p>
              <p className="text-xs text-gray-500">学习次数</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? "-" : Math.round((stats?.totalDuration || 0) / 60)}
              </p>
              <p className="text-xs text-gray-500">学习时长(分)</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? "-" : stats?.avgScore || 0}
              </p>
              <p className="text-xs text-gray-500">平均分</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="p-4 text-center">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {favLoading ? "-" : favorites?.length || 0}
              </p>
              <p className="text-xs text-gray-500">收藏</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Learning */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#1a6b4f]" />
                最近学习
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {recordsLoading ? (
                <Skeleton className="h-32 rounded-lg" />
              ) : !records?.length ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  暂无学习记录
                </p>
              ) : (
                <div className="space-y-3">
                  {records.slice(0, 8).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {r.mode === "flashcard" ? "闪卡" : r.mode === "quiz" ? "测试" : r.mode}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {r.targetType} #{r.targetId}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favorites */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                我的收藏
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {favLoading ? (
                <Skeleton className="h-32 rounded-lg" />
              ) : !favorites?.length ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  暂无收藏
                </p>
              ) : (
                <div className="space-y-3">
                  {favorites.slice(0, 8).map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {f.targetType}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          #{f.targetId}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(f.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">
          快速入口
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/terminology">
            <Card className="border-gray-200 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1a6b4f]/10 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-[#1a6b4f]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">术语库</p>
                  <p className="text-xs text-gray-500">浏览和管理术语</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/resources">
            <Card className="border-gray-200 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">教学资源</p>
                  <p className="text-xs text-gray-500">开始学习</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/translate">
            <Card className="border-gray-200 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">翻译</p>
                  <p className="text-xs text-gray-500">中俄互译</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
