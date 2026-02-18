import { useState, useEffect, useCallback } from 'react';

const useSpeechToText = (options = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Browser does not support Speech Recognition");
            setError("Browser does not support Speech Recognition");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let currentInterim = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    currentInterim += event.results[i][0].transcript;
                }
            }

            setTranscript((prev) => prev + finalTranscript);
            setInterimTranscript(currentInterim);
        };

        recognition.onend = () => {
            // Auto-restart if it stopped but we still want to listen (unless we stopped it manually)
            // But for now, just sync state
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') {
                setError("Microphone access denied. Check permissions.");
            } else if (event.error === 'network') {
                setError("Network error accessing speech service.");
            } else {
                setError(`Error: ${event.error}`);
            }
            setIsListening(false);
        };

        if (isListening) {
           try {
               recognition.start();
           } catch (e) {
               console.error("Failed to start recognition", e);
           }
        }

        return () => {
             // Clean up
             try {
                recognition.stop();
             } catch(e) {}
        };
    }, [isListening]); 

    // Re-implemented to toggle the state that drives the effect
    const startListening = useCallback(() => setIsListening(true), []);
    const stopListening = useCallback(() => setIsListening(false), []);
    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setError(null);
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript, 
        error 
    };
};

export default useSpeechToText;
