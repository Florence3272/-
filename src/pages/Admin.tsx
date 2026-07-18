import { Link } from "react-router";
import { Layout } from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import {
  Users,
  Database,
  BookOpen,
  GraduationCap,
  Languages,
  Shield,
  ArrowLeft,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function Admin() {
  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery();
  const { data: users, isLoading: usersLoading } = trpc.admin.userList.useQuery({});
  const { data: activities } = trpc.admin.recentActivities.useQuery();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-500 hover:text-[#1a6b4f] mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回首页
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#1a6b4f]" />
              后台管理
            </h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            {
              label: "用户总数",
              value: stats?.userCount || 0,
              icon: Users,
              color: "text-blue-500 bg-blue-50",
            },
            {
              label: "分库数量",
              value: stats?.dbCount || 0,
              icon: Database,
              color: "text-emerald-500 bg-emerald-50",
            },
            {
              label: "术语数量",
              value: stats?.termCount || 0,
              icon: BookOpen,
              color: "text-amber-500 bg-amber-50",
            },
            {
              label: "学习记录",
              value: stats?.recordCount || 0,
              icon: GraduationCap,
              color: "text-purple-500 bg-purple-50",
            },
            {
              label: "翻译次数",
              value: stats?.translationCount || 0,
              icon: Languages,
              color: "text-pink-500 bg-pink-50",
            },
          ].map((s) => (
            <Card key={s.label} className="border-gray-200">
              <CardContent className="p-4">
                <div
                  className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "-" : s.value}
                </p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Table */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1a6b4f]" />
                用户管理
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {usersLoading ? (
                <Skeleton className="h-48 rounded-lg" />
              ) : !users?.length ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  暂无用户
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">
                          ID
                        </th>
                        <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">
                          名称
                        </th>
                        <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">
                          角色
                        </th>
                        <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">
                          注册时间
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-gray-50 last:border-0"
                        >
                          <td className="py-2 px-2 text-sm text-gray-600">
                            {u.id}
                          </td>
                          <td className="py-2 px-2 text-sm text-gray-900 font-medium">
                            {u.name || "未命名"}
                          </td>
                          <td className="py-2 px-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                u.role === "admin"
                                  ? "border-red-200 text-red-600 bg-red-50"
                                  : "border-gray-200 text-gray-600"
                              }`}
                            >
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-400">
                            {new Date(u.createdAt).toLocaleDateString("zh-CN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1a6b4f]" />
                最近动态
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {!activities?.recentTerms?.length ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  暂无动态
                </p>
              ) : (
                <div className="space-y-3">
                  {activities.recentTerms.slice(0, 6).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#1a6b4f]" />
                        <span className="text-sm text-gray-700 line-clamp-1">
                          {t.cnTerm}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(t.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Term Growth Chart placeholder */}
        <Card className="border-gray-200 mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1a6b4f]" />
              系统概览
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">平均每日术语增长</p>
                <p className="text-xl font-bold text-gray-900">--</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">活跃用户占比</p>
                <p className="text-xl font-bold text-gray-900">--</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">翻译准确率</p>
                <p className="text-xl font-bold text-gray-900">--</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
