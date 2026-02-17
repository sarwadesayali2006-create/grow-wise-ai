
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { translations, Language } from '../translations';
import { FarmReminder } from '../types';

interface PersonalRecommendationProps {
  language: Language;
  onAddReminder?: (reminder: FarmReminder) => void;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const YEARS = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i);

const PersonalRecommendation: React.FC<PersonalRecommendationProps> = ({ language: initialLanguage, onAddReminder }) => {
  const [personalLang, setPersonalLang] = useState<Language>(initialLanguage);
  const t = translations[personalLang];
  
  const [state, setState] = useState('');
  const [soilHistory, setSoilHistory] = useState('');
  const [burnYear, setBurnYear] = useState('');
  const [report, setReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Alarm State
  const [alarmTime, setAlarmTime] = useState('');
  const [alarmTask, setAlarmTask] = useState('');

  const generateReport = async () => {
    if (!state || !soilHistory) return;
    setIsGenerating(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let prompt = "";
      if (personalLang === 'hi') {
        prompt = `मैं ${state} का एक किसान हूँ। मेरी मिट्टी का इतिहास: ${soilHistory}। वर्ष ${burnYear} में मेरी फसल जल गई थी या विफल हो गई थी। मुझे भविष्य के लिए एक व्यक्तिगत कृषि रणनीति बताएं, जिसमें मिट्टी की उर्वरता बहाल करने और सर्वोत्तम अगली फसल के सुझाव शामिल हों। हिंदी में जवाब दें और महत्वपूर्ण बिन्दुओं को बुलेट्स में लिखें।`;
      } else if (personalLang === 'mr') {
        prompt = `मी ${state} मधील शेतकरी आहे. माझ्या मातीचा इतिहास: ${soilHistory}. वर्ष ${burnYear} मध्ये माझे पीक जळाले किंवा निकामी झाले होते. भविष्यासाठी मला वैयक्तिकृत कृषी धोरण सांगा, ज्यामध्ये मातीची सुपीकता पुनर्संचयित करण्यासाठी टिप्स आणि सर्वोत्तम पुढील पिकाच्या शिफारसींचा समावेश असेल. मराठीत उत्तर द्या आणि महत्त्वाचे मुद्दे बुलेट्समध्ये लिहा.`;
      } else {
        prompt = `I am a farmer from ${state}. Soil history: ${soilHistory}. In year ${burnYear}, my crop was burned/failed. Provide a personalized agricultural strategy for the future, including soil recovery tips and best next crop suggestions. Use bullet points and speak in English.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setReport(response.text || "Unable to generate report.");
    } catch (error) {
      console.error(error);
      setReport("Error generating personal advice. Please check your connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddAlarm = () => {
    if (!alarmTime || !alarmTask || !onAddReminder) return;
    
    const newReminder: FarmReminder = {
      id: Math.random().toString(36).substr(2, 9),
      time: alarmTime,
      task: alarmTask,
      isCompleted: false,
      type: alarmTask.toLowerCase().includes('water') ? 'irrigation' : 'other'
    };
    
    onAddReminder(newReminder);
    setAlarmTime('');
    setAlarmTask('');
    const successMsg = personalLang === 'hi' ? 'अलार्म सेट हो गया!' : personalLang === 'mr' ? 'अलार्म सेट झाला!' : 'Farm alarm set successfully!';
    alert(successMsg);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <span className="bg-emerald-100 p-2 rounded-2xl transform hover:rotate-12 transition-transform">🎯</span>
          {t.personalAdvisorTitle}
        </h2>
        
        {/* Local Language Toggle */}
        <div className="flex items-center bg-[#f1f6f2] p-1.5 rounded-2xl shadow-inner border border-emerald-50">
          <button 
            onClick={() => setPersonalLang('en')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${personalLang === 'en' ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-emerald-700/60 hover:text-emerald-900'}`}
          >
            English
          </button>
          <button 
            onClick={() => setPersonalLang('hi')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${personalLang === 'hi' ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-emerald-700/60 hover:text-emerald-900'}`}
          >
            हिन्दी
          </button>
          <button 
            onClick={() => setPersonalLang('mr')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${personalLang === 'mr' ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-emerald-700/60 hover:text-emerald-900'}`}
          >
            मराठी
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form Input Section - DARK THEME */}
        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-800 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
          
          <div className="relative z-10 space-y-8">
            <h3 className="text-emerald-400 font-black text-xs uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
               📝 {personalLang === 'hi' ? 'विवरण भरें' : personalLang === 'mr' ? 'तपशील भरा' : 'Fill Details'}
            </h3>

            <div>
              <label className="block text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">{t.locationState}</label>
              <select 
                className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-2xl p-4 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer text-lg font-bold shadow-lg"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="" className="text-slate-400">{t.selectState}</option>
                {INDIAN_STATES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">{t.soilHistory}</label>
              <textarea 
                rows={3}
                className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-2xl p-5 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-base font-medium placeholder:text-slate-600 shadow-lg custom-scrollbar"
                placeholder={t.soilHistoryPlaceholder}
                value={soilHistory}
                onChange={(e) => setSoilHistory(e.target.value)}
              />
            </div>

            <button 
              onClick={generateReport}
              disabled={isGenerating || !state || !soilHistory}
              className={`w-full py-6 rounded-[2rem] text-white font-black text-2xl shadow-2xl transition-all transform flex items-center justify-center gap-4 ${
                isGenerating || !state || !soilHistory 
                ? 'bg-slate-800 text-slate-700 border border-slate-700 cursor-not-allowed shadow-none scale-100' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/30 active:scale-95'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-7 w-7 border-4 border-white/20 border-t-white rounded-full"></div>
                  Generating...
                </>
              ) : (
                <>🚀 {t.generatePersonalReport}</>
              )}
            </button>

            {/* NEW ALARM SECTION INSIDE AI VIEW */}
            <div className="pt-8 border-t border-slate-800 space-y-6">
              <h3 className="text-emerald-400 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2">
                ⏰ {t.smartScheduling}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="time" 
                  className="bg-slate-800 border-2 border-slate-700 text-white rounded-xl p-3 focus:border-emerald-500 outline-none font-bold"
                  value={alarmTime}
                  onChange={(e) => setAlarmTime(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder={t.alarmTask}
                  className="bg-slate-800 border-2 border-slate-700 text-white rounded-xl p-3 focus:border-emerald-500 outline-none font-bold text-sm"
                  value={alarmTask}
                  onChange={(e) => setAlarmTask(e.target.value)}
                />
              </div>
              <button 
                onClick={handleAddAlarm}
                disabled={!alarmTime || !alarmTask}
                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${!alarmTime || !alarmTask ? 'bg-slate-800 text-slate-600' : 'bg-white text-slate-900 hover:bg-emerald-50 active:scale-95'}`}
              >
                ➕ {t.addAlarm}
              </button>
            </div>
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="bg-[#f9fbf9] p-10 rounded-[3rem] shadow-sm border border-emerald-50 flex flex-col min-h-[600px] relative group overflow-hidden perspective-1000">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-emerald-500/10 transition-all duration-1000"></div>
          
          <div className="flex items-center justify-between mb-10 border-b border-emerald-100/50 pb-6 relative z-10">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
              <span className="text-emerald-600 bg-white p-2 rounded-xl border border-emerald-50">✨</span> {t.personalReportResult}
            </h3>
            {report && (
              <span className="bg-emerald-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 animate-pulse">
                AI Live Strategy
              </span>
            )}
          </div>
          
          <div className="flex-grow relative z-10">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-emerald-800/40 space-y-8">
                <div className="relative">
                  <div className="w-28 h-28 border-8 border-emerald-50 border-t-emerald-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-4xl transform -rotate-12">🌾</div>
                </div>
                <p className="text-lg font-black uppercase tracking-widest animate-pulse leading-none">Synthesizing Data</p>
              </div>
            ) : report ? (
              <div className="prose prose-emerald max-w-none animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-slate-800 text-lg leading-relaxed whitespace-pre-line bg-white/70 backdrop-blur-md p-10 rounded-[2.5rem] border-2 border-white/50 shadow-inner group-hover:shadow-lg transition-all duration-500">
                  {report}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-center px-12 space-y-10 opacity-40">
                <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center text-7xl shadow-inner border-2 border-emerald-50 transform rotate-6 hover:rotate-0 transition-all duration-700 animate-float">🚜</div>
                <div className="space-y-3">
                  <p className="text-2xl font-black text-emerald-900 tracking-tighter uppercase">Roadmap Generation Ready</p>
                  <p className="text-sm font-bold text-emerald-800 leading-tight">Generate a report to unlock smart scheduling tasks for your fields.</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 pt-8 border-t border-emerald-100/50 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-black shadow-lg">AI</div>
                <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-black shadow-lg">GEO</div>
                <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] text-white font-black shadow-lg">AGR</div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Engineered by Gemini Pro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalRecommendation;
