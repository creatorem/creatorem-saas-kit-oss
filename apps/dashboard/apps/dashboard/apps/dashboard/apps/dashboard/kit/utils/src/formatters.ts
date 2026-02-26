export function getInitials(name: string): string {
    if (!name) {
        return '';
    }
    return name
        .replace(/\s+/, ' ')
        .split(' ')
        .slice(0, 2)
        .map((v) => v?.[0]?.toUpperCase())
        .join('');
}

export function getTimeSlot(hours: number, minutes: number): Date {
    const date = new Date(0);

    date.setMilliseconds(0);
    date.setSeconds(0);
    date.setMinutes(0);
    date.setHours(0);

    date.setHours(hours);
    date.setMinutes(minutes);

    return date;
}

export const compactNumber = (locale: string, value: number, decimals: number, currency?: string): string => {
    if (currency) {
        const compactFormatter = Intl.NumberFormat(locale, {
            currency: currency,
            style: 'currency',
            notation: 'compact',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
        return compactFormatter.format(value);
    }

    const compactFormatter = Intl.NumberFormat(locale, {
        notation: 'compact',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    return compactFormatter.format(value);
};
