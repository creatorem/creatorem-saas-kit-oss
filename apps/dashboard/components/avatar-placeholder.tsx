'use client';

import { useUser } from '@kit/auth/www/user';
import { Avatar, AvatarFallback } from '@kit/ui/avatar';
import { Icon } from '@kit/ui/icon';
import { cn, getInitials } from '@kit/utils';

interface AvatarPlaceholderProps {
    className?: string;
}

export function AvatarPlaceholder({ className }: AvatarPlaceholderProps) {
    const user = useUser();

    return (
        <Avatar className={cn('size-28', className)}>
            <AvatarFallback className={cn('size-full text-2xl', className)}>
                {user.name ? (
                    getInitials(user.name)
                ) : (
                    <Icon name="Upload" className="text-muted-foreground size-5 shrink-0" />
                )}
            </AvatarFallback>
        </Avatar>
    );
}
