'use client';

import { useSignOut } from '@kit/supabase';
import { Button } from '@kit/ui/button';
import { Slot } from '@kit/ui/slot';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';

export interface SignOutButtonProps {
    /**
     * The URL to redirect to after signing out.
     */
    redirectTo: string;
    onSignOut?: () => void;
    /**
     * @default false
     */
    asChild?: boolean;
}

export function SignOutButton({
    redirectTo,
    onSignOut,
    asChild = false,
    ...props
}: React.ComponentProps<typeof Button> & SignOutButtonProps): React.JSX.Element {
    const signOut = useSignOut();
    const Comp = asChild ? Slot : Button;
    const router = useRouter();

    const handleSignOut = useCallback(async () => {
        await signOut.mutateAsync();
        onSignOut?.();
        router.push(redirectTo);
    }, [signOut, router, redirectTo]);

    return <Comp {...props} onClick={handleSignOut} />;
}
