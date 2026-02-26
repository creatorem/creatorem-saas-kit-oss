import { RadioGroup, RadioGroupItem } from '@kit/ui/radio-group';
import { QuickFormInput, SettingOption } from '@kit/utils/quick-form';

export const RadioInput: QuickFormInput<{
    options: SettingOption[];
}> = ({ field, options, slug }) => {
    return (
        <RadioGroup onValueChange={field.onChange} value={String(field.value || '')} disabled={field.disabled}>
            {options.map((option, index) => (
                <div key={index} className="flex h-10 items-center gap-x-4">
                    <RadioGroupItem
                        value={String(option.value)}
                        className="peer"
                        id={`${slug}-${String(option.value)}`}
                    />
                    <label
                        htmlFor={`${slug}-${String(option.value)}`}
                        className="text-muted-foreground peer-data-[state=checked]:text-primary text-sm"
                    >
                        {option.label}
                    </label>
                </div>
            ))}
        </RadioGroup>
    );
};
