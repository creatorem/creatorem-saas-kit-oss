'use client';

import { Icon } from '@kit/ui/icon';
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '../shadcn/button';
import { PrefixSuffixInput } from './prefix-suffix-input';

const PasswordInput = React.forwardRef<
    HTMLInputElement,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
        prefix?: React.ReactElement;
    }
>((props, ref) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleClickShowPassword = useCallback((): void => {
        setShowPassword((prev) => !prev);
    }, []);

    const handleMouseDownPassword = useCallback((event: React.SyntheticEvent): void => {
        event.preventDefault();
    }, []);

    const suffixButton = useMemo(
        () => (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Toggle password visibility"
                className="-mr-2 size-7"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                disabled={props.disabled}
            >
                {showPassword ? (
                    <Icon name="EyeOff" className="size-4 shrink-0" />
                ) : (
                    <Icon name="Eye" className="size-4 shrink-0" />
                )}
            </Button>
        ),
        [showPassword, handleClickShowPassword, handleMouseDownPassword, props.disabled],
    );

    return <PrefixSuffixInput ref={ref} type={showPassword ? 'text' : 'password'} suffix={suffixButton} {...props} />;
});
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
