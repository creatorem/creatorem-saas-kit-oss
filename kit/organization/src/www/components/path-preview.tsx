'use client';

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { OrgConfig, wwwConfig } from '../../config';

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
        <p className="text-muted-foreground ml-0.5 -translate-y-4 text-[0.8rem] break-all">
            <span className="opacity-50 dark:opacity-80">{wwwConfig(orgConfig).urls.organizationRoot}/</span>
            <span className="font-semibold">{orgSlug}</span>
        </p>
    );
};
