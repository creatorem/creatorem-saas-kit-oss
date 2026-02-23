'use client';

import { useApplyFilter } from '@kit/utils/filters';
import NextError from 'next/error';
import * as React from 'react';

export type GlobalErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function GlobalError({ error: { digest, ...error } }: GlobalErrorProps): React.JSX.Element {
    useApplyFilter('capture_global_error', null, {
        error,
        digest,
    });

    return (
        <html>
            <body>
                <NextError statusCode={0} />
            </body>
        </html>
    );
}
