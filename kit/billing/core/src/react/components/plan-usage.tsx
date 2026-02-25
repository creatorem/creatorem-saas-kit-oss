'use client';

import { Progress } from '@kit/ui/progress';
import { cn } from '@kit/utils';

export interface PlanUsageProps {
    /**
     * Current usage amount (e.g., dollar amount spent)
     */
    currentUsage: number;
    /**
     * Maximum allowed usage amount (e.g., plan limit)
     */
    maxUsage: number;
    /**
     * Currency symbol (e.g., '$', '�', '�')
     * @default '$'
     */
    currencySymbol?: string;
    /**
     * Label for the usage metric
     * @default 'Usage'
     */
    label?: string;
    /**
     * Optional className for styling
     */
    className?: string;
    /**
     * Optional variant for different display styles
     * @default 'default'
     */
    variant?: 'default' | 'compact';
    /**
     * Period end date (Unix timestamp in seconds)
     */
    periodEndDate?: number;
}

export function PlanUsage({
    currentUsage,
    maxUsage,
    currencySymbol = '$',
    label = 'Usage',
    className,
    variant = 'default',
    periodEndDate,
}: PlanUsageProps) {
    const percentage = maxUsage > 0 ? Math.min((currentUsage / maxUsage) * 100, 100) : 0;
    const remainingUsage = Math.max(maxUsage - currentUsage, 0);

    const getProgressColorClass = () => {
        if (percentage >= 90) return '[&>div]:bg-destructive';
        if (percentage >= 75) return '[&>div]:bg-warning';
        return '';
    };

    const getResetText = () => {
        if (!periodEndDate) return null;

        const now = Date.now();
        const endDate = periodEndDate * 1000; // Convert to milliseconds
        const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        if (daysRemaining < 0) return 'Expired';
        if (daysRemaining === 0) return 'Resets today';
        if (daysRemaining === 1) return 'Resets tomorrow';
        return `Resets in ${daysRemaining} days`;
    };

    if (variant === 'compact') {
        const resetText = getResetText();

        return (
            <div className={cn('flex items-center gap-2', className)}>
                <div className="flex min-w-42 flex-col text-sm">
                    <span className="text-muted-foreground">Current session</span>
                    {resetText && <span className="text-muted-foreground text-xs">{resetText}</span>}
                </div>
                <Progress
                    value={percentage}
                    className={cn('bg-muted h-5 rounded-sm border', getProgressColorClass())}
                />
                <span className="">{Math.ceil(percentage)}%</span>
            </div>
        );
    }

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{label}</h3>
                <span className="text-sm font-semibold">{Math.ceil(percentage)}%</span>
            </div>

            <Progress value={percentage} className={cn('bg-muted h-5 rounded-sm border', getProgressColorClass())} />

            <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Current</p>
                    <p className="font-semibold">
                        {currencySymbol}
                        {currentUsage.toFixed(2)}
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Limit</p>
                    <p className="font-semibold">
                        {currencySymbol}
                        {maxUsage.toFixed(2)}
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Remaining</p>
                    <p className={cn('font-semibold', percentage >= 90 && 'text-destructive')}>
                        {currencySymbol}
                        {remainingUsage.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
}
