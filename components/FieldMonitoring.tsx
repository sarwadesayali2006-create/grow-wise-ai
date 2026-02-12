
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { translations, Language } from '../translations';

interface FieldMonitoringProps {
  language: Language;
}

const MOISTURE_THRESHOLD = 35;
const TEMP_THRESHOLD = 38;

const FieldMonitoring: React.FC<FieldMonitoringProps> = ({ language }) => {
  const t = translations[language];
  const [metrics, setMetrics] = useState({
    moisture: 42,
    temp: 28,
    humidity: 65
  });

  const [trendData, setTrendData] = useState(() => 
    Array.from({ length: 12 }, (_, i) => ({
      time: `${i * 2}:00`,
      moisture: Math.floor(Math.random() * 20) + 35
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        // More volatile updates for demo purposes to trigger alerts
        const newMoisture = Math.min(100, Math.max(0, prev.moisture + (Math.random() - 0.6) * 4));
        const newTemp = Math.min(45, Math.max(15, prev.temp + (Math.random() - 0.4) * 2));
        const newHumidity = Math.min(100, Math.max(20, prev.humidity + (Math.random() - 0.5) * 3));
        
        return {
          moisture: newMoisture,
          temp: newTemp,
          humidity: newHumidity
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const alerts = [];
  if (metrics.moisture < MOISTURE_THRESHOLD) {
    alerts.push({
      type: 'critical',
      title: t.lowMoistureAlert,
      message: t.irrigationRecommendation,
      icon: '💧'
    });
  }
  if (metrics.temp > TEMP_THRESHOLD) {
    alerts.push({
      type: 'warning',
      title: t.highTempAlert,
      message: t.heatRecommendation,
      icon: '🔥'
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          📡 {t.fieldStatus}
        </h2>
      </div>

      {/* Alert Section */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map((alert, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-4 p-5 rounded-3xl border-2 animate-in slide-in-from-top-4 duration-500 ${
                alert.type === 'critical' 
                  ? 'bg-red-50 border-red-200 text-red-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="text-3xl">{alert.icon}</div>
              <div className="flex-grow">
                <h4 className="font-black text-lg mb-1">{alert.title}</h4>
                <p className="text-sm opacity-90">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`bg-white p-6 rounded-3xl shadow-sm border transition-colors ${metrics.moisture < MOISTURE_THRESHOLD ? 'border-red-400' : 'border-slate-200'}`}>
          <p className="text-sm font-bold text-slate-500 uppercase mb-2">{t.soilMoisture}</p>
          <div className="flex items-end gap-2">
            <p className={`text-4xl font-black ${metrics.moisture < MOISTURE_THRESHOLD ? 'text-red-600' : 'text-blue-600'}`}>
              {metrics.moisture.toFixed(1)}%
            </p>
            <span className={`text-xs font-bold mb-1 ${metrics.moisture < MOISTURE_THRESHOLD ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
              {metrics.moisture < MOISTURE_THRESHOLD ? t.critical : t.optimal}
            </span>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${metrics.moisture < MOISTURE_THRESHOLD ? 'bg-red-500' : 'bg-blue-500'}`} 
              style={{ width: `${metrics.moisture}%` }}
            ></div>
          </div>
        </div>

        <div className={`bg-white p-6 rounded-3xl shadow-sm border transition-colors ${metrics.temp > TEMP_THRESHOLD ? 'border-amber-400' : 'border-slate-200'}`}>
          <p className="text-sm font-bold text-slate-500 uppercase mb-2">{t.temperature}</p>
          <div className="flex items-end gap-2">
            <p className={`text-4xl font-black ${metrics.temp > TEMP_THRESHOLD ? 'text-amber-600' : 'text-orange-500'}`}>
              {metrics.temp.toFixed(1)}°C
            </p>
            {metrics.temp > TEMP_THRESHOLD && (
              <span className="text-xs font-bold text-amber-500 mb-1 animate-pulse tracking-tight">{t.highTempAlert}</span>
            )}
          </div>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${metrics.temp > TEMP_THRESHOLD ? 'bg-amber-500' : 'bg-orange-400'}`} 
              style={{ width: `${(metrics.temp / 45) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <p className="text-sm font-bold text-slate-500 uppercase mb-2">{t.humidity}</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-indigo-500">{metrics.humidity.toFixed(1)}%</p>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-400 h-full transition-all duration-1000" style={{ width: `${metrics.humidity}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6">{t.moistureTrend}</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="moisture" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FieldMonitoring;
