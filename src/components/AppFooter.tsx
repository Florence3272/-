import { BookOpen } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-[#1a6b4f] rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-gray-900">
                中俄能源装备术语库
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              面向"一带一路"中俄能源装备贸易的行业术语库及教学资源建设系统，服务于经贸合作人才培养与跨域沟通。
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <a href="/terminology" className="text-sm text-gray-500 hover:text-[#1a6b4f] transition-colors">
                  术语库管理
                </a>
              </li>
              <li>
                <a href="/resources" className="text-sm text-gray-500 hover:text-[#1a6b4f] transition-colors">
                  教学资源
                </a>
              </li>
              <li>
                <a href="/translate" className="text-sm text-gray-500 hover:text-[#1a6b4f] transition-colors">
                  翻译服务
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">项目信息</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              国家语言文字"十四五"科研规划2025年度一般项目
            </p>
            <p className="text-xs text-gray-400 mt-2">
              面向"一带一路"经贸合作的"专业技能+语言能力+跨域文化"行业术语与教学资源建设研究
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} 中俄能源装备术语库系统. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
