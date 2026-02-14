
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
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Sync with global language if it changes, but only if not active
  useEffect(() => {
    if (!isActive) {
      setVoiceLanguage(initialLanguage);
    }
  }, [initialLanguage, isActive]);

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
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
    }
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
              setTranscript(prev => [...prev.slice(-4), `You: ${text}`]);
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscript(prev => [...prev.slice(-4), `GrowWise: ${text}`]);
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
          onerror: (e) => {
            console.error(e);
            stopConversation();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are a helpful agricultural expert advisor named GrowWise. Speak in ${voiceLanguage === 'hi' ? 'Hindi' : 'English'}. Help the farmer with crop choices, soil health, and pest management. Be concise and empathetic.`,
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

    } catch (err) {
      console.error(err);
      stopConversation();
    }
  };

  return (
    <div className="bg-[#f9fbf9] rounded-[3rem] p-10 shadow-sm border border-emerald-50 animate-in fade-in duration-500">
      <div className="flex flex-col items-center text-center space-y-8">
        
        {/* Language Selection Toggle */}
        <div className="flex items-center bg-[#f1f6f2] p-1.5 rounded-2xl border border-emerald-50 shadow-inner">
          <button 
            disabled={isActive}
            onClick={() => setVoiceLanguage('en')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
              voiceLanguage === 'en' 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'text-emerald-700/60 hover:text-emerald-800'
            } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            English
          </button>
          <button 
            disabled={isActive}
            onClick={() => setVoiceLanguage('hi')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
              voiceLanguage === 'hi' 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'text-emerald-700/60 hover:text-emerald-800'
            } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            हिन्दी
          </button>
        </div>

        <div className="relative">
          <div className={`absolute inset-0 bg-emerald-500 rounded-full opacity-20 blur-3xl transition-all duration-1000 ${isActive ? 'animate-pulse scale-150' : 'scale-0'}`}></div>
          <button 
            onClick={isActive ? stopConversation : startConversation}
            className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center text-5xl shadow-2xl transition-all active:scale-90 ${
              isActive ? 'bg-red-500 text-white animate-bounce' : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isActive ? '⏹️' : '🎙️'}
          </button>
        </div>

        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{t.voiceAssistantTitle}</h2>
          <p className="text-slate-500 mt-2 font-medium">{t.voiceInstruction}</p>
          <p className="text-[10px] font-black text-emerald-600 mt-3 uppercase tracking-[0.2em] bg-emerald-100 px-4 py-1.5 rounded-full inline-block">
            {voiceLanguage === 'en' ? 'Mode: English' : 'मोड: हिंदी'}
          </p>
        </div>

        <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 min-h-[160px] flex flex-col justify-center border border-emerald-50 shadow-inner">
          {!isActive ? (
            <p className="text-emerald-800/20 italic font-black text-lg">{t.voiceStart}</p>
          ) : (
            <div className="space-y-4 text-left">
              {transcript.length === 0 && (
                <div className="flex items-center gap-3 text-emerald-600 font-black justify-center">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="uppercase tracking-widest text-xs">{isSpeaking ? t.voiceSpeaking : t.voiceListening}</span>
                </div>
              )}
              {transcript.map((line, i) => (
                <p key={i} className={`text-base leading-relaxed ${line.startsWith('You') ? 'text-slate-400 font-medium italic' : 'text-emerald-800 font-black'}`}>
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
        
        {isActive && (
          <button 
            onClick={stopConversation}
            className="text-xs font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-all"
          >
            {t.voiceStop}
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;
