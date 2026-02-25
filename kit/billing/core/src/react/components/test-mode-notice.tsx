// import { cn } from '@kit/utils';
// import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
// import { Badge } from '@kit/ui/badge';
import { Badge } from '@kit/ui/badge';
import { Icon } from '@kit/ui/icon';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@kit/ui/item';
import React from 'react';

type TestModeNoticeProps = {
    className?: string;
    isCheckout?: boolean;
};

export function TestModeNotice({ className, isCheckout = false }: TestModeNoticeProps): React.JSX.Element {
    return (
        <Item variant="outline" className="max-w-xl" size="sm">
            <ItemMedia>
                <Icon name="Users" className="size-5" />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>
                    <Badge className="mb-1 rounded-full bg-orange-600">Test mode</Badge>
                </ItemTitle>
                <ItemDescription>
                    {isCheckout
                        ? 'Use the card number 4242 4242 4242 4242 with any future expiry and CVC to complete checkout.'
                        : 'You are in test billing mode. This means that your billing provider is in test mode.'}
                </ItemDescription>
            </ItemContent>
        </Item>
    );
}
