
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import Sidebar from './components/Sidebar';
import RecommendationCard from './components/RecommendationCard';
import FieldMonitoring from './components/FieldMonitoring';
import DiseaseDetection from './components/DiseaseDetection';
import VoiceAssistant from './components/VoiceAssistant';
import WeatherSection from './components/WeatherSection';
import PersonalRecommendation from './components/PersonalRecommendation';
import Login from './components/Login';
import { UserInputs, RecommendationResult, FarmReminder } from './types';
import { CROPS_DATA } from './data';
import { getRecommendations } from './utils';
import { translations, Language } from './translations';

type ActiveTab = 'advisor' | 'monitor' | 'disease' | 'assistant' | 'weather' | 'personal' | 'notifications';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<ActiveTab>('advisor');
  const [inputs, setInputs] = useState<UserInputs>({
    season: 'Kharif',
    soil: 'Loamy',
    water: 'Medium',
    landSize: 10
  });

  const [reminders, setReminders] = useState<FarmReminder[]>([]);
  const t = translations[language];

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleGetRecommendations = () => {
    const results = getRecommendations(CROPS_DATA, inputs);
    setRecommendations(results);
    setHasSearched(true);
    setActiveTab('advisor');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setHasSearched(false);
  };

  const addReminder = (reminder: FarmReminder) => {
    setReminders(prev => [...prev, reminder]);
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const activeRemindersCount = reminders.filter(r => !r.isCompleted).length;

  const topThree = useMemo(() => recommendations.slice(0, 3), [recommendations]);
  const bestCrop = topThree[0];

  const pieData = useMemo(() => {
    if (!recommendations.length) return [];
    const counts = recommendations.reduce((acc: any, curr) => {
      const cat = curr.demandScore >= 8 ? t.strongExport : curr.demandScore >= 5 ? t.moderateGlobal : t.emergingMarket;
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    return Object.keys(counts).map(name => ({
      name,
      value: counts[name]
    }));
  }, [recommendations, language]);

  const PIE_COLORS = ['#10b981', '#6366f1', '#94a3b8'];

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#fcfdfa] animate-in fade-in duration-500">
      {/* Sidebar for Inputs */}
      <aside className="w-full md:w-80 lg:w-96 flex-shrink-0">
        <Sidebar 
          inputs={inputs} 
          setInputs={setInputs} 
          onGetRecommendations={handleGetRecommendations} 
          onLogout={handleLogout}
          language={language}
          setLanguage={setLanguage}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        {/* Navigation Tabs + Notification Center */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap gap-2 md:gap-4 bg-[#f1f6f2] p-2 rounded-3xl border border-emerald-100/50 w-fit shadow-inner">
            <button 
              onClick={() => setActiveTab('advisor')}
              className={`px-5 py-3 rounded-2xl font-black transition-all text-xs md:text-sm uppercase tracking-wider ${activeTab === 'advisor' ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'text-emerald-700/60 hover:bg-emerald-100/50'}`}
            >
              🌾 {t.navAdvisor}
            </button>
            <button 
              onClick={() => setActiveTab('personal')}
              className={`px-5 py-3 rounded-2xl font-black transition-all text-xs md:text-sm uppercase tracking-wider ${activeTab === 'personal' ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'text-emerald-700/60 hover:bg-emerald-100/50'}`}
            >
              🎯 {t.navPersonal}
            </button>
            <button 
              onClick={() => setActiveTab('monitor')}
              className={`px-5 py-3 rounded-2xl font-black transition-all text-xs md:text-sm uppercase tracking-wider ${activeTab === 'monitor' ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'text-emerald-700/60 hover:bg-emerald-100/50'}`}
            >
              📊 {t.navMonitoring}
            </button>
            <button 
              onClick={() => setActiveTab('disease')}
              className={`px-5 py-3 rounded-2xl font-black transition-all text-xs md:text-sm uppercase tracking-wider ${activeTab === 'disease' ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'text-emerald-700/60 hover:bg-emerald-100/50'}`}
            >
              🔍 {t.navDetection}
            </button>
          </div>

          <button 
            onClick={() => setActiveTab('notifications')}
            className={`relative p-4 rounded-3xl transition-all shadow-lg ${activeTab === 'notifications' ? 'bg-slate-900 text-white scale-110' : 'bg-white text-slate-800 hover:bg-emerald-50 border border-emerald-50'}`}
          >
            <span className="text-2xl">{activeRemindersCount > 0 ? '🔔' : '🔕'}</span>
            {activeRemindersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-white animate-bounce">
                {activeRemindersCount}
              </span>
            )}
          </button>
        </div>

        {/* Dynamic Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-5xl bg-emerald-100 p-3 rounded-[2rem] shadow-sm transform hover:rotate-6 transition-transform">
              {activeTab === 'advisor' ? '🌾' : activeTab === 'personal' ? '🎯' : activeTab === 'monitor' ? '🛰️' : activeTab === 'disease' ? '🧠' : activeTab === 'notifications' ? '📋' : activeTab === 'weather' ? '🌤️' : '🤖'}
            </span>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                {t.title} <span className="text-emerald-600">/ {activeTab === 'advisor' ? t.subtitle : activeTab === 'personal' ? t.navPersonal : activeTab === 'monitor' ? t.navMonitoring : activeTab === 'disease' ? t.navDetection : activeTab === 'notifications' ? t.reminders : activeTab === 'weather' ? t.weatherForecast : t.navAssistant}</span>
              </h1>
              <p className="text-slate-500 text-lg font-medium max-w-2xl mt-1">
                {activeTab === 'notifications' ? t.activeNotifications : t.description}
              </p>
            </div>
          </div>
        </div>

        {/* Content Router */}
        <div className="perspective-1000">
          {activeTab === 'advisor' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* ... (advisor content unchanged) ... */}
              {!hasSearched ? (
                <div className="flex flex-col items-center justify-center py-24 bg-[#f9fbf9] rounded-[3rem] border-4 border-dashed border-emerald-100 shadow-inner">
                  <div className="text-8xl mb-8 opacity-20 transform -rotate-12 animate-float">🚜</div>
                  <h2 className="text-3xl font-black text-emerald-900/40 uppercase tracking-tighter">{t.readyToStart}</h2>
                  <p className="text-emerald-700/30 mt-3 font-bold text-center max-w-md">{t.configureLand}</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {bestCrop && (
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-200 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 transition-all duration-700 group-hover:scale-110"></div>
                      <div className="relative z-10 flex-grow">
                        <p className="text-emerald-100 font-black uppercase tracking-[0.2em] text-xs mb-3">{t.topRecommended}</p>
                        <h2 className="text-6xl font-black mb-6 tracking-tighter">{bestCrop.name}</h2>
                        <div className="flex flex-wrap gap-6">
                          <div className="bg-white/10 px-6 py-4 rounded-[1.5rem] backdrop-blur-md border border-white/20 shadow-xl">
                            <p className="text-[10px] text-emerald-100 uppercase font-black tracking-widest mb-1">{t.totalScore}</p>
                            <p className="text-3xl font-black">{bestCrop.score} <span className="text-sm opacity-60">pts</span></p>
                          </div>
                          <div className="bg-white/10 px-6 py-4 rounded-[1.5rem] backdrop-blur-md border border-white/20 shadow-xl">
                            <p className="text-[10px] text-emerald-100 uppercase font-black tracking-widest mb-1">{t.estRevenue}</p>
                            <p className="text-3xl font-black">₹{bestCrop.expectedRevenue.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="relative z-10 flex-shrink-0 text-center md:text-right">
                        <div className="text-9xl mb-4 drop-shadow-2xl filter saturate-150 animate-float">🏆</div>
                        <p className="text-emerald-50 text-xl font-black uppercase tracking-widest">{t.bestFit}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                      <span className="bg-emerald-100 p-2 rounded-xl">📋</span> {t.detailedRecommendations}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {topThree.map((crop, idx) => (
                        <RecommendationCard key={crop.id} crop={crop} rank={idx + 1} language={language} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'personal' && <PersonalRecommendation language={language} onAddReminder={addReminder} />}
          {activeTab === 'monitor' && <FieldMonitoring language={language} />}
          {activeTab === 'disease' && <DiseaseDetection language={language} />}
          {activeTab === 'weather' && <WeatherSection language={language} />}
          {activeTab === 'assistant' && <VoiceAssistant language={language} />}
          
          {activeTab === 'notifications' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reminders.length === 0 ? (
                  <div className="col-span-full py-20 bg-[#f9fbf9] rounded-[3rem] border-4 border-dashed border-emerald-100 flex flex-col items-center justify-center text-center px-10">
                    <span className="text-7xl mb-6 opacity-20">📭</span>
                    <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">{t.noNotifications}</h3>
                  </div>
                ) : (
                  reminders.map(reminder => (
                    <div 
                      key={reminder.id} 
                      className={`bg-[#f9fbf9] p-8 rounded-[2.5rem] shadow-xl border border-emerald-50 transition-all duration-500 hover:rotate-x-6 hover:-translate-y-2 preserve-3d group ${reminder.isCompleted ? 'opacity-50 grayscale' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-emerald-50">
                          {reminder.type === 'irrigation' ? '💧' : reminder.type === 'fertilizer' ? '🧪' : reminder.type === 'harvest' ? '🧺' : '📅'}
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 bg-white px-3 py-1.5 rounded-full shadow-sm uppercase tracking-widest border border-emerald-50">
                          {reminder.time}
                        </span>
                      </div>
                      <h4 className={`text-xl font-black text-slate-800 mb-4 ${reminder.isCompleted ? 'line-through' : ''}`}>{reminder.task}</h4>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => toggleReminder(reminder.id)}
                          className={`flex-grow py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${reminder.isCompleted ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700'}`}
                        >
                          {reminder.isCompleted ? 'Undo' : t.taskCompleted}
                        </button>
                        <button 
                          onClick={() => deleteReminder(reminder.id)}
                          className="px-5 rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
