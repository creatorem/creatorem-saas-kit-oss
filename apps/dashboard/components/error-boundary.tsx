'use client';

import { Button } from '@kit/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/ui/empty';
import { Icon } from '@kit/ui/icon';
import { cn } from '@kit/utils';
import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    className?: string;
    fallback?: React.ComponentType<{ error: Error }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return <this.props.fallback error={this.state.error!} />;
            }

            return (
                <div className={cn('flex-1 p-2', this.props.className)}>
                    <Empty className={'border-destructive h-full rounded-md border border-dashed'}>
                        <EmptyHeader>
                            <EmptyMedia
                                variant="icon"
                                className="bg-destructive/10 text-destructive border-destructive border"
                            >
                                <Icon name="ServerCrash" />
                            </EmptyMedia>
                            <EmptyTitle>Something went wrong</EmptyTitle>
                            <EmptyDescription>An error occurred while loading this page.</EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    aria-label="Try again"
                                    onClick={() => this.setState({ hasError: false })}
                                >
                                    Try again
                                </Button>
                            </div>
                        </EmptyContent>
                    </Empty>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
