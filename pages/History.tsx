import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { subscribeToHistory } from '../services/firebase';
import { AIHistoryItem } from '../types';
import { RefreshCw, ArrowUpRight } from 'lucide-react';

interface HistoryProps {
  user: User;
  onReuse: (prompt: string) => void;
}

export const History: React.FC<HistoryProps> = ({ user, onReuse }) => {
  const [history, setHistory] = useState<AIHistoryItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToHistory(user.uid, (data) => {
      setHistory(data as AIHistoryItem[]);
    });
    return () => unsubscribe();
  }, [user.uid]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Consultation History</h1>
          <p className="text-gray-500 mt-1">Review your past queries and their estimated nutrition.</p>
        </div>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500">No history found. Try asking the AI about a meal!</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium text-lg">"{item.prompt}"</p>
                  
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="font-semibold text-gray-700">
                        {item.response.foodName}
                      </div>
                      <div className="text-gray-600">
                        Calories: <span className="font-medium text-gray-900">{item.response.calories}</span>
                      </div>
                      <div className="text-gray-600">
                        P: <span className="font-medium text-gray-900">{item.response.protein}g</span>
                      </div>
                      <div className="text-gray-600">
                         C: <span className="font-medium text-gray-900">{item.response.carbs}g</span>
                      </div>
                      <div className="text-gray-600">
                         F: <span className="font-medium text-gray-900">{item.response.fat}g</span>
                      </div>
                    </div>
                    {item.response.reasoning && (
                      <p className="mt-2 text-xs text-gray-500 italic">
                        Note: {item.response.reasoning}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onReuse(item.prompt)}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reuse Prompt
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
