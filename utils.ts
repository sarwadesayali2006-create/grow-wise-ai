
import { Crop, UserInputs, RecommendationResult } from './types';

/**
 * Scoring logic based on the user's requirements:
 * +25 if season matches
 * +20 if soil matches
 * +20 if water matches
 * + (DemandScore * 3)
 * -10 if RiskLevel is High
 * -5 if RiskLevel is Medium
 */
export const calculateCropScore = (crop: Crop, inputs: UserInputs): number => {
  let score = 0;

  if (crop.season === inputs.season) score += 25;
  if (crop.soil === inputs.soil) score += 20;
  if (crop.water === inputs.water) score += 20;

  score += (crop.demandScore * 3);

  if (crop.riskLevel === 'High') score -= 10;
  else if (crop.riskLevel === 'Medium') score -= 5;

  return score;
};

/**
 * Market Potential logic:
 * If DemandScore ≥ 8 → “Strong Export Opportunity”
 * If 5–7 → “Moderate Global Potential”
 * Else → “Emerging Market”
 */
export const getMarketPotential = (demandScore: number): string => {
  if (demandScore >= 8) return "Strong Export Opportunity";
  if (demandScore >= 5) return "Moderate Global Potential";
  return "Emerging Market";
};

export const getRecommendations = (crops: Crop[], inputs: UserInputs): RecommendationResult[] => {
  return crops.map(crop => {
    const score = calculateCropScore(crop, inputs);
    const expectedRevenue = crop.avgPrice * crop.yieldPerAcre * inputs.landSize;
    const marketPotential = getMarketPotential(crop.demandScore);
    
    return {
      ...crop,
      score,
      expectedRevenue,
      marketPotential
    };
  }).sort((a, b) => b.score - a.score);
};
