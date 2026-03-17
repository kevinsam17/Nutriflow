import React, { useState } from 'react';
import { Sparkles, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { estimateNutrition } from '../services/geminiService';
import { NutritionalInfo } from '../types';

interface AIEstimatorProps {
  onEstimateComplete: (data: NutritionalInfo, prompt: string) => void;
  initialPrompt?: string;
}

export const AIEstimator: React.FC<AIEstimatorProps> = ({ onEstimateComplete, initialPrompt = '' }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If initialPrompt changes (e.g. from history reuse), update state
  React.useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleEstimate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await estimateNutrition(prompt);
      onEstimateComplete(data, prompt);
      setPrompt(''); 
    } catch (err: any) {
      // Display the actual error message
      setError(err.message || "Failed to estimate nutrition. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm border border-indigo-100 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-indigo-900">AI Nutrition Estimator</h3>
      </div>
      
      <p className="text-sm text-indigo-700 mb-4">
        Not sure about the macros? Describe your meal and let Gemini AI estimate it for you.
      </p>

      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 2 slices of pepperoni pizza and a coke"
          className="w-full p-4 pr-12 rounded-lg border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] resize-none text-gray-800"
        />
        <button
          onClick={handleEstimate}
          disabled={loading || !prompt.trim()}
          className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
        </button>
      </div>

      {error && (
        <div className="mt-3 flex items-start text-red-600 text-sm bg-red-50 p-3 rounded-md">
          <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};