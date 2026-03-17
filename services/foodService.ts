import { NutritionalInfo } from '../types';

// TO THE DEVELOPER: Replace these with your actual API keys.
// Get USDA Key: https://fdc.nal.usda.gov/api-key-signup.html
const USDA_API_KEY = "GcxjyyxtURANXSO0nqC8Il39FeeV5IYMwM3w1RwP";

const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

export const searchUSDA = async (query: string): Promise<NutritionalInfo[]> => {

  const response = await fetch(
    `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${USDA_API_KEY}`
  );

  if (!response.ok) throw new Error("Failed to fetch from USDA");

  const data = await response.json();
  
  return data.foods.map((item: any) => {
    // Helper function to robustly find nutrients
    // The USDA API can be inconsistent with IDs between datasets (Foundation vs SR Legacy vs Branded)
    // We prioritize matching by 'nutrientNumber' (the standard code), then fall back to 'nutrientId'.
    const getNutrientValue = (nutrientNum: string, nutrientIdFallback: number) => {
      // Find matches for either the string Number code or the internal ID
      const n = item.foodNutrients.find((nutrient: any) => 
        nutrient.nutrientNumber === nutrientNum || 
        nutrient.nutrientId === nutrientIdFallback
      );
      return n ? Math.round(n.value) : 0;
    };

    // USDA Nutrient Mapping:
    // Energy (KCAL): Number "208", ID 1008
    // Protein: Number "203", ID 1003
    // Fat: Number "204", ID 1004
    // Carbs: Number "205", ID 1005
    
    const calories = getNutrientValue("208", 1008);
    const protein = getNutrientValue("203", 1003);
    const fat = getNutrientValue("204", 1004);
    const carbs = getNutrientValue("205", 1005);

    // Determine serving size text
    let portionText = "per 100g"; // USDA standard fallback
    if (item.servingSize && item.servingSizeUnit) {
      portionText = `per ${item.servingSize} ${item.servingSizeUnit}`;
    }

    // Determine display name (include Brand if available)
    let displayName = item.description;
    if (item.brandOwner) {
      displayName = `${item.description} (${item.brandOwner})`;
    }
    
    // Capitalize appropriately if USDA returns all caps (simple title case)
    displayName = displayName.replace(/\w\S*/g, (txt: string) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    return {
      foodName: displayName,
      calories,
      protein,
      carbs,
      fat,
      reasoning: `USDA Data (${portionText})`
    };
  });
};