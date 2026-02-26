import { UserMediaManager } from '@kit/auth/www/user';
import { QuickFormInput } from '@kit/utils/quick-form';

export const UserSettingMedia: QuickFormInput<{
    triggerClassName?: string;
    imageClassName?: string;
    placeholder?: React.ReactNode;
}> = ({ field, triggerClassName, imageClassName, placeholder }) => {
    return (
        <UserMediaManager
            value={field.value}
            disabled={field.disabled}
            onValueChange={field.onChange}
            multiple={false}
            triggerClassName={triggerClassName}
            imageClassName={imageClassName}
            placeholder={placeholder}
            isUrl
        />
    );
};
