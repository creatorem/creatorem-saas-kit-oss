'use client';

import { useFloatingAIChat } from '@kit/ai/ui/floating-ai-chat';
import { StaticThread } from '@kit/ai/ui/thread';
import { ThreadList } from '@kit/ai/ui/thread-list';
import { useUser } from '@kit/auth/www/user';
import { Button } from '@kit/ui/button';
import { Icon } from '@kit/ui/icon';
import { ScrollArea } from '@kit/ui/scroll-area';
import { ThemeToggle } from '@kit/ui/theme-toggle';
import { TooltipSc } from '@kit/ui/tooltip';
import { cn } from '@kit/utils';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dashboard,
    DashboardActions,
    DashboardBody,
    DashboardHeader,
    DashboardPrimaryBar,
} from '~/components/dashboard/dashboard';
import { DashboardBreadcrumb } from '~/components/dashboard/dashboard-breadcrumb';
import { Logo } from '~/components/logo';

function getTimeBasedGreeting(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return 'morning';
    } else if (hour >= 12 && hour < 17) {
        return 'afternoon';
    } else if (hour >= 17 && hour < 21) {
        return 'evening';
    } else {
        return 'night';
    }
}

export default function AIChatPage() {
    const [seeChats, setSeeChats] = useState<null | 'chats' | 'archived'>(null);
    const { setOpen: setOpenFloatingAIChat } = useFloatingAIChat();
    const user = useUser();
    const { t } = useTranslation('ai-content');

    const handleSeeChats = () => {
        setSeeChats((prev) => (prev === 'chats' ? null : 'chats'));
    };

    useEffect(() => {
        setOpenFloatingAIChat(false);
    }, []);

    return (
        <Dashboard>
            <DashboardHeader>
                <DashboardPrimaryBar>
                    <DashboardBreadcrumb info={t('title')} />
                    <DashboardActions>
                        <TooltipSc side="bottom" content={t('actions.seeConversations')}>
                            <Button
                                variant={seeChats === 'chats' ? 'default' : 'ghost'}
                                size="icon"
                                aria-label={t('actions.seeConversations')}
                                onClick={handleSeeChats}
                            >
                                <Icon name="MessagesSquare" />
                                <span className="sr-only">{t('actions.seeConversations')}</span>
                            </Button>
                        </TooltipSc>
                        <ThemeToggle />
                    </DashboardActions>
                </DashboardPrimaryBar>
            </DashboardHeader>
            <DashboardBody disableScroll className="relative">
                <div className="flex size-full">
                    <StaticThread className="flex-1">
                        <div className="mx-auto flex w-full max-w-full flex-col items-center gap-7 pb-4 max-md:pt-4">
                            <div
                                className="font-display text-text-200 w-full flex-col items-center text-center transition-opacity duration-300 ease-in max-md:flex sm:-ml-0.5 sm:block"
                                style={{
                                    fontSize: 'clamp(1.875rem, 1.2rem + 2vw, 2.5rem)',
                                    lineHeight: 1.5,
                                }}
                            >
                                <div className="relative inline-block pt-0.5 align-middle md:mr-3">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10, transition: { delay: 0 } }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <Logo className="size-8" />
                                    </motion.div>
                                </div>
                                <div
                                    className="inline-block max-w-full align-middle select-none max-md:line-clamp-2 max-md:break-words md:overflow-hidden md:overflow-ellipsis"
                                    style={{
                                        minHeight: '1.5em',
                                        opacity: 1,
                                    }}
                                >
                                    <motion.span
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10, transition: { delay: 0.1 } }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <span className="capitalize">{t(`greetings.${getTimeBasedGreeting()}`)}</span>,{' '}
                                    </motion.span>
                                    <motion.span
                                        className="capitalize"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10, transition: { delay: 0.2 } }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        {user.name.split(' ')[0]}
                                    </motion.span>
                                </div>
                            </div>
                        </div>
                    </StaticThread>
                    <ScrollArea
                        className={cn(
                            'bg-background absolute top-0 left-0 h-full overflow-hidden overflow-y-auto transition-all duration-500 max-lg:shadow lg:relative',
                            seeChats ? 'w-52 lg:w-72' : 'w-0',
                        )}
                    >
                        <AnimatePresence>
                            {seeChats === 'chats' ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-0 left-0 flex h-full w-full flex-col gap-4 p-4 max-lg:min-w-52 max-lg:border-r lg:min-w-72 lg:border-l"
                                >
                                    <ThreadList />
                                </motion.div>
                            ) : seeChats === 'archived' ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-0 left-0 flex h-full w-full flex-col gap-4 p-4 max-lg:min-w-52 max-lg:border-r lg:min-w-72 lg:border-l"
                                >
                                    <ThreadList />
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </ScrollArea>
                </div>
            </DashboardBody>
        </Dashboard>
    );
}
