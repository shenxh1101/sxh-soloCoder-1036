import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/common/Card';
import { Question } from '@/types/survey';
import { calculateQuestionStats } from '@/utils/mockData';
import { Response } from '@/types/survey';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface TextAnswersProps {
  question: Question;
  responses: Response[];
}

export const TextAnswers = ({ question, responses }: TextAnswersProps) => {
  const [expanded, setExpanded] = useState(false);
  const stats = calculateQuestionStats(question, responses);

  if (!stats || stats.type !== 'text') return null;

  const answers = stats.data as string[];
  const displayAnswers = expanded ? answers : answers.slice(0, 5);

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-zinc-900">{question.title}</h4>
            <p className="text-xs text-zinc-500 mt-1">
              共 {stats.answeredCount} 条有效回答
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-lg">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayAnswers.map((answer, index) => (
            <div
              key={index}
              className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all"
            >
              <p className="text-sm text-zinc-700 leading-relaxed">{answer}</p>
            </div>
          ))}
        </div>
        {answers.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-4 text-zinc-500 hover:text-zinc-700"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                收起回答
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                查看全部 {answers.length} 条回答
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
