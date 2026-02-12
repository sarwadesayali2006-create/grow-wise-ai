
import React from 'react';
import { RecommendationResult } from '../types';
import { translations, Language } from '../translations';

interface RecommendationCardProps {
  crop: RecommendationResult;
  rank: number;
  language: Language;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ crop, rank, language }) => {
  const t = translations[language];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getRiskLabel = (risk: string) => {
    if (language === 'hi') {
      if (risk === 'Low') return 'कम';
      if (risk === 'Medium') return 'मध्यम';
      if (risk === 'High') return 'उच्च';
    }
    return risk;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow relative">
      <div className="absolute top-4 right-4 text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase">
        #{rank}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{crop.name}</h3>
            <span className={`mt-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(crop.riskLevel)}`}>
              {getRiskLabel(crop.riskLevel)} {t.risk}
            </span>
          </div>
        </div>

        <p className="text-slate-600 text-sm mb-6 leading-relaxed min-h-[40px]">
          {crop.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.expectedRevenue}</p>
            <p className="text-lg font-bold text-emerald-700">₹{crop.expectedRevenue.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.demandScore}</p>
            <p className="text-lg font-bold text-slate-700">{crop.demandScore}/10</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">{t.globalMarketInsight}</p>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${crop.demandScore >= 8 ? 'bg-blue-500' : crop.demandScore >= 5 ? 'bg-indigo-400' : 'bg-slate-300'}`}></div>
            <p className="text-sm font-semibold text-slate-700">
              {language === 'hi' ? translations.hi[crop.marketPotential.includes('Strong') ? 'strongExport' : crop.marketPotential.includes('Moderate') ? 'moderateGlobal' : 'emergingMarket'] : crop.marketPotential}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
