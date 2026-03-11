"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kit/ui/dropdown-menu";
import { Icon } from "@kit/ui/icon";
import { Input } from "@kit/ui/input";
import { ScrollArea } from "@kit/ui/scroll-area";
import { cn } from "@kit/utils";
import { useCopyToClipboard } from "@kit/utils/hooks/use-copy-to-clipboard";
import parsePhoneNumber, {
  AsYouType,
  CountryCallingCode,
  CountryCode,
} from "libphonenumber-js";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  COUNTRIES,
  ISO_CODES,
  MuiTelInputCountry,
  NUMBER_TO_ISO_CODE,
} from "./model/constants/countries";
import {
  filterCountries,
  sortAlphabeticallyCountryCodes,
} from "./model/country";
import { FlagElement } from "./model/flag";
import { getDisplayNames } from "./model/intl";

type PhoneInputContextValue = {
  isoCode: CountryCode;
  countryCode?: CountryCallingCode;
  number: string;
  defaultNumber?: string;
  defaultCountryISO: CountryCode;
  onCountryChange: (isoCode: CountryCode) => void;
  onPhoneInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const PhoneInputContext = React.createContext<PhoneInputContextValue | null>(
  null,
);

function usePhoneInputContext(): PhoneInputContextValue {
  const ctx = useContext(PhoneInputContext);
  if (!ctx) {
    throw new Error(
      "PhoneInput components must be used within <PhoneInputRoot>.",
    );
  }
  return ctx;
}

const trimPhone = (phone: string) => phone.replace(/^[\s|0|+]*/g, "");

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

const PhoneInputRoot: React.FC<
  PhoneInputRootProps & React.PropsWithChildren
> = ({
  value,
  onPhoneInputChange,
  defaultNumber,
  defaultCountryISO = "FR",
  children,
  className,
}) => {
  const phoneNumber = parsePhoneNumber(value || "", defaultCountryISO);
  const [isoCode, setIsoCode] = useState<CountryCode>(
    defaultCountryISO as CountryCode,
  );

  const countryCode = useMemo((): CountryCallingCode | undefined => {
    return phoneNumber?.countryCallingCode;
  }, [phoneNumber]);

  useEffect(() => {
    if (countryCode && NUMBER_TO_ISO_CODE[countryCode] !== isoCode) {
      setIsoCode(
        NUMBER_TO_ISO_CODE[countryCode as CountryCallingCode] as CountryCode,
      );
    }
  }, [countryCode, isoCode]);

  const number = useMemo(() => {
    if (!phoneNumber)
      return value
        ? value.replace(new RegExp(`^\\+${COUNTRIES[isoCode]?.[0]}`), "")
        : "";
    const formatted = new AsYouType(isoCode).input(value || "");
    return formatted.replace(new RegExp(`^\\+${countryCode}`), "");
  }, [countryCode, value, isoCode, phoneNumber]);

  const handleCountryChange = useCallback(
    (newIsoCode: CountryCode) => {
      setIsoCode(newIsoCode);
      const newValue = `+${COUNTRIES[newIsoCode]?.[0]}${phoneNumber ? trimPhone(number) : ""}`;
      onPhoneInputChange?.({
        target: { value: newValue },
      } as React.ChangeEvent<HTMLInputElement>);
    },
    [phoneNumber, number, onPhoneInputChange],
  );

  const handlePhoneInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value.startsWith("+")) {
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
    [
      isoCode,
      countryCode,
      number,
      defaultNumber,
      defaultCountryISO,
      handleCountryChange,
      handlePhoneInputChange,
    ],
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

const FlagMenuItem: React.FC<FlagMenuItemProps> = ({
  onChange,
  isoCode,
  countryName,
  selected,
}) => {
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
      ref.current?.scrollIntoView({ block: "center" });
    }
  }, [selected]);

  return (
    <DropdownMenuItem
      ref={ref}
      onClick={handleClick}
      className="mr-4 flex items-center gap-x-2"
    >
      <span>
        <FlagElement isoCode={isoCode} countryName={countryName} />
      </span>
      <span>{countryName}</span>
      {selected && (
        <Icon
          name="Check"
          className="text-primary-500 dark:text-primary-400 h-5 w-5"
          aria-hidden="true"
        />
      )}
      <span className="text-muted-foreground ml-auto">
        +{COUNTRIES[isoCode]?.[0]}
      </span>
    </DropdownMenuItem>
  );
};

const PhoneInputFlagMenu: React.FC<
  Omit<React.HTMLAttributes<HTMLButtonElement>, "children" | "type" | "role">
> = ({ className, ...props }) => {
  const { isoCode, onCountryChange, defaultCountryISO } =
    usePhoneInputContext();
  const [open, setOpen] = useState(false);
  const displayNames = useMemo(() => {
    return getDisplayNames(defaultCountryISO);
  }, []);

  const ISO_CODES_SORTED = sortAlphabeticallyCountryCodes(
    ISO_CODES,
    displayNames,
  );

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
            "focus-visible:ring-primary focus:ring-primary border-input inline-flex h-9 shrink-0 items-center rounded-l-md rounded-r-none border px-4 py-2 text-center text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden",
            className,
          )}
          type="button"
          role="menuitem"
          {...props}
        >
          <FlagElement
            isoCode={isoCode as MuiTelInputCountry}
            countryName={displayNames.of(isoCode as MuiTelInputCountry) || ""}
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
                  countryName={displayNames.of(isoCodeItem) || ""}
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

const PhoneInputBase = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Input>
>(({ className, ...props }, ref) => {
  const { number, onPhoneInputChange } = usePhoneInputContext();
  return (
    <Input
      type="tel"
      className={cn(
        "focus-visible:ring-primary focus:ring-primary block w-full rounded-l-none rounded-r-md border border-s-0 px-3 py-2.5 text-sm",
        className,
      )}
      placeholder="7 12 34 56 78"
      {...props}
      value={number}
      onChange={onPhoneInputChange}
      ref={ref}
    />
  );
});

PhoneInputBase.displayName = "PhoneInputBase";

const DEFAULT_PHONE_INPUT_COUNTRIES: MuiTelInputCountry[] = [
  "FR",
  "BE",
  "LU",
  "DE",
  "NL",
  "GB",
  "IE",
  "DK",
  "CH",
  "IT",
  "ES",
];

export interface PhoneInputProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  "onBlur" | "onChange" | "value"
> {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (value: string) => void;
  flagMenuClassName?: string;
  copyable?: boolean;
  requireCountrySelection?: boolean;
  initialIsoCode?: CountryCode | null;
  onCountryChange?: (isoCode: CountryCode | null) => void;
  selectableCountries?: MuiTelInputCountry[];
}

interface CompatFlagMenuProps {
  value: MuiTelInputCountry | null;
  onChange?: (isoCode: CountryCode) => void;
  flagMenuClassName?: string;
  selectableCountries?: MuiTelInputCountry[];
}

const CompatFlagMenu: React.FC<CompatFlagMenuProps> = ({
  value,
  onChange,
  flagMenuClassName,
  selectableCountries = DEFAULT_PHONE_INPUT_COUNTRIES,
}) => {
  const [open, setOpen] = useState(false);
  const displayNames = useMemo(() => {
    return getDisplayNames("FR");
  }, []);

  const countriesFiltered = useMemo(() => {
    const isoCodesSorted = sortAlphabeticallyCountryCodes(
      ISO_CODES,
      displayNames,
    );
    return filterCountries(isoCodesSorted, {}).filter((isoCode) => {
      return selectableCountries.includes(isoCode);
    });
  }, [displayNames, selectableCountries]);

  const handleChange = useCallback(
    (isoCode: CountryCode) => {
      onChange?.(isoCode);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "focus-visible:ring-primary focus:ring-primary z-10 inline-flex shrink-0 items-center rounded-l-md rounded-r-none border bg-gray-50 px-4 py-2.5 text-center text-sm font-medium hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden",
            flagMenuClassName,
          )}
          type="button"
          role="menuitem"
        >
          {value ? (
            <>
              <FlagElement
                isoCode={value}
                countryName={displayNames.of(value) || ""}
              />
              <span className="ml-2">+{COUNTRIES[value]?.[0]}</span>
            </>
          ) : (
            <span className="mr-2" aria-hidden="true">
              🏳️
            </span>
          )}
          <Icon name="ChevronDown" className="ml-1 h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px] pr-0">
        <ScrollArea type="always" className="h-[292px]">
          {countriesFiltered.map((isoCodeItem) => {
            return (
              <FlagMenuItem
                key={isoCodeItem}
                isoCode={isoCodeItem}
                countryName={displayNames.of(isoCodeItem) || ""}
                onChange={handleChange}
                selected={isoCodeItem === value}
              />
            );
          })}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      onChange,
      onBlur,
      value,
      className,
      flagMenuClassName,
      copyable,
      requireCountrySelection = false,
      initialIsoCode,
      onCountryChange,
      selectableCountries = DEFAULT_PHONE_INPUT_COUNTRIES,
      ...props
    },
    ref,
  ) => {
    const { copyToClipboard, isCopied } = useCopyToClipboard();
    const [isoCode, setIsoCode] = useState<CountryCode | null>(() => {
      if (initialIsoCode !== undefined) {
        return initialIsoCode;
      }

      return requireCountrySelection ? null : ("FR" as CountryCode);
    });
    const phoneNumber = useMemo(() => {
      return isoCode
        ? parsePhoneNumber(value || "", isoCode)
        : parsePhoneNumber(value || "");
    }, [isoCode, value]);

    const countryCode = useMemo((): CountryCallingCode | undefined => {
      return phoneNumber?.countryCallingCode;
    }, [phoneNumber]);

    useEffect(() => {
      if (
        !requireCountrySelection &&
        countryCode &&
        NUMBER_TO_ISO_CODE[countryCode] !== isoCode
      ) {
        setIsoCode(NUMBER_TO_ISO_CODE[countryCode] ?? null);
      }
    }, [countryCode, isoCode, requireCountrySelection]);

    const number = useMemo(() => {
      if (!phoneNumber) {
        if (!isoCode) {
          return "";
        }

        return value
          ? value.replace(new RegExp(`^\\+${COUNTRIES[isoCode]?.[0]}`), "")
          : "";
      }

      const formatted = new AsYouType((isoCode || "FR") as CountryCode).input(
        value || "",
      );
      return formatted.replace(new RegExp(`^\\+${countryCode}`), "");
    }, [countryCode, isoCode, phoneNumber, value]);

    const fullPhoneValue = useMemo(() => {
      if (!isoCode) {
        return value || "";
      }

      const countryPrefix = COUNTRIES[isoCode]?.[0];
      return countryPrefix
        ? `+${countryPrefix}${trimPhone(number)}`
        : value || "";
    }, [isoCode, number, value]);

    const copyValue = useMemo(() => {
      if (!copyable || !isoCode) {
        return "";
      }

      const countryPrefix = COUNTRIES[isoCode]?.[0];
      return countryPrefix ? `+${countryPrefix}${number}` : "";
    }, [copyable, isoCode, number]);

    const handleCountryChange = useCallback(
      (newIsoCode: CountryCode) => {
        setIsoCode(newIsoCode);
        onCountryChange?.(newIsoCode);

        const nextValue = `+${COUNTRIES[newIsoCode]?.[0]}${phoneNumber ? trimPhone(number) : ""}`;
        onChange?.({
          target: { value: nextValue },
        } as React.ChangeEvent<HTMLInputElement>);
      },
      [number, onChange, onCountryChange, phoneNumber],
    );

    const handlePhoneInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (requireCountrySelection && !isoCode) {
          event.preventDefault();
          return;
        }

        if (event.target.value.startsWith("+")) {
          onChange?.(event);
          return;
        }

        event.target.value = `+${COUNTRIES[isoCode as CountryCode]?.[0]}${trimPhone(event.target.value)}`;
        onChange?.(event);
      },
      [isoCode, onChange, requireCountrySelection],
    );

    const handleBlur = useCallback(() => {
      onBlur?.(fullPhoneValue);
    }, [fullPhoneValue, onBlur]);

    return (
      <div className="flex items-center">
        <CompatFlagMenu
          value={isoCode}
          onChange={handleCountryChange}
          selectableCountries={selectableCountries}
          flagMenuClassName={flagMenuClassName}
        />

        <div className="relative w-full">
          <Input
            type="tel"
            className={cn(
              "focus-visible:ring-primary focus:ring-primary z-20 block w-full rounded-l-none rounded-r-md border border-s-0 bg-gray-50 px-3 py-2.5 text-sm hover:bg-white",
              copyable ? "pr-10" : "",
              className,
            )}
            placeholder="7 12 34 56 78"
            {...props}
            value={number}
            onBlur={handleBlur}
            onChange={handlePhoneInputChange}
            ref={ref}
            disabled={requireCountrySelection && !isoCode}
          />

          {copyable ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void copyToClipboard(copyValue);
              }}
              className="absolute right-2 top-1/2 z-30 -translate-y-1/2 rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              title={isCopied ? "Copied!" : "Copy to clipboard"}
              disabled={!copyValue}
            >
              {isCopied ? (
                <Icon name="Check" className="h-4 w-4" />
              ) : (
                <Icon name="Copy" className="h-4 w-4" />
              )}
            </button>
          ) : null}
        </div>
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInputBase, PhoneInputFlagMenu, PhoneInputRoot };
