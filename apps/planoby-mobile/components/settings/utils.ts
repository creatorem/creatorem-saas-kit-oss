import type { BaseInputProps } from '@kit/utils/quick-form';

export const unwrapSettingValue = (value: unknown): unknown => {
    if (value && typeof value === 'object' && 'json' in (value as Record<string, unknown>)) {
        return (value as Record<string, unknown>).json;
    }

    return value;
};

export const normalizeString = (value: unknown, fallback = ''): string => {
    const parsed = unwrapSettingValue(value);

    return typeof parsed === 'string' ? parsed : fallback;
};

export const normalizeBoolean = (value: unknown, fallback = false): boolean => {
    const parsed = unwrapSettingValue(value);

    if (typeof parsed === 'boolean') return parsed;
    if (typeof parsed === 'number') return parsed === 1;
    if (typeof parsed === 'string') {
        const lowered = parsed.trim().toLowerCase();
        if (lowered === 'true' || lowered === '1') return true;
        if (lowered === 'false' || lowered === '0') return false;
    }

    return fallback;
};

export const normalizeNumber = (value: unknown, fallback = 0): number => {
    const parsed = unwrapSettingValue(value);

    if (typeof parsed === 'number' && Number.isFinite(parsed)) {
        return parsed;
    }

    if (typeof parsed === 'string') {
        const num = Number.parseFloat(parsed);
        if (Number.isFinite(num)) {
            return num;
        }
    }

    return fallback;
};

export const getFieldStringValue = (field: BaseInputProps['field'], fallback = ''): string => {
    return normalizeString(field.value, fallback);
};
