import React, { useState } from 'react';
import { Mic, Image, Send, Plus, Code, PenTool, Sparkles, Compass } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const SuggestionChip = ({ icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 bg-dark-850 hover:bg-dark-800 text-gray-300 rounded-full text-sm transition-colors border border-transparent hover:border-dark-700"
    >
        {Icon && <Icon size={16} className="text-brand-500" />}
        <span>{label}</span>
    </button>
);

const LandingView = ({ userName = "Gurpreet", onStartInteraction }) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            onStartInteraction(inputValue);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 overflow-y-auto">
            <div className="w-full max-w-3xl flex flex-col gap-8">

                {/* Greeting Section */}
                <div className="space-y-2">
                    <h1 className="text-5xl font-medium tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-red-400">
                            Hi {userName}
                        </span>
                    </h1>
                    <h2 className="text-5xl font-medium text-dark-600">
                        Where should we start?
                    </h2>
                </div>

                {/* Input Section */}
                <div className="w-full relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative bg-dark-850 rounded-3xl p-4 transition-all border border-transparent focus-within:border-dark-700 hover:border-dark-700">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Gemini"
                            className="w-full bg-transparent text-lg text-gray-100 placeholder-dark-600 resize-none outline-none min-h-[60px] max-h-[200px]"
                            rows={1}
                        />

                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-dark-800 rounded-full transition-colors">
                                    <Plus size={20} />
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-dark-800 rounded-full transition-colors">
                                    <span className="font-medium">Tools</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    className={clsx(
                                        "p-2 rounded-full transition-all duration-300",
                                        inputValue.trim() ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20" : "bg-dark-800 text-gray-400"
                                    )}
                                    onClick={() => inputValue.trim() && onStartInteraction(inputValue)}
                                >
                                    {inputValue.trim() ? <Send size={20} /> : <Mic size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Suggestions / Chips */}
                <div className="flex flex-wrap gap-3 mt-4">
                    <SuggestionChip icon={Image} label="Create image" onClick={() => onStartInteraction("Create image")} />
                    <SuggestionChip icon={Code} label="Code a project" onClick={() => onStartInteraction("Code project")} />
                    <SuggestionChip icon={PenTool} label="Write anything" onClick={() => onStartInteraction("Write content")} />
                    <SuggestionChip icon={Sparkles} label="Help me learn" onClick={() => onStartInteraction("Help me learn")} />
                    <SuggestionChip icon={Compass} label="Boost my day" onClick={() => onStartInteraction("Boost my day")} />
                </div>
            </div>
        </div>
    );
};

export default LandingView;
