
import React from 'react';
import { UserInputs, Season, Soil, Water } from '../types';
import { translations, Language } from '../translations';

interface SidebarProps {
  inputs: UserInputs;
  setInputs: (inputs: UserInputs) => void;
  onGetRecommendations: () => void;
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ inputs, setInputs, onGetRecommendations, onLogout, language, setLanguage }) => {
  const t = translations[language];

  const handleChange = (field: keyof UserInputs, value: string | number) => {
    setInputs({ ...inputs, [field]: value });
  };

  return (
    <div className="bg-[#f2f7f4] p-6 h-full border-r border-emerald-100 flex flex-col shadow-inner">
      <div className="mb-8">
        <h2 className="text-xl font-black text-emerald-900 flex items-center gap-2 uppercase tracking-tight">
          <span className="bg-emerald-200/50 p-1.5 rounded-lg">⚙️</span> {t.configuration}
        </h2>
        <p className="text-sm text-emerald-700/70 mt-1 font-medium">{t.adjustFactors}</p>
      </div>

      <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <label className="block text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">{t.language}</label>
          <select 
            className="w-full bg-white border-2 border-emerald-100 text-emerald-900 text-sm rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 block p-3 font-bold shadow-sm transition-all"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">{t.season}</label>
          <select 
            className="w-full bg-white border-2 border-emerald-100 text-slate-900 text-sm rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 block p-3 font-medium shadow-sm transition-all"
            value={inputs.season}
            onChange={(e) => handleChange('season', e.target.value as Season)}
          >
            <option value="Kharif">{t.kharif}</option>
            <option value="Rabi">{t.rabi}</option>
            <option value="Summer">{t.summer}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">{t.soil}</label>
          <select 
            className="w-full bg-white border-2 border-emerald-100 text-slate-900 text-sm rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 block p-3 font-medium shadow-sm transition-all"
            value={inputs.soil}
            onChange={(e) => handleChange('soil', e.target.value as Soil)}
          >
            <option value="Loamy">{t.loamy}</option>
            <option value="Clay">{t.clay}</option>
            <option value="Black">{t.black}</option>
            <option value="Sandy">{t.sandy}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">{t.water}</label>
          <select 
            className="w-full bg-white border-2 border-emerald-100 text-slate-900 text-sm rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 block p-3 font-medium shadow-sm transition-all"
            value={inputs.water}
            onChange={(e) => handleChange('water', e.target.value as Water)}
          >
            <option value="Low">{t.low}</option>
            <option value="Medium">{t.medium}</option>
            <option value="High">{t.high}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-emerald-800 uppercase tracking-widest mb-2">{t.landSize}</label>
          <input 
            type="number"
            min="1"
            className="w-full bg-white border-2 border-emerald-100 text-slate-900 text-sm rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 block p-3 font-medium shadow-sm transition-all"
            value={inputs.landSize}
            onChange={(e) => handleChange('landSize', parseFloat(e.target.value) || 1)}
          />
        </div>

        <button 
          onClick={onGetRecommendations}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-4 rounded-2xl transition-all shadow-xl shadow-emerald-200 active:scale-95 flex items-center justify-center gap-2 mt-4"
        >
          🔍 {t.getRecommendations}
        </button>

        <div className="mt-8 p-5 bg-emerald-100/50 rounded-2xl border-2 border-emerald-200/50">
          <h3 className="text-xs font-black text-emerald-900 uppercase tracking-widest flex items-center gap-2">
            💡 {t.scoringGuide}
          </h3>
          <ul className="text-xs text-emerald-800 mt-3 space-y-2 font-bold">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Season Match: +25 pts</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Soil/Water Match: +20 pts</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> High Demand: Up to +30 pts</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Risk Penalty: Up to -10 pts</li>
          </ul>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-emerald-200/50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-emerald-600/60 hover:text-red-500 transition-all text-sm font-black uppercase tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {t.logout}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
