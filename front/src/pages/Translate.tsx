import { useState } from "react";
import { Layout } from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Languages,
  ArrowRightLeft,
  BookOpen,
  Sparkles,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { mockTerms } from "@/lib/mockData";

export default function Translate() {
  const { user } = useAuth();
  const [sourceText, setSourceText] = useState("");
  const [sourceLang, setSourceLang] = useState<"zh" | "ru">("zh");
  const [result, setResult] = useState<{
    result: string;
    matchedTerms: Array<{ cn: string; ru: string }>;
    isMachineTranslated: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const translateMutation = trpc.translate.text.useMutation({
    onSuccess: (data) => setResult(data),
  });

  const { data: history, isLoading: historyLoading } =
    trpc.translate.history.useQuery(undefined, { enabled: !!user });

  const handleTranslate = () => {
    if (!sourceText.trim()) return;
    translateMutation.mutate({
      text: sourceText,
      sourceLang,
      targetLang: sourceLang === "zh" ? "ru" : "zh",
    });
  };

  const handleSwap = () => {
    setSourceLang(sourceLang === "zh" ? "ru" : "zh");
    if (result) {
      setSourceText(result.result);
      setResult(null);
    }
  };

  const handleCopy = () => {
    if (result?.result) {
      navigator.clipboard.writeText(result.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Languages className="w-6 h-6 text-[#1a6b4f]" />
            翻译服务
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            中俄互译，智能术语匹配
          </p>
        </div>

        {/* Translate Card */}
        <Card className="border-gray-200 mb-8">
          <CardContent className="p-6">
            {/* Language Selector */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sourceLang === "zh"
                    ? "bg-[#1a6b4f] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setSourceLang("zh")}
              >
                中文
              </button>
              <button
                onClick={handleSwap}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4 text-gray-400" />
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sourceLang === "ru"
                    ? "bg-[#1a6b4f] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setSourceLang("ru")}
              >
                俄文
              </button>
            </div>

            {/* Source Input */}
            <Textarea
              placeholder={
                sourceLang === "zh"
                  ? "输入中文文本..."
                  : "Введите текст на русском..."
              }
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={5}
              className="mb-4 resize-none"
            />

            <Button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || translateMutation.isPending}
              className="w-full bg-[#1a6b4f] hover:bg-[#145a42] mb-6"
            >
              {translateMutation.isPending ? "翻译中..." : "翻译"}
            </Button>

            {/* Result */}
            {result && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    翻译结果
                  </span>
                  <div className="flex items-center gap-2">
                    {result.isMachineTranslated && (
                      <Badge
                        variant="outline"
                        className="text-xs text-amber-600 border-amber-200"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        机器翻译
                      </Badge>
                    )}
                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-900 leading-relaxed">
                  {result.result}
                </div>

                {/* Matched Terms */}
                {result.matchedTerms.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      术语匹配 ({result.matchedTerms.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedTerms.map((t, i) => (
                        <Badge
                          key={i}
                          className="bg-[#1a6b4f]/10 text-[#1a6b4f] hover:bg-[#1a6b4f]/20 cursor-pointer"
                        >
                          {t.cn} → {t.ru}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Search */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            快速查词
          </h2>
          <QuickTranslate />
        </div>

        {/* History */}
        {user && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              翻译历史
            </h2>
            {historyLoading ? (
              <Skeleton className="h-40 rounded-xl" />
            ) : !history?.length ? (
              <Card className="border-dashed border-gray-300">
                <CardContent className="py-8 text-center">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">暂无翻译记录</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 10).map((h) => (
                  <Card key={h.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {h.sourceLang === "zh" ? "中→俄" : "俄→中"}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(h.createdAt).toLocaleString("zh-CN")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 line-clamp-1 mb-1">
                        {h.sourceText}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {h.resultText}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function QuickTranslate() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const { data: apiData, isLoading, isError } = trpc.translate.quickTranslate.useQuery(
    { q: query },
    { enabled: searched && query.length > 0 }
  );

  // Fallback to mock data for quick translate
  const mockQuickData = searched && !isLoading
    ? {
        found: true,
        terms: mockTerms
          .filter((t) => {
            const q = query.toLowerCase();
            return t.cnTerm.toLowerCase().includes(q) || t.ruTerm.toLowerCase().includes(q);
          })
          .slice(0, 5)
          .map((t) => ({ ...t, dbId: t.dbId })),
      }
    : null;

  const data = isError || !apiData ? mockQuickData : apiData;

  const handleSearch = () => {
    if (query.trim()) setSearched(true);
  };

  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="输入术语快速查询..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b4f]/20 focus:border-[#1a6b4f]"
          />
          <Button
            size="sm"
            onClick={handleSearch}
            className="bg-[#1a6b4f] hover:bg-[#145a42]"
          >
            查询
          </Button>
        </div>

        {searched && isLoading && (
          <Skeleton className="h-20 rounded-lg" />
        )}

        {searched && data && (
          <div>
            {data.found && data.terms.length > 0 ? (
              <div className="space-y-2">
                {data.terms.map((t) => (
                  <Link
                    key={t.id}
                    to={
                      t.id > 0
                        ? `/terminology/${t.dbId}/term/${t.id}`
                        : "#"
                    }
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-[#1a6b4f]/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900 mr-3">
                          {t.cnTerm}
                        </span>
                        <span className="text-gray-600">{t.ruTerm}</span>
                      </div>
                      {t.enTerm && (
                        <span className="text-xs text-gray-400">
                          {t.enTerm}
                        </span>
                      )}
                    </div>
                    {t.definition && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {t.definition}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                未找到匹配的术语
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
