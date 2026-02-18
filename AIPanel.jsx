import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, X, BrainCircuit, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIPanel = ({ isOpen, onClose, noteContent }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "I'm ready. I can analyze this session, solve problems, or help you brainstorm." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [mode, setMode] = useState('chat'); // 'chat' | 'training'
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const fetchGeminiResponse = async (userText) => {
        setIsTyping(true);
        // Add user message immediately
        const userMsg = { role: 'user', text: userText };
        setMessages(prev => [...prev, userMsg]);

        // Dynamically get backend URL (same IP, port 3000)
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const backendUrl = `${protocol}//${hostname}:3000/api/chat`;

        console.log("Attempting to fetch AI from:", backendUrl);

        try {
            const res = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    context: noteContent
                })
            });

            if (!res.ok) {
                // Try to parse JSON error, fall back to text
                const text = await res.text();
                try {
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.error || "Something went wrong.");
                } catch (e) {
                    console.error("Server returned non-JSON error:", text.slice(0, 500));
                    throw new Error(`Server Error (${res.status}): ${text.slice(0, 100)}...`);
                }
            }

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
        } catch (error) {
            console.error("AI Error:", error);
            // Handle JSON syntax error specifically
            if (error.name === 'SyntaxError' && error.message.includes('Unexpected token')) {
                setMessages(prev => [...prev, { role: 'assistant', text: "Error: server returned HTML. Check console for URL." }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', text: error.message || "I encountered an error connecting to the AI." }]);
            }
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;
        const text = input;
        setInput('');
        fetchGeminiResponse(text);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute top-0 right-0 w-96 h-full bg-dark-900/95 backdrop-blur-xl border-l border-dark-800 flex flex-col shadow-2xl z-50 font-sans"
        >
            {/* Header */}
            <div className="p-4 border-b border-dark-800 flex items-center justify-between bg-dark-900">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-100">Genesis AI</h2>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Online v4.2</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-dark-800 rounded-full">
                    <X size={20} />
                </button>
            </div>

            {/* Mode Switcher */}
            <div className="p-2 grid grid-cols-2 gap-2 bg-dark-850 m-4 rounded-xl p-1">
                <button
                    onClick={() => setMode('chat')}
                    className={`nav-btn p-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${mode === 'chat' ? 'bg-dark-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Sparkles size={14} /> Chat
                </button>
                <button
                    onClick={() => setMode('training')}
                    className={`nav-btn p-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${mode === 'training' ? 'bg-brand-900/50 text-brand-400 ring-1 ring-brand-500/50' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <BrainCircuit size={14} /> Train Context
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {mode === 'training' ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-70">
                        <div className="relative">
                            <div className="absolute inset-0 bg-brand-500 blur-2xl opacity-20 animate-pulse"></div>
                            <BrainCircuit size={64} className="text-brand-500 relative z-10" />
                        </div>
                        <div className="space-y-2 max-w-[80%]">
                            <h3 className="text-lg font-medium text-white">Context Training Active</h3>
                            <p className="text-sm text-gray-400">The model is passively ingesting the live transcript to fine-tune its local weights.</p>
                        </div>
                        <button
                            onClick={() => {
                                setMessages(prev => [...prev, { role: 'user', text: "Train on current session data." }]);
                                simulateAIResponse("Train on current session data.");
                            }}
                            className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-full text-sm font-medium transition-colors shadow-lg shadow-brand-500/20"
                        >
                            Execute Fine-Tuning
                        </button>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] space-y-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                    <div className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-dark-800 text-gray-200 border border-dark-700'
                                        }`}>
                                        {msg.text.split('\n').map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line}
                                                {i !== msg.text.split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-gray-600 px-2 uppercase tracking-wider">
                                        {msg.role === 'assistant' ? 'Genesis AI' : 'You'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-dark-800 rounded-2xl px-4 py-3 border border-dark-700 flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-dark-900 border-t border-dark-800">
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={mode === 'training' ? "Enter training parameters..." : "Ask complex question..."}
                        className="flex-1 bg-dark-850 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm focus:border-brand-500 focus:outline-none placeholder-gray-600 transition-colors"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-3 bg-white text-dark-900 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default AIPanel;

