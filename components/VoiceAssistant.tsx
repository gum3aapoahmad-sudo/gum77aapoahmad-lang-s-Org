
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Mic, MicOff, Volume2, Sparkles, ShieldCheck } from 'lucide-react';
import { APP_MODELS } from '../constants';

interface VoiceAssistantProps {
  onRefine: (prompt: string) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onRefine }) => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Utilities for audio
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
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

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
    setIsListening(false);
  };

  const startSession = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: APP_MODELS.VOICE,
      callbacks: {
        onopen: () => {
          setIsActive(true);
          const source = inputAudioContext.createMediaStreamSource(stream);
          const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
            
            const pcmBlob: Blob = {
              data: encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            
            sessionPromise.then(session => {
              if (session) session.sendRealtimeInput({ media: pcmBlob });
            });
          };

          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.destination);
          setIsListening(true);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.inputTranscription) {
            setTranscription(prev => prev + ' ' + message.serverContent?.inputTranscription?.text);
          }

          if (message.serverContent?.turnComplete) {
            const lastText = transcription.toLowerCase();
            if (
              lastText.includes('apply') || lastText.includes('change') || lastText.includes('make it') ||
              lastText.includes('طبق') || lastText.includes('غير') || lastText.includes('اجعل')
            ) {
               onRefine(lastText);
            }
            setTranscription('');
          }

          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && audioContextRef.current) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }

          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => stopSession(),
        onerror: (e) => console.error('Live API Error:', e),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: "You are Amna (أمنة), a world-class luxury brand strategist and secure AI expert. You help high-end fashion designers refine their campaigns. You are fluent in English and Arabic. When the user suggests a change, affirm it with confidence and professional elegance. Your priority is security and luxury aesthetics. Speak concisely.",
        inputAudioTranscription: {},
      },
    });

    sessionRef.current = await sessionPromise;
  };

  return (
    <div className="fixed bottom-8 inset-inline-end-8 flex flex-col items-end gap-4 z-50">
      {isActive && (
        <div className="bg-[#0A1A3A]/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white/10 max-w-xs animate-in slide-in-from-bottom-4 text-start">
          <div className="flex items-center gap-2 mb-3 text-[#4A90E2] text-[10px] font-bold uppercase tracking-[0.2em]">
            <ShieldCheck size={14} className="text-[#2E8B57]" />
            Amna Secure Strategist
          </div>
          <p className="text-white text-sm leading-relaxed italic font-light">
            {transcription || "Listening to your vision..."}
          </p>
        </div>
      )}
      
      <button
        onClick={isActive ? stopSession : startSession}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
          isActive 
            ? 'bg-red-500 text-white rotate-12 scale-110' 
            : 'bg-[#0A1A3A] text-white hover:bg-[#1A3A5F] hover:scale-110 shadow-blue-900/40'
        }`}
      >
        {isActive ? <MicOff size={26} /> : <Mic size={26} />}
      </button>
    </div>
  );
};

export default VoiceAssistant;
