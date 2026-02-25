import { Card, CardContent, CardHeader } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';
import { cn } from '@kit/utils';

interface LoadingOverlayProps {
    className?: string;
}

function LoadingSkeleton({ className }: { className?: string }) {
    return (
        <Card className={cn('mx-auto w-full max-w-4xl', className)}>
            <CardHeader className="space-y-3 px-4 sm:px-6">
                {/* Title with icon */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-4 flex-shrink-0 rounded-sm sm:h-5 sm:w-5" />
                    <Skeleton className="h-6 w-28 sm:h-7 sm:w-36" />
                </div>
                {/* Description */}
                <Skeleton className="h-5 w-full max-w-lg" />
            </CardHeader>
            <CardContent>
                {/* Single entry */}
                <div className="flex flex-col gap-3 rounded-lg px-2 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-0">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        {/* Provider icon */}
                        <Skeleton className="h-9 w-9 flex-shrink-0 rounded-full sm:h-8 sm:w-8" />

                        <div className="flex min-w-0 flex-1 flex-col space-y-1">
                            {/* Provider name */}
                            <Skeleton className="h-4 w-20 sm:h-5 sm:w-24" />
                            {/* Email */}
                            <Skeleton className="h-3 w-32 sm:h-4 sm:w-40" />
                            {/* Last used */}
                            <Skeleton className="h-3 w-24 sm:w-28" />
                        </div>
                    </div>

                    <div className="ml-auto flex flex-col gap-2 sm:flex-row sm:items-center">
                        {/* Connected badge */}
                        <Skeleton className="h-5 w-16 rounded-full" />
                        {/* Since date */}
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function AuthProviderSkeleton({ className }: LoadingOverlayProps) {
    return <LoadingSkeleton className={className} />;
}
