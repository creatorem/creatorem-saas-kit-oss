// components/VoiceInput.tsx
'use client';

import { Icon } from '@kit/ui/icon';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    duringTranscript?: (text: string) => void;
}

export function VoiceInput({ onTranscript, duringTranscript }: VoiceInputProps) {
    const { t } = useTranslation('p_ai');
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Check if browser supports speech recognition
        setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    }, []);

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false; // Stop after user finishes speaking
        recognition.interimResults = true; // Get interim results while speaking
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result) => result.transcript)
                .join('');

            // Check if this is a final result
            const isFinal = event.results[event.results.length - 1].isFinal;

            if (isFinal) {
                onTranscript(transcript);
            } else if (duringTranscript) {
                duringTranscript(transcript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    if (!isSupported) {
        return <p className="text-sm text-gray-500">{t('voiceInputNotSupported')}</p>;
    }

    return (
        <button
            onClick={startListening}
            disabled={isListening}
            className={`rounded-full p-2 ${
                isListening ? 'animate-pulse bg-red-500' : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
            aria-label={isListening ? t('listening') : t('startVoiceInput')}
        >
            {isListening ? <Icon name="MicOff" size={20} /> : <Icon name="Mic" size={20} />}
        </button>
    );
}
