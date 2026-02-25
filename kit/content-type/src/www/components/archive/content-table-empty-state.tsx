/**
 * This component provides a consistent empty state display for content tables
 * when no data is available.
 */

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/ui/empty';
import { Icon, IconName } from '@kit/ui/icon';
import Link from 'next/link';
import React from 'react';

interface ContentTableEmptyStateProps {
    title: string;
    description: string;
    newItemLink?: string;
    icon?: IconName;
    action?: React.ReactNode;
}

export function ContentTableEmptyState({
    title,
    description,
    newItemLink,
    icon: propIcon,
    action,
}: ContentTableEmptyStateProps) {
    return (
        <div className="flex h-full min-h-[400px] p-2">
            {newItemLink ? (
                <Link
                    href={newItemLink}
                    className="hover:bg-muted/50 group/empty-ct-table flex flex-1 items-center justify-center rounded-lg border border-dashed transition-all duration-300"
                >
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia
                                variant="icon"
                                className="group-hover/empty-ct-table:text-primary group-hover/empty-ct-table:border-primary group-hover/empty-ct-table:bg-primary/10 border transition-all duration-300 group-hover/empty-ct-table:border"
                            >
                                <Icon name={propIcon ?? 'Box'} />
                            </EmptyMedia>
                            <EmptyTitle>{title}</EmptyTitle>
                            <EmptyDescription>{description}</EmptyDescription>
                        </EmptyHeader>
                        {action && <EmptyContent>{action}</EmptyContent>}
                    </Empty>
                </Link>
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Icon name={propIcon ?? 'Box'} />
                            </EmptyMedia>
                            <EmptyTitle>{title}</EmptyTitle>
                            <EmptyDescription>{description}</EmptyDescription>
                        </EmptyHeader>
                        {action && <EmptyContent>{action}</EmptyContent>}
                    </Empty>
                </div>
            )}
        </div>
    );
}
