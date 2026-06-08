import { useState, useMemo } from 'react';
import { Search, Plus, CircleDot, CheckSquare, Type, Star, ArrowUpDown, Layers } from 'lucide-react';
import { useSurveyStore } from '@/store/useSurveyStore';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { questionLibrary, categories } from '@/data/questionLibrary';
import { QuestionType } from '@/types/survey';
import { cn } from '@/lib/utils';

const typeIcons: Record<QuestionType, typeof CircleDot> = {
  single: CircleDot,
  multiple: CheckSquare,
  text: Type,
  rating: Star,
  ranking: ArrowUpDown,
  group: Layers,
};

const typeColors: Record<QuestionType, string> = {
  single: 'bg-blue-100 text-blue-700',
  multiple: 'bg-green-100 text-green-700',
  text: 'bg-purple-100 text-purple-700',
  rating: 'bg-orange-100 text-orange-700',
  ranking: 'bg-pink-100 text-pink-700',
  group: 'bg-zinc-200 text-zinc-700',
};

const typeLabels: Record<QuestionType, string> = {
  single: '单选题',
  multiple: '多选题',
  text: '填空题',
  rating: '评分题',
  ranking: '排序题',
  group: '分组',
};

export const LibraryPage = () => {
  const { addQuestionFromTemplate } = useSurveyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const filteredQuestions = useMemo(() => {
    return questionLibrary.filter((q) => {
      const matchesSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === '全部' || q.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleAddToSurvey = (template: typeof questionLibrary[0]) => {
    addQuestionFromTemplate({
      type: template.type,
      title: template.title,
      options: template.options,
    });
    setAddedIds((prev) => new Set(prev).add(template.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(template.id);
        return next;
      });
    }, 2000);
  };

  return (
    <div className="flex-1 min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="text-xl font-bold text-zinc-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              题目库
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              选择常用题目模板，快速添加到问卷
            </p>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索题目..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                selectedCategory === category
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuestions.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-xl border-2 border-dashed border-zinc-300">
              <Search className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                没有找到匹配的题目
              </h3>
              <p className="text-sm text-zinc-500">
                试试其他搜索关键词或分类
              </p>
            </div>
          ) : (
            filteredQuestions.map((template) => {
              const Icon = typeIcons[template.type];
              const isAdded = addedIds.has(template.id);

              return (
                <Card key={template.id} hover className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center',
                            typeColors[template.type]
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-zinc-500">
                          {typeLabels[template.type]}
                        </span>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-full">
                        {template.category}
                      </span>
                    </div>

                    <h4 className="font-medium text-zinc-900 mb-3 line-clamp-2">
                      {template.title}
                    </h4>

                    {template.options && (
                      <div className="space-y-1.5 mb-4">
                        {template.options.slice(0, 3).map((opt) => (
                          <div
                            key={opt.id}
                            className="flex items-center gap-2 text-sm text-zinc-500"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                            <span className="truncate">{opt.label}</span>
                          </div>
                        ))}
                        {template.options.length > 3 && (
                          <p className="text-xs text-zinc-400">
                            还有 {template.options.length - 3} 个选项...
                          </p>
                        )}
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant={isAdded ? 'secondary' : 'primary'}
                      className={cn(
                        'w-full',
                        isAdded && 'bg-green-500 hover:bg-green-600'
                      )}
                      onClick={() => handleAddToSurvey(template)}
                    >
                      <Plus className="w-4 h-4" />
                      {isAdded ? '已添加' : '添加到问卷'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
