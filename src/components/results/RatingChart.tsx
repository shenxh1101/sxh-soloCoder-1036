import { Card, CardContent, CardHeader } from '@/components/common/Card';
import { Question } from '@/types/survey';
import { calculateQuestionStats } from '@/utils/mockData';
import { Response } from '@/types/survey';
import { Star } from 'lucide-react';

interface RatingChartProps {
  question: Question;
  responses: Response[];
}

export const RatingChart = ({ question, responses }: RatingChartProps) => {
  const stats = calculateQuestionStats(question, responses);

  if (!stats || stats.type !== 'rating') return null;

  const average = (stats as any).average || 0;
  const maxCount = Math.max(...stats.data.map((d: any) => d.count), 1);

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-zinc-900">{question.title}</h4>
            <p className="text-xs text-zinc-500 mt-1">
              共 {stats.answeredCount} 人回答
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-5 h-5"
                  fill={star <= Math.round(average) ? '#f97316' : 'none'}
                  stroke={star <= Math.round(average) ? '#f97316' : '#d4d4d8'}
                />
              ))}
            </div>
            <p
              className="text-2xl font-bold text-orange-500 mt-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {average.toFixed(1)}
              <span className="text-sm font-normal text-zinc-500"> / 5</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((score) => {
            const data = stats.data.find((d: any) => d.value === String(score));
            const count = data?.count || 0;
            const percentage = stats.totalCount > 0 ? (count / stats.totalCount) * 100 : 0;

            return (
              <div key={score} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-zinc-700 w-4">{score}</span>
                  <Star
                    className="w-4 h-4"
                    fill="#f97316"
                    stroke="#f97316"
                  />
                </div>
                <div className="flex-1 h-6 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-20 text-right">
                  <span className="text-sm font-medium text-zinc-700">{count}</span>
                  <span className="text-xs text-zinc-400 ml-1">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
