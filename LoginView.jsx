import React, { useState } from 'react';
import { Mic, Users, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

const LoginView = ({ onJoinAsHost, onJoinAsAudience }) => {
    const [view, setView] = useState('selection'); // 'selection' | 'audience-input'
    const [code, setCode] = useState('');

    if (view === 'audience-input') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-6 text-center">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">
                        Join Broadcast
                    </h2>
                    <p className="text-gray-400">Enter the 6-digit code from the host</p>

                    <input
                        type="text"
                        value={code}
                        maxLength={6}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-dark-850 border border-dark-700 rounded-2xl p-4 text-center text-3xl tracking-[1em] font-mono focus:border-brand-500 focus:outline-none transition-colors"
                        placeholder="000000"
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={() => setView('selection')}
                            className="flex-1 py-3 rounded-xl font-medium bg-dark-800 text-gray-400 hover:text-white transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => code.length === 6 && onJoinAsAudience(code)}
                            disabled={code.length !== 6}
                            className="flex-1 py-3 rounded-xl font-medium bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-600/20"
                        >
                            Join
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Host Card */}
                <button
                    onClick={onJoinAsHost}
                    className="group relative bg-dark-850 hover:bg-dark-800 border border-dark-800 hover:border-brand-500/50 rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10 flex flex-col gap-4"
                >
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 group-hover:scale-110 transition-transform">
                        <Mic size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-100 mb-2">I am a Host</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Create a room and broadcast your voice. Generates a live code for others to join.
                        </p>
                    </div>
                    <div className="mt-auto pt-4 flex items-center text-brand-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                        Start Hosting <ArrowRight size={18} className="ml-2" />
                    </div>
                </button>

                {/* Audience Card */}
                <button
                    onClick={() => setView('audience-input')}
                    className="group relative bg-dark-850 hover:bg-dark-800 border border-dark-800 hover:border-ai-500/50 rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-ai-500/10 flex flex-col gap-4"
                >
                    <div className="w-14 h-14 rounded-2xl bg-ai-500/10 flex items-center justify-center text-ai-500 group-hover:scale-110 transition-transform">
                        <Users size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-100 mb-2">I am Audience</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Join a room with a code to read and listen to the live transcript.
                        </p>
                    </div>
                    <div className="mt-auto pt-4 flex items-center text-ai-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                        Join Room <ArrowRight size={18} className="ml-2" />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default LoginView;
