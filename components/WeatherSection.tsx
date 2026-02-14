
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { translations, Language } from '../translations';

interface WeatherSectionProps {
  language: Language;
}

interface ForecastDay {
  day: string;
  temp: number;
  condition: string;
  icon: string;
}

const WeatherSection: React.FC<WeatherSectionProps> = ({ language }) => {
  const t = translations[language];
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState('');
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [location, setLocation] = useState('New Delhi, India');

  // Mock forecast data for visualization
  const forecast: ForecastDay[] = [
    { day: 'Mon', temp: 32, condition: 'Sunny', icon: '☀️' },
    { day: 'Tue', temp: 30, condition: 'Partly Cloudy', icon: '⛅' },
    { day: 'Wed', temp: 28, condition: 'Light Rain', icon: '🌦️' },
    { day: 'Thu', temp: 29, condition: 'Cloudy', icon: '☁️' },
    { day: 'Fri', temp: 33, condition: 'Sunny', icon: '☀️' },
  ];

  useEffect(() => {
    // Attempt to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`Nearby Field (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
          setLoading(false);
        },
        () => {
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const generateWeatherAdvice = async () => {
    setIsGeneratingAdvice(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = language === 'hi'
        ? `वर्तमान मौसम 32 डिग्री सेल्सियस और धूप वाला है। आगामी 3 दिनों में हल्की बारिश की संभावना है। एक किसान के लिए कृषि संबंधी सलाह दें (बुआई, सिंचाई, उर्वरक)। हिंदी में जवाब दें।`
        : `Current weather is 32°C and Sunny. Light rain expected in 3 days. Provide agricultural advice for a farmer (sowing, irrigation, fertilizer application). Be concise.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAdvice(response.text || "Advice unavailable.");
    } catch (error) {
      console.error(error);
      setAdvice("Could not generate AI advice at this time.");
    } finally {
      setIsGeneratingAdvice(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[#f9fbf9] rounded-[3rem] border border-emerald-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-100 border-t-emerald-600 mb-6"></div>
        <p className="text-emerald-800/40 font-black uppercase tracking-widest text-xs">{t.fetchingWeather}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <span className="bg-emerald-100 p-2 rounded-2xl">🌤️</span> {t.weatherForecast}
        </h2>
        <div className="bg-[#f1f6f2] px-6 py-3 rounded-2xl border border-emerald-100 text-sm font-black text-emerald-800 flex items-center gap-3 shadow-inner uppercase tracking-tight">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          {location}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Current Weather Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-200 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mb-32 blur-3xl transition-all duration-700 group-hover:bg-white/10"></div>
          
          <div className="text-center md:text-left flex-grow relative z-10">
            <p className="text-emerald-100 font-black uppercase tracking-[0.2em] text-[10px] mb-4 drop-shadow-sm">{t.currentCondition}</p>
            <div className="flex items-center justify-center md:justify-start gap-6">
              <span className="text-8xl drop-shadow-xl filter saturate-150">☀️</span>
              <div>
                <h3 className="text-8xl font-black tracking-tighter">32°C</h3>
                <p className="text-2xl font-black text-emerald-50 uppercase tracking-widest">{language === 'hi' ? 'धूप' : 'Sunny'}</p>
              </div>
            </div>
            
            <div className="mt-10 grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 shadow-xl transition-all hover:bg-white/15">
                <p className="text-[10px] text-emerald-200 font-black uppercase tracking-widest mb-2">{t.humidity}</p>
                <p className="text-3xl font-black">45%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 shadow-xl transition-all hover:bg-white/15">
                <p className="text-[10px] text-emerald-200 font-black uppercase tracking-widest mb-2">{t.windSpeed}</p>
                <p className="text-3xl font-black">12 <span className="text-sm font-bold opacity-60">km/h</span></p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto relative z-10">
            <div className="bg-black/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
              <h4 className="font-black mb-6 text-emerald-100 text-xs uppercase tracking-widest border-b border-white/10 pb-3">{t.weeklyOutlook}</h4>
              <div className="space-y-4">
                {forecast.map((f, i) => (
                  <div key={i} className="flex items-center justify-between gap-10 hover:translate-x-1 transition-all">
                    <span className="font-black text-sm w-12 text-emerald-100">{f.day}</span>
                    <span className="text-2xl filter drop-shadow-sm">{f.icon}</span>
                    <span className="font-black text-lg w-12 text-right">{f.temp}°</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Weather Advisor Card */}
        <div className="bg-[#f9fbf9] rounded-[3rem] p-10 shadow-sm border border-emerald-50 flex flex-col group">
          <h3 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
            <span className="text-emerald-600">🧠</span> {t.agriInsight}
          </h3>
          <p className="text-[11px] font-bold text-slate-400 mb-8 leading-relaxed uppercase tracking-wider">
            {language === 'hi' ? 'स्थानीय मौसम विश्लेषण' : 'Advanced Local Data Synthesis'}
          </p>

          <div className="flex-grow bg-white rounded-[2rem] p-6 border border-emerald-100/50 mb-8 min-h-[180px] relative overflow-hidden shadow-inner">
            {isGeneratingAdvice && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md z-10 animate-in fade-in duration-300">
                <div className="relative">
                  <div className="animate-spin h-10 w-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full"></div>
                </div>
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mt-4">Consulting Gemini...</p>
              </div>
            )}
            
            {advice ? (
              <p className="text-sm font-medium text-slate-700 leading-relaxed animate-in fade-in slide-in-from-bottom-2 italic">
                {advice}
              </p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 py-6">
                <div className="text-5xl opacity-20">🍃</div>
                <p className="text-xs font-bold text-center italic">{t.weatherAdvicePlaceholder}</p>
              </div>
            )}
          </div>

          <button 
            onClick={generateWeatherAdvice}
            disabled={isGeneratingAdvice}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all flex items-center justify-center gap-3 active:scale-95 text-lg"
          >
            🪄 {t.analyze}
          </button>
        </div>
      </div>
      
      {/* Visual Recommendation Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-blue-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-125 transition-all duration-1000"></div>
        <div className="text-6xl bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/10 shadow-inner">🚜</div>
        <div className="text-center md:text-left">
          <h4 className="font-black text-2xl tracking-tighter uppercase mb-2">{language === 'hi' ? 'खेत की तैयारी के लिए अनुकूल' : 'Favorable for Tilling'}</h4>
          <p className="text-blue-100 text-lg font-medium max-w-2xl leading-tight">Low precipitation and mild winds make today ideal for field preparation and soil conditioning.</p>
        </div>
        <div className="md:ml-auto">
          <span className="bg-white text-blue-700 font-black px-6 py-3 rounded-2xl shadow-xl uppercase tracking-widest text-sm">Actionable</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherSection;
