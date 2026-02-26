'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@kit/ui/dropdown-menu';
import { Icon } from '@kit/ui/icon';
import { Input } from '@kit/ui/input';
import { ScrollArea } from '@kit/ui/scroll-area';
import { cn } from '@kit/utils';
import parsePhoneNumber, { AsYouType, CountryCallingCode, CountryCode } from 'libphonenumber-js';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRIES, ISO_CODES, MuiTelInputCountry, NUMBER_TO_ISO_CODE } from './model/constants/countries';
import { filterCountries, sortAlphabeticallyCountryCodes } from './model/country';
import { FlagElement } from './model/flag';
import { getDisplayNames } from './model/intl';

type PhoneInputContextValue = {
    isoCode: CountryCode;
    countryCode?: CountryCallingCode;
    number: string;
    defaultNumber?: string;
    defaultCountryISO: CountryCode;
    onCountryChange: (isoCode: CountryCode) => void;
    onPhoneInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const PhoneInputContext = React.createContext<PhoneInputContextValue | null>(null);

function usePhoneInputContext(): PhoneInputContextValue {
    const ctx = useContext(PhoneInputContext);
    if (!ctx) {
        throw new Error('PhoneInput components must be used within <PhoneInputRoot>.');
    }
    return ctx;
}

const trimPhone = (phone: string) => phone.replace(/^[\s|0|+]*/g, '');

export interface PhoneInputRootProps {
    value?: string;
    onPhoneInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /**
     * The default number value
     */
    defaultNumber?: string;
    /**
     * The default country ISO code
     * @default 'FR'
     */
    defaultCountryISO?: CountryCode;
    className?: string;
}

const PhoneInputRoot: React.FC<PhoneInputRootProps & React.PropsWithChildren> = ({
    value,
    onPhoneInputChange,
    defaultNumber,
    defaultCountryISO = 'FR',
    children,
    className,
}) => {
    const phoneNumber = parsePhoneNumber(value || '', defaultCountryISO);
    const [isoCode, setIsoCode] = useState<CountryCode>(defaultCountryISO as CountryCode);

    const countryCode = useMemo((): CountryCallingCode | undefined => {
        return phoneNumber?.countryCallingCode;
    }, [phoneNumber]);

    useEffect(() => {
        if (countryCode && NUMBER_TO_ISO_CODE[countryCode] !== isoCode) {
            setIsoCode(NUMBER_TO_ISO_CODE[countryCode as CountryCallingCode] as CountryCode);
        }
    }, [countryCode, isoCode]);

    const number = useMemo(() => {
        if (!phoneNumber) return value ? value.replace(new RegExp(`^\\+${COUNTRIES[isoCode]?.[0]}`), '') : '';
        const formatted = new AsYouType(isoCode).input(value || '');
        return formatted.replace(new RegExp(`^\\+${countryCode}`), '');
    }, [countryCode, value, isoCode, phoneNumber]);

    const handleCountryChange = useCallback(
        (newIsoCode: CountryCode) => {
            setIsoCode(newIsoCode);
            const newValue = `+${COUNTRIES[newIsoCode]?.[0]}${phoneNumber ? trimPhone(number) : ''}`;
            onPhoneInputChange?.({
                target: { value: newValue },
            } as React.ChangeEvent<HTMLInputElement>);
        },
        [phoneNumber, number, onPhoneInputChange],
    );

    const handlePhoneInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.value.startsWith('+')) {
                return onPhoneInputChange?.(e);
            }
            e.target.value = `+${COUNTRIES[isoCode]?.[0]}${trimPhone(e.target.value)}`;
            onPhoneInputChange?.(e);
        },
        [isoCode, onPhoneInputChange],
    );

    const contextValue = useMemo<PhoneInputContextValue>(
        () => ({
            isoCode,
            countryCode,
            number,
            defaultNumber,
            defaultCountryISO,
            onCountryChange: handleCountryChange,
            onPhoneInputChange: handlePhoneInputChange,
        }),
        [isoCode, countryCode, number, defaultNumber, defaultCountryISO, handleCountryChange, handlePhoneInputChange],
    );

    return (
        <PhoneInputContext.Provider value={contextValue}>
            <div className="flex items-center">{children}</div>
        </PhoneInputContext.Provider>
    );
};

interface FlagMenuItemProps {
    isoCode: MuiTelInputCountry;
    onChange?: (isoCode: CountryCode) => void;
    countryName: string;
    selected: boolean;
}

const FlagMenuItem: React.FC<FlagMenuItemProps> = ({ onChange, isoCode, countryName, selected }) => {
    const ref = useRef<React.ComponentRef<typeof DropdownMenuItem>>(null);

    const handleClick = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();
            onChange?.(isoCode);
        },
        [isoCode, onChange],
    );

    useEffect(() => {
        if (selected) {
            ref.current?.scrollIntoView({ block: 'center' });
        }
    }, [selected]);

    return (
        <DropdownMenuItem ref={ref} onClick={handleClick} className="mr-4 flex items-center gap-x-2">
            <span>
                <FlagElement isoCode={isoCode} countryName={countryName} />
            </span>
            <span>{countryName}</span>
            {selected && (
                <Icon name="Check" className="text-primary-500 dark:text-primary-400 h-5 w-5" aria-hidden="true" />
            )}
            <span className="text-muted-foreground ml-auto">+{COUNTRIES[isoCode]?.[0]}</span>
        </DropdownMenuItem>
    );
};

const PhoneInputFlagMenu: React.FC<Omit<React.HTMLAttributes<HTMLButtonElement>, 'children' | 'type' | 'role'>> = ({
    className,
    ...props
}) => {
    const { isoCode, onCountryChange, defaultCountryISO } = usePhoneInputContext();
    const [open, setOpen] = useState(false);
    const displayNames = useMemo(() => {
        return getDisplayNames(defaultCountryISO);
    }, []);

    const ISO_CODES_SORTED = sortAlphabeticallyCountryCodes(ISO_CODES, displayNames);

    const countriesFiltered = filterCountries(ISO_CODES_SORTED, {});

    const handleChange = useCallback(
        (newIsoCode: CountryCode) => {
            onCountryChange(newIsoCode);
            setOpen(false);
        },
        [onCountryChange],
    );

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        'focus-visible:ring-primary focus:ring-primary border-input inline-flex h-9 shrink-0 items-center rounded-l-md rounded-r-none border px-4 py-2 text-center text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
                        className,
                    )}
                    type="button"
                    role="menuitem"
                    {...props}
                >
                    <FlagElement
                        isoCode={isoCode as MuiTelInputCountry}
                        countryName={displayNames.of(isoCode as MuiTelInputCountry) || ''}
                    />
                    <span className="ml-2">+{COUNTRIES[isoCode]?.[0]}</span>
                    <Icon name="ChevronDown" className="ml-1 h-4 w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[300px] pr-0">
                <ScrollArea type="always" className="h-[292px]">
                    {countriesFiltered.map((isoCodeItem) => {
                        return (
                            <React.Fragment key={isoCodeItem}>
                                <FlagMenuItem
                                    isoCode={isoCodeItem}
                                    countryName={displayNames.of(isoCodeItem) || ''}
                                    onChange={handleChange}
                                    selected={isoCodeItem === isoCode}
                                />
                            </React.Fragment>
                        );
                    })}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const PhoneInputBase = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<typeof Input>>(
    ({ className, ...props }, ref) => {
        const { number, onPhoneInputChange } = usePhoneInputContext();
        return (
            <Input
                type="tel"
                className={cn(
                    'focus-visible:ring-primary focus:ring-primary block w-full rounded-l-none rounded-r-md border border-s-0 px-3 py-2.5 text-sm',
                    className,
                )}
                placeholder="7 12 34 56 78"
                {...props}
                value={number}
                onChange={onPhoneInputChange}
                ref={ref}
            />
        );
    },
);

PhoneInputBase.displayName = 'PhoneInputBase';

export { PhoneInputBase, PhoneInputFlagMenu, PhoneInputRoot };
