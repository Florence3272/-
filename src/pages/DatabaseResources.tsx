import { Link, useParams } from "react-router";
import { Layout } from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Database,
  MessageSquare,
  FileText,
  Briefcase,
  Video,
  HelpCircle,
  Sparkles,
  Clock,
} from "lucide-react";

const moduleConfig = [
  { value: "dialogue", label: "情境对话", icon: MessageSquare },
  { value: "reading", label: "专业阅读", icon: FileText },
  { value: "case", label: "案例分析", icon: Briefcase },
  { value: "video", label: "微课视频", icon: Video },
  { value: "quiz", label: "习题测试", icon: HelpCircle },
  { value: "culture", label: "文化贴士", icon: Sparkles },
];

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-50 text-green-700",
  intermediate: "bg-amber-50 text-amber-700",
  advanced: "bg-red-50 text-red-700",
};

const difficultyLabels: Record<string, string> = {
  beginner: "初级",
  intermediate: "中级",
  advanced: "高级",
};

export default function DatabaseResources() {
  const { dbId } = useParams<{ dbId: string }>();
  const id = parseInt(dbId || "0");

  const { data: dbInfo } = trpc.database.byId.useQuery({ id });
  const { data: resources, isLoading } = trpc.resource.list.useQuery({ dbId: id });

  const resourcesByModule = moduleConfig.map((m) => ({
    ...m,
    items: resources?.filter((r) => r.moduleType === m.value) || [],
  }));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link
          to="/resources"
          className="inline-flex items-center text-sm text-gray-500 hover:text-[#1a6b4f] mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回教学资源
        </Link>

        {/* Header */}
        {dbInfo && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#1a6b4f]/10 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-[#1a6b4f]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{dbInfo.name}</h1>
                <p className="text-sm text-gray-500">{dbInfo.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resources by Module */}
        <Tabs defaultValue="dialogue" className="w-full">
          <TabsList className="mb-6 flex flex-wrap h-auto">
            {moduleConfig.map((m) => (
              <TabsTrigger key={m.value} value={m.value} className="flex items-center gap-1.5">
                <m.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{m.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {resourcesByModule.map((module) => (
            <TabsContent key={module.value} value={module.value}>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </div>
              ) : module.items.length === 0 ? (
                <Card className="border-dashed border-gray-300">
                  <CardContent className="py-12 text-center">
                    <module.icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      暂无{module.label}资源
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {module.items.map((resource) => (
                    <Card
                      key={resource.id}
                      className="border-gray-200 hover:shadow-md transition-all"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center">
                            <module.icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <Badge
                            className={`${difficultyColors[resource.difficulty]} text-xs`}
                          >
                            {difficultyLabels[resource.difficulty]}
                          </Badge>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">
                          {resource.title}
                        </h3>
                        {resource.duration && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                            <Clock className="w-3.5 h-3.5" />
                            {resource.duration} 分钟
                          </div>
                        )}
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {resource.content?.slice(0, 100) || "暂无描述"}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}
