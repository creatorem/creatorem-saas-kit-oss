import { Input } from '@kit/ui/input';
import { cn } from '@kit/utils';
import { QuickFormInput, quickFormInputVariants } from '@kit/utils/quick-form';

export const TextInput: QuickFormInput<{
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}> = ({ field, placeholder, className, disabled, variant }) => {
    return (
        <Input
            value={field.value || ''}
            onChange={field.onChange}
            disabled={field.disabled || disabled}
            placeholder={placeholder}
            className={cn(
                quickFormInputVariants({ variant }),
                field.value ? 'bg-muted/50 focus-visible:bg-background' : '',
                className,
            )}
        />
    );
};
