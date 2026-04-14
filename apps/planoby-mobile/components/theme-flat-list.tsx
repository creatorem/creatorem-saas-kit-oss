import { cn } from '@kit/utils';
import React, { forwardRef } from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { withUniwind } from 'uniwind';

// Create a styled FlatList
const StyledFlatList = withUniwind(FlatList);

// Define the props type, making it generic
export type ThemedFlatListProps<T> = FlatListProps<T> & {
    className?: string;
};

// Use forwardRef to properly handle refs
function ThemedFlatListInner<T>({ className, ...props }: ThemedFlatListProps<T>, ref: React.Ref<FlatList<T>>) {
    // We need to cast StyledFlatList to any to avoid TypeScript errors with generics
    const TypedStyledFlatList = StyledFlatList as any;

    return (
        <TypedStyledFlatList
            bounces={true}
            overScrollMode="never"
            ref={ref}
            showsVerticalScrollIndicator={false}
            className={cn('bg-background flex-1 px-4', className)}
            {...props}
        />
    );
}

// Create the forwardRef component with proper typing
const ThemedFlatList = forwardRef(ThemedFlatListInner) as <T>(
    props: ThemedFlatListProps<T> & { ref?: React.Ref<FlatList<T>> },
) => React.ReactElement;

export default ThemedFlatList;
