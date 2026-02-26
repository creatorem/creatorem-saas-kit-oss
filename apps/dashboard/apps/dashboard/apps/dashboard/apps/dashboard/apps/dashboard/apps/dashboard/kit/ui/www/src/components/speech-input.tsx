'use client';

import { Button } from '@kit/ui/button';
import { Icon } from '@kit/ui/icon';
import { Input } from '@kit/ui/input';
import { Slot } from '@radix-ui/react-slot';
import { motion } from 'motion/react';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// ============================================================================
// Context & Types
// ============================================================================

interface SpeechInputContextValue {
    isListening: boolean;
    isSupported: boolean;
    transcript: string;
    interimTranscript: string;
    lang: string;
    startListening: () => void;
    stopListening: () => void;
    cancelListening: () => void;
}

const SpeechInputContext = createContext<SpeechInputContextValue | undefined>(undefined);

const useSpeechInputContext = () => {
    const context = useContext(SpeechInputContext);
    if (!context) {
        throw new Error('You are calling useSpeechInputContext outside of SpeechInput');
    }
    return context;
};

// ============================================================================
// Root Component
// ============================================================================

export interface SpeechInputProps {
    children: React.ReactNode;
    lang?: string;
    onSpeechChange?: (text: string) => void;
    onInterimSpeechChange?: (text: string) => void;
    onSpeechStart?: () => void;
}

export function SpeechInput({
    children,
    lang = 'en-US',
    onSpeechChange,
    onInterimSpeechChange,
    onSpeechStart,
}: SpeechInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const recognitionRef = useRef<any>(null);
    const isCancelledRef = useRef(false);
    const transcriptRef = useRef('');

    // Check browser support
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);
    }, []);

    const handleRecognitionStart = useCallback(() => {
        setIsListening(true);
        setTranscript('');
        setInterimTranscript('');
        transcriptRef.current = '';
        onSpeechStart?.();
    }, [onSpeechStart]);

    const handleRecognitionResult = useCallback(
        (event: any) => {
            let interim = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcriptSegment = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalTranscript += `${transcriptSegment} `;
                } else {
                    interim += transcriptSegment;
                }
            }

            if (interim !== interimTranscript) {
                setInterimTranscript(interim);
                onInterimSpeechChange?.(interim);
            }

            if (finalTranscript && !isCancelledRef.current) {
                const newTranscript = transcriptRef.current + finalTranscript;
                transcriptRef.current = newTranscript;
                setTranscript(newTranscript);
                onSpeechChange?.(newTranscript);
            }
        },
        [interimTranscript, onInterimSpeechChange, onSpeechChange],
    );

    const handleRecognitionError = useCallback((event: any) => {
        const errorType = event.error;

        // Handle different error types gracefully
        switch (errorType) {
            case 'no-speech':
                // User didn't speak - this is not really an error, just silent
                // Reset listening state and let user try again
                setIsListening(false);
                break;
            case 'audio-capture':
                console.error('No microphone input detected');
                setIsListening(false);
                break;
            case 'network':
                console.error('Network error during speech recognition');
                setIsListening(false);
                break;
            case 'permission-denied':
                console.error('Microphone permission denied');
                setIsListening(false);
                break;
            default:
                console.error('Speech recognition error:', errorType);
                setIsListening(false);
        }
    }, []);

    const handleRecognitionEnd = useCallback(() => {
        setIsListening(false);
    }, []);

    const startListening = useCallback(() => {
        if (!isSupported || isListening) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = handleRecognitionStart;
        recognition.onresult = handleRecognitionResult;
        recognition.onerror = handleRecognitionError;
        recognition.onend = handleRecognitionEnd;

        recognition.start();
    }, [
        isSupported,
        isListening,
        lang,
        handleRecognitionStart,
        handleRecognitionResult,
        handleRecognitionError,
        handleRecognitionEnd,
    ]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
        isCancelledRef.current = false;
    }, []);

    const cancelListening = useCallback(() => {
        isCancelledRef.current = true;
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
        setIsListening(false);
        setTranscript('');
        setInterimTranscript('');
    }, []);

    const value = useMemo(
        () => ({
            isListening,
            isSupported,
            transcript,
            interimTranscript,
            lang,
            startListening,
            stopListening,
            cancelListening,
        }),
        [isListening, isSupported, transcript, interimTranscript, lang, startListening, stopListening, cancelListening],
    );

    return <SpeechInputContext.Provider value={value}>{children}</SpeechInputContext.Provider>;
}

// ============================================================================
// Trigger Component
// ============================================================================

interface SpeechInputTriggerProps extends Omit<React.ComponentProps<typeof Button>, 'aria-label'> {}

const SpeechInputTrigger = React.forwardRef<HTMLButtonElement, SpeechInputTriggerProps>(
    ({ children, asChild, className, onClick, ...props }, ref) => {
        const { isListening, startListening, stopListening } = useSpeechInputContext();

        const handleClick = useCallback(
            (e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                e.stopPropagation();

                if (isListening) {
                    stopListening();
                } else {
                    startListening();
                }
                onClick?.(e);
            },
            [isListening, startListening, stopListening, onClick],
        );

        const [isHovering, setIsHovering] = useState(false);

        const handleMouseEnter = useCallback(() => {
            setIsHovering(true);
        }, []);

        const handleMouseLeave = useCallback(() => {
            setIsHovering(false);
        }, []);

        return (
            <Button
                ref={ref}
                data-slot="speech-input-trigger"
                onClick={handleClick}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
                size="icon"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={className}
                {...props}
            >
                {/* {children || (isListening ? <MicOff size={20} /> : <Mic size={20} />)} */}
                {children ||
                    (isListening ? (
                        isHovering ? (
                            <Icon name="Check" className="size-4 shrink-0" />
                        ) : (
                            <SpeechInputEqualizer />
                        )
                    ) : (
                        <Icon name="Mic" size={20} />
                    ))}
            </Button>
        );
    },
);

SpeechInputTrigger.displayName = 'SpeechInputTrigger';

// ============================================================================
// Cancel Component
// ============================================================================

export interface SpeechInputCancelProps {
    /**
     * If true, the button will be hidden when not listening
     * @default false
     */
    hideWhenNotListening?: boolean;
}

const SpeechInputCancel = React.forwardRef<
    HTMLButtonElement,
    SpeechInputCancelProps & Omit<React.ComponentProps<typeof Button>, 'aria-label'>
>(({ children, className, onClick, hideWhenNotListening = false, ...props }, ref) => {
    const { isListening, cancelListening } = useSpeechInputContext();

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            cancelListening();
            onClick?.(e);
        },
        [cancelListening, onClick],
    );

    if (hideWhenNotListening && !isListening) {
        return null;
    }

    return (
        <Button
            ref={ref}
            data-slot="speech-input-cancel"
            onClick={handleClick}
            aria-label="Cancel speech input"
            disabled={!isListening}
            variant="outline"
            size="sm"
            className={className}
            {...props}
        >
            {children || <Icon name="X" className="size-4 shrink-0" />}
        </Button>
    );
});

// ============================================================================
// Reflection Component (Motion Component)
// ============================================================================

export interface SpeechInputEqualizerProps {
    className?: string;
}

const SpeechInputEqualizer: React.FC<SpeechInputEqualizerProps> = ({ className }) => {
    const { isListening } = useSpeechInputContext();

    const MIN_HEIGHT = 3;
    const MAX_HEIGHT = 18;
    const CENTER_Y = 12;

    // Memoize bars to prevent recreation
    const bars = useMemo(
        () => [
            { x: 2, initialHeight: 3, delay: 0 },
            { x: 6, initialHeight: 11, delay: 0.1 },
            { x: 10, initialHeight: 18, delay: 0.2 },
            { x: 14, initialHeight: 7, delay: 0.15 },
            { x: 18, initialHeight: 13, delay: 0.05 },
            { x: 22, initialHeight: 3, delay: 0.25 },
        ],
        [],
    );

    // Memoize bar positions to prevent animation state loss
    const barPositions = useMemo(
        () =>
            bars.map((bar) => ({
                x: bar.x,
                y1Initial: CENTER_Y - bar.initialHeight / 2,
                y2Initial: CENTER_Y + bar.initialHeight / 2,
                delay: bar.delay,
                initialHeight: bar.initialHeight,
            })),
        [bars],
    );

    console.log({ barPositions });

    // todo: fix this issue
    // Error: <line> attribute y2: Expected length, "undefined".
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {barPositions.map((pos, index) => (
                <motion.line
                    key={`bar-${index}`}
                    x1={pos.x || 0}
                    x2={pos.x || 0}
                    y1={pos.y1Initial || 0}
                    y2={pos.y2Initial || 0}
                    stroke="currentColor"
                    strokeWidth={index === 2 ? 2.2 : 1.8}
                    strokeLinecap="round"
                    animate={
                        isListening
                            ? {
                                  y1: [
                                      pos.y1Initial,
                                      CENTER_Y - MAX_HEIGHT / 2,
                                      CENTER_Y - MIN_HEIGHT / 2,
                                      CENTER_Y - (pos.initialHeight * 0.8) / 2,
                                      pos.y1Initial,
                                  ],
                                  y2: [
                                      pos.y2Initial,
                                      CENTER_Y + MAX_HEIGHT / 2,
                                      CENTER_Y + MIN_HEIGHT / 2,
                                      CENTER_Y + (pos.initialHeight * 0.8) / 2,
                                      pos.y2Initial,
                                  ],
                              }
                            : {
                                  y1: pos.y1Initial || 0,
                                  y2: pos.y2Initial || 0,
                              }
                    }
                    transition={{
                        duration: 1.2,
                        repeat: isListening ? Infinity : 0,
                        ease: 'easeInOut',
                        delay: pos.delay,
                    }}
                />
            ))}
        </motion.svg>
    );
};

// ============================================================================
// Base Component (Input)
// ============================================================================

export interface SpeechInputBaseProps {
    asChild?: boolean;
    noInterim?: boolean;
}

const SpeechInputBase = React.forwardRef<
    HTMLInputElement,
    SpeechInputBaseProps & React.InputHTMLAttributes<HTMLInputElement>
>(({ asChild, noInterim = false, value, className, onChange, ...props }, ref) => {
    const { transcript, interimTranscript, isListening } = useSpeechInputContext();
    const internalRef = useRef<HTMLInputElement>(null);

    const displayValue = useMemo(
        () => (noInterim ? transcript : transcript + interimTranscript),
        [noInterim, transcript, interimTranscript],
    );

    const finalValue = useMemo(() => (value !== undefined ? value : displayValue), [value, displayValue]);

    const Comp = useMemo(() => (asChild ? Slot : Input), [asChild]);

    // Auto-scroll to the end when text is updated during recording
    useEffect(() => {
        const inputElement = internalRef.current;
        if (inputElement && isListening) {
            // Use setTimeout to ensure the DOM is updated
            setTimeout(() => {
                inputElement.scrollLeft = inputElement.scrollWidth;
            }, 0);
        }
    }, [finalValue, isListening]);

    // Merge the internal ref with the forwarded ref
    const mergedRef = useCallback(
        (node: HTMLInputElement | null) => {
            internalRef.current = node;
            if (ref) {
                if (typeof ref === 'function') {
                    ref(node);
                } else {
                    ref.current = node;
                }
            }
        },
        [ref],
    );

    // Handle onChange to allow keyboard input while preserving speech input
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            // Update the input element's value immediately for user feedback
            // If value is controlled externally, the parent will handle it via onChange
            onChange?.(e);
        },
        [onChange],
    );

    return (
        <Comp
            ref={mergedRef}
            data-slot="speech-input-base"
            type="text"
            value={finalValue}
            onChange={handleChange}
            className={className}
            {...props}
        />
    );
});

SpeechInputBase.displayName = 'SpeechInputBase';

export { SpeechInputBase, SpeechInputCancel, SpeechInputEqualizer, SpeechInputTrigger };
