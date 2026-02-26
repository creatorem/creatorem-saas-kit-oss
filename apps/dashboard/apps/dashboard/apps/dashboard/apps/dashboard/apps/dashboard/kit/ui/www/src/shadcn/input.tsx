// import { cn } from '@kit/utils';
// import React from 'react';
// export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
//     primitiveStyle?: boolean;
// }

// const Input = React.forwardRef<HTMLInputElement, InputProps>(
//     ({ className, type, primitiveStyle = false, ...props }, ref) => {
//         return (
//             <input
//                 type={type}
//                 className={cn(
//                     primitiveStyle
//                         ? 'ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring rounded-md file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
//                         : 'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2.5 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
//                     className
//                 )}
//                 ref={ref}
//                 {...props}
//             />
//         );
//     }
// );
// Input.displayName = 'Input';

// export { Input };

/**
 * Tailwindcss v4 from shadcn https://ui.shadcn.com/docs/components/input
 */

import { cn } from '@kit/utils';
import React from 'react';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                className,
            )}
            {...props}
        />
    );
}

export { Input };
