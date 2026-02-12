
import React, { useState, useMemo } from 'react';
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
import Login from './components/Login';
import { UserInputs, RecommendationResult } from './types';
import { CROPS_DATA } from './data';
import { getRecommendations } from './utils';
import { translations, Language } from './translations';

type ActiveTab = 'advisor' | 'monitor' | 'disease' | 'assistant' | 'weather';

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
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 animate-in fade-in duration-500">
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
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit">
          <button 
            onClick={() => setActiveTab('advisor')}
            className={`px-4 py-2 rounded-xl font-bold transition-all text-xs md:text-sm ${activeTab === 'advisor' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            🌾 {t.navAdvisor}
          </button>
          <button 
            onClick={() => setActiveTab('monitor')}
            className={`px-4 py-2 rounded-xl font-bold transition-all text-xs md:text-sm ${activeTab === 'monitor' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            📊 {t.navMonitoring}
          </button>
          <button 
            onClick={() => setActiveTab('disease')}
            className={`px-4 py-2 rounded-xl font-bold transition-all text-xs md:text-sm ${activeTab === 'disease' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            🔍 {t.navDetection}
          </button>
          <button 
            onClick={() => setActiveTab('weather')}
            className={`px-4 py-2 rounded-xl font-bold transition-all text-xs md:text-sm ${activeTab === 'weather' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            🌤️ {t.navWeather}
          </button>
          <button 
            onClick={() => setActiveTab('assistant')}
            className={`px-4 py-2 rounded-xl font-bold transition-all text-xs md:text-sm ${activeTab === 'assistant' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            🎙️ {t.navAssistant}
          </button>
        </div>

        {/* Dynamic Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">
              {activeTab === 'advisor' ? '🌾' : activeTab === 'monitor' ? '🛰️' : activeTab === 'disease' ? '🧠' : activeTab === 'weather' ? '🌤️' : '🤖'}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.title} – <span className="text-emerald-600">
                {activeTab === 'advisor' ? t.subtitle : activeTab === 'monitor' ? t.navMonitoring : activeTab === 'disease' ? t.navDetection : activeTab === 'weather' ? t.weatherForecast : t.navAssistant}
              </span>
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            {t.description}
          </p>
        </div>

        {/* Content Router */}
        {activeTab === 'advisor' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {!hasSearched ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="text-6xl mb-6 opacity-40">🚜</div>
                <h2 className="text-2xl font-bold text-slate-400">{t.readyToStart}</h2>
                <p className="text-slate-400 mt-2">{t.configureLand}</p>
              </div>
            ) : (
              <div className="space-y-10">
                {bestCrop && (
                  <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-grow">
                      <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-2">{t.topRecommended}</p>
                      <h2 className="text-5xl font-black mb-4">{bestCrop.name}</h2>
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-emerald-500/30 px-4 py-2 rounded-xl backdrop-blur-sm border border-emerald-400/20">
                          <p className="text-[10px] text-emerald-100 uppercase font-bold">{t.totalScore}</p>
                          <p className="text-2xl font-bold">{bestCrop.score} pts</p>
                        </div>
                        <div className="bg-emerald-500/30 px-4 py-2 rounded-xl backdrop-blur-sm border border-emerald-400/20">
                          <p className="text-[10px] text-emerald-100 uppercase font-bold">{t.estRevenue}</p>
                          <p className="text-2xl font-bold">₹{bestCrop.expectedRevenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-center md:text-right">
                      <div className="text-7xl mb-2">🏆</div>
                      <p className="text-emerald-100 text-sm font-medium">{t.bestFit}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    📋 {t.detailedRecommendations}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topThree.map((crop, idx) => (
                      <RecommendationCard key={crop.id} crop={crop} rank={idx + 1} language={language} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                      📊 {t.scoreAnalysis}
                    </h2>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topThree} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                          <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={50}>
                            {topThree.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#94a3b8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                      🥧 {t.marketPotentialDistribution}
                    </h2>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'monitor' && <FieldMonitoring language={language} />}
        {activeTab === 'disease' && <DiseaseDetection language={language} />}
        {activeTab === 'weather' && <WeatherSection language={language} />}
        {activeTab === 'assistant' && <VoiceAssistant language={language} />}
      </main>
    </div>
  );
};

export default App;
