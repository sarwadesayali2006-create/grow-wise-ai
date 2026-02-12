
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        🔍 {t.diseaseDetection}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          {image ? (
            <div className="relative w-full group">
              <img src={image} alt="Selected" className="max-h-80 w-full object-cover rounded-2xl mb-6 shadow-lg" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="border-4 border-dashed border-slate-100 rounded-3xl p-12 w-full mb-6">
              <span className="text-6xl mb-4 block">📸</span>
              <p className="text-slate-400 font-medium">{t.uploadPrompt}</p>
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
            className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl transition-all mb-4"
          >
            {image ? 'Change Photo' : 'Capture / Upload'}
          </label>

          <button 
            disabled={!image || isAnalyzing}
            onClick={analyzeImage}
            className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg ${
              !image || isAnalyzing ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            {isAnalyzing ? 'Analyzing...' : `✨ ${t.analyze}`}
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
            📝 {t.analysisResult}
          </h3>
          <div className="flex-grow prose prose-slate max-w-none">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p>Gemini AI is processing your image...</p>
              </div>
            ) : analysis ? (
              <div className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">
                {analysis}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-300 italic text-center px-10">
                {t.placeholderResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
