import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router";
import { Layout } from "@/components/Layout";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  RotateCw,
  CheckCircle,
  XCircle,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { getTermsByDbId, mockQuizQuestions } from "@/lib/mockData";

export default function Learn() {
  const { mode } = useParams<{ mode: string }>();
  const [searchParams] = useSearchParams();
  const dbId = parseInt(searchParams.get("dbId") || "0") || undefined;

  if (mode === "flashcard") return <FlashcardMode dbId={dbId} />;
  if (mode === "quiz") return <QuizMode dbId={dbId} />;
  if (mode === "compare") return <CompareMode dbId={dbId} />;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">未知学习模式</p>
        <Link to="/resources" className="text-[#1a6b4f] hover:underline mt-2 inline-block">
          返回教学资源
        </Link>
      </div>
    </Layout>
  );
}

// ========== Flashcard Mode ==========
function FlashcardMode({ dbId }: { dbId?: number }) {
  const { data: apiTerms, isLoading, isError } = trpc.learn.flashcards.useQuery({ dbId, limit: 20 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const recordMutation = trpc.learn.record.useMutation();

  // Fallback to mock data
  const mockTerms = dbId ? getTermsByDbId(dbId).slice(0, 20) : getTermsByDbId(1).slice(0, 20);
  const terms = isError || !apiTerms ? mockTerms : apiTerms;

  if (isLoading && !isError) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!terms?.length) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无术语数据</p>
        </div>
      </Layout>
    );
  }

  const current = terms[currentIndex];
  const progress = ((currentIndex + 1) / terms.length) * 100;

  const handleNext = (isKnown: boolean) => {
    if (isKnown) setKnown((k) => k + 1);
    else setUnknown((u) => u + 1);

    recordMutation.mutate({
      targetType: "term",
      targetId: current.id,
      mode: "flashcard",
      score: isKnown ? 1 : 0,
    });

    setFlipped(false);
    if (currentIndex < terms.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (currentIndex >= terms.length) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">学习完成!</h2>
          <p className="text-gray-500 mb-6">
            已掌握 {known} 个，待复习 {unknown} 个
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setCurrentIndex(0); setKnown(0); setUnknown(0); }}>
              重新开始
            </Button>
            <Link to="/resources">
              <Button variant="outline">返回资源</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          to="/resources"
          className="inline-flex items-center text-sm text-gray-500 hover:text-[#1a6b4f] mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回
        </Link>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#1a6b4f]" />
            闪卡记忆
          </h1>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {terms.length}
          </span>
        </div>

        <Progress value={progress} className="mb-6" />

        {/* Flashcard */}
        <div
          className="relative h-72 cursor-pointer perspective-1000"
          onClick={() => setFlipped(!flipped)}
        >
          <Card
            className={`h-full border-2 transition-all duration-300 ${
              flipped
                ? "border-[#1a6b4f] bg-[#1a6b4f]/5"
                : "border-gray-200 bg-white"
            }`}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
              {!flipped ? (
                <>
                  <span className="text-xs text-gray-400 mb-4 uppercase tracking-wide">
                    中文
                  </span>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {current.cnTerm}
                  </h2>
                  {current.enTerm && (
                    <p className="text-sm text-gray-400">{current.enTerm}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-6">
                    点击翻转查看俄文
                  </p>
                </>
              ) : (
                <>
                  <span className="text-xs text-[#1a6b4f] mb-4 uppercase tracking-wide">
                    俄文
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {current.ruTerm}
                  </h2>
                  {current.definition && (
                    <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                      {current.definition}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => handleNext(false)}
            disabled={!flipped}
          >
            <XCircle className="w-4 h-4 mr-1" />
            未掌握
          </Button>
          <Button
            variant="outline"
            onClick={() => setFlipped(!flipped)}
          >
            <RotateCw className="w-4 h-4 mr-1" />
            翻转
          </Button>
          <Button
            className="bg-[#1a6b4f] hover:bg-[#145a42]"
            onClick={() => handleNext(true)}
            disabled={!flipped}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            已掌握
          </Button>
        </div>
      </div>
    </Layout>
  );
}

// ========== Quiz Mode ==========
function QuizMode({ dbId }: { dbId?: number }) {
  const [quizMode, setQuizMode] = useState<"zh_to_ru" | "ru_to_zh">("zh_to_ru");
  const { data: apiQuestions, isLoading, isError } = trpc.learn.quizQuestions.useQuery({
    dbId,
    mode: quizMode,
    limit: 10,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [, setScore] = useState(0);
  const [answers, setAnswers] = useState<Array<{ correct: boolean }>>([]);
  const recordMutation = trpc.learn.record.useMutation();

  // Fallback: generate quiz from mock data
  const generateMockQuestions = () => {
    const terms = dbId ? getTermsByDbId(dbId) : getTermsByDbId(1);
    return mockQuizQuestions.slice(0, 10);
  };
  const mockQuestions = generateMockQuestions();
  const questions = isError || !apiQuestions ? mockQuestions : apiQuestions;

  if (isLoading && !isError) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!questions?.length) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无测试题目</p>
        </div>
      </Layout>
    );
  }

  if (answers.length >= questions.length) {
    const correctCount = answers.filter((a) => a.correct).length;
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">测试完成!</h2>
          <p className="text-4xl font-bold text-[#1a6b4f] mb-2">
            {Math.round((correctCount / questions.length) * 100)}%
          </p>
          <p className="text-gray-500 mb-6">
            答对 {correctCount} / {questions.length} 题
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setAnswers([]);
                setSelectedAnswer(null);
                setShowResult(false);
              }}
            >
              再测一次
            </Button>
            <Link to="/resources">
              <Button variant="outline">返回资源</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const q = questions[currentIndex];

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    const correct = answer === q.correctAnswer;
    if (correct) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, { correct }]);

    recordMutation.mutate({
      targetType: "term",
      targetId: q.id,
      mode: "quiz",
      score: correct ? 1 : 0,
    });
  };

  const handleNext = () => {
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          to="/resources"
          className="inline-flex items-center text-sm text-gray-500 hover:text-[#1a6b4f] mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回
        </Link>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#1a6b4f]" />
            术语测试
          </h1>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <Progress
          value={((currentIndex + 1) / questions.length) * 100}
          className="mb-6"
        />

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={quizMode === "zh_to_ru" ? "default" : "outline"}
            size="sm"
            onClick={() => setQuizMode("zh_to_ru")}
            className={quizMode === "zh_to_ru" ? "bg-[#1a6b4f]" : ""}
          >
            中译俄
          </Button>
          <Button
            variant={quizMode === "ru_to_zh" ? "default" : "outline"}
            size="sm"
            onClick={() => setQuizMode("ru_to_zh")}
            className={quizMode === "ru_to_zh" ? "bg-[#1a6b4f]" : ""}
          >
            俄译中
          </Button>
        </div>

        {/* Question */}
        <Card className="border-gray-200 mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {q.question}
            </h3>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    showResult
                      ? opt === q.correctAnswer
                        ? "border-green-500 bg-green-50 text-green-700"
                        : opt === selectedAnswer
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200"
                      : "border-gray-200 hover:border-[#1a6b4f] hover:bg-[#1a6b4f]/5"
                  }`}
                  onClick={() => handleAnswer(opt)}
                  disabled={showResult}
                >
                  <span className="font-medium mr-2">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {showResult && (
          <div className="flex justify-end">
            <Button onClick={handleNext} className="bg-[#1a6b4f] hover:bg-[#145a42]">
              下一题 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}

// ========== Compare Mode ==========
function CompareMode({ dbId }: { dbId?: number }) {
  const effectiveDbId = dbId || 1;
  const { data: apiTerms, isLoading, isError } = trpc.learn.compareTerms.useQuery({
    dbId: effectiveDbId,
  });

  // Fallback to mock data
  const mockTerms = getTermsByDbId(effectiveDbId);
  const terms = isError || !apiTerms ? mockTerms : apiTerms;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link
          to="/resources"
          className="inline-flex items-center text-sm text-gray-500 hover:text-[#1a6b4f] mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#1a6b4f]" />
          对比学习
        </h1>

        {isLoading && !isError ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : !terms?.length ? (
          <Card className="border-dashed border-gray-300">
            <CardContent className="py-12 text-center">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无术语数据</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left p-4 text-sm font-semibold text-gray-900">中文</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-900">俄文</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-900 hidden sm:table-cell">英文</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-900 hidden md:table-cell">释义</th>
                  </tr>
                </thead>
                <tbody>
                  {terms.map((term) => (
                    <tr
                      key={term.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium text-gray-900">
                        {term.cnTerm}
                      </td>
                      <td className="p-4 text-gray-700">{term.ruTerm}</td>
                      <td className="p-4 text-gray-500 hidden sm:table-cell">
                        {term.enTerm || "-"}
                      </td>
                      <td className="p-4 text-gray-600 text-sm hidden md:table-cell max-w-xs truncate">
                        {term.definition || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
