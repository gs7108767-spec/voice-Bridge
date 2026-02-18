import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, AlertCircle, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

const AudienceView = ({ roomCode, socket, onToggleAI, onTextUpdate }) => {
    const [liveText, setLiveText] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('receive_transcript', (text) => {
            setLiveText(text);
            if (onTextUpdate) onTextUpdate(text);
        });

        return () => {
            socket.off('receive_transcript');
        };
    }, [socket, onTextUpdate]);

    // Simple Auto-Scroll
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [liveText]);


    const handleSpeak = () => {
        if ('speechSynthesis' in window) {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            } else {
                const utterance = new SpeechSynthesisUtterance(liveText);
                utterance.onend = () => setIsSpeaking(false);
                window.speechSynthesis.speak(utterance);
                setIsSpeaking(true);
            }
        } else {
            alert("Text-to-speech not supported on this browser.");
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center p-4 h-full overflow-hidden relative">
            {/* Header */}
            <div className="w-full flex items-center justify-between p-4 mb-4 border-b border-dark-800 bg-dark-900 z-10">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-gray-400 font-medium">Live from Host</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-dark-800 px-3 py-1 rounded-full text-xs text-brand-400 font-mono tracking-wider">
                        CODE: {roomCode}
                    </div>
                    <button
                        onClick={onToggleAI}
                        className="p-2 hover:bg-dark-800 rounded-full text-ai-500 hover:text-ai-400 transition-colors"
                        title="AI Assistant"
                    >
                        <Sparkles size={20} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div ref={contentRef} className="flex-1 w-full max-w-3xl overflow-y-auto p-6 space-y-4">
                {liveText ? (
                    <p className="text-2xl md:text-3xl text-gray-100 font-medium leading-relaxed transition-all">
                        {liveText}
                    </p>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
                        <AlertCircle size={32} />
                        <p>Waiting for host to speak...</p>
                    </div>
                )}
            </div>

            {/* Footer / Controls */}
            <div className="w-full max-w-md p-4 pb-8 z-10">
                <button
                    onClick={handleSpeak}
                    className={clsx(
                        "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all",
                        isSpeaking
                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                            : "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500"
                    )}
                >
                    {isSpeaking ? (
                        <> <VolumeX size={24} /> Stop Reading </>
                    ) : (
                        <> <Volume2 size={24} /> Read Aloud </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AudienceView;
