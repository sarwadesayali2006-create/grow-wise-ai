
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { translations, Language } from '../translations';

interface VoiceAssistantProps {
  language: Language;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ language: initialLanguage }) => {
  const [voiceLanguage, setVoiceLanguage] = useState<Language>(initialLanguage);
  const t = translations[voiceLanguage];
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      setVoiceLanguage(initialLanguage);
    }
  }, [initialLanguage, isActive]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopConversation = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  };

  const startConversation = async () => {
    try {
      setIsActive(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      const targetLangName = voiceLanguage === 'hi' ? 'Hindi' : voiceLanguage === 'mr' ? 'Marathi' : 'English';

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsListening(true);
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscript(prev => [...prev.slice(-20), `👨‍🌾: ${text}`]);
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscript(prev => [...prev.slice(-20), `🤖: ${text}`]);
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setIsSpeaking(true);
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const audioSource = ctx.createBufferSource();
              audioSource.buffer = buffer;
              audioSource.connect(ctx.destination);
              audioSource.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(audioSource);
              audioSource.onended = () => {
                sourcesRef.current.delete(audioSource);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopConversation(),
          onerror: (e) => { console.error(e); stopConversation(); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are GrowWise, a world-class agricultural expert. Speak in ${targetLangName}. Assist with soil, pests, and crops. Be concise. Respond both in text and audio.`,
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
      scriptProcessor.onaudioprocess = (e) => {
        if (sessionRef.current) {
          const inputData = e.inputBuffer.getChannelData(0);
          sessionRef.current.sendRealtimeInput({ media: createBlob(inputData) });
        }
      };
    } catch (err) { console.error(err); stopConversation(); }
  };

  const handleSendChat = async (text: string = chatInput) => {
    if (!text.trim()) return;
    const userMsg = `👨‍🌾: ${text}`;
    setTranscript(prev => [...prev.slice(-20), userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const targetLangName = voiceLanguage === 'hi' ? 'Hindi' : voiceLanguage === 'mr' ? 'Marathi' : 'English';
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: text,
        config: {
          systemInstruction: `You are GrowWise, a world-class agricultural expert. Answer in ${targetLangName}. Be helpful and concise.`,
        }
      });

      const aiMsg = `🤖: ${response.text}`;
      setTranscript(prev => [...prev.slice(-20), aiMsg]);
    } catch (err) {
      console.error(err);
      setTranscript(prev => [...prev, "🤖: Error processing your request."]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h2 className="text-4xl font-black text-slate-900 flex items-center gap-4 tracking-tighter">
          <span className="bg-emerald-100 p-3 rounded-3xl shadow-lg transform hover:rotate-12 transition-transform">🎙️</span> 
          {t.voiceAssistantTitle}
        </h2>
        
        <div className="flex items-center bg-[#f1f6f2] p-1.5 rounded-2xl border border-emerald-50 shadow-inner perspective-1000">
          <button 
            disabled={isActive}
            onClick={() => setVoiceLanguage('en')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
              voiceLanguage === 'en' 
                ? 'bg-emerald-600 text-white shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] scale-105' 
                : 'text-emerald-700/60 hover:text-emerald-800'
            } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            English
          </button>
          <button 
            disabled={isActive}
            onClick={() => setVoiceLanguage('hi')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
              voiceLanguage === 'hi' 
                ? 'bg-emerald-600 text-white shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] scale-105' 
                : 'text-emerald-700/60 hover:text-emerald-800'
            } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            हिन्दी
          </button>
          <button 
            disabled={isActive}
            onClick={() => setVoiceLanguage('mr')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
              voiceLanguage === 'mr' 
                ? 'bg-emerald-600 text-white shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] scale-105' 
                : 'text-emerald-700/60 hover:text-emerald-800'
            } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            मराठी
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Section: Live Visuals */}
        <div className="bg-[#f9fbf9] rounded-[4rem] p-12 shadow-2xl border border-emerald-50 flex flex-col items-center text-center space-y-12 relative overflow-hidden group perspective-1000 min-h-[500px] justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent)] pointer-events-none"></div>
          
          <div className="relative">
            <div className={`absolute inset-0 bg-emerald-500 rounded-full opacity-20 blur-3xl transition-all duration-1000 ${isActive ? 'animate-pulse scale-150' : 'scale-0'}`}></div>
            <button 
              onClick={isActive ? stopConversation : startConversation}
              className={`relative z-10 w-48 h-48 rounded-full flex items-center justify-center text-7xl shadow-2xl transition-all active:scale-90 border-8 border-white ${
                isActive ? 'bg-red-500 text-white animate-bounce' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:rotate-3'
              }`}
            >
              <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {isActive ? '⏹️' : '🎙️'}
            </button>
            {isActive && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping [animation-delay:0.3s]"></span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping [animation-delay:0.6s]"></span>
              </div>
            )}
          </div>

          <div className="space-y-4 transform translate-z-10">
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter">
               {voiceLanguage === 'en' ? 'Live Voice' : voiceLanguage === 'hi' ? 'लाइव वॉयस' : 'लाइव्ह व्हॉइस'}
            </h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">{t.voiceInstruction}</p>
            <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full border border-emerald-50 shadow-sm">
               <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                 {voiceLanguage === 'en' ? 'Gemini 2.5 Native Audio' : voiceLanguage === 'hi' ? 'जेमिनी 2.5 नेटिव ऑडियो' : 'जेमिनी २.५ नेटिव्ह ऑडिओ'}
               </span>
            </div>
          </div>
        </div>

        {/* Right Section: Chat & Transcript Hub */}
        <div className="bg-white rounded-[4rem] shadow-xl border border-emerald-50 flex flex-col h-[650px] group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          
          {/* Header */}
          <div className="px-10 py-8 border-b border-emerald-100/50 flex items-center justify-between shrink-0">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <span className="text-emerald-600 text-2xl">✨</span> {voiceLanguage === 'en' ? 'Conversational Hub' : voiceLanguage === 'hi' ? 'संवाद केंद्र' : 'संवाद केंद्र'}
            </h3>
            {isActive && (
               <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-4 py-1.5 rounded-full animate-pulse uppercase tracking-widest">
                 {isSpeaking ? t.voiceSpeaking : t.voiceListening}
               </span>
            )}
          </div>

          {/* Transcript/Message Area */}
          <div 
            ref={scrollRef}
            className="flex-grow p-10 overflow-y-auto space-y-6 scroll-smooth custom-scrollbar"
          >
            {transcript.length === 0 && !isChatLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-30">
                <div className="text-7xl transform -rotate-12">🚜</div>
                <p className="text-xl font-black text-emerald-900 uppercase tracking-tighter">{voiceLanguage === 'en' ? 'Start chatting or speaking' : 'बातचीत शुरू करें'}</p>
              </div>
            ) : (
              <>
                {transcript.map((line, i) => (
                  <div key={i} className={`flex ${line.startsWith('👨‍🌾') ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] p-5 rounded-[2rem] shadow-sm border-2 ${
                      line.startsWith('👨‍🌾') 
                        ? 'bg-slate-900 border-slate-800 text-white font-bold' 
                        : 'bg-emerald-50 border-emerald-100 text-slate-800 font-medium'
                    }`}>
                      {line.replace(/👨‍🌾:|🤖:/, '').trim()}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-emerald-50 p-5 rounded-[2rem] border-2 border-emerald-100 flex gap-2">
                       <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                       <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Interaction Area (Quick Chips + Input) */}
          <div className="p-8 bg-[#fcfdfa] border-t border-emerald-100/50 space-y-4 shrink-0">
            {/* Quick Action Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 scroll-hide">
              {[t.pestControl, t.soilHealth, t.cropPrice].map((chip) => (
                <button 
                  key={chip}
                  onClick={() => handleSendChat(chip)}
                  className="whitespace-now8 py-2 px-4 bg-white border border-emerald-100 rounded-full text-[10px] font-black text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95 shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input Field */}
            <div className="relative flex items-center gap-3">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder={t.chatPlaceholder}
                className="w-full bg-white border-2 border-emerald-100/50 px-6 py-5 rounded-3xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-slate-800 shadow-inner"
              />
              <button 
                onClick={() => handleSendChat()}
                disabled={!chatInput.trim() || isChatLoading}
                className={`p-5 rounded-3xl shadow-xl transition-all active:scale-90 ${
                  !chatInput.trim() || isChatLoading 
                    ? 'bg-slate-100 text-slate-300' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
