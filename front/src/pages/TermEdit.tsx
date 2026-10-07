import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Layout } from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save } from "lucide-react";

export default function TermEdit() {
  const { dbId, termId } = useParams<{ dbId: string; termId: string }>();
  const navigate = useNavigate();
  const id = parseInt(termId || "0");
  const dbid = parseInt(dbId || "0");
  const isNew = id === 0;

  const { data: term, isLoading } = trpc.term.byId.useQuery(
    { id },
    { enabled: !isNew }
  );

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

  const updateTerm = trpc.term.update.useMutation({
    onSuccess: () => {
      utils.term.byId.invalidate({ id });
      navigate(`/terminology/${dbid}/term/${id}`);
    },
  });

  const createTerm = trpc.term.create.useMutation({
    onSuccess: (data) => {
      utils.term.list.invalidate();
      if (data?.id) {
        navigate(`/terminology/${dbid}/term/${data.id}`);
      }
    },
  });

  useEffect(() => {
    if (term) {
      setFormData({
        cnTerm: term.cnTerm || "",
        ruTerm: term.ruTerm || "",
        enTerm: term.enTerm || "",
        definition: term.definition || "",
        context: term.context || "",
        cultureNote: term.cultureNote || "",
        pos: term.pos || "",
        tags: term.tags || "",
      });
    }
  }, [term]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cnTerm || !formData.ruTerm) return;

    if (isNew) {
      createTerm.mutate({ dbId: dbid, ...formData });
    } else {
      updateTerm.mutate({ id, ...formData });
    }
  };

  if (!isNew && isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() =>
            isNew
              ? navigate(`/terminology/${dbid}`)
              : navigate(`/terminology/${dbid}/term/${id}`)
          }
          className="inline-flex items-center text-sm text-gray-500 hover:text-[#1a6b4f] mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isNew ? "新增术语" : "编辑术语"}
        </h1>

        <Card className="border-gray-200">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cnTerm">中文名 *</Label>
                  <Input
                    id="cnTerm"
                    value={formData.cnTerm}
                    onChange={(e) =>
                      setFormData({ ...formData, cnTerm: e.target.value })
                    }
                    placeholder="输入中文术语"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ruTerm">俄文名 *</Label>
                  <Input
                    id="ruTerm"
                    value={formData.ruTerm}
                    onChange={(e) =>
                      setFormData({ ...formData, ruTerm: e.target.value })
                    }
                    placeholder="输入俄文术语"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="enTerm">英文参考</Label>
                <Input
                  id="enTerm"
                  value={formData.enTerm}
                  onChange={(e) =>
                    setFormData({ ...formData, enTerm: e.target.value })
                  }
                  placeholder="输入英文参考"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pos">词性</Label>
                  <Input
                    id="pos"
                    value={formData.pos}
                    onChange={(e) =>
                      setFormData({ ...formData, pos: e.target.value })
                    }
                    placeholder="如：名词、动词"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">领域标签</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="如：钻井,机械,采油"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="definition">专业释义</Label>
                <Textarea
                  id="definition"
                  value={formData.definition}
                  onChange={(e) =>
                    setFormData({ ...formData, definition: e.target.value })
                  }
                  placeholder="输入专业释义"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="context">使用场景</Label>
                <Textarea
                  id="context"
                  value={formData.context}
                  onChange={(e) =>
                    setFormData({ ...formData, context: e.target.value })
                  }
                  placeholder="输入使用场景描述"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="cultureNote">文化注释</Label>
                <Textarea
                  id="cultureNote"
                  value={formData.cultureNote}
                  onChange={(e) =>
                    setFormData({ ...formData, cultureNote: e.target.value })
                  }
                  placeholder="输入跨域文化注释"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-[#1a6b4f] hover:bg-[#145a42]"
                  disabled={updateTerm.isPending || createTerm.isPending}
                >
                  <Save className="w-4 h-4 mr-1" />
                  {updateTerm.isPending || createTerm.isPending
                    ? "保存中..."
                    : "保存"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    isNew
                      ? navigate(`/terminology/${dbid}`)
                      : navigate(`/terminology/${dbid}/term/${id}`)
                  }
                >
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
