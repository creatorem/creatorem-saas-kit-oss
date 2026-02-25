'use client';

import { Text } from '@kit/native-ui/text';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { nativeConfig, OrgConfig } from '../../config';

function slugify(str: string): string {
    return str.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
}

export const PathPreview = ({ orgConfig }: { orgConfig: OrgConfig }) => {
    const form = useFormContext();
    const orgName = useWatch({ name: 'orgName' });

    useEffect(() => {
        if (orgName) {
            form.setValue('orgSlug', slugify(orgName));
        }
    }, [orgName, form]);

    const orgSlug = useWatch({ name: 'orgSlug' });

    return (
        <View className="flex -translate-y-4 flex-row">
            <Text className="text-muted-foreground text-[0.8rem] break-all opacity-50 dark:opacity-80">
                {nativeConfig(orgConfig).urls.organizationRoot}/
            </Text>
            <Text className="text-muted-foreground text-[0.8rem] font-semibold break-all">{orgSlug}</Text>
        </View>
    );
};
