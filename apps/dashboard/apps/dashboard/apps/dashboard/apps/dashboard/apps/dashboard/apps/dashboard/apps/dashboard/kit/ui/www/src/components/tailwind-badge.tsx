import { cn } from '@kit/utils';
import React from 'react';
export type TailwindColor =
    | 'yellow'
    | 'amber'
    | 'orange'
    | 'red'
    | 'rose'
    | 'pink'
    | 'fuchsia'
    | 'purple'
    | 'violet'
    | 'indigo'
    | 'blue'
    | 'sky'
    | 'blue'
    | 'cyan'
    | 'teal'
    | 'emerald'
    | 'green'
    | 'lime'
    | 'stone'
    | 'slate'
    | 'zinc'
    | 'neutral'
    | 'gray';

interface Props {
    variant?: 'default' | 'outline';
    color: TailwindColor;
    children: React.ReactNode;
    Comp?: React.ElementType;
    className?: string;
}

const defaultClassNameColors: Record<TailwindColor, string> = {
    yellow: 'bg-yellow-200 text-yellow-600 dark:bg-yellow-600 dark:text-yellow-200',
    amber: 'bg-amber-200 text-amber-600 dark:bg-amber-600 dark:text-amber-200',
    orange: 'bg-orange-200 text-orange-600 dark:bg-orange-600 dark:text-orange-200',
    red: 'bg-red-200 text-red-600 dark:bg-red-600 dark:text-red-200',
    rose: 'bg-rose-200 text-rose-600 dark:bg-rose-600 dark:text-rose-200',
    pink: 'bg-pink-200 text-pink-600 dark:bg-pink-600 dark:text-pink-200',
    fuchsia: 'bg-fuchsia-200 text-fuchsia-600 dark:bg-fuchsia-600 dark:text-fuchsia-200',
    purple: 'bg-purple-200 text-purple-600 dark:bg-purple-600 dark:text-purple-200',
    violet: 'bg-violet-200 text-violet-600 dark:bg-violet-600 dark:text-violet-200',
    indigo: 'bg-indigo-200 text-indigo-600 dark:bg-indigo-600 dark:text-indigo-200',
    blue: 'bg-blue-200 text-blue-600 dark:bg-blue-600 dark:text-blue-200',
    cyan: 'bg-cyan-200 text-cyan-600 dark:bg-cyan-600 dark:text-cyan-200',
    sky: 'bg-sky-200 text-sky-600 dark:bg-sky-600 dark:text-sky-200',
    teal: 'bg-teal-200 text-teal-600 dark:bg-teal-600 dark:text-teal-200',
    emerald: 'bg-emerald-200 text-emerald-600 dark:bg-emerald-600 dark:text-emerald-200',
    green: 'bg-green-200 text-green-600 dark:bg-green-600 dark:text-green-200',
    lime: 'bg-lime-200 text-lime-600 dark:bg-lime-600 dark:text-lime-200',
    stone: 'bg-stone-200 text-stone-600 dark:bg-stone-600 dark:text-stone-200',
    slate: 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200',
    zinc: 'bg-zinc-200 text-zinc-600 dark:bg-zinc-600 dark:text-zinc-200',
    neutral: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-600 dark:text-neutral-200',
    gray: 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-200',
};

const outlineClassNameColors: Record<TailwindColor, string> = {
    yellow: 'border-yellow-200 text-yellow-600 dark:border-yellow-600 dark:text-yellow-200',
    amber: 'border-amber-200 text-amber-600 dark:border-amber-600 dark:text-amber-200',
    orange: 'border-orange-200 text-orange-600 dark:border-orange-600 dark:text-orange-200',
    red: 'border-red-200 text-red-600 dark:border-red-600 dark:text-red-200',
    rose: 'border-rose-200 text-rose-600 dark:border-rose-600 dark:text-rose-200',
    pink: 'border-pink-200 text-pink-600 dark:border-pink-600 dark:text-pink-200',
    fuchsia: 'border-fuchsia-200 text-fuchsia-600 dark:border-fuchsia-600 dark:text-fuchsia-200',
    purple: 'border-purple-200 text-purple-600 dark:border-purple-600 dark:text-purple-200',
    violet: 'border-violet-200 text-violet-600 dark:border-violet-600 dark:text-violet-200',
    indigo: 'border-indigo-200 text-indigo-600 dark:border-indigo-600 dark:text-indigo-200',
    blue: 'border-blue-200 text-blue-600 dark:border-blue-600 dark:text-blue-200',
    cyan: 'border-cyan-200 text-cyan-600 dark:border-cyan-600 dark:text-cyan-200',
    sky: 'border-sky-200 text-sky-600 dark:border-sky-600 dark:text-sky-200',
    teal: 'border-teal-200 text-teal-600 dark:border-teal-600 dark:text-teal-200',
    emerald: 'border-emerald-200 text-emerald-600 dark:border-emerald-600 dark:text-emerald-200',
    green: 'border-green-200 text-green-600 dark:border-green-600 dark:text-green-200',
    lime: 'border-lime-200 text-lime-600 dark:border-lime-600 dark:text-lime-200',
    stone: 'border-stone-200 text-stone-600 dark:border-stone-600 dark:text-stone-200',
    slate: 'border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-200',
    zinc: 'border-zinc text-zinc-600 dark:border-zinc-600 dark:text-zinc-200',
    neutral: 'border-neutral-200 text-neutral-600 dark:border-neutral-600 dark:text-neutral-200',
    gray: 'border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-200',
};

export const TailwindColorBadge: React.FC<Props> = ({
    color,
    className,
    Comp = 'div',
    variant = 'default',
    children,
}) => {
    return (
        <Comp
            className={cn(
                `flex items-center gap-2 px-2 py-1 font-mono text-base text-xs leading-100 whitespace-nowrap uppercase`,
                variant === 'default' ? defaultClassNameColors[color] : `${outlineClassNameColors[color]} border`,
                className,
            )}
        >
            {children}
        </Comp>
    );
};
