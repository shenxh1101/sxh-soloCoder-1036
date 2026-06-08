import { CircleDot, CheckSquare, Type, Star, ArrowUpDown, Layers } from 'lucide-react';
import { QuestionType } from '@/types/survey';
import { Button } from '@/components/common/Button';

interface QuestionTypeSelectorProps {
  onSelect: (type: QuestionType) => void;
  onClose?: () => void;
}

const questionTypes: { type: QuestionType; label: string; icon: typeof CircleDot; description: string }[] = [
  { type: 'single', label: '单选题', icon: CircleDot, description: '从多个选项中选择一个' },
  { type: 'multiple', label: '多选题', icon: CheckSquare, description: '从多个选项中选择多个' },
  { type: 'text', label: '填空题', icon: Type, description: '用户输入文字回答' },
  { type: 'rating', label: '评分题', icon: Star, description: '用户进行星级评分' },
  { type: 'ranking', label: '排序题', icon: ArrowUpDown, description: '用户对选项进行排序' },
  { type: 'group', label: '分组题', icon: Layers, description: '对题目进行分组管理' },
];

export const QuestionTypeSelector = ({ onSelect, onClose }: QuestionTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {questionTypes.map((item) => (
        <button
          key={item.type}
          onClick={() => {
            onSelect(item.type);
            onClose?.();
          }}
          className="flex flex-col items-center gap-2 p-5 rounded-xl border border-zinc-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <item.icon className="w-6 h-6 text-zinc-600 group-hover:text-blue-700 transition-colors" />
          </div>
          <div className="w-full text-center">
            <p className="text-sm font-semibold text-zinc-900">{item.label}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};
