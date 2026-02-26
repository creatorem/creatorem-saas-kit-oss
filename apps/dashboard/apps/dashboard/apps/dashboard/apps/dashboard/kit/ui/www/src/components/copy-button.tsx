'use client';

import { Button } from '@kit/ui/button';
import { Icon } from '@kit/ui/icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@kit/ui/tooltip';
import { useCopyToClipboard } from '@kit/utils/hooks/use-copy-to-clipboard';

interface CopyButtonProps {
    toCopy: string;
    noTooltip?: boolean;
    isCopied?: boolean;
}

export function CopyButton({
    toCopy,
    children,
    noTooltip = false,
    isCopied: higherIsCopied = undefined,
    ...props
}: CopyButtonProps & React.ComponentProps<typeof Button>) {
    const { copyToClipboard, isCopied: localIsCopied } = useCopyToClipboard();
    const isCopied = higherIsCopied ?? localIsCopied;

    return noTooltip ? (
        <Button {...props} onClick={() => copyToClipboard(toCopy)}>
            {isCopied ? <Icon name="Check" className="size-3.5" /> : <Icon name="Copy" className="size-3.5" />}
            <span className="sr-only">{props['aria-label']}</span>
            {children}
        </Button>
    ) : (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button {...props} onClick={() => copyToClipboard(toCopy)}>
                    {isCopied ? <Icon name="Check" className="size-3.5" /> : <Icon name="Copy" className="size-3.5" />}
                    <span className="sr-only">{props['aria-label']}</span>
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{isCopied ? 'Copied' : props['aria-label']}</TooltipContent>
        </Tooltip>
    );
}
