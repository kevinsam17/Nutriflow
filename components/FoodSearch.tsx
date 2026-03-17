import React, { useState } from 'react';
import { Search, Database, Loader2, AlertCircle } from 'lucide-react';
import { searchUSDA } from '../services/foodService';
import { NutritionalInfo } from '../types';

interface FoodSearchProps {
  onSelect: (data: NutritionalInfo) => void;
}

export const FoodSearch: React.FC<FoodSearchProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NutritionalInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const data = await searchUSDA(query);
      setResults(data);
      if (data.length === 0) setError("No results found in USDA database.");
    } catch (err: any) {
      setError(err.message || "Search failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-gray-900">USDA Food Search</h3>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Cheddar Cheese, Apple, Grilled Chicken"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
        />
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1.5 bg-gray-900 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center mb-4">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {results.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => {
                onSelect(item);
                setResults([]);
                setQuery('');
              }}
              className="p-3 border border-gray-100 rounded-lg hover:bg-emerald-50 hover:border-emerald-100 cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">{item.foodName}</span>
                <span className="text-xs text-gray-400 group-hover:text-emerald-600 flex items-center">
                  Select <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex gap-2">
                <span>{item.calories} kcal</span>
                <span>P: {item.protein}g</span>
                <span>C: {item.carbs}g</span>
                <span>F: {item.fat}g</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper icon
const ArrowRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);