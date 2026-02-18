
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { translations, Language } from '../translations';

interface DiseaseDetectionProps {
  language: Language;
}

const DiseaseDetection: React.FC<DiseaseDetectionProps> = ({ language: initialLanguage }) => {
  const [detectionLang, setDetectionLang] = useState<Language>(initialLanguage);
  const t = translations[detectionLang];
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync with global language if changed while not currently detecting
  useEffect(() => {
    if (!isAnalyzing && !analysis) {
      setDetectionLang(initialLanguage);
    }
  }, [initialLanguage, isAnalyzing, analysis]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(''); // Clear old analysis when new image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setAnalysis('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];
      
      let prompt = "";
      if (detectionLang === 'hi') {
        prompt = "इस पौधे की पत्ती की छवि का विश्लेषण करें। पौधे का नाम, बीमारी (यदि कोई है), और विस्तृत जैविक उपचार के सुझाव हिंदी में दें। उत्तर को स्पष्ट बिंदुओं (bullet points) में व्यवस्थित करें।";
      } else if (detectionLang === 'mr') {
        prompt = "या रोपाच्या पानांच्या प्रतिमेचे विश्लेषण करा. रोपाचे नाव, रोग (असल्यास), आणि सविस्तर सेंद्रिय उपचार सुचवा. उत्तर मराठीत द्या आणि महत्त्वाचे मुद्दे बुलेट्समध्ये लिहा.";
      } else {
        prompt = "Analyze this plant leaf image. Identify the plant, the disease (if any), and provide detailed organic treatment suggestions in English. Organize the response with clear bullet points.";
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
          ]
        }
      });

      setAnalysis(response.text || "Analysis failed. Please try again.");
    } catch (error) {
      console.error(error);
      setAnalysis("Error: Could not complete analysis. Check your internet connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h2 className="text-4xl font-black text-slate-900 flex items-center gap-4 tracking-tighter">
          <span className="bg-emerald-100 p-3 rounded-3xl shadow-lg transform hover:rotate-12 transition-transform">🔍</span> 
          {t.diseaseDetection}
        </h2>

        {/* Local Language Toggle */}
        <div className="flex items-center bg-[#f1f6f2] p-1.5 rounded-2xl border border-emerald-50 shadow-inner perspective-1000">
          {[
            { id: 'en', label: 'English' },
            { id: 'hi', label: 'हिन्दी' },
            { id: 'mr', label: 'मराठी' }
          ].map((lang) => (
            <button 
              key={lang.id}
              disabled={isAnalyzing}
              onClick={() => setDetectionLang(lang.id as Language)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                detectionLang === lang.id 
                  ? 'bg-emerald-600 text-white shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] scale-105' 
                  : 'text-emerald-700/60 hover:text-emerald-800'
              } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-[#f9fbf9] p-10 rounded-[3rem] shadow-sm border border-emerald-50 flex flex-col items-center justify-center text-center group">
          {image ? (
            <div className="relative w-full overflow-hidden rounded-[2.5rem] shadow-2xl mb-8 group-hover:scale-[1.02] transition-all duration-500">
              <img src={image} alt="Selected" className="max-h-[400px] w-full object-cover" />
              <button 
                onClick={() => { setImage(null); setAnalysis(''); }}
                className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-md text-white p-3 rounded-full hover:bg-red-600 transition-all shadow-xl z-20"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="border-4 border-dashed border-emerald-100 bg-white/50 rounded-[3rem] p-16 w-full mb-8 flex flex-col items-center justify-center group-hover:border-emerald-300 transition-all duration-500">
              <span className="text-8xl mb-6 block animate-bounce [animation-duration:3s]">📸</span>
              <p className="text-emerald-800/40 font-black uppercase tracking-widest text-sm">{t.uploadPrompt}</p>
            </div>
          )}
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            onChange={handleImageChange}
            className="hidden" 
            id="imageInput" 
          />
          <div className="flex gap-4 w-full">
            <label 
              htmlFor="imageInput" 
              className="flex-grow cursor-pointer bg-white border-2 border-emerald-100 hover:bg-emerald-50 text-emerald-700 font-black py-4 px-6 rounded-2xl transition-all mb-6 shadow-sm active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            >
              📷 {image ? 'Change Photo' : 'Capture / Upload'}
            </label>
          </div>

          <button 
            disabled={!image || isAnalyzing}
            onClick={analyzeImage}
            className={`w-full py-6 rounded-[2rem] text-white font-black text-xl shadow-2xl transition-all transform ${
              !image || isAnalyzing ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 active:scale-95'
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                {detectionLang === 'hi' ? 'विश्लेषण कर रहे हैं...' : detectionLang === 'mr' ? 'विश्लेषण करत आहे...' : 'Analyzing...'}
              </span>
            ) : `✨ ${t.analyze}`}
          </button>
        </div>

        <div className="bg-[#f9fbf9] p-10 rounded-[3rem] shadow-sm border border-emerald-50 min-h-[500px] flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-all duration-1000"></div>
          
          <h3 className="text-xl font-black text-slate-800 mb-8 border-b border-emerald-100/50 pb-6 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-2">📝 {t.analysisResult}</span>
            <div className="flex gap-2">
              {analysis && (
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 px-3 py-1.5 rounded-full shadow-sm">
                  {detectionLang === 'en' ? 'English' : detectionLang === 'hi' ? 'हिन्दी' : 'मराठी'}
                </span>
              )}
              {analysis && <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full shadow-sm">AI Verified</span>}
            </div>
          </h3>
          
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 text-emerald-800/40 py-20">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-50 border-t-emerald-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-3xl font-black">🧠</div>
                </div>
                <div className="text-center space-y-2">
                   <p className="font-black uppercase tracking-widest text-xs animate-pulse">
                     {detectionLang === 'hi' ? 'पत्ती के ऊतकों का स्कैन किया जा रहा है...' : detectionLang === 'mr' ? 'पानांच्या ऊतींचे स्कॅनिंग सुरू आहे...' : 'Scanning leaf tissues...'}
                   </p>
                   <p className="text-[10px] font-bold opacity-60 italic">
                     {detectionLang === 'hi' ? 'रोग के लक्षणों की पहचान की जा रही है' : detectionLang === 'mr' ? 'रोगाची लक्षणे ओळखली जात आहेत' : 'Identifying pathology symptoms'}
                   </p>
                </div>
              </div>
            ) : analysis ? (
              <div className="text-slate-800 whitespace-pre-line text-lg leading-relaxed bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] border-2 border-white shadow-inner animate-in fade-in slide-in-from-bottom-4 duration-500 prose prose-emerald max-w-none">
                {analysis}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 italic text-center px-12 py-20 space-y-8 opacity-40">
                <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center text-7xl shadow-inner border-4 border-emerald-50 transform group-hover:rotate-6 transition-all duration-700 animate-float">🩺</div>
                <div className="space-y-3">
                  <p className="text-2xl font-black text-emerald-900 tracking-tighter uppercase">{detectionLang === 'hi' ? 'विश्लेषण के लिए तैयार' : detectionLang === 'mr' ? 'विश्लेषण करण्यास तयार' : 'Diagnostic Engine Ready'}</p>
                  <p className="text-sm font-bold text-emerald-800 leading-tight">{t.placeholderResult}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-100/30 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Real-time Neural Analysis</span>
             </div>
             <p className="text-[9px] font-black text-emerald-600/50 uppercase tracking-[0.2em]">Powered by Gemini 3 Flash</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
