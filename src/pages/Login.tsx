import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/providers/trpc";
import {
  BookOpen,
  Loader2,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Database,
  GraduationCap,
  Languages,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";

interface FieldErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
}

/* ==================== 格式要求（与后端 zod 一致） ====================
 * 用户名：3-20 位，仅字母 / 数字 / 下划线 / 汉字
 * 密  码：6-30 位，任意字符
 * ================================================================== */

function validateUsername(v: string): string | undefined {
  if (!v.trim()) return "用户名不能为空";
  if (v.trim().length < 3) return "至少3个字符";
  if (v.trim().length > 20) return "最多20个字符";
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(v.trim()))
    return "只能含字母、数字、下划线和汉字";
  return undefined;
}

function validatePassword(v: string): string | undefined {
  if (!v) return "密码不能为空";
  if (v.length < 6) return "至少6个字符";
  if (v.length > 30) return "最多30个字符";
  return undefined;
}

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showRules, setShowRules] = useState(false);

  // Floating particles
  const [particles] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 4 + Math.random() * 12,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 10,
    }))
  );

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      window.location.href = "/";
    },
    onError: (err) => setServerError(err.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      window.location.href = "/";
    },
    onError: (err) => setServerError(err.message),
  });

  const validateField = useCallback(
    (field: string, value: string) => {
      let err: string | undefined;
      if (field === "username") err = validateUsername(value);
      if (field === "password") err = validatePassword(value);
      if (field === "confirmPassword") {
        if (!value) err = "请确认密码";
        else if (value !== password) err = "两次密码不一致";
      }
      setErrors((prev) => ({ ...prev, [field]: err }));
      return !err;
    },
    [password]
  );

  const handleBlur = (field: string) => setTouched((p) => ({ ...p, [field]: true }));

  const handleChange = (field: string, value: string) => {
    setServerError("");
    if (field === "username") setUsername(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);
    if (field === "name") setName(value);
    if (touched[field]) validateField(field, value);
  };

  useEffect(() => {
    if (touched.confirmPassword || confirmPassword) {
      validateField("confirmPassword", confirmPassword);
    }
  }, [password, confirmPassword, touched.confirmPassword, validateField]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const newT: Record<string, boolean> = { username: true, password: true };
    if (isRegister) newT.confirmPassword = true;
    setTouched(newT);

    const newE: FieldErrors = {};
    newE.username = validateUsername(username);
    newE.password = validatePassword(password);
    if (isRegister) {
      if (!confirmPassword) newE.confirmPassword = "请确认密码";
      else if (confirmPassword !== password) newE.confirmPassword = "两次密码不一致";
    }
    setErrors(newE);
    if (Object.values(newE).some(Boolean)) return;

    if (isRegister) {
      const payload: { username: string; password: string; name?: string } = {
        username: username.trim(),
        password,
      };
      const n = name.trim();
      if (n) payload.name = n;
      registerMutation.mutate(payload);
    } else {
      loginMutation.mutate({ username: username.trim(), password });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;
  const pwdLenOk = password.length >= 6 && password.length <= 30;
  const pwdMatchOk = isRegister ? password === confirmPassword && !!password : true;

  const switchMode = () => {
    setIsRegister(!isRegister);
    setErrors({});
    setServerError("");
    setTouched({});
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen flex">
      {/* ====== LEFT: Brand Area ====== */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] bg-[#1a6b4f] relative overflow-hidden flex-col justify-between p-10 xl:p-14">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white/10 animate-pulse"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        <Link to="/" className="relative z-10 flex items-center gap-3 group">
          <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white/25 transition-colors">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">中俄术语库</span>
            <p className="text-[11px] text-emerald-200/70 -mt-0.5">中俄能源装备术语库系统</p>
          </div>
        </Link>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/15 mb-6 w-fit">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs text-emerald-100 font-medium">面向"一带一路"经贸合作</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
            专业技能 +
            <br />
            语言能力 +
            <br />
            <span className="text-amber-300">跨域文化</span>
          </h2>
          <p className="text-emerald-200/80 text-base leading-relaxed max-w-sm">
            覆盖油气、电力、新能源等全领域装备术语，提供术语管理、教学资源、翻译服务与学习工具。
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { icon: Database, label: "6大分库" },
              { icon: GraduationCap, label: "教学资源" },
              { icon: Languages, label: "中俄互译" },
              { icon: BookOpen, label: "34+术语" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10"
              >
                <item.icon className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-xs text-emerald-100 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-emerald-300/50 text-xs">
          国家语言文字"十四五"科研规划项目
        </div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-white/5 border border-white/10" />
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/5 border border-white/10" />
      </div>

      {/* ====== RIGHT: Form Area ====== */}
      <div className="flex-1 flex flex-col bg-[#f8fafb] relative">
        <div className="lg:hidden flex items-center p-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#1a6b4f] rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">中俄术语库</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-[400px]">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
                {isRegister ? "创建新账号" : "欢迎回来"}
              </h1>
              <p className="text-sm text-gray-400">
                {isRegister ? "填写以下信息开始使用术语库" : "登录以管理术语和学习资源"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  用户名 <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    onBlur={() => handleBlur("username")}
                    placeholder="如：zhangsan"
                    autoComplete="username"
                    disabled={isPending}
                    className={`pl-11 h-12 bg-white border-gray-200 rounded-xl text-sm transition-all ${
                      touched.username && errors.username
                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : touched.username && !errors.username && username
                        ? "border-green-300 focus:border-green-400 focus:ring-2 focus:ring-green-100"
                        : "focus:border-[#1a6b4f] focus:ring-2 focus:ring-[#1a6b4f]/10"
                    }`}
                  />
                </div>
                {touched.username && errors.username ? (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="w-3 h-3 shrink-0" />
                    {errors.username}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    3-20位，仅字母 / 数字 / 下划线 / 汉字
                  </p>
                )}
              </div>

              {/* Nickname */}
              {isRegister && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    昵称 <span className="text-gray-300 text-xs font-normal">（可选）</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="显示名称"
                      disabled={isPending}
                      className="pl-11 h-12 bg-white border-gray-200 rounded-xl text-sm focus:border-[#1a6b4f] focus:ring-2 focus:ring-[#1a6b4f]/10 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    密码 <span className="text-red-400">*</span>
                  </Label>
                  {isRegister && (
                    <button
                      type="button"
                      onClick={() => setShowRules(!showRules)}
                      className="text-xs text-[#1a6b4f] hover:underline"
                    >
                      {showRules ? "隐藏要求" : "查看要求"}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="6-30位"
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    disabled={isPending}
                    className={`pl-11 pr-11 h-12 bg-white border-gray-200 rounded-xl text-sm transition-all ${
                      touched.password && errors.password
                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : touched.password && !errors.password && password
                        ? "border-green-300 focus:border-green-400 focus:ring-2 focus:ring-green-100"
                        : "focus:border-[#1a6b4f] focus:ring-2 focus:ring-[#1a6b4f]/10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
                {touched.password && errors.password ? (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="w-3 h-3 shrink-0" />
                    {errors.password}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    6-30位，任意字符均可
                  </p>
                )}

                {/* Password Requirements Detail (register) */}
                {isRegister && showRules && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <p className="text-xs font-medium text-gray-600">密码格式说明：</p>
                    {[
                      { label: "长度 6-30 位", ok: password.length >= 6 && password.length <= 30 },
                      { label: "两次输入一致", ok: pwdMatchOk },
                    ].map((r) => (
                      <div key={r.label} className="flex items-center gap-2">
                        {r.ok ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        )}
                        <span className={`text-xs ${r.ok ? "text-green-600" : "text-gray-500"}`}>
                          {r.label}
                        </span>
                      </div>
                    ))}
                    <div className="pt-1 border-t border-gray-200">
                      <p className="text-[11px] text-gray-400">
                        密码可以是字母、数字、符号的任意组合，如：abc123、hello2024、@Pass1 等
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              {isRegister && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    确认密码 <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      onBlur={() => handleBlur("confirmPassword")}
                      placeholder="再次输入密码"
                      autoComplete="new-password"
                      disabled={isPending}
                      className={`pl-11 pr-11 h-12 bg-white border-gray-200 rounded-xl text-sm transition-all ${
                        touched.confirmPassword && errors.confirmPassword
                          ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                          : touched.confirmPassword && !errors.confirmPassword && confirmPassword
                          ? "border-green-300 focus:border-green-400 focus:ring-2 focus:ring-green-100"
                          : "focus:border-[#1a6b4f] focus:ring-2 focus:ring-[#1a6b4f]/10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                    >
                      {showConfirm ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <XCircle className="w-3 h-3 shrink-0" />
                      {errors.confirmPassword}
                    </p>
                  )}
                  {/* Inline checks */}
                  <div className="flex gap-4">
                    {[
                      { label: "长度符合", ok: pwdLenOk },
                      { label: "两次一致", ok: pwdMatchOk },
                    ].map((c) => (
                      <div key={c.label} className="flex items-center gap-1">
                        {c.ok ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-gray-300" />
                        )}
                        <span className={`text-[11px] ${c.ok ? "text-green-600" : "text-gray-400"}`}>
                          {c.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Server Error */}
              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600">{serverError}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 bg-[#1a6b4f] hover:bg-[#145a42] text-white font-medium rounded-xl shadow-lg shadow-[#1a6b4f]/20 transition-all text-sm"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-1.5" />}
                {isRegister ? "注册账号" : "登录"}
              </Button>
            </form>

            {/* Switch */}
            <div className="mt-6 text-center">
              <button type="button" onClick={switchMode} className="text-sm text-gray-500 hover:text-[#1a6b4f] transition-colors">
                {isRegister ? (
                  <span>已有账号？<span className="font-semibold text-[#1a6b4f]">去登录</span></span>
                ) : (
                  <span>没有账号？<span className="font-semibold text-[#1a6b4f]">去注册</span></span>
                )}
              </button>
            </div>

            <div className="mt-8 text-center">
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowRight className="w-3 h-3 rotate-180" />
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
