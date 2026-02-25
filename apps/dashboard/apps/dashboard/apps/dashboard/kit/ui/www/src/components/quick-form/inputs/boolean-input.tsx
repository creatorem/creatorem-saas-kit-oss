import { Switch } from '@kit/ui/switch';
import { QuickFormInput } from '@kit/utils/quick-form';

export const BooleanInput: QuickFormInput = ({ field: { onChange, value, ...field }, slug }) => {
    return (
        <Switch checked={value} onCheckedChange={onChange} disabled={field.disabled} id={slug} className="mt-[5px]" />
    );
};
