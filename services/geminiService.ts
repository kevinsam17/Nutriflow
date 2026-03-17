import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { NutritionalInfo, Meal } from "../types";

// According to guidelines:
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// Assume this variable is pre-configured, valid, and accessible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const estimateNutrition = async (prompt: string): Promise<NutritionalInfo> => {
  try {
    const modelId = "gemini-2.5-flash";
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: `Estimate the nutritional information for: "${prompt}". 
                 Provide a single summary for the entire meal description. 
                 Return the results in JSON format with keys: foodName (short descriptive name), calories (number), protein (grams), carbs (grams), fat (grams), and reasoning (short text explanation).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ["foodName", "calories", "protein", "carbs", "fat"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      console.warn("Empty response from AI:", response);
      throw new Error("AI returned an empty response. It might have been blocked by safety settings.");
    }
    
    return JSON.parse(text) as NutritionalInfo;
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    // Return a clean error message to the UI
    throw new Error(error.message || "Failed to connect to AI service");
  }
};

export const analyzeDailyLog = async (meals: Meal[]): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash";
    
    const mealSummary = meals.map(m => 
      `- ${m.food}: ${m.calories}kcal, P:${m.protein}g, C:${m.carbs}g, F:${m.fat}g`
    ).join('\n');

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: `Analyze this daily food log:\n${mealSummary}\n\n
                 Provide a brief (max 3 sentences) friendly feedback on the nutritional balance. 
                 Highlight one positive thing and one specific suggestion for improvement. 
                 Address the user directly.`,
    });

    return response.text || "Unable to generate analysis.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Sorry, I couldn't analyze your data right now.";
  }
};