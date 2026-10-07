import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { Layout } from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  ArrowLeft,
  BookOpen,
  Eye,
  Pencil,
  Trash2,
  Filter,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getTermsByDbId, getDbById, mockPosList } from "@/lib/mockData";

export default function DatabaseTerms() {
  const { dbId } = useParams<{ dbId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const id = parseInt(dbId || "0");

  const [search, setSearch] = useState("");
  const [pos, setPos] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    cnTerm: "",
    ruTerm: "",
    enTerm: "",
    definition: "",
    context: "",
    cultureNote: "",
    pos: "",
    tags: "",
  });

  const utils = trpc.useUtils();
  const { data: apiDbInfo } = trpc.database.byId.useQuery({ id });
  const { data: apiTerms, isLoading, isError } = trpc.term.list.useQuery({
    dbId: id,
    search: search || undefined,
    pos: pos || undefined,
  });
  const { data: apiPosList } = trpc.term.posList.useQuery();

  const createTerm = trpc.term.create.useMutation({
    onSuccess: () => {
      utils.term.list.invalidate();
      utils.database.byId.invalidate({ id });
      setDialogOpen(false);
      setFormData({ cnTerm: "", ruTerm: "", enTerm: "", definition: "", context: "", cultureNote: "", pos: "", tags: "" });
    },
  });

  const deleteTerm = trpc.term.delete.useMutation({
    onSuccess: () => {
      utils.term.list.invalidate();
      utils.database.byId.invalidate({ id });
    },
  });

  // Fallback to mock data when API fails
  const dbInfo = apiDbInfo ?? getDbById(id);
  const mockTermsForDb = getTermsByDbId(id);
  const filteredMockTerms = mockTermsForDb.filter((t) => {
    if (search) {
      const s = search.toLowerCase();
      return t.cnTerm.toLowerCase().includes(s) || t.ruTerm.toLowerCase().includes(s);
    }
    if (pos && t.pos !== pos) return false;
    return true;
  });
  const terms = isError || !apiTerms ? filteredMockTerms : apiTerms;
  const posList = apiPosList ?? mockPosList;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cnTerm || !formData.ruTerm) return;
    createTerm.mutate({ dbId: id, ...formData });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <Link
            to="/terminology"
            className="inline-flex items-center text-sm text-gray-500 hover:text-[#1a6b4f] mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回术语库
          </Link>
          {dbInfo && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{dbInfo.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{dbInfo.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="secondary" className="bg-[#1a6b4f]/10 text-[#1a6b4f] hover:bg-[#1a6b4f]/20">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {dbInfo.termCount} 术语
                  </Badge>
                  <span className="text-xs text-gray-400">
                    更新于 {new Date(dbInfo.updatedAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </div>
              {user && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#1a6b4f] hover:bg-[#145a42]">
                      <Plus className="w-4 h-4 mr-1" />
                      新增术语
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>新增术语</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cnTerm">中文名 *</Label>
                          <Input
                            id="cnTerm"
                            value={formData.cnTerm}
                            onChange={(e) => setFormData({ ...formData, cnTerm: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="ruTerm">俄文名 *</Label>
                          <Input
                            id="ruTerm"
                            value={formData.ruTerm}
                            onChange={(e) => setFormData({ ...formData, ruTerm: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="enTerm">英文参考</Label>
                        <Input
                          id="enTerm"
                          value={formData.enTerm}
                          onChange={(e) => setFormData({ ...formData, enTerm: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pos">词性</Label>
                          <Input
                            id="pos"
                            value={formData.pos}
                            onChange={(e) => setFormData({ ...formData, pos: e.target.value })}
                            placeholder="如：名词"
                          />
                        </div>
                        <div>
                          <Label htmlFor="tags">领域标签</Label>
                          <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="如：钻井,机械"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="definition">专业释义</Label>
                        <Textarea
                          id="definition"
                          value={formData.definition}
                          onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="context">使用场景</Label>
                        <Textarea
                          id="context"
                          value={formData.context}
                          onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cultureNote">文化注释</Label>
                        <Textarea
                          id="cultureNote"
                          value={formData.cultureNote}
                          onChange={(e) => setFormData({ ...formData, cultureNote: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-[#1a6b4f] hover:bg-[#145a42]"
                        disabled={createTerm.isPending}
                      >
                        {createTerm.isPending ? "保存中..." : "保存"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索术语（中俄文均可）..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={pos || "__all__"} onValueChange={(v) => setPos(v === "__all__" ? "" : v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="全部词性" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部词性</SelectItem>
                {posList?.map((p) => (
                  <SelectItem key={p} value={p || "__all__"}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Terms Table */}
        {isLoading && !isError ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : terms?.length === 0 ? (
          <Card className="border-dashed border-gray-300">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {search || pos ? "未找到匹配的术语" : "暂无术语，请添加第一条术语"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">中文名</TableHead>
                    <TableHead className="font-semibold">俄文名</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">英文</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">词性</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">标签</TableHead>
                    <TableHead className="font-semibold text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {terms?.map((term) => (
                    <TableRow key={term.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {term.cnTerm}
                      </TableCell>
                      <TableCell className="text-gray-700">{term.ruTerm}</TableCell>
                      <TableCell className="text-gray-500 hidden sm:table-cell">
                        {term.enTerm || "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {term.pos && (
                          <Badge variant="outline" className="text-xs">
                            {term.pos}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {term.tags?.split(",").map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs bg-gray-100 text-gray-600"
                            >
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/terminology/${id}/term/${term.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(`/terminology/${id}/term/${term.id}/edit`)
                                }
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => {
                                  if (confirm("确认删除该术语？")) {
                                    deleteTerm.mutate({ id: term.id });
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
