import { BooleanInput } from './inputs/boolean-input';
import { ColorInput } from './inputs/color-input';
import { NumberInput } from './inputs/number-input';
import { PhoneInput } from './inputs/phone-input';
import { QuestionSelectInput } from './inputs/question-select-input';
import { RadioInput } from './inputs/radio-input';
import { SelectInput } from './inputs/select-input';
import { TextInput } from './inputs/text-input';
import { TextareaInput } from './inputs/textarea-input';
import { ThemeInput } from './inputs/theme-input';
import { TimeInput } from './inputs/time-input';

/**
 * `ui` and `group` keys are already reserved.
 */
export const REGISTERED_INPUTS = {
    text: TextInput,
    textarea: TextareaInput,
    /**
     * Phone input. Implemented using the [PhoneInput](/docs/ui/components/phone-input) component.
     */
    phone: PhoneInput,
    select: SelectInput,
    /**
     * Checkbox input.
     */
    boolean: BooleanInput,
    /**
     * Number input. Implemented using the [NumberInput](/docs/ui/components/number-input) component.
     */
    number: NumberInput,
    color: ColorInput,
    time: TimeInput,
    radio: RadioInput,
    /**
     * Theme input.
     */
    theme: ThemeInput,
    question_select: QuestionSelectInput,
} as const;
