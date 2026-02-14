
import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfdfa] p-4 relative overflow-hidden">
      {/* Floating 3D-ish Icons */}
      <div className="absolute top-20 left-[10%] text-7xl animate-float opacity-20 pointer-events-none">🌾</div>
      <div className="absolute bottom-20 right-[15%] text-8xl animate-float-delayed opacity-10 pointer-events-none">🚜</div>
      <div className="absolute top-[40%] right-[10%] text-6xl animate-float opacity-15 pointer-events-none">☀️</div>
      <div className="absolute bottom-[30%] left-[12%] text-5xl animate-float-delayed opacity-20 pointer-events-none">🌱</div>

      <div className="max-w-md w-full perspective-1000 z-10">
        <div className="bg-[#f9fbf9] rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(16,185,129,0.15)] border border-emerald-50 overflow-hidden transform transition-all duration-700 hover:rotate-x-2 preserve-3d">
          <div className="bg-emerald-600 p-14 text-center text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-all duration-1000"></div>
            <span className="text-8xl mb-6 block drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] filter saturate-150 transform transition-transform group-hover:scale-110 duration-500">🌾</span>
            <h2 className="text-5xl font-black tracking-tighter mb-2 translate-z-10">GrowWise</h2>
            <p className="text-emerald-100 mt-2 text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Precision Agriculture</p>
          </div>
          
          <div className="p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="transform transition-all hover:translate-z-10">
                <label className="block text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-3">Identity Access</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-6 py-5 rounded-2xl bg-white border-2 border-emerald-50 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-600 outline-none transition-all font-bold text-slate-800 shadow-inner placeholder:text-slate-300"
                  placeholder="Mobile / Email ID"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              
              <div className="transform transition-all hover:translate-z-10">
                <label className="block text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-3">Security Key</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-6 py-5 rounded-2xl bg-white border-2 border-emerald-50 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-600 outline-none transition-all font-bold text-slate-800 shadow-inner placeholder:text-slate-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full py-6 rounded-[2.5rem] text-white font-black text-xl shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] transition-all transform flex items-center justify-center gap-4 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 ${
                  isLoading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-teal-600'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Verifying...
                  </span>
                ) : 'Enter Dashboard'}
              </button>
            </form>
            
            <div className="mt-12 pt-8 border-t border-emerald-50 flex items-center justify-between opacity-60">
              <button className="text-[9px] text-emerald-600 font-black uppercase tracking-widest hover:text-emerald-800">Lost Key?</button>
              <button className="text-[9px] text-slate-400 font-black uppercase tracking-widest hover:text-slate-600">Apply for Access</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
