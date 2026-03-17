import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, subscribeToMeals } from '../services/firebase';
import { analyzeDailyLog } from '../services/geminiService';
import { Meal, NutritionalInfo } from '../types';
import { DailyStats } from '../components/DailyStats';
import { MealForm } from '../components/MealForm';
import { AIEstimator } from '../components/AIEstimator';
import { FoodSearch } from '../components/FoodSearch';
import { Trash2, BrainCircuit, Sparkles, Database, Loader2 } from 'lucide-react';

interface DashboardProps {
  user: User;
  initialPrompt?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, initialPrompt }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [aiResult, setAiResult] = useState<NutritionalInfo | null>(null);
  const [entryMode, setEntryMode] = useState<'ai' | 'search'>('ai');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    setLoadingMeals(true);
    const unsubscribe = subscribeToMeals(user.uid, (data) => {
      setMeals(data as Meal[]);
      setLoadingMeals(false);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleAddMeal = async (mealData: Omit<Meal, 'id' | 'userId'>) => {
    try {
      await addDoc(collection(db, 'meals'), {
        ...mealData,
        userId: user.uid,
      });
      // Clear analysis when new data is added as it might be stale
      if (analysis) setAnalysis(null);
    } catch (error) {
      console.error("Error adding meal:", error);
      alert("Failed to save meal. Please check your connection.");
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (window.confirm("Delete this entry?")) {
      try {
        await deleteDoc(doc(db, 'meals', id));
        if (analysis) setAnalysis(null);
      } catch (error) {
        console.error("Error deleting meal:", error);
      }
    }
  };

  const handleAIComplete = async (data: NutritionalInfo, prompt: string) => {
    setAiResult(data);
    // Optimistically log history? Or wait for user to confirm in form?
    // We log it to history collection as a record of the AI interaction
    try {
      await addDoc(collection(db, 'history'), {
        userId: user.uid,
        prompt,
        response: data,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const handleRunAnalysis = async () => {
    if (meals.length === 0) return;
    setAnalyzing(true);
    try {
      // Filter for today's meals only
      const today = new Date();
      today.setHours(0,0,0,0);
      const todaysMeals = meals.filter(m => m.timestamp >= today.getTime());
      
      const result = await analyzeDailyLog(todaysMeals);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <DailyStats meals={meals} />
          
          {/* Analysis Section */}
          {meals.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-1 shadow-sm border border-emerald-100">
               {!analysis ? (
                 <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-900">Get Daily Insights</h3>
                      <p className="text-xs text-emerald-700">Let AI analyze your nutrient balance today.</p>
                    </div>
                    <button 
                      onClick={handleRunAnalysis}
                      disabled={analyzing}
                      className="flex items-center gap-2 bg-white text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-emerald-50 transition-colors"
                    >
                      {analyzing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <BrainCircuit className="w-4 h-4" />
                          Analyze Day
                        </>
                      )}
                    </button>
                 </div>
               ) : (
                 <div className="p-5 relative">
                   <div className="flex items-start gap-3">
                     <BrainCircuit className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
                     <div>
                       <h3 className="font-semibold text-emerald-900 mb-1">AI Nutrition Feedback</h3>
                       <p className="text-emerald-800 text-sm leading-relaxed">{analysis}</p>
                     </div>
                     <button 
                       onClick={() => setAnalysis(null)}
                       className="text-emerald-400 hover:text-emerald-600 ml-auto"
                     >
                       ×
                     </button>
                   </div>
                 </div>
               )}
            </div>
          )}

          {/* Entry Method Tabs */}
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setEntryMode('ai')}
              className={`pb-3 text-sm font-medium flex items-center gap-2 transition-colors relative ${
                entryMode === 'ai' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Estimate
              {entryMode === 'ai' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
            </button>
            <button
              onClick={() => setEntryMode('search')}
              className={`pb-3 text-sm font-medium flex items-center gap-2 transition-colors relative ${
                entryMode === 'search' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Database className="w-4 h-4" />
              Search Database
              {entryMode === 'search' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
            </button>
          </div>

          <div className="mt-4">
            {entryMode === 'ai' ? (
              <AIEstimator 
                onEstimateComplete={handleAIComplete} 
                initialPrompt={initialPrompt} 
              />
            ) : (
              <FoodSearch onSelect={(data) => setAiResult(data)} />
            )}
          </div>
          
          <MealForm 
            onSubmit={handleAddMeal} 
            prefillData={aiResult}
            onClearPrefill={() => setAiResult(null)}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Recent Entries</h3>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[calc(100vh-400px)] overflow-y-auto">
              {loadingMeals ? (
                <div className="p-8 flex justify-center text-emerald-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : meals.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No meals logged yet today.
                </div>
              ) : (
                meals.map((meal) => (
                  <div key={meal.id} className="p-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-gray-900">{meal.food}</h4>
                      <button 
                        onClick={() => meal.id && handleDeleteMeal(meal.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span className="font-medium text-emerald-600">{meal.calories} kcal</span>
                      <div className="flex gap-2 text-xs">
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>F: {meal.fat}g</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};