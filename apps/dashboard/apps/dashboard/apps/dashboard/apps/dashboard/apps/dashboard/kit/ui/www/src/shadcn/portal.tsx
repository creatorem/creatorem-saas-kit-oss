'use client';

import * as PortalPrimitive from '@radix-ui/react-portal';
import React, { useEffect, useState } from 'react';

const Portal = React.forwardRef<
    React.ComponentRef<typeof PortalPrimitive.Root>,
    Omit<React.ComponentPropsWithoutRef<typeof PortalPrimitive.Root> & { containerID?: string }, 'container'>
>(({ children, containerID, ...props }, ref) => {
    const [container, setContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setContainer(containerID ? document.getElementById(containerID) || document.body : document.body);
    }, [containerID]);

    return (
        <PortalPrimitive.Root ref={ref} {...props} container={container}>
            {children}
        </PortalPrimitive.Root>
    );
});

Portal.displayName = 'Portal';

export { Portal };
