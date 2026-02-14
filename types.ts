
export type Season = 'Kharif' | 'Rabi' | 'Summer';
export type Water = 'Low' | 'Medium' | 'High';
export type Soil = 'Loamy' | 'Clay' | 'Black' | 'Sandy';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface Crop {
  id: string;
  name: string;
  season: Season;
  water: Water;
  soil: Soil;
  avgPrice: number;
  demandScore: number;
  riskLevel: RiskLevel;
  yieldPerAcre: number;
  description: string;
}

export interface UserInputs {
  season: Season;
  soil: Soil;
  water: Water;
  landSize: number;
}

export interface RecommendationResult extends Crop {
  score: number;
  expectedRevenue: number;
  marketPotential: string;
}

export interface FarmReminder {
  id: string;
  time: string;
  task: string;
  isCompleted: boolean;
  type: 'irrigation' | 'fertilizer' | 'harvest' | 'other';
}
