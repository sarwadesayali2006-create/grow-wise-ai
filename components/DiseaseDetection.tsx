
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { translations, Language } from '../translations';

interface DiseaseDetectionProps {
  language: Language;
}

const DiseaseDetection: React.FC<DiseaseDetectionProps> = ({ language }) => {
  const t = translations[language];
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
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
      
      const prompt = language === 'hi' 
        ? "इस पौधे की पत्ती की छवि का विश्लेषण करें। पौधे का नाम, बीमारी (यदि कोई है), और जैविक उपचार के सुझाव हिंदी में दें।"
        : "Analyze this plant leaf image. Identify the plant, the disease (if any), and provide organic treatment suggestions in English.";

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
      <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
        <span className="bg-emerald-100 p-2 rounded-2xl">🔍</span> {t.diseaseDetection}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-[#f9fbf9] p-10 rounded-[3rem] shadow-sm border border-emerald-50 flex flex-col items-center justify-center text-center group">
          {image ? (
            <div className="relative w-full overflow-hidden rounded-[2.5rem] shadow-2xl mb-8 group-hover:scale-[1.02] transition-all duration-500">
              <img src={image} alt="Selected" className="max-h-96 w-full object-cover" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-md text-white p-3 rounded-full hover:bg-red-600 transition-all shadow-xl"
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
          <label 
            htmlFor="imageInput" 
            className="cursor-pointer bg-white border-2 border-emerald-100 hover:bg-emerald-50 text-emerald-700 font-black py-4 px-10 rounded-2xl transition-all mb-6 shadow-sm active:scale-95 uppercase tracking-widest text-sm"
          >
            {image ? 'Change Photo' : 'Capture / Upload'}
          </label>

          <button 
            disabled={!image || isAnalyzing}
            onClick={analyzeImage}
            className={`w-full py-5 rounded-[2rem] text-white font-black text-xl shadow-2xl transition-all transform ${
              !image || isAnalyzing ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 active:scale-95'
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                Analyzing...
              </span>
            ) : `✨ ${t.analyze}`}
          </button>
        </div>

        <div className="bg-[#f9fbf9] p-10 rounded-[3rem] shadow-sm border border-emerald-50 min-h-[500px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <h3 className="text-xl font-black text-slate-800 mb-8 border-b border-emerald-100 pb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">📝 {t.analysisResult}</span>
            {analysis && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">Gemini Verified</span>}
          </h3>
          
          <div className="flex-grow">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 text-emerald-800/40">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-100 border-t-emerald-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-black">🧠</div>
                </div>
                <p className="font-black uppercase tracking-widest text-xs animate-pulse">Deep scanning leaf tissues...</p>
              </div>
            ) : analysis ? (
              <div className="text-slate-800 whitespace-pre-line text-lg leading-relaxed bg-white/80 p-8 rounded-3xl border border-emerald-50 shadow-inner animate-in fade-in slide-in-from-bottom-4">
                {analysis}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 italic text-center px-12 space-y-6">
                <div className="text-7xl opacity-20">📡</div>
                <p className="font-bold text-slate-400 leading-tight">{t.placeholderResult}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
