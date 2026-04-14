import { Input } from '@kit/native-ui/input';
import type { QuickFormInput } from '@kit/utils/quick-form';
import { normalizeString } from './utils';

const HOUR_TIME_PATTERN = /^([01]?\d|2[0-4]):([0-5]\d)$/;

const clampTime = (value: string) => {
    const trimmed = value.trim();

    if (HOUR_TIME_PATTERN.test(trimmed)) {
        return trimmed;
    }

    return '00:00';
};

export const HourTimeInput: QuickFormInput = ({ field }) => {
    const value = normalizeString(field.value, '00:00');

    const onChange = (next: string) => {
        field.onChange(next);
    };

    const onBlur = () => {
        field.onChange(clampTime(value));
    };

    return (
        <Input
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            editable={!field.disabled}
            placeholder="00:00"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            className="w-28"
        />
    );
};
