
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
          // In a real app we'd reverse geocode this. For hackathon, we'll just indicate "Local Field"
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
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
        <p className="text-slate-500 font-medium">{t.fetchingWeather}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          🌤️ {t.weatherForecast}
        </h2>
        <div className="bg-white px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          {location}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Current Weather Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-100 flex flex-col md:flex-row items-center gap-10">
          <div className="text-center md:text-left flex-grow">
            <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs mb-2">{t.currentCondition}</p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <span className="text-7xl">☀️</span>
              <div>
                <h3 className="text-6xl font-black">32°C</h3>
                <p className="text-xl font-medium text-emerald-50">{language === 'hi' ? 'धूप' : 'Sunny'}</p>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-[10px] text-emerald-100 font-bold uppercase mb-1">{t.humidity}</p>
                <p className="text-xl font-bold">45%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-[10px] text-emerald-100 font-bold uppercase mb-1">{t.windSpeed}</p>
                <p className="text-xl font-bold">12 km/h</p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto">
            <h4 className="font-bold mb-4 text-emerald-100 text-sm uppercase tracking-wider">{t.weeklyOutlook}</h4>
            <div className="space-y-3">
              {forecast.map((f, i) => (
                <div key={i} className="flex items-center justify-between gap-8 bg-white/5 p-2 px-4 rounded-xl border border-white/5">
                  <span className="font-bold text-sm w-10">{f.day}</span>
                  <span className="text-xl">{f.icon}</span>
                  <span className="font-black text-sm">{f.temp}°</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Weather Advisor Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            🧠 {t.agriInsight}
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {language === 'hi' ? 'हम आपके स्थानीय मौसम का विश्लेषण करते हैं ताकि आपको खेती के सही निर्णय लेने में मदद मिल सके।' : 'We analyze your local weather to help you make precise farming decisions.'}
          </p>

          <div className="flex-grow bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 min-h-[150px] relative overflow-hidden">
            {isGeneratingAdvice ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                <div className="animate-spin h-6 w-6 border-b-2 border-emerald-600 mb-2"></div>
                <p className="text-[10px] font-bold text-emerald-700">Consulting Gemini...</p>
              </div>
            ) : null}
            
            {advice ? (
              <p className="text-sm text-slate-700 whitespace-pre-line animate-in fade-in slide-in-from-bottom-2">
                {advice}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic text-center py-10">
                {t.weatherAdvicePlaceholder}
              </p>
            )}
          </div>

          <button 
            onClick={generateWeatherAdvice}
            disabled={isGeneratingAdvice}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
          >
            🪄 {t.analyze}
          </button>
        </div>
      </div>
      
      {/* Visual Recommendation Banner */}
      <div className="bg-blue-600 rounded-3xl p-6 text-white flex items-center gap-6 shadow-xl shadow-blue-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="text-4xl">🚜</div>
        <div>
          <h4 className="font-bold text-lg">{language === 'hi' ? 'खेत की तैयारी के लिए अनुकूल' : 'Favorable for Tilling'}</h4>
          <p className="text-blue-100 text-sm">Low precipitation and mild winds make today ideal for field preparation.</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherSection;
