'use client';

import { Turnstile, TurnstileInstance, TurnstileProps } from '@marsidev/react-turnstile';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

interface CaptchaContextType {
    captchaToken: string;
    setCaptchaToken: (token: string) => void;
    resetCaptchaToken: () => void;
    turnstile: TurnstileInstance | null;
}

const captchaContext = createContext<CaptchaContextType>({
    captchaToken: '',
    turnstile: null,
    setCaptchaToken: () => {},
    resetCaptchaToken: () => {},
});

export function useCaptchaToken() {
    const context = useContext(captchaContext);
    if (!context) {
        throw new Error(`useCaptchaToken must be used within a CaptchaProvider`);
    }
    return context;
}

export function CaptchaProvider({
    siteKey,
    options,
    children,
}: {
    siteKey: string | undefined;
    options?: TurnstileProps;
    children: React.ReactNode;
}) {
    const [token, setToken] = useState<string>('');
    const instanceRef = useRef<TurnstileInstance>(null);

    const setTurnstile = useCallback((ref: TurnstileInstance) => {
        instanceRef.current = ref;
    }, []);

    const resetCaptchaToken = useCallback(() => {
        setToken('');
        instanceRef.current?.reset();
    }, []);

    return (
        <captchaContext.Provider
            value={{
                captchaToken: token,
                setCaptchaToken: setToken,
                resetCaptchaToken,
                turnstile: instanceRef.current,
            }}
        >
            {siteKey && (
                <CaptchaTurnstile
                    siteKey={siteKey}
                    options={options}
                    setTurnstile={setTurnstile}
                    setCaptchaToken={setToken}
                />
            )}
            {children}
        </captchaContext.Provider>
    );
}

const CaptchaTurnstile = ({
    siteKey,
    options,
    setTurnstile,
    setCaptchaToken,
}: {
    siteKey: string;
    options?: TurnstileProps;
    setTurnstile: (ref: TurnstileInstance) => void;
    setCaptchaToken: (token: string) => void;
}) => {
    const turnstileProps = options ?? {
        options: {
            size: 'invisible',
        },
    };

    return (
        <Turnstile
            ref={(turnstile: TurnstileInstance) => {
                if (turnstile) {
                    setTurnstile(turnstile);
                }
            }}
            onSuccess={setCaptchaToken}
            siteKey={siteKey}
            {...turnstileProps}
        />
    );
};
