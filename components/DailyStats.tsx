import React from 'react';
import { Meal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DailyStatsProps {
  meals: Meal[];
}

export const DailyStats: React.FC<DailyStatsProps> = ({ meals }) => {
  // Filter for today's meals
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  
  const todaysMeals = meals.filter(meal => {
    // Safety check for valid timestamp
    const ts = typeof meal.timestamp === 'number' ? meal.timestamp : 0;
    return ts >= todayTime;
  });

  const totals = todaysMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (Number(meal.calories) || 0),
      protein: acc.protein + (Number(meal.protein) || 0),
      carbs: acc.carbs + (Number(meal.carbs) || 0),
      fat: acc.fat + (Number(meal.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const data = [
    { name: 'Protein', value: totals.protein, color: '#10b981' }, // Emerald 500
    { name: 'Carbs', value: totals.carbs, color: '#3b82f6' },     // Blue 500
    { name: 'Fat', value: totals.fat, color: '#f59e0b' },        // Amber 500
  ];

  // If no data or all zero, show empty state in chart
  const hasData = data.some(d => d.value > 0);
  const chartData = hasData ? data : [{ name: 'Empty', value: 1, color: '#e5e7eb' }];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 uppercase font-medium">Calories</p>
            <p className="text-3xl font-bold text-gray-900">{Math.round(totals.calories)} <span className="text-base font-normal text-gray-500">kcal</span></p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <p className="text-xs text-emerald-700 font-bold uppercase">Protein</p>
              <p className="text-xl font-bold text-emerald-900">{Math.round(totals.protein)}g</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 font-bold uppercase">Carbs</p>
              <p className="text-xl font-bold text-blue-900">{Math.round(totals.carbs)}g</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-700 font-bold uppercase">Fat</p>
              <p className="text-xl font-bold text-amber-900">{Math.round(totals.fat)}g</p>
            </div>
          </div>
        </div>

        <div className="h-48 w-full flex justify-center items-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={hasData ? 5 : 0}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {hasData && <Tooltip formatter={(value: number) => Math.round(value)} />}
                </PieChart>
              </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};