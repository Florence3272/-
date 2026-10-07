import { Link, useParams, useNavigate } from "react-router";
import { Layout } from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pencil,
  BookOpen,
  Tag,
  Globe,
  FileText,
  MapPin,
  Heart,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { getTermById, getDbById } from "@/lib/mockData";

export default function TermDetail() {
  const { dbId, termId } = useParams<{ dbId: string; termId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const id = parseInt(termId || "0");
  const dbid = parseInt(dbId || "0");

  const { data: apiTerm, isLoading } = trpc.term.byId.useQuery({ id });
  const { data: apiDbInfo } = trpc.database.byId.useQuery({ id: dbid });
  const [favorited, setFavorited] = useState(false);
  const addFavorite = trpc.favorite.add.useMutation();

  // Fallback to mock data
  const term = apiTerm ?? getTermById(id);
  const dbInfo = apiDbInfo ?? getDbById(dbid);

  if (isLoading && !term) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!term) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">术语不存在</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(`/terminology/${dbid}`)}
          >
            返回
          </Button>
        </div>
      </Layout>
    );
  }

  const handleFavorite = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    addFavorite.mutate(
      { targetType: "term", targetId: term.id },
      { onSuccess: () => setFavorited(true) }
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/terminology" className="hover:text-[#1a6b4f]">
            术语库
          </Link>
          <span>/</span>
          <Link to={`/terminology/${dbid}`} className="hover:text-[#1a6b4f]">
            {dbInfo?.name || "分库"}
          </Link>
          <span>/</span>
          <span className="text-gray-900">术语详情</span>
        </div>

        {/* Term Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{term.cnTerm}</h1>
              <Button
                variant="ghost"
                size="sm"
                className={favorited ? "text-red-500" : "text-gray-400"}
                onClick={handleFavorite}
              >
                <Heart className={`w-5 h-5 ${favorited ? "fill-current" : ""}`} />
              </Button>
            </div>
            <p className="text-xl text-gray-600 font-medium">{term.ruTerm}</p>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/terminology/${dbid}/term/${id}/edit`)}
              >
                <Pencil className="w-4 h-4 mr-1" />
                编辑
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/learn/flashcard?dbId=${dbid}&termId=${id}`)}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              学习
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {term.enTerm && (
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">英文参考</span>
                </div>
                <p className="text-gray-900 font-medium">{term.enTerm}</p>
              </CardContent>
            </Card>
          )}
          {term.pos && (
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm">词性</span>
                </div>
                <Badge variant="outline">{term.pos}</Badge>
              </CardContent>
            </Card>
          )}
          {term.tags && (
            <Card className="border-gray-200 sm:col-span-2">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm">领域标签</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {term.tags.split(",").map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-[#1a6b4f]/10 text-[#1a6b4f] hover:bg-[#1a6b4f]/20"
                    >
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Definition */}
        {term.definition && (
          <Card className="border-gray-200 mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1a6b4f]" />
                专业释义
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 leading-relaxed">{term.definition}</p>
            </CardContent>
          </Card>
        )}

        {/* Context */}
        {term.context && (
          <Card className="border-gray-200 mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                使用场景
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 leading-relaxed">{term.context}</p>
            </CardContent>
          </Card>
        )}

        {/* Culture Note */}
        {term.cultureNote && (
          <Card className="border-gray-200 mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                文化注释
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 leading-relaxed">{term.cultureNote}</p>
            </CardContent>
          </Card>
        )}

        {/* Meta */}
        <div className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
          <p>
            版本: v{term.version} | 更新于: {new Date(term.updatedAt).toLocaleString("zh-CN")}
          </p>
        </div>
      </div>
    </Layout>
  );
}
