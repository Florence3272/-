import { Link } from "react-router";
import { Layout } from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  GraduationCap,
  Languages,
  User,
  Search,
  Database,
  ArrowRight,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { mockDatabases, getMockStats } from "@/lib/mockData";

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: apiDatabases, isLoading: dbLoading, isError: dbError } = trpc.database.list.useQuery({});
  const { data: apiTermStats } = trpc.term.stats.useQuery();

  // Fallback to mock data
  const databases = dbError || !apiDatabases ? mockDatabases : apiDatabases;
  const mockStats = getMockStats();
  const termStats = apiTermStats ?? mockStats;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/terminology?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const features = [
    {
      title: "术语库管理",
      desc: "多维度分库架构，支持术语全生命周期管理",
      icon: BookOpen,
      path: "/terminology",
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "教学资源",
      desc: "情境对话、微课视频、习题测试等学习资源",
      icon: GraduationCap,
      path: "/resources",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "翻译服务",
      desc: "中俄互译，术语智能匹配与辅助翻译",
      icon: Languages,
      path: "/translate",
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "个人中心",
      desc: "学习记录、收藏术语、笔记管理",
      icon: User,
      path: "/profile",
      color: "bg-purple-50 text-purple-700",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1a6b4f] to-[#145a42] text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              中俄能源装备术语库
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 mb-8 leading-relaxed">
              面向"一带一路"经贸合作的专业术语与教学资源平台
              <br className="hidden sm:block" />
              覆盖油气、电力、新能源等全领域装备术语
            </p>
            <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="搜索术语（中俄文均可）..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white text-gray-900 border-0 text-base placeholder:text-gray-400"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-white px-6"
              >
                搜索
              </Button>
            </form>
            {termStats && (
              <div className="flex gap-8 mt-8 text-emerald-100">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  <span className="text-sm">
                    收录术语 <strong className="text-white">{termStats.totalTerms}+</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-sm">
                    专业分库 <strong className="text-white">{termStats.totalDatabases}+</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <Link key={f.path} to={f.path}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group border-gray-200">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
                    >
                      <f.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      {f.title}
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Database Quick Access */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              热门分数据库
            </h2>
            <Link
              to="/terminology"
              className="text-sm text-[#1a6b4f] hover:text-[#145a42] font-medium flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {dbLoading && !dbError ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {databases?.slice(0, 6).map((db) => (
                <Link key={db.id} to={`/terminology/${db.id}`}>
                  <Card className="h-full hover:shadow-md transition-all cursor-pointer border-gray-200 group">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-[#1a6b4f]/10 rounded-lg flex items-center justify-center">
                          <Database className="w-5 h-5 text-[#1a6b4f]" />
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {db.category}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-[#1a6b4f] transition-colors">
                        {db.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {db.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {db.termCount} 术语
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(db.updatedAt).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            推荐学习路径
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "新手入门",
                desc: "从基础术语开始，掌握能源装备核心词汇",
                icon: TrendingUp,
                color: "from-emerald-500 to-teal-600",
                path: "/terminology",
              },
              {
                title: "情境学习",
                desc: "通过真实贸易场景，提升实际应用能力",
                icon: GraduationCap,
                color: "from-blue-500 to-indigo-600",
                path: "/resources",
              },
              {
                title: "术语测试",
                desc: "检验学习成果，巩固记忆",
                icon: BookOpen,
                color: "from-amber-500 to-orange-600",
                path: "/learn/quiz",
              },
            ].map((item) => (
              <Link key={item.path} to={item.path}>
                <Card className="h-full hover:shadow-lg transition-all cursor-pointer overflow-hidden border-0">
                  <div className={`bg-gradient-to-br ${item.color} p-6 text-white h-full`}>
                    <item.icon className="w-10 h-10 mb-4 opacity-90" />
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
