
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
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="perspective-1000 group">
      <div className="bg-[#f9fbf9] rounded-[3rem] shadow-sm border border-emerald-50 overflow-hidden transition-all duration-500 preserve-3d group-hover:rotate-y-12 group-hover:rotate-x-6 group-hover:shadow-2xl group-hover:shadow-emerald-500/10 group-hover:-translate-y-2 cursor-pointer">
        <div className="absolute top-8 right-8 text-[10px] font-black bg-white text-emerald-600 px-4 py-2 rounded-full uppercase tracking-widest shadow-lg border border-emerald-50 transform translate-z-20">
          #{rank}
        </div>
        
        <div className="p-10">
          <div className="flex items-start justify-between mb-8 transform translate-z-10">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-3 leading-none group-hover:text-emerald-600 transition-colors">{crop.name}</h3>
              <span className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${getRiskColor(crop.riskLevel)}`}>
                {crop.riskLevel} {t.risk}
              </span>
            </div>
          </div>

          <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed min-h-[60px] italic opacity-80 transform translate-z-5">
            "{crop.description}"
          </p>

          <div className="grid grid-cols-2 gap-5 mb-10">
            <div className="p-6 bg-white rounded-3xl shadow-inner border border-emerald-50 flex flex-col justify-center transform transition-transform group-hover:translate-z-30">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">{t.expectedRevenue}</p>
              <p className="text-2xl font-black text-emerald-700 tracking-tight">₹{crop.expectedRevenue.toLocaleString()}</p>
            </div>
            <div className="p-6 bg-white rounded-3xl shadow-inner border border-emerald-50 flex flex-col justify-center transform transition-transform group-hover:translate-z-30">
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">{t.demandScore}</p>
              <p className="text-2xl font-black text-slate-800 tracking-tight">{crop.demandScore}<span className="text-xs opacity-30">/10</span></p>
            </div>
          </div>

          <div className="border-t border-emerald-100/50 pt-8 transform translate-z-10">
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-4">{t.globalMarketInsight}</p>
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className={`h-5 w-5 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)] ${crop.demandScore >= 8 ? 'bg-emerald-500 animate-pulse' : crop.demandScore >= 5 ? 'bg-indigo-400' : 'bg-slate-300'}`}></div>
              <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                {crop.marketPotential}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
