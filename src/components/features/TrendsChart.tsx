'use client';

import { WaterQualityResult } from '@/lib/types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

interface TrendsChartProps {
  data: WaterQualityResult[];
  limit?: string | null;
  reference?: string | null;
}

export function TrendsChart({ data, limit, reference }: TrendsChartProps) {
  const chartData = [...data].reverse().map(item => ({
    date: new Date(item.date_prelevement).toLocaleDateString(),
    value: item.resultat_numerique || 0,
    fullDate: item.date_prelevement
  }));

  const parseRef = (ref: string | null | undefined) => {
    if (!ref) return null;
    const match = ref.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  };

  const limitVal = parseRef(limit);
  const refVal = parseRef(reference);

  return (
    <div className="h-[200px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="date" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#94a3b8' }}
          />
          <YAxis 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#94a3b8' }}
          />
          <RechartsTooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#6366f1' }}
          />
          {limitVal !== null && (
            <ReferenceLine y={limitVal} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Limite', fill: '#ef4444', fontSize: 10 }} />
          )}
          {refVal !== null && (
            <ReferenceLine y={refVal} stroke="#eab308" strokeDasharray="3 3" label={{ position: 'right', value: 'Ref', fill: '#eab308', fontSize: 10 }} />
          )}
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#6366f1" 
            strokeWidth={2} 
            dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
