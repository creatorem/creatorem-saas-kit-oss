import { Textarea } from '@kit/ui/textarea';
import { cn } from '@kit/utils';
import { QuickFormInput } from '@kit/utils/quick-form';

export const TextareaInput: QuickFormInput = ({ field }) => {
    return (
        <Textarea
            value={field.value || ''}
            onChange={field.onChange}
            disabled={field.disabled}
            className={cn('max-h-[300px]', field.value ? 'bg-muted/50 focus-visible:bg-background' : '')}
            autoResize
        />
    );
};
