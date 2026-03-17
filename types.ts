export interface Meal {
  id?: string;
  userId: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number; // Unix timestamp
}

export interface AIHistoryItem {
  id?: string;
  userId: string;
  prompt: string;
  response: NutritionalInfo;
  timestamp: number;
}

export interface NutritionalInfo {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  reasoning?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
}
