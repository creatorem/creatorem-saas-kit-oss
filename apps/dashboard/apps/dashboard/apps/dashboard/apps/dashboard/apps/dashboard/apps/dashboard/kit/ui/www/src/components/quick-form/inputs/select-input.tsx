import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kit/ui/select';
import { QuickFormInput, quickFormInputVariants, SettingOption } from '@kit/utils/quick-form';

export const SelectInput: QuickFormInput<{
    options: SettingOption[];
}> = ({ field, options, slug, variant }) => {
    return (
        <Select onValueChange={field.onChange} value={String(field.value || '')} disabled={field.disabled}>
            <SelectTrigger id={slug} className={quickFormInputVariants({ variant })}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={String(option.value)} value={String(option.value)}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
