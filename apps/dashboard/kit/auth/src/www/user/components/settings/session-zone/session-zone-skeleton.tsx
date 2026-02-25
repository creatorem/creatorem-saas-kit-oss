import { Card, CardContent, CardHeader } from '@kit/ui/card';
import { Separator } from '@kit/ui/separator';
import { Skeleton } from '@kit/ui/skeleton';
import { cn } from '@kit/utils';

interface SessionZoneSkeletonProps {
    className?: string;
    sessionCount?: number;
}

export function SessionZoneSkeleton({ className, sessionCount = 2 }: SessionZoneSkeletonProps) {
    return (
        <Card className={cn('mx-auto w-full max-w-4xl', className)}>
            <CardHeader className="space-y-3 px-4 sm:px-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="space-y-2">
                        {/* Title with icon */}
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5 flex-shrink-0" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                        {/* Description */}
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-80 max-w-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    {/* Revoke all button (only show if more than 1 session) */}
                    {sessionCount > 1 && <Skeleton className="h-9 w-full sm:w-36" />}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: sessionCount }).map((_, index) => (
                    <div key={index}>
                        <div className="flex flex-col space-y-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                {/* Device icon */}
                                <div className="mt-1 flex-shrink-0">
                                    <Skeleton className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-2">
                                    {/* Browser and OS with badges */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Skeleton className="h-4 w-28 sm:h-5 sm:w-32" />
                                        <Skeleton className="h-5 w-16 rounded-full" /> {/* Current badge */}
                                        <Skeleton className="h-5 w-8 rounded-full" /> {/* MFA badge */}
                                    </div>
                                    <div className="space-y-1 text-xs sm:text-sm">
                                        {/* Last active */}
                                        <Skeleton className="h-3 w-32 sm:h-4 sm:w-36" />
                                        <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0">
                                            {/* Location with map pin icon */}
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-3 w-3 flex-shrink-0" />
                                                <Skeleton className="h-3 w-24 sm:w-32" />
                                            </div>
                                            {/* Created date with calendar icon */}
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-3 w-3 flex-shrink-0" />
                                                <Skeleton className="h-3 w-20 sm:w-24" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Revoke button */}
                            <div className="w-full flex-shrink-0 sm:w-auto">
                                <Skeleton className="h-9 w-full sm:w-28" />
                            </div>
                        </div>
                        {index < sessionCount - 1 && <Separator className="my-2" />}
                    </div>
                ))}

                {/* Info text at bottom */}
                <div className="pt-4">
                    <div className="flex items-start gap-2">
                        <Skeleton className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-3 w-full max-w-md sm:h-4" />
                            <Skeleton className="h-3 w-48 sm:h-4 sm:w-56" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
