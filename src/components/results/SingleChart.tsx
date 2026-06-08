import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/common/Card';
import { Question } from '@/types/survey';
import { calculateQuestionStats } from '@/utils/mockData';
import { Response } from '@/types/survey';
import { useState } from 'react';

interface SingleChartProps {
  question: Question;
  responses: Response[];
}

const COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

export const SingleChart = ({ question, responses }: SingleChartProps) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const stats = calculateQuestionStats(question, responses);

  if (!stats || (stats.type !== 'single' && stats.type !== 'multiple' && stats.type !== 'ranking')) return null;

  const data = stats.data.map(item => ({
    name: item.label.length > 8 ? item.label.slice(0, 8) + '...' : item.label,
    fullName: item.label,
    count: item.count,
    percentage: stats.totalCount > 0 ? ((item.count / stats.totalCount) * 100).toFixed(1) : 0,
  }));

  const chartTitleSuffix = stats.type === 'multiple' ? '（多选）' : stats.type === 'ranking' ? '（排序）' : '';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-zinc-200">
          <p className="text-sm font-medium text-zinc-900">{item.fullName}</p>
          <p className="text-sm text-zinc-600">
            {item.count} 人 ({item.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card hover>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h4 className="font-semibold text-zinc-900">{question.title}{chartTitleSuffix}</h4>
          <p className="text-xs text-zinc-500 mt-1">
            共 {stats.answeredCount} 人回答
          </p>
        </div>
        <div className="flex gap-1 bg-zinc-100 rounded-lg p-1">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              chartType === 'bar'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            柱状图
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              chartType === 'pie'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            饼图
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
