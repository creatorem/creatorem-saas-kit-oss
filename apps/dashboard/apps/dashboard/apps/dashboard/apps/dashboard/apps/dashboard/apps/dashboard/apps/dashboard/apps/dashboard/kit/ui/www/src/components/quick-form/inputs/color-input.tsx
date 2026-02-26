import { ColorInput as UIColorInput } from '@kit/ui/color-input';
import { QuickFormInput } from '@kit/utils/quick-form';

export const ColorInput: QuickFormInput = ({ field: { onChange, value, ...field }, slug }) => {
    return <UIColorInput value={value} onChange={onChange} disabled={field.disabled} id={slug} />;
};
