'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kit/ui/select';
import { cn } from '@kit/utils';
import Image from 'next/image';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

function capitalize(lang: string) {
    return lang.slice(0, 1).toUpperCase() + lang.slice(1);
}

interface LanguageSelectorContextValue {
    value: string;
    onChange: (locale: string) => void;
    square?: boolean;
}

const LanguageSelectorContext = createContext<LanguageSelectorContextValue | null>(null);

function useLanguageSelector() {
    const context = useContext(LanguageSelectorContext);
    if (!context) {
        throw new Error('useLanguageSelector must be used within LanguageSelectorRoot');
    }
    return context;
}

export interface LanguageSelectorRootProps {
    /**
     * Whether to show the selector as a square
     */
    square?: boolean;
    /**
     * Whether to reload the page when the language is changed.
     * Allow to translate all the content even server side translations.
     *
     * @default true
     */
    reload?: boolean;
    onChange?: (locale: string) => void;
    useRouting?: boolean;
    children: React.ReactNode;
}

function LanguageSelectorRoot({
    children,
    onChange,
    square = false,
    reload = true,
    useRouting = false,
}: LanguageSelectorRootProps) {
    const {
        i18n: { language: currentLanguage, changeLanguage },
    } = useTranslation();

    const [value, setValue] = useState(currentLanguage);

    const handleChange = useCallback(
        async (locale: string) => {
            setValue(locale);

            if (onChange) {
                onChange(locale);
            }

            await changeLanguage(locale);

            if (typeof window === 'undefined') {
                return;
            }

            if (useRouting) {
                // Replace the language segment in the URL
                const currentPath = window.location.pathname;
                const pathSegments = currentPath.split('/').filter(Boolean);

                // Replace the first segment (language) with the new locale
                if (pathSegments.length > 0) {
                    pathSegments[0] = locale;
                    const newPath = `/${pathSegments.join('/')}`;
                    window.location.href = newPath + window.location.search + window.location.hash;
                } else {
                    // If no segments, just add the language
                    window.location.href = `/${locale}${window.location.search}${window.location.hash}`;
                }
            } else {
                // refresh cached translations
                if (reload) {
                    window.location.reload();
                }
            }
        },
        [changeLanguage, onChange, reload, useRouting],
    );

    const contextValue: LanguageSelectorContextValue = {
        value,
        onChange: handleChange,
        square,
    };

    return (
        <LanguageSelectorContext.Provider value={contextValue}>
            <Select value={value} onValueChange={handleChange}>
                {children}
            </Select>
        </LanguageSelectorContext.Provider>
    );
}

export interface LanguageSelectorFlagProps {
    locale: string;
    className?: string;
}

function LanguageSelectorFlag({ locale, className }: LanguageSelectorFlagProps) {
    return (
        <Image
            src={
                'https://purecatamphetamine.github.io/country-flag-icons/3x2/' +
                (locale === 'en' ? 'US' : locale.toUpperCase()) +
                '.svg'
            }
            alt={locale}
            width={24}
            height={16}
            className={className}
        />
    );
}

export interface LanguageSelectorTriggerProps {
    className?: string;
    renderValue?: (value: string) => React.ReactNode;
}

function LanguageSelectorTrigger({ className, renderValue }: LanguageSelectorTriggerProps) {
    const { value, square } = useLanguageSelector();

    if (square) {
        return (
            <SelectTrigger
                className={cn(
                    'h-8! w-8! cursor-pointer justify-center rounded-full border p-0 shadow-xs [&>span]:flex [&>span]:h-full [&>span]:w-8 [&>span]:items-center [&>span]:justify-center',
                    className,
                )}
                hideArrow
                aria-label="Language switcher"
            >
                <SelectValue>
                    <LanguageSelectorFlag
                        locale={value}
                        className={cn('aspect-[3/2] size-full rounded-full border object-cover')}
                    />
                </SelectValue>
            </SelectTrigger>
        );
    }

    return (
        <SelectTrigger aria-label="Language switcher" className={cn('hover:bg-accent cursor-pointer', className)}>
            <SelectValue>{renderValue ? renderValue(value) : undefined}</SelectValue>
        </SelectTrigger>
    );
}

const LanguageSelectorContent = SelectContent;

export interface LanguageSelectorItemsProps {
    renderItem?: (option: { value: string; label: string }) => React.ReactNode;
}

function LanguageSelectorItems({ renderItem }: LanguageSelectorItemsProps) {
    const { square } = useLanguageSelector();
    const {
        i18n: { language: currentLanguage, options },
    } = useTranslation();

    const locales = (options.supportedLngs as string[]).filter((locale) => locale.toLowerCase() !== 'cimode');

    const languageNames = useMemo(() => {
        return new Intl.DisplayNames([currentLanguage], {
            type: 'language',
        });
    }, [currentLanguage]);

    return (
        <>
            {locales.map((locale) => {
                const label = capitalize(languageNames.of(locale) ?? locale);

                const option = {
                    value: locale,
                    label,
                };

                if (renderItem) {
                    return (
                        <SelectItem value={option.value} key={option.value}>
                            {renderItem(option)}
                        </SelectItem>
                    );
                }

                return (
                    <SelectItem value={option.value} key={option.value}>
                        <span className="!flex items-center justify-center gap-2">
                            <LanguageSelectorFlag
                                locale={locale}
                                className={cn(
                                    square
                                        ? 'h-7! w-7! rounded-full border object-cover'
                                        : 'rounded-[2px] object-cover',
                                )}
                            />
                            {option.label}
                        </span>
                    </SelectItem>
                );
            })}
        </>
    );
}

/* ======================= HIGHER LEVEL COMPONENTS ======================= */

export interface LanguageSelectorBaseProps {
    /**
     * Whether to reload the page when the language is changed.
     * Allow to translate all the content even server side translations.
     *
     * @default true
     */
    reload?: boolean;
    square?: boolean;
    renderItem?: (option: { value: string; label: string }) => React.ReactNode;
    className?: string;
    onChange?: (locale: string) => void;
    useRouting?: boolean;
}

function LanguageSelectorBase({
    onChange,
    square = false,
    renderItem,
    className,
    reload = true,
    useRouting,
}: LanguageSelectorBaseProps) {
    return (
        <LanguageSelectorRoot useRouting={useRouting} onChange={onChange} square={square} reload={reload}>
            <LanguageSelectorTrigger className={className} />
            <LanguageSelectorContent>
                <LanguageSelectorItems renderItem={renderItem} />
            </LanguageSelectorContent>
        </LanguageSelectorRoot>
    );
}

export {
    LanguageSelectorRoot as LanguageSelector,
    LanguageSelectorBase,
    LanguageSelectorContent,
    LanguageSelectorFlag,
    LanguageSelectorItems,
    LanguageSelectorTrigger,
};
