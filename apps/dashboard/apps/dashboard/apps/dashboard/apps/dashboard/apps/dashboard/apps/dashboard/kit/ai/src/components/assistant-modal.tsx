'use client';

import { AssistantModalPrimitive } from '@assistant-ui/react';
import { Button } from '@kit/ui/button';
import { TooltipSc } from '@kit/ui/tooltip';
import { BotIcon, ChevronDownIcon } from 'lucide-react';
import { type FC, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Thread } from './thread';

export const AssistantModal: FC = () => {
    return (
        <AssistantModalPrimitive.Root>
            <AssistantModalPrimitive.Anchor className="aui-root aui-modal-anchor fixed right-4 bottom-4 size-11">
                <AssistantModalPrimitive.Trigger asChild>
                    <AssistantModalButton />
                </AssistantModalPrimitive.Trigger>
            </AssistantModalPrimitive.Anchor>
            <AssistantModalPrimitive.Content
                sideOffset={16}
                className="aui-root aui-modal-content bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:zoom-out data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:slide-in-from-right-1/2 data-[state=open]:zoom-in z-50 h-[500px] w-[400px] overflow-clip rounded-xl border p-0 shadow-md outline-none [&>.aui-thread-root]:bg-inherit"
            >
                <Thread />
            </AssistantModalPrimitive.Content>
        </AssistantModalPrimitive.Root>
    );
};

type AssistantModalButtonProps = { 'data-state'?: 'open' | 'closed' };

const AssistantModalButton = forwardRef<HTMLButtonElement, AssistantModalButtonProps>(
    ({ 'data-state': state, ...rest }, ref) => {
        const { t } = useTranslation('p_ai');
        const tooltip = state === 'open' ? t('closeAssistant') : t('openAssistant');

        return (
            <TooltipSc content={tooltip} side="left">
                <Button
                    aria-label={tooltip}
                    variant="default"
                    size="icon"
                    {...rest}
                    className="aui-modal-button size-full rounded-full shadow transition-transform hover:scale-110 active:scale-90"
                    ref={ref}
                >
                    <BotIcon
                        data-state={state}
                        className="aui-modal-button-closed-icon absolute size-6 transition-all data-[state=closed]:scale-100 data-[state=closed]:rotate-0 data-[state=open]:scale-0 data-[state=open]:rotate-90"
                    />

                    <ChevronDownIcon
                        data-state={state}
                        className="aui-modal-button-open-icon absolute size-6 transition-all data-[state=closed]:scale-0 data-[state=closed]:-rotate-90 data-[state=open]:scale-100 data-[state=open]:rotate-0"
                    />
                    <span className="aui-sr-only sr-only">{tooltip}</span>
                </Button>
            </TooltipSc>
        );
    },
);

AssistantModalButton.displayName = 'AssistantModalButton';
