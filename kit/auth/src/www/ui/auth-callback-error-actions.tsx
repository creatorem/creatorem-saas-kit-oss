'use client';

import { Button } from '@kit/ui/button';
import type { AuthError } from '@supabase/supabase-js';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ResendAuthLinkForm } from './resend-auth-link-form';

interface AuthCallbackErrorActionsProps {
    signInPath: string;
    redirectPath?: string;
    signInLabel: string;
    code?: AuthError['code'];
}

export function AuthCallbackErrorActions({
    signInPath,
    redirectPath,
    signInLabel,
    code,
}: AuthCallbackErrorActionsProps) {
    const [hashErrorCode, setHashErrorCode] = useState<string>();

    useEffect(() => {
        const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
        const hashParams = new URLSearchParams(hash);
        const parsedErrorCode = hashParams.get('error_code');

        if (parsedErrorCode) {
            setHashErrorCode(parsedErrorCode);
        }
    }, []);

    const resolvedCode = code ?? hashErrorCode;

    if (resolvedCode === 'otp_expired') {
        return <ResendAuthLinkForm redirectPath={redirectPath} />;
    }

    return (
        <Button className={'w-full'} asChild aria-label={signInLabel}>
            <Link href={signInPath}>{signInLabel}</Link>
        </Button>
    );
}
