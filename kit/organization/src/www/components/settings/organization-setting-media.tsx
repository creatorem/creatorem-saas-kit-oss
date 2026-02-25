'use client';

import { QuickFormInput } from '@kit/utils/quick-form';
import { OrganizationMediaManager } from './organization-media-manager';

export const OrganizationSettingMedia: QuickFormInput<{
    triggerClassName?: string;
    imageClassName?: string;
    placeholder?: React.ReactNode;
}> = ({ field, triggerClassName, imageClassName, placeholder }) => {
    return (
        <OrganizationMediaManager
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
