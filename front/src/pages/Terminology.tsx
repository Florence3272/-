import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Layout } from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Database,
  Search,
  Plus,
  BookOpen,
  Clock,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { mockDatabases, mockCategories } from "@/lib/mockData";

export default function Terminology() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    description: string;
    visibility: "public" | "private" | "team";
  }>({
    name: "",
    category: "",
    description: "",
    visibility: "public",
  });

  const utils = trpc.useUtils();
  const { data: apiDatabases, isLoading, isError } = trpc.database.list.useQuery({
    search: search || undefined,
    category: category || undefined,
  });
  const { data: apiCategories } = trpc.database.categories.useQuery();
  const createDb = trpc.database.create.useMutation({
    onSuccess: () => {
      utils.database.list.invalidate();
      setDialogOpen(false);
      setFormData({ name: "", category: "", description: "", visibility: "public" });
    },
  });

  // Fallback to mock data when API fails (static deployment)
  const databases = isError || !apiDatabases
    ? mockDatabases.filter((db) => {
        if (search && !db.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (category && db.category !== category) return false;
        return true;
      })
    : apiDatabases;
  const categories = apiCategories ?? mockCategories;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return;
    createDb.mutate(formData);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">术语库管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              管理分数据库，浏览和编辑术语条目
            </p>
          </div>
          {user && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1a6b4f] hover:bg-[#145a42]">
                  <Plus className="w-4 h-4 mr-1" />
                  创建分库
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>创建分数据库</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label htmlFor="dbName">库名称 *</Label>
                    <Input
                      id="dbName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="如：油气开采装备"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dbCategory">所属领域 *</Label>
                    <Input
                      id="dbCategory"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="如：油气领域"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dbDesc">描述</Label>
                    <Textarea
                      id="dbDesc"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="简要描述该分库的内容范围"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>可见性</Label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(v) =>
                        setFormData({ ...formData, visibility: v as "public" | "private" | "team" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">公开</SelectItem>
                        <SelectItem value="private">私有</SelectItem>
                        <SelectItem value="team">团队</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#1a6b4f] hover:bg-[#145a42]"
                    disabled={createDb.isPending}
                  >
                    {createDb.isPending ? "创建中..." : "创建"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索分库名称..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={category || "__all__"} onValueChange={(v) => setCategory(v === "__all__" ? "" : v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="全部领域" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部领域</SelectItem>
                {categories?.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Database Grid */}
        {isLoading && !isError ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : databases?.length === 0 ? (
          <Card className="border-dashed border-gray-300">
            <CardContent className="py-12 text-center">
              <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无分数据库</p>
              {user && (
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => setDialogOpen(true)}
                >
                  创建第一个分库
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {databases?.map((db) => (
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
                    <div className="flex items-center justify-between">
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
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1a6b4f] transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
