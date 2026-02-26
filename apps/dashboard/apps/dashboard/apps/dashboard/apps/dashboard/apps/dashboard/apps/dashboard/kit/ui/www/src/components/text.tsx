import { cn } from '@kit/utils';

type HeadingProps = {
    as?: 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
} & React.ComponentPropsWithoutRef<'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;

/**
 * @deprecated
 *
 * @param param0
 * @returns
 */
export function Heading({ className, as: Element = 'h2', ...props }: HeadingProps) {
    return (
        <Element
            {...props}
            className={cn('mb-8 text-4xl font-semibold tracking-tighter text-pretty text-gray-950', className)}
        />
    );
}

/**
 * @deprecated
 *
 * @param param0
 * @returns
 */
export function Subheading({ className, as: Element = 'h2', ...props }: HeadingProps) {
    return <Element {...props} className={cn('text-primary text-lg leading-7 font-semibold', className)} />;
}

/**
 * @deprecated
 *
 * @param param0
 * @returns
 */
export function Lead({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
    return <p className={cn('text-muted-foreground text-lg font-light', className)} {...props} />;
}

export const H1 = ({ className, ...props }: React.ComponentPropsWithoutRef<'h1'>) => {
    return (
        <h1
            className={cn(
                'font-heading scroll-m-20 text-4xl font-extrabold tracking-tighter text-pretty lg:text-5xl',
                className,
            )}
            {...props}
        />
    );
};

export const H2 = ({ className, ...props }: React.ComponentPropsWithoutRef<'h2'>) => {
    return (
        <h2
            className={cn(
                'font-heading scroll-m-20 text-3xl font-bold tracking-tight text-pretty lg:text-4xl',
                className,
            )}
            {...props}
        />
    );
};

export const H3 = ({ className, ...props }: React.ComponentPropsWithoutRef<'h3'>) => {
    return (
        <h3
            className={cn(
                'font-heading scroll-m-20 text-2xl font-bold tracking-tight text-pretty lg:text-3xl',
                className,
            )}
            {...props}
        />
    );
};

export const H4 = ({ className, ...props }: React.ComponentPropsWithoutRef<'h4'>) => {
    return (
        <h4
            className={cn(
                'font-heading scroll-m-20 text-xl font-bold tracking-tight text-pretty lg:text-2xl',
                className,
            )}
            {...props}
        />
    );
};

export const H5 = ({ className, ...props }: React.ComponentPropsWithoutRef<'h5'>) => {
    return (
        <h5
            className={cn(
                'font-heading scroll-m-20 text-lg font-bold tracking-tight text-pretty lg:text-xl',
                className,
            )}
            {...props}
        />
    );
};

export const H6 = ({ className, ...props }: React.ComponentPropsWithoutRef<'h6'>) => {
    return (
        <h6
            className={cn(
                'font-heading scroll-m-20 text-base font-bold tracking-tight text-pretty lg:text-lg',
                className,
            )}
            {...props}
        />
    );
};

export const Paragraph = ({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) => {
    return <p className={cn('leading-7 [&:not(:first-child)]:mt-6', className)} {...props} />;
};

export const Blockquote = ({ className, ...props }: React.ComponentPropsWithoutRef<'blockquote'>) => {
    return <blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)} {...props} />;
};

export const Code = ({ className, ...props }: React.ComponentPropsWithoutRef<'code'>) => {
    return (
        <code
            className={cn('bg-muted relative rounded-sm px-[0.3rem] py-[0.2rem] font-mono text-sm', className)}
            {...props}
        />
    );
};

export const Small = ({ className, ...props }: React.ComponentPropsWithoutRef<'small'>) => {
    return <small className={cn('text-muted-foreground/50 inline-block font-mono text-xs', className)} {...props} />;
};

export const Muted = ({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) => {
    return <span className={cn('text-muted-foreground text-sm', className)} {...props} />;
};

export const Strong = ({ className, children, ...props }: React.ComponentPropsWithoutRef<'strong'>) => {
    return (
        <strong className={cn('relative font-normal text-black dark:text-white', className)} {...props}>
            {children}
        </strong>
    );
};
