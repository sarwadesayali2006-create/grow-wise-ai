
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
    <div className="bg-white p-6 h-full border-r border-slate-200 flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-2">
          ⚙️ {t.configuration}
        </h2>
        <p className="text-sm text-slate-500 mt-1">{t.adjustFactors}</p>
      </div>

      <div className="space-y-6 flex-grow overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t.language}</label>
          <select 
            className="w-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 font-bold"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t.season}</label>
          <select 
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5"
            value={inputs.season}
            onChange={(e) => handleChange('season', e.target.value as Season)}
          >
            <option value="Kharif">{t.kharif}</option>
            <option value="Rabi">{t.rabi}</option>
            <option value="Summer">{t.summer}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t.soil}</label>
          <select 
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5"
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
          <label className="block text-sm font-medium text-slate-700 mb-2">{t.water}</label>
          <select 
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5"
            value={inputs.water}
            onChange={(e) => handleChange('water', e.target.value as Water)}
          >
            <option value="Low">{t.low}</option>
            <option value="Medium">{t.medium}</option>
            <option value="High">{t.high}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t.landSize}</label>
          <input 
            type="number"
            min="1"
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5"
            value={inputs.landSize}
            onChange={(e) => handleChange('landSize', parseFloat(e.target.value) || 1)}
          />
        </div>

        <button 
          onClick={onGetRecommendations}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
        >
          🔍 {t.getRecommendations}
        </button>

        <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
            💡 {t.scoringGuide}
          </h3>
          <ul className="text-xs text-emerald-700 mt-2 space-y-1">
            <li>• Season Match: +25 pts</li>
            <li>• Soil/Water Match: +20 pts</li>
            <li>• High Demand: Up to +30 pts</li>
            <li>• Risk Penalty: Up to -10 pts</li>
          </ul>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {t.logout}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
