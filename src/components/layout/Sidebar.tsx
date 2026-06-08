import { NavLink } from 'react-router-dom';
import {
  FileEdit,
  Library,
  GitBranch,
  Eye,
  BarChart3,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '问卷编辑', icon: FileEdit },
  { path: '/library', label: '题目库', icon: Library },
  { path: '/logic', label: '逻辑设置', icon: GitBranch },
  { path: '/preview', label: '样式预览', icon: Eye },
  { path: '/results', label: '结果查看', icon: BarChart3 },
];

export const Sidebar = () => {
  return (
    <aside className="w-60 bg-zinc-50 border-r border-zinc-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1
              className="text-xl font-bold text-zinc-900 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              问卷调研
            </h1>
            <p className="text-xs text-zinc-500">Survey Builder</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-200">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
          <p className="text-xs text-blue-800 font-medium mb-1">快捷操作</p>
          <p className="text-xs text-blue-600">所有数据自动保存到浏览器本地</p>
        </div>
      </div>
    </aside>
  );
};
