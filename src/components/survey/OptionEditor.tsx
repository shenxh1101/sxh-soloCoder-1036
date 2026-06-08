import { useState } from 'react';
import { GripVertical, Trash2, Plus, Edit3, X } from 'lucide-react';
import { Option } from '@/types/survey';
import { useSurveyStore } from '@/store/useSurveyStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { TextArea } from '@/components/common/Input';

interface OptionEditorProps {
  questionId: string;
  options: Option[];
}

export const OptionEditor = ({ questionId, options }: OptionEditorProps) => {
  const { updateOption, deleteOption, addOption, batchUpdateOptions } = useSurveyStore();
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [batchText, setBatchText] = useState(options.map(o => o.label).join('\n'));

  const handleBatchSave = () => {
    const labels = batchText.split('\n').filter(l => l.trim());
    if (labels.length > 0) {
      batchUpdateOptions(questionId, labels);
    }
    setShowBatchEdit(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-500">选项设置</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setBatchText(options.map(o => o.label).join('\n'));
            setShowBatchEdit(true);
          }}
          className="text-xs h-7 px-2"
        >
          <Edit3 className="w-3 h-3" />
          批量编辑
        </Button>
      </div>

      {options.map((option, index) => (
        <div key={option.id} className="flex items-center gap-2 group">
          <GripVertical className="w-4 h-4 text-zinc-300 flex-shrink-0 cursor-grab" />
          <span className="text-xs text-zinc-400 w-5">{index + 1}.</span>
          <Input
            value={option.label}
            onChange={(e) => updateOption(questionId, option.id, e.target.value)}
            placeholder={`选项 ${index + 1}`}
            className="h-9 py-1 text-sm"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteOption(questionId, option.id)}
            disabled={options.length <= 2}
            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => addOption(questionId)}
        className="w-full mt-2 text-zinc-500 border-dashed"
      >
        <Plus className="w-4 h-4" />
        添加选项
      </Button>

      <Modal
        isOpen={showBatchEdit}
        onClose={() => setShowBatchEdit(false)}
        title="批量编辑选项"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowBatchEdit(false)}>
              <X className="w-4 h-4" />
              取消
            </Button>
            <Button onClick={handleBatchSave}>保存</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">
            每行输入一个选项，支持快速批量添加和修改
          </p>
          <TextArea
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            placeholder="选项1&#10;选项2&#10;选项3"
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-zinc-500">
            当前有 {options.length} 个选项，保存后将替换为 {batchText.split('\n').filter(l => l.trim()).length} 个选项
          </p>
        </div>
      </Modal>
    </div>
  );
};
