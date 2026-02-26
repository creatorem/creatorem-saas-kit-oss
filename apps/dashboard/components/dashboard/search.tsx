'use client';

import { Button } from '@kit/ui/button';
import { Icon } from '@kit/ui/icon';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showContentTypeCmdSearch } from '../../lib/show-content-type-cmd-search';

interface Props {
    smallMobileOnly?: boolean;
    className?: string;
}

export const Search: React.FC<Props> = ({ smallMobileOnly = false, className }) => {
    const { t } = useTranslation('dashboard');
    const handleClick = useCallback(() => {
        showContentTypeCmdSearch();
    }, []);

    return smallMobileOnly ? (
        <Button
            data-slot="search-trigger"
            onClick={handleClick}
            variant={'ghost'}
            size={'sm'}
            className={className}
            aria-label={t('search.search')}
        >
            <Icon name="Search" className="size-4" />
        </Button>
    ) : (
        <div
            data-slot="search-trigger"
            className="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground relative hidden cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm lg:flex lg:w-52 xl:w-72"
            onClick={handleClick}
        >
            <div className="flex items-center gap-2">
                <Icon name="Search" className="size-4" />
                <span className="text-muted-foreground inline-flex">{t('search.search')}</span>
            </div>
            <div className="hidden gap-1 sm:flex">
                <kbd className="[&amp;_svg:not([class*='size-'])]:size-3 bg-background text-muted-foreground pointer-events-none flex h-5 items-center justify-center gap-1 rounded-sm border px-1 font-sans text-[0.7rem] font-medium select-none">
                    ⌘
                </kbd>
                <kbd className="[&amp;_svg:not([class*='size-'])]:size-3 bg-background text-muted-foreground pointer-events-none flex aspect-square h-5 items-center justify-center gap-1 rounded-sm border px-1 font-sans text-[0.7rem] font-medium select-none">
                    K
                </kbd>
            </div>
        </div>
    );
};
