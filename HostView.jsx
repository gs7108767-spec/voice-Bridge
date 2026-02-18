import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Share2, Copy, Check, Sparkles, X, MessageCircle } from 'lucide-react';
import useSpeechToText from '../hooks/useSpeechToText';
import { clsx } from 'clsx';

const ShareModal = ({ isOpen, onClose, url, roomCode }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Join my VoiceNotes Live session!\n${url}`)}`;

    const handleCopy = () => {
        // Try native then fallback
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url);
            setCopied(true);
        } else {
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            document.body.removeChild(textArea);
        }
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-white mb-2">Share Session</h3>
                <p className="text-gray-400 text-sm mb-6">Invite others to view the transcription live.</p>

                {/* Link Box */}
                <div className="bg-dark-900 rounded-lg p-3 flex items-center gap-2 mb-4 border border-dark-700">
                    <input
                        readOnly
                        value={url}
                        className="bg-transparent flex-1 text-sm text-gray-300 outline-none"
                    />
                    <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-dark-700 rounded-md text-gray-400 hover:text-white transition-colors"
                        title="Copy Link"
                    >
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 gap-3">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-medium transition-transform active:scale-95"
                    >
                        <MessageCircle size={20} />
                        Share via WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
};

const HostView = ({ roomCode, socket, onUpdate, onToggleAI, initialContent, noteId }) => {
    // We use interimTranscript for real-time feedback
    const { isListening, transcript, interimTranscript, startListening, stopListening, error } = useSpeechToText();
    const [copied, setCopied] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    // Fix Duplicate Bug: Store the valid initial content ONCE on mount.
    // We ignore subsequent updates to initialContent to prevent the "append loop".
    const [baseContent, setBaseContent] = useState(initialContent || "");

    // Logic Update: If the Note ID changes, we MUST reset baseContent to the new note's content.
    // This allows switching notes while hosting.
    useEffect(() => {
        setBaseContent(initialContent || "");
    }, [noteId]); // Only reset if noteId changes (or on mount)

    // Fallback: If initialContent arrives late (e.g. note fetch), set it if empty.
    useEffect(() => {
        if (!baseContent && initialContent) {
            setBaseContent(initialContent);
        }
    }, [initialContent]);
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        // Pre-fetch IP for the link
        const fetchIp = async () => {
            let baseUrl = window.location.origin;
            try {
                const res = await fetch('http://localhost:3000/api/network-ip');
                const data = await res.json();
                if (data.ip && data.ip !== 'localhost') {
                    const port = window.location.port || '80';
                    baseUrl = `http://${data.ip}:${port}`;
                }
            } catch (e) {
                console.error("Failed IP fetch", e);
            }
            setShareUrl(`${baseUrl}?code=${roomCode}`);
        };
        fetchIp();
    }, [roomCode]);

    // Broadcast transcript updates
    useEffect(() => {
        if (roomCode && transcript && socket) {
            socket.emit('send_transcript', { roomCode, text: transcript });

            // Fix: We append the CURRENT session transcript to the FIXED baseContent.
            // This prevents "Initial + Transcript + Transcript..." recursion.
            if (onUpdate) {
                const fullContent = (baseContent ? baseContent + "\n" : "") + transcript;
                onUpdate(fullContent);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript, roomCode, socket, baseContent]);

    const handleCopyCode = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(roomCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-between p-8 relative overflow-hidden">
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                url={shareUrl}
                roomCode={roomCode}
            />

            {/* Background Ambience */}
            <div className={clsx(
                "absolute inset-0 transition-opacity duration-1000 pointer-events-none",
                isListening ? "opacity-100" : "opacity-0"
            )}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[100px] animate-pulse" />
            </div>

            {/* Header: Room Code */}
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="bg-dark-850 border border-dark-700 rounded-full px-8 py-3 flex items-center gap-4 shadow-lg">
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Room Code</span>
                        <span className="text-3xl font-mono font-bold text-brand-400 tracking-widest">{roomCode}</span>
                    </div>
                    <div className="h-10 w-px bg-dark-700" />
                    <button
                        onClick={handleCopyCode}
                        className="p-2 hover:bg-dark-700 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                    </button>
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="p-2 hover:bg-dark-700 rounded-full text-brand-400 hover:text-brand-300 transition-colors"
                    >
                        <Share2 size={20} />
                    </button>
                    <div className="h-10 w-px bg-dark-700" />
                    <button
                        onClick={onToggleAI}
                        className="p-2 hover:bg-dark-700 rounded-full text-ai-500 hover:text-ai-400 transition-colors group"
                        title="AI Assistant"
                    >
                        <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Main Mic Interface */}
            <div className="relative z-10 flex-1 flex items-center justify-center flex-col gap-4">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/90 text-white max-w-md text-center px-6 py-4 rounded-xl text-sm font-medium animate-bounce shadow-lg flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-lg">
                            <span>🚫 Microphone Blocked</span>
                        </div>
                        <p className="opacity-90">
                            Use <strong>http://localhost:5173</strong> to host and record.<br />
                            Use the IP address link <strong>only for audience/sharing</strong>.
                        </p>
                    </div>
                )}

                <button
                    onClick={isListening ? stopListening : startListening}
                    className={clsx(
                        "relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300",
                        isListening
                            ? "bg-red-500 text-white shadow-[0_0_80px_rgba(239,68,68,0.4)] scale-110"
                            : "bg-dark-800 text-gray-400 hover:bg-dark-750 hover:text-white hover:scale-105 border border-dark-700"
                    )}
                >
                    {isListening ? (
                        <MicOff size={64} />
                    ) : (
                        <Mic size={64} />
                    )}

                    {/* Ring Animations */}
                    {isListening && (
                        <>
                            <div className="absolute inset-0 rounded-full border-2 border-red-500 opacity-20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                            <div className="absolute inset-0 rounded-full border-2 border-red-500 opacity-20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
                        </>
                    )}
                </button>
            </div>

            <div className="h-32 w-full max-w-2xl text-center z-10 flex flex-col items-center">
                <p className="text-xl text-gray-300 font-medium leading-relaxed transition-all">
                    {/* Display interim text for immediate feedback */}
                    {transcript} {interimTranscript && <span className="text-gray-500 italic">{interimTranscript}</span>}
                    {!transcript && !interimTranscript && (isListening ? "Listening..." : "Tap microphone to start hosting")}
                </p>
            </div>
        </div>
    );
};

export default HostView;
