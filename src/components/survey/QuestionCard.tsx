import { useState } from 'react';
import {
  GripVertical,
  Copy,
  Trash2,
  CircleDot,
  CheckSquare,
  Type,
  Star,
  ArrowUpDown,
  Layers,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { Question, QuestionType } from '@/types/survey';
import { useSurveyStore } from '@/store/useSurveyStore';
import { Input, TextArea, Select } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { OptionEditor } from './OptionEditor';
import { cn } from '@/lib/utils';
import { ConfirmModal } from '@/components/common/Modal';

interface QuestionCardProps {
  question: Question;
  isSelected: boolean;
  onSelect: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

const typeIcons: Record<QuestionType, typeof CircleDot> = {
  single: CircleDot,
  multiple: CheckSquare,
  text: Type,
  rating: Star,
  ranking: ArrowUpDown,
  group: Layers,
};

const typeLabels: Record<QuestionType, string> = {
  single: '单选题',
  multiple: '多选题',
  text: '填空题',
  rating: '评分题',
  ranking: '排序题',
  group: '分组',
};

const typeColors: Record<QuestionType, string> = {
  single: 'bg-blue-100 text-blue-700',
  multiple: 'bg-green-100 text-green-700',
  text: 'bg-purple-100 text-purple-700',
  rating: 'bg-orange-100 text-orange-700',
  ranking: 'bg-pink-100 text-pink-700',
  group: 'bg-zinc-200 text-zinc-700',
};

export const QuestionCard = ({
  question,
  isSelected,
  onSelect,
  dragHandleProps,
}: QuestionCardProps) => {
  const { updateQuestion, duplicateQuestion, deleteQuestion, survey } = useSurveyStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const groups = survey.questions.filter(q => q.type === 'group' && q.id !== question.id);
  const Icon = typeIcons[question.type];

  if (question.type === 'group') {
    return (
      <div
        className={cn(
          'bg-white rounded-xl border-2 transition-all duration-200',
          isSelected ? 'border-blue-500 shadow-lg' : 'border-zinc-200 shadow-sm hover:border-zinc-300'
        )}
        onClick={onSelect}
      >
        <div className="flex items-center gap-3 p-4">
          <div {...dragHandleProps} className="cursor-grab">
            <GripVertical className="w-5 h-5 text-zinc-300 hover:text-zinc-500" />
          </div>
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', typeColors[question.type])}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <Input
              value={question.title}
              onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
              className="font-semibold text-zinc-900 border-0 px-0 focus:ring-0 bg-transparent text-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                duplicateQuestion(question.id);
              }}
              className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => deleteQuestion(question.id)}
          title="删除分组"
          message="确定要删除这个分组吗？分组内的题目不会被删除，但会移出分组。"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl border-2 transition-all duration-200',
        isSelected ? 'border-blue-500 shadow-lg' : 'border-zinc-200 shadow-sm hover:border-zinc-300',
        question.groupId && 'ml-6'
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 p-4 border-b border-zinc-100">
        <div {...dragHandleProps} className="cursor-grab">
          <GripVertical className="w-5 h-5 text-zinc-300 hover:text-zinc-500" />
        </div>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', typeColors[question.type])}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">{typeLabels[question.type]}</span>
            {question.required && (
              <span className="text-xs font-medium text-red-500">必答</span>
            )}
          </div>
          <Input
            value={question.title}
            onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
            placeholder="请输入题目"
            className="font-medium text-zinc-900 border-0 px-0 focus:ring-0 bg-transparent mt-0.5"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              duplicateQuestion(question.id);
            }}
            className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <TextArea
            value={question.description || ''}
            onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
            placeholder="题目说明（选填）"
            className="text-sm resize-none bg-zinc-50"
            rows={2}
            onClick={(e) => e.stopPropagation()}
          />

          {question.options && (
            <OptionEditor questionId={question.id} options={question.options} />
          )}

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={`required-${question.id}`}
                checked={question.required}
                onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-zinc-300 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor={`required-${question.id}`} className="text-sm text-zinc-700">
                必答题
              </label>
            </div>

            {question.options && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`random-${question.id}`}
                  checked={question.randomOptions}
                  onChange={(e) => updateQuestion(question.id, { randomOptions: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-zinc-300 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
                <label htmlFor={`random-${question.id}`} className="text-sm text-zinc-700">
                  选项随机
                </label>
              </div>
            )}

            {question.type === 'multiple' && (
              <>
                <div onClick={(e) => e.stopPropagation()}>
                  <Input
                    type="number"
                    label="最少选择"
                    value={question.minSelect || 1}
                    onChange={(e) => updateQuestion(question.id, { minSelect: Number(e.target.value) })}
                    min={1}
                    className="text-sm"
                  />
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <Input
                    type="number"
                    label="最多选择"
                    value={question.maxSelect || (question.options?.length || 0)}
                    onChange={(e) => updateQuestion(question.id, { maxSelect: Number(e.target.value) })}
                    min={1}
                    className="text-sm"
                  />
                </div>
              </>
            )}

            {groups.length > 0 && (
              <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                <Select
                  label={
                    <span className="flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5" />
                      所属分组
                    </span>
                  }
                  value={question.groupId || ''}
                  onChange={(e) =>
                    updateQuestion(question.id, {
                      groupId: e.target.value || undefined,
                    })
                  }
                  options={[
                    { value: '', label: '无分组' },
                    ...groups.map((g) => ({ value: g.id, label: g.title })),
                  ]}
                  className="text-sm"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteQuestion(question.id)}
        title="删除题目"
        message={`确定要删除题目「${question.title}」吗？此操作无法撤销。`}
      />
    </div>
  );
};
