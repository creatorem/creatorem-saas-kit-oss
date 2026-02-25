'use client';

import { Input } from '@kit/ui/input';
import { cn } from '@kit/utils';
import { useCopyToClipboard } from '@kit/utils/hooks/use-copy-to-clipboard';
import { CopyButton } from './copy-button';

export function CopyInput({
    className,
    buttonClassName,
    ...props
}: Omit<React.ComponentProps<typeof CopyButton>, 'aria-label'> & { buttonClassName?: string }) {
    const { copyToClipboard, isCopied } = useCopyToClipboard();

    return (
        <div className={cn('relative', className)} onClick={() => copyToClipboard(props.toCopy)}>
            <Input
                value={props.toCopy}
                readOnly
                className={cn(
                    'hover:bg-accent! pointer-events-auto h-10 w-full cursor-pointer! pr-10',
                    isCopied ? 'cursor-default' : '',
                )}
                disabled={isCopied}
            />
            <CopyButton
                {...props}
                isCopied={isCopied}
                aria-label={'Copy'}
                className={cn('absolute top-1 right-1 rounded-sm', buttonClassName)}
                size={'icon-sm'}
            />
        </div>
    );
}
