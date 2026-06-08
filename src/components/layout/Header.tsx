import { useSurveyStore } from '@/store/useSurveyStore';
import { Input } from '@/components/common/Input';
import { TextArea } from '@/components/common/Input';
import { Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useState } from 'react';

export const Header = () => {
  const { survey, updateSurveyTitle, updateSurveyDescription, generateMockResponses } = useSurveyStore();
  const [showGenerate, setShowGenerate] = useState(false);

  return (
    <header className="bg-white border-b border-zinc-200 px-8 py-5 sticky top-0 z-30">
      <div className="flex items-start justify-between gap-8">
        <div className="flex-1 min-w-0">
          <Input
            value={survey.title}
            onChange={(e) => updateSurveyTitle(e.target.value)}
            placeholder="请输入问卷标题"
            className="text-2xl font-bold border-0 px-0 focus:ring-0 bg-transparent"
            style={{ fontFamily: "'Playfair Display', serif" }}
          />
          <TextArea
            value={survey.description || ''}
            onChange={(e) => updateSurveyDescription(e.target.value)}
            placeholder="请输入问卷描述（选填）"
            className="mt-2 border-0 px-0 focus:ring-0 bg-transparent resize-none text-zinc-600"
            rows={2}
          />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGenerate(!showGenerate)}
            >
              <RefreshCw className="w-4 h-4" />
              模拟数据
            </Button>
            {showGenerate && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-zinc-200 p-3 w-52 z-50">
                <p className="text-xs text-zinc-500 mb-2">生成模拟答卷数量</p>
                <div className="flex gap-2">
                  {[20, 50, 100].map((num) => (
                    <Button
                      key={num}
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        generateMockResponses(num);
                        setShowGenerate(false);
                      }}
                    >
                      {num}份
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Save className="w-4 h-4" />
            <span>自动保存</span>
          </div>
        </div>
      </div>
    </header>
  );
};
