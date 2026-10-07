import { Link } from "react-router";
import { Layout } from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  BookOpen,
  ChevronRight,
  GraduationCap,
  MessageSquare,
  FileText,
  Briefcase,
  Video,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { mockDatabases } from "@/lib/mockData";

const moduleConfig = [
  { value: "dialogue", label: "情境对话", icon: MessageSquare, color: "bg-blue-50 text-blue-700" },
  { value: "reading", label: "专业阅读", icon: FileText, color: "bg-emerald-50 text-emerald-700" },
  { value: "case", label: "案例分析", icon: Briefcase, color: "bg-amber-50 text-amber-700" },
  { value: "video", label: "微课视频", icon: Video, color: "bg-purple-50 text-purple-700" },
  { value: "quiz", label: "习题测试", icon: HelpCircle, color: "bg-red-50 text-red-700" },
  { value: "culture", label: "文化贴士", icon: Sparkles, color: "bg-pink-50 text-pink-700" },
];

export default function Resources() {
  const { data: apiDatabases, isLoading, isError } = trpc.database.list.useQuery({});

  // Fallback to mock data
  const databases = isError || !apiDatabases ? mockDatabases : apiDatabases;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">教学资源库</h1>
          <p className="text-sm text-gray-500 mt-1">
            情境对话、专业阅读、案例分析、微课视频、习题测试、文化贴士
          </p>
        </div>

        {/* Module Types */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {moduleConfig.map((m) => (
            <Link key={m.value} to={`/resources?module=${m.value}`}>
              <Card className="h-full hover:shadow-md transition-all cursor-pointer border-gray-200">
                <CardContent className="p-4 text-center">
                  <div
                    className={`w-10 h-10 rounded-lg ${m.color} flex items-center justify-center mx-auto mb-2`}
                  >
                    <m.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {m.label}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Database Resources */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          按分库浏览
        </h2>

        {isLoading && !isError ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {databases?.map((db) => (
              <Link key={db.id} to={`/resources/${db.id}`}>
                <Card className="h-full hover:shadow-md transition-all cursor-pointer border-gray-200 group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-[#1a6b4f]/10 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-[#1a6b4f]" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1a6b4f] transition-colors" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-[#1a6b4f] transition-colors">
                      {db.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {db.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-600 text-xs"
                      >
                        <GraduationCap className="w-3 h-3 mr-1" />
                        教学资源
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Access to Learning */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-10">
          快速学习
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/learn/flashcard">
            <Card className="h-full hover:shadow-md transition-all cursor-pointer border-gray-200">
              <CardContent className="p-5">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  闪卡记忆
                </h3>
                <p className="text-sm text-gray-500">
                  通过翻卡方式记忆术语，支持间隔重复
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/learn/quiz">
            <Card className="h-full hover:shadow-md transition-all cursor-pointer border-gray-200">
              <CardContent className="p-5">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-3">
                  <HelpCircle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  术语测试
                </h3>
                <p className="text-sm text-gray-500">
                  多种题型测试，检验术语掌握程度
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/learn/compare">
            <Card className="h-full hover:shadow-md transition-all cursor-pointer border-gray-200">
              <CardContent className="p-5">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  对比学习
                </h3>
                <p className="text-sm text-gray-500">
                  对比同类术语的中俄差异
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
