'use client';

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { envs } from '../../../envs';

function slugify(str: string): string {
    return str.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
}

export const PathPreview = () => {
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
            <span className="opacity-50 dark:opacity-80">{envs.www().NEXT_PUBLIC_DASHBOARD_URL}/</span>
            <span className="font-semibold">{orgSlug}</span>
        </p>
    );
};
