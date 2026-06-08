import { useState, useMemo, useEffect } from 'react';
import { CircleDot, CheckSquare, Star, ArrowUpDown, GripVertical, AlertCircle } from 'lucide-react';
import { Question } from '@/types/survey';
import { cn } from '@/lib/utils';
import { useSurveyStore } from '@/store/useSurveyStore';
import { getNextQuestionId } from '@/utils/logic';
import { Button } from '@/components/common/Button';

interface PreviewRendererProps {
  previewMode?: 'mobile' | 'desktop';
}

interface ValidationError {
  message: string;
}

export const PreviewRenderer = ({ previewMode = 'desktop' }: PreviewRendererProps) => {
  const { survey } = useSurveyStore();
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [showWelcome, setShowWelcome] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);
  const [error, setError] = useState<ValidationError | null>(null);
  const [shuffledOptionsMap, setShuffledOptionsMap] = useState<Record<string, Question['options']>>({});

  const validQuestions = useMemo(
    () => survey.questions.filter(q => q.type !== 'group'),
    [survey.questions]
  );

  const firstQuestionId = validQuestions[0]?.id || null;

  useEffect(() => {
    if (currentQuestionId) {
      const question = survey.questions.find(q => q.id === currentQuestionId);
      if (question && question.randomOptions && question.options && !shuffledOptionsMap[currentQuestionId]) {
        const shuffled = [...question.options].sort(() => Math.random() - 0.5);
        setShuffledOptionsMap(prev => ({ ...prev, [currentQuestionId]: shuffled }));
      }
    }
  }, [currentQuestionId, survey.questions, shuffledOptionsMap]);

  const startSurvey = () => {
    setShowWelcome(false);
    setCurrentQuestionId(firstQuestionId);
    setAnswers({});
    setShuffledOptionsMap({});
    setError(null);
  };

  const restartSurvey = () => {
    setShowWelcome(true);
    setShowThankYou(false);
    setCurrentQuestionId(null);
    setAnswers({});
    setShuffledOptionsMap({});
    setError(null);
  };

  const handleAnswer = (questionId: string, answer: string | string[] | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setError(null);
  };

  const validateAnswer = (question: Question): ValidationError | null => {
    if (!question.required) return null;

    const answer = answers[question.id];

    switch (question.type) {
      case 'single':
      case 'ranking':
        if (!answer) {
          return { message: '请选择一个选项' };
        }
        break;
      case 'multiple':
        const selectedCount = Array.isArray(answer) ? answer.length : 0;
        if (selectedCount === 0) {
          return { message: '请至少选择一个选项' };
        }
        if (question.minSelect && selectedCount < question.minSelect) {
          return { message: `请至少选择 ${question.minSelect} 个选项` };
        }
        if (question.maxSelect && selectedCount > question.maxSelect) {
          return { message: `最多只能选择 ${question.maxSelect} 个选项` };
        }
        break;
      case 'text':
        if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
          return { message: '请输入您的回答' };
        }
        break;
      case 'rating':
        if (!answer || (typeof answer === 'number' && answer === 0)) {
          return { message: '请选择评分' };
        }
        break;
    }

    return null;
  };

  const handleNext = () => {
    if (!currentQuestionId) return;

    const currentQuestion = survey.questions.find(q => q.id === currentQuestionId);
    if (!currentQuestion) return;

    const validationError = validateAnswer(currentQuestion);
    if (validationError) {
      setError(validationError);
      return;
    }

    const nextId = getNextQuestionId(
      currentQuestionId,
      survey.questions,
      survey.logicRules,
      answers
    );

    if (nextId) {
      setCurrentQuestionId(nextId);
      setError(null);
    } else {
      setShowThankYou(true);
    }
  };

  const handlePrev = () => {
    if (!currentQuestionId) return;
    const currentIndex = validQuestions.findIndex(q => q.id === currentQuestionId);
    if (currentIndex > 0) {
      setCurrentQuestionId(validQuestions[currentIndex - 1].id);
      setError(null);
    }
  };

  const handleSingleSelect = (questionId: string, value: string) => {
    handleAnswer(questionId, value);
  };

  const handleMultipleToggle = (questionId: string, value: string) => {
    const currentAnswer = answers[questionId];
    const currentArray = Array.isArray(currentAnswer) ? currentAnswer : [];
    
    if (currentArray.includes(value)) {
      const newAnswer = currentArray.filter(v => v !== value);
      handleAnswer(questionId, newAnswer);
    } else {
      const question = survey.questions.find(q => q.id === questionId);
      if (question?.maxSelect && currentArray.length >= question.maxSelect) {
        setError({ message: `最多只能选择 ${question.maxSelect} 个选项` });
        return;
      }
      const newAnswer = [...currentArray, value];
      handleAnswer(questionId, newAnswer);
    }
  };

  const currentQuestion = survey.questions.find(q => q.id === currentQuestionId);
  const currentIndex = validQuestions.findIndex(q => q.id === currentQuestionId);
  const progress = validQuestions.length > 0 ? ((currentIndex + 1) / validQuestions.length) * 100 : 0;

  const getOptions = (question: Question) => {
    if (!question.options) return [];
    if (question.randomOptions && shuffledOptionsMap[question.id]) {
      return shuffledOptionsMap[question.id]!;
    }
    return question.options;
  };

  const renderQuestion = (question: Question) => {
    const options = getOptions(question);
    const answer = answers[question.id];

    switch (question.type) {
      case 'single':
        return (
          <div className="space-y-3">
            {options.map((option) => (
              <div
                key={option.id}
                onClick={() => handleSingleSelect(question.id, option.value)}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                  answer === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    answer === option.value ? 'border-blue-500 bg-blue-500' : 'border-zinc-300'
                  )}
                >
                  {answer === option.value && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-sm text-zinc-700">{option.label}</span>
              </div>
            ))}
          </div>
        );

      case 'multiple':
        return (
          <div className="space-y-3">
            {options.map((option) => {
              const isSelected = Array.isArray(answer) && answer.includes(option.value);
              return (
                <div
                  key={option.id}
                  onClick={() => handleMultipleToggle(question.id, option.value)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-zinc-300'
                    )}
                  >
                    {isSelected && (
                      <CheckSquare className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-zinc-700">{option.label}</span>
                </div>
              );
            })}
            {(question.minSelect || question.maxSelect) && (
              <p className="text-xs text-zinc-500 mt-2">
                {question.minSelect && `最少选择 ${question.minSelect} 项`}
                {question.minSelect && question.maxSelect && '，'}
                {question.maxSelect && `最多选择 ${question.maxSelect} 项`}
              </p>
            )}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={(answer as string) || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="请输入您的回答..."
            className="w-full h-32 px-4 py-3 rounded-xl border-2 border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm"
          />
        );

      case 'rating':
        return (
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => handleAnswer(question.id, score)}
                className={cn(
                  'p-2 rounded-xl transition-all duration-200 hover:scale-110',
                  Number(answer) >= score ? 'text-orange-500' : 'text-zinc-300'
                )}
              >
                <Star
                  className="w-10 h-10"
                  fill={Number(answer) >= score ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
        );

      case 'ranking':
        const rankingAnswer = (answer as string[]) || [];
        const remainingOptions = options.filter(
          opt => !rankingAnswer.includes(opt.value)
        );

        return (
          <div className="space-y-4">
            {rankingAnswer.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500">已排序</p>
                {rankingAnswer.map((value, index) => {
                  const option = options.find(o => o.value === value);
                  return (
                    <div
                      key={value}
                      className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200"
                    >
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm text-zinc-700 flex-1">{option?.label}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newAnswer = [...rankingAnswer];
                          newAnswer.splice(index, 1);
                          handleAnswer(question.id, newAnswer);
                        }}
                        className="text-zinc-400 hover:text-red-500 text-xs"
                      >
                        移除
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {remainingOptions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500">点击选择（按顺序）</p>
                {remainingOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      handleAnswer(question.id, [...rankingAnswer, option.value]);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-zinc-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <GripVertical className="w-4 h-4 text-zinc-300" />
                    <CircleDot className="w-4 h-4 text-zinc-300" />
                    <span className="text-sm text-zinc-600">{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (showWelcome) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
          <CircleDot className="w-10 h-10 text-white" />
        </div>
        <h2
          className="text-2xl font-bold text-zinc-900 mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {survey.title}
        </h2>
        {survey.description && (
          <p className="text-zinc-600 mb-8 max-w-md">{survey.description}</p>
        )}
        <p className="text-sm text-zinc-500 mb-6">
          共 {validQuestions.length} 道题目 · 预计用时约 3 分钟
        </p>
        <Button size="lg" onClick={startSurvey}>
          开始答题
        </Button>
      </div>
    );
  }

  if (showThankYou) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
          <CheckSquare className="w-10 h-10 text-white" />
        </div>
        <h2
          className="text-2xl font-bold text-zinc-900 mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          感谢您的参与！
        </h2>
        <p className="text-zinc-600 mb-8">
          您的回答已成功提交，感谢您抽出宝贵时间参与本次调研。
        </p>
        <Button variant="outline" onClick={restartSurvey}>
          重新答题
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-1 bg-zinc-100 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-xs text-zinc-500 mb-4">
        第 {currentIndex + 1} / {validQuestions.length} 题
      </div>

      {currentQuestion && (
        <div className="flex-1">
          <div className="flex items-start gap-2 mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 flex-1">
              {currentQuestion.title}
              {currentQuestion.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h3>
          </div>

          {currentQuestion.description && (
            <p className="text-sm text-zinc-500 mb-6 bg-zinc-50 p-3 rounded-lg">
              {currentQuestion.description}
            </p>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 animate-in">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-600">{error.message}</span>
            </div>
          )}

          {renderQuestion(currentQuestion)}
        </div>
      )}

      <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-zinc-100">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          上一题
        </Button>
        <Button onClick={handleNext}>
          {currentIndex === validQuestions.length - 1 ? '提交' : '下一题'}
        </Button>
      </div>
    </div>
  );
};
