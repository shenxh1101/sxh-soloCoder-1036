import { ReactNode } from 'react';
import { Card } from '@/components/common/Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export const StatCard = ({ title, value, icon, trend, trendUp, className }: StatCardProps) => {
  return (
    <Card className={cn('p-6', className)} hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500 mb-1">{title}</p>
          <p
            className="text-3xl font-bold text-zinc-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'text-xs font-medium mt-2',
                trendUp ? 'text-green-600' : 'text-zinc-500'
              )}
            >
              {trend}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg">
          {icon}
        </div>
      </div>
    </Card>
  );
};
