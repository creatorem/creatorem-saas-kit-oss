import { cn } from '@kit/utils';
import React from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

interface ThemeFooterProps extends ViewProps {
    children: React.ReactNode;
}

const ThemeFooter = withUniwind(View);

export default function ThemedFooter({ children, className, ...props }: ThemeFooterProps) {
    const insets = useSafeAreaInsets();
    return (
        <ThemeFooter
            style={{ paddingBottom: insets.bottom }}
            className={cn('bg-background w-full px-4 pt-4', className)}
            {...props}
        >
            {children}
        </ThemeFooter>
    );
}
