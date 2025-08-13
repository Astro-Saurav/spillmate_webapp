import { useState, useEffect, useRef, Fragment } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Mic, Bot, Send, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';

// --- TYPE DEFINITIONS ---
// It's best practice to move these to a central `types.ts` file
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

type BotState = 'idle' | 'listening' | 'thinking' | 'speaking';
type MoodState = 'neutral' | 'positive' | 'negative';

// This interface helps TypeScript understand the browser's Speech Recognition API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

// --- Main Component ---
export default function Conversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);

  // Effect to set up initial state or fetch conversations from a database
  useEffect(() => {
    if (user && conversations.length === 0) {
      const welcomeConvo: Conversation = { 
        id: 'welcome-chat', 
        title: 'Your First Conversation', 
        messages: [{ 
          id: 'welcome-msg', 
          role: 'assistant', 
          content: "Hello! I'm here to listen. Whatever is on your mind, feel free to share." 
        }]
      };
      setConversations([welcomeConvo]);
      setActiveConv(welcomeConvo);
    }
  }, [user]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    if (!activeConv) return;
    const newMessage: Message = { id: new Date().toISOString(), role, content };
    const updatedConv = { ...activeConv, messages: [...activeConv.messages, newMessage] };
    const updatedConvs = conversations.map(c => c.id === activeConv.id ? updatedConv : c);
    setConversations(updatedConvs);
    setActiveConv(updatedConv);
  };

  const createNewConversation = () => {
    const newId = `convo_${new Date().toISOString()}`;
    const newConvo: Conversation = {
        id: newId,
        title: "New Conversation",
        messages: [{id: 'new-msg', role: 'assistant', content: "It's a fresh start. What would you like to talk about?"}]
    }
    setConversations([newConvo, ...conversations]);
    setActiveConv(newConvo);
  }

  const deleteConversation = (idToDelete: string) => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
        const updatedConvs = conversations.filter(c => c.id !== idToDelete);
        setConversations(updatedConvs);

        if (activeConv?.id === idToDelete) {
            setActiveConv(updatedConvs.length > 0 ? updatedConvs[0] : null);
        }
    }
  };
  
  if (!user) {
    return <div className="flex h-full items-center justify-center p-8 text-slate-400">Please sign in to begin.</div>;
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-8">
      <Sidebar 
        conversations={conversations} 
        activeConv={activeConv} 
        setActiveConv={setActiveConv}
        onNewChat={createNewConversation}
        onDelete={deleteConversation}
      />
      <AnimatePresence mode="wait">
        {activeConv ? (
          <ChatArea key={activeConv.id} activeConv={activeConv} addMessage={addMessage} />
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-grow flex flex-col items-center justify-center text-center text-slate-400 p-8"
          >
            <Bot className="h-16 w-16 mb-4 text-slate-500"/>
            <h2 className="text-xl font-semibold text-white">No Conversation Selected</h2>
            <p>Select a conversation from the history panel or start a new one.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sidebar Component ---
function Sidebar({ conversations, activeConv, setActiveConv, onNewChat, onDelete }: {
  conversations: Conversation[];
  activeConv: Conversation | null;
  setActiveConv: (conv: Conversation) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div initial={{x:-30, opacity:0}} animate={{x:0, opacity:1}} transition={{ duration: 0.5, ease: "easeOut" }} className="hidden w-1/4 flex-col gap-4 md:flex">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">History</h2>
        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={onNewChat} className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700 shadow-md">
          <Plus className="h-4 w-4"/> New Chat
        </motion.button>
      </div>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl flex-grow overflow-y-auto p-3 space-y-1">
        {conversations.map((c) => (
          <div key={c.id} className="group relative">
            <button onClick={() => setActiveConv(c)} className={`w-full rounded-lg p-3 text-left transition-colors truncate ${activeConv?.id===c.id ? 'bg-purple-600/40 text-white' : 'text-slate-300 hover:bg-slate-700/50'}`}>
              <h3 className="text-sm font-semibold">{c.title}</h3>
            </button>
            <motion.button 
              onClick={() => onDelete(c.id)} 
              whileHover={{ scale: 1.1, color: '#f87171' }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              aria-label="Delete conversation"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// --- ChatArea Component ---
function ChatArea({ activeConv, addMessage }: { activeConv: Conversation; addMessage: (role: 'user' | 'assistant', content: string) => void; }) {
  const [botState, setBotState] = useState<BotState>('idle');
  const [mood, setMood] = useState<MoodState>('neutral'); // This can be enhanced further
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect for Text-to-Speech
  useEffect(() => {
    const lastMessage = activeConv.messages[activeConv.messages.length - 1];
    if (lastMessage?.role === 'assistant' && botState === 'idle') {
      const utterance = new SpeechSynthesisUtterance(lastMessage.content);
      utterance.onstart = () => setBotState('speaking');
      utterance.onend = () => setBotState('idle');
      speechSynthesis.speak(utterance);
    }
    // Cleanup synthesis on component unmount or if message changes mid-speech
    return () => speechSynthesis.cancel();
  }, [activeConv.messages, botState]);

  // Effect to scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv.messages]);
  
  return (
    <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} exit={{y:20, opacity:0}} transition={{ duration: 0.3, ease: 'easeOut' }} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl flex flex-grow flex-col">
       <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <AnimatedBotAvatar key="avatar" state={botState} mood={mood} />
          {activeConv.messages.map((msg) => (<MessageBubble key={msg.id} msg={msg}/>))}
          <div ref={messagesEndRef} />
       </div>
       <InputBar addMessage={addMessage} setBotState={setBotState} activeConv={activeConv} />
    </motion.div>
  );
}

// --- InputBar Component ---
function InputBar({ addMessage, setBotState, activeConv }: { 
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setBotState: (state: BotState) => void;
  activeConv: Conversation;
}) {
    const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition(setBotState);
    const [inputText, setInputText] = useState('');
    
    useEffect(() => { setInputText(transcript) }, [transcript]);

    const handleSend = async (content: string) => {
        if (!content.trim()) return;
        
        const userMessage: Message = { id: 'user-temp-' + Date.now(), role: 'user', content };
        addMessage(userMessage.role, userMessage.content);
        
        setBotState('thinking');
        setInputText('');
        setTranscript('');

        try {
            // Call our secure backend API with the full conversation history
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...activeConv.messages, userMessage] })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "The AI failed to respond.");
            }

            const data = await response.json();
            addMessage('assistant', data.content);

        } catch (error: any) {
            console.error("API Error:", error);
            addMessage('assistant', `I'm sorry, I'm having a little trouble connecting right now. (${error.message})`);
        } finally {
            setBotState('idle');
        }
    }
    
    return (
        <div className="border-t border-slate-700/50 p-4">
            <div className="flex items-center gap-3">
                <input 
                    value={inputText} 
                    onChange={e => setInputText(e.target.value)} 
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(inputText); }}}
                    placeholder={isListening ? "Listening..." : "Type or hold the mic to talk..."} 
                    className="w-full border-none bg-slate-700/50 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none" 
                />
                <motion.button 
                    onMouseDown={startListening} 
                    onMouseUp={() => { stopListening(); if (transcript) handleSend(transcript); }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`flex-shrink-0 rounded-full p-3.5 text-white transition-colors ${isListening ? 'bg-red-600 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}`}
                    aria-label={isListening ? "Stop listening" : "Start listening"}
                >
                    <Mic className="h-5 w-5"/>
                </motion.button>
                 <motion.button 
                    onClick={() => handleSend(inputText)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex-shrink-0 rounded-full p-3.5 bg-teal-600 text-white hover:bg-teal-700"
                    aria-label="Send message"
                >
                    <Send className="h-5 w-5"/>
                </motion.button>
            </div>
        </div>
    );
}

// --- MessageBubble Component ---
function MessageBubble({ msg }: { msg: Message }) {
  return (
    <motion.div 
      initial={{opacity:0, y:10}} 
      animate={{opacity:1, y:0}} 
      className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-md md:max-w-lg rounded-2xl px-4 py-2.5 shadow-md ${msg.role === 'user' ? 'rounded-br-none bg-gradient-to-r from-purple-600 to-teal-600 text-white' : 'rounded-bl-none bg-slate-700 text-slate-200'}`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
      </div>
    </motion.div>
  );
}

// --- AnimatedBotAvatar Component ---
function AnimatedBotAvatar({ state, mood }: { state: BotState, mood: MoodState }) {
  const variants: Variants = {
    idle: { scale: 1, rotate: 0 },
    listening: { scale: 1.1 },
    thinking: { rotate: 360, transition: { repeat: Infinity, duration: 1.5, ease: "linear" } },
    speaking: { scale: [1, 1.05, 1], transition: { repeat: Infinity, repeatType: "reverse", duration: 1.2 } }
  };
  const moodMap = { positive: '😊', negative: '😔', neutral: '🙂' };

  return (
    <motion.div 
      className="flex justify-start mb-4"
      animate={state}
      variants={variants}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <div className="relative">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center shadow-lg shadow-black/30">
          <Bot className="w-8 h-8 text-white/90" />
        </div>
        <AnimatePresence>
          <motion.div 
            key={mood} // Animate when mood changes
            initial={{scale:0, y: 10}} 
            animate={{scale:1, y: 0}} 
            exit={{scale:0}} 
            className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-800 bg-slate-700 text-xl"
          >
            {moodMap[mood]}
          </motion.div>
        </AnimatePresence>
        {state === 'listening' && <div className="absolute inset-0 rounded-full bg-purple-500/50 blur-lg animate-pulse -z-10" />}
      </div>
    </motion.div>
  );
}

// --- useSpeechRecognition Hook ---
function useSpeechRecognition(setBotState: (state: BotState) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechAPI = ((window as unknown) as IWindow).SpeechRecognition || ((window as unknown) as IWindow).webkitSpeechRecognition;
    if (!SpeechAPI) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechAPI();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      setTranscript(
        Array.from(event.results)
          .map((res: any) => res[0])
          .map(res => res.transcript)
          .join('')
      );
    };

    recognition.onstart = () => { setIsListening(true); setBotState('listening'); };
    recognition.onend = () => { setIsListening(false); setBotState('idle'); };
    
    recognitionRef.current = recognition;

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }
  }, [setBotState]);

  return {
    isListening,
    transcript,
    setTranscript,
    startListening: () => recognitionRef.current?.start(),
    stopListening: () => recognitionRef.current?.stop(),
  };
}