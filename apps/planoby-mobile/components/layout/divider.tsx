import { cn } from '@kit/utils';
import React from 'react';
import { View } from 'react-native';

interface DividerProps {
    direction?: 'horizontal' | 'vertical';
    className?: string;
}

export const Divider: React.FC<DividerProps> = ({ direction = 'horizontal', className = '' }) => {
    return (
        <View
            className={cn(
                'border-border border',
                direction === 'vertical' ? 'h-full flex-1 border-l' : 'w-full border-t',
                className,
            )}
        />
    );
};
