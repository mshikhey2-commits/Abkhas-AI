
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader2, Sparkles, Mic, MicOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';
import { askAbkhas } from '../services/geminiService';

const AIChatBot: React.FC = () => {
  const { lang, userPrefs } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const messageToSend = textOverride || input;
    if (!messageToSend.trim() || isLoading) return;
    
    setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askAbkhas(messageToSend, userPrefs);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: lang === 'ar' ? 'أبخص واجه ضغط كبير حالياً، حاول مرة ثانية بعد شوي.' : 'Abkhas is busy, try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(lang === 'ar' ? "متصفحك لا يدعم التعرف على الصوت." : "Browser doesn't support speech recognition.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="fixed bottom-24 end-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <span className="font-bold">{lang === 'ar' ? 'اسأل أبخص' : 'Ask Abkhas'}</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-900/50 text-start">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><Bot size={16} /></div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-ss-none text-sm shadow-sm">{t.chatWelcome}</div>
            </div>
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm shadow-sm max-w-[80%] ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-se-none' : 'bg-white dark:bg-slate-800 dark:text-slate-200 rounded-ss-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && <div className="flex gap-2 items-center text-indigo-500 font-bold text-xs"><Loader2 size={14} className="animate-spin" /> {lang === 'ar' ? 'أبخص يفكر...' : 'Thinking...'}</div>}
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={lang === 'ar' ? 'وش تبي تسأل أبخص؟' : 'Ask anything...'}
                  className="w-full ps-4 pe-12 py-3 bg-gray-100 dark:bg-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <button 
                  onClick={() => handleSend()}
                  className="absolute end-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Send size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
              </div>
              <button 
                onClick={toggleVoice}
                className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative"
      >
        <div className="absolute -top-1 -end-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
          <Sparkles size={10} />
        </div>
        <MessageCircle size={32} className="group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
};

export default AIChatBot;
