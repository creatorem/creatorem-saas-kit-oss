import { Card, CardContent, CardFooter } from '@kit/ui/card';
import { Separator } from '@kit/ui/separator';
import { Skeleton } from '@kit/ui/skeleton';
import { cn } from '@kit/utils';
import React from 'react';

interface DangerZoneSkeletonProps {
    className?: string;
}

export function DangerZoneSkeleton({ className }: DangerZoneSkeletonProps): React.JSX.Element {
    return (
        <Card className={cn('border-destructive', className)}>
            <CardContent>
                <Skeleton className="mb-2 h-6 w-32" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            </CardContent>
            <Separator />
            <CardFooter className="flex w-full justify-end pt-6">
                <Skeleton className="h-9 w-[132px]" />
            </CardFooter>
        </Card>
    );
}
