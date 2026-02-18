import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Copy, Check, Sparkles } from 'lucide-react';
import useSpeechToText from '../hooks/useSpeechToText';
import { clsx } from 'clsx';

const NoteEditor = ({ note, onUpdate, onToggleAI }) => {
    const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechToText();
    const [copied, setCopied] = React.useState(false);
    const textareaRef = useRef(null);

    // Append transcript to note content when it updates
    useEffect(() => {
        if (transcript) {
            // Need to handle cursor position or just append?
            // Simple approach: Append to end, or update "transcript" buffer.
            // Problem: "transcript" grows from start of session.
            // We need the *difference* or just append the final results.

            // Actually, useSpeechToText returns full session transcript.
            // If we want to append to existing note, we need to manage that interaction.
            // Strategy: When listening stops, append transcript to note and reset transcript?
            // Or stream it in?

            // Streaming:
            // note.content + " " + transcript?
            // But transcript keeps growing.
            // We can display the "transcript" separately or merge it.
        }
    }, [transcript]); // This logic is tricky.

    // Revised approach for speech:
    // We'll let the User manually handle the "Stream".
    // Or better: We detect changes in transcript and update the parent, BUT `transcript` accumulates from 0.
    // So: Default state = note.content
    // Visual state = note.content + (isListening ? transcript : "")
    // When listening stops, commit transcript to note.content and reset transcript.

    useEffect(() => {
        // If we stop listening, we should "commit" the transcript.
        if (!isListening && transcript) {
            const newContent = (note.content ? note.content + ' ' : '') + transcript;
            onUpdate({ ...note, content: newContent });
            resetTranscript();
        }
    }, [isListening, transcript, note, onUpdate, resetTranscript]);


    const handleCopy = () => {
        navigator.clipboard.writeText(note.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!note) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-dark-900/50">
                <div className="text-center">
                    <p className="text-xl font-medium mb-2">Select a note or create a new one</p>
                    <p className="text-sm opacity-60">Your thoughts, organized.</p>
                </div>
            </div>
        );
    }

    // Display content: stored content + current active transcript
    const displayContent = note.content + (isListening && transcript ? ' ' + transcript : '');

    return (
        <div className="flex-1 flex flex-col h-full bg-dark-900 relative">
            <div className="p-6 pb-2">
                <input
                    type="text"
                    value={note.title}
                    onChange={(e) => onUpdate({ ...note, title: e.target.value })}
                    placeholder="Note Title"
                    className="text-4xl font-bold bg-transparent border-none focus:outline-none text-white w-full placeholder-gray-700"
                />
                <div className="text-sm text-gray-500 mt-2 flex items-center justify-between">
                    <span>{new Date(note.updatedAt).toLocaleString()}</span>
                    {/* Header Actions */}
                    <div className="flex gap-2">
                        <button onClick={handleCopy} className="p-2 hover:bg-dark-800 rounded-full transition-colors text-gray-400 hover:text-white" title="Copy text">
                            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 pt-2 relative">
                <textarea
                    ref={textareaRef}
                    value={displayContent}
                    onChange={(e) => onUpdate({ ...note, content: e.target.value })}
                    placeholder="Start typing or recording..."
                    className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-lg text-gray-300 placeholder-dark-700 leading-relaxed custom-scrollbar"
                />

                {/* Floating Action Bar */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-dark-800/90 backdrop-blur-md p-2 rounded-2xl border border-dark-700 shadow-2xl">
                    <button
                        onClick={isListening ? stopListening : startListening}
                        className={clsx(
                            "p-4 rounded-xl transition-all flex items-center gap-2 font-medium min-w-[140px] justify-center",
                            isListening
                                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 animate-pulse border border-red-500/20"
                                : "bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/20"
                        )}
                    >
                        {isListening ? (
                            <> <MicOff size={20} /> Stop </>
                        ) : (
                            <> <Mic size={20} /> Record </>
                        )}
                    </button>

                    <div className="w-px h-8 bg-dark-600 mx-1"></div>

                    <button
                        onClick={onToggleAI}
                        className="p-4 hover:bg-dark-700 rounded-xl text-ai-500 transition-colors flex items-center gap-2 group"
                    >
                        <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">AI Assistant</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteEditor;
