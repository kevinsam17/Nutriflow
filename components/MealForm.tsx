import React, { useState, useEffect } from 'react';
import { NutritionalInfo } from '../types';
import { PlusCircle, Loader2 } from 'lucide-react';

interface MealFormProps {
  onSubmit: (meal: any) => Promise<void>;
  prefillData?: NutritionalInfo | null;
  onClearPrefill: () => void;
}

export const MealForm: React.FC<MealFormProps> = ({ onSubmit, prefillData, onClearPrefill }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    food: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  useEffect(() => {
    if (prefillData) {
      setFormData({
        food: prefillData.foodName,
        calories: prefillData.calories.toString(),
        protein: prefillData.protein.toString(),
        carbs: prefillData.carbs.toString(),
        fat: prefillData.fat.toString()
      });
    }
  }, [prefillData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      // Create a timeout promise to prevent infinite loading if Firestore hangs
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out")), 5000)
      );

      await Promise.race([
        onSubmit({
          food: formData.food,
          calories: Number(formData.calories),
          protein: Number(formData.protein),
          carbs: Number(formData.carbs),
          fat: Number(formData.fat),
          timestamp: Date.now()
        }),
        timeout
      ]);

      setFormData({ food: '', calories: '', protein: '', carbs: '', fat: '' });
      onClearPrefill();
    } catch (err) {
      console.error(err);
      // Optional: Add user feedback here if needed, but for now we just clear the loading state
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {prefillData ? 'Review & Log Meal' : 'Add Meal Entry'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Food Name</label>
          <input
            type="text"
            name="food"
            required
            value={formData.food}
            onChange={handleChange}
            placeholder="e.g., Grilled Chicken Salad"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
            <input
              type="number"
              name="calories"
              required
              min="0"
              value={formData.calories}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
            <input
              type="number"
              name="protein"
              required
              min="0"
              value={formData.protein}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
            <input
              type="number"
              name="carbs"
              required
              min="0"
              value={formData.carbs}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
            <input
              type="number"
              name="fat"
              required
              min="0"
              value={formData.fat}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <PlusCircle className="w-5 h-5 mr-2" />
                Add to Log
              </>
            )}
          </button>
          {prefillData && (
             <button
             type="button"
             onClick={() => {
                setFormData({ food: '', calories: '', protein: '', carbs: '', fat: '' });
                onClearPrefill();
             }}
             className="px-4 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
           >
             Cancel
           </button>
          )}
        </div>
      </div>
    </form>
  );
};