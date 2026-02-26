import { useRouter } from 'next/navigation';
import { useLayoutEffect } from 'react';

export const Redirect: React.FC<{
    href: Parameters<ReturnType<typeof useRouter>['push']>[0];
    options: Parameters<ReturnType<typeof useRouter>['push']>[1];
}> = ({ href, options }) => {
    const router = useRouter();

    useLayoutEffect(() => {
        router.push(href, options);
    }, [router, href, options]);

    return null;
};
