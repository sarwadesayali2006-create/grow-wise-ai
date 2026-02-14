
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { translations, Language } from '../translations';

interface FieldMonitoringProps {
  language: Language;
}

const FieldMonitoring: React.FC<FieldMonitoringProps> = ({ language }) => {
  const t = translations[language];
  const [metrics, setMetrics] = useState({ moisture: 42, temp: 28, humidity: 65 });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        moisture: Math.min(100, Math.max(0, prev.moisture + (Math.random() - 0.5) * 2)),
        temp: Math.min(45, Math.max(15, prev.temp + (Math.random() - 0.5) * 1.5)),
        humidity: Math.min(100, Math.max(20, prev.humidity + (Math.random() - 0.5) * 2.5))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
        <span className="bg-emerald-100 p-3 rounded-3xl shadow-lg transform hover:rotate-12 transition-transform">📡</span> 
        {t.fieldStatus}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 perspective-1000">
        {[
          { label: t.soilMoisture, val: metrics.moisture, unit: '%', color: 'blue' },
          { label: t.temperature, val: metrics.temp, unit: '°C', color: 'orange' },
          { label: t.humidity, val: metrics.humidity, unit: '%', color: 'indigo' }
        ].map((item, idx) => (
          <div key={idx} className="bg-[#f9fbf9] p-10 rounded-[3.5rem] shadow-xl border border-emerald-50 transition-all duration-500 hover:rotate-x-12 hover:-translate-y-4 hover:shadow-2xl hover:shadow-emerald-500/5 group relative overflow-hidden">
            {/* Animated Ping Background */}
            <div className="absolute top-10 right-10 w-2 h-2">
               <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping"></div>
               <div className="absolute inset-0 bg-emerald-500 rounded-full"></div>
            </div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{item.label}</p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className={`text-7xl font-black tracking-tighter text-slate-800 transition-colors group-hover:text-emerald-600`}>
                {item.val.toFixed(1)}
              </span>
              <span className="text-2xl font-black text-slate-300">{item.unit}</span>
            </div>
            
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner p-1">
              <div 
                className={`h-full rounded-full transition-all duration-1000 shadow-lg ${
                  item.color === 'blue' ? 'bg-blue-500' : item.color === 'orange' ? 'bg-orange-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${item.val}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#f9fbf9] p-12 rounded-[4rem] shadow-2xl border border-emerald-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.03),transparent)] pointer-events-none"></div>
        <h3 className="text-2xl font-black text-slate-800 mb-12 flex items-center gap-4">
          <span className="text-blue-500 animate-pulse">●</span> {t.moistureTrend}
        </h3>
        <div className="h-[400px] w-full transform hover:scale-[1.01] transition-transform duration-500">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={Array.from({length: 12}, (_, i) => ({ time: `${i*2}:00`, moisture: 40 + Math.random() * 20 }))}>
              <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#eef2f6" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px' }}
              />
              <Line 
                type="monotone" 
                dataKey="moisture" 
                stroke="#10b981" 
                strokeWidth={6} 
                dot={{ r: 8, fill: '#fff', stroke: '#10b981', strokeWidth: 4 }} 
                activeDot={{ r: 10, strokeWidth: 0, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FieldMonitoring;
