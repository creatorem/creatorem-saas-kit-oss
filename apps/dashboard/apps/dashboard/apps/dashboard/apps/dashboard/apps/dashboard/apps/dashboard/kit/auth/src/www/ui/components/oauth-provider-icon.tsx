import { Icon, IconName } from '@kit/ui/icon';
import { cn } from '@kit/utils';
import type { Provider } from '@supabase/supabase-js';

const providerLogo: {
    [key in Provider | 'email']?: IconName;
} = {
    email: 'Mail',
    google: 'google',
    github: 'github',
    facebook: 'facebook',
    apple: 'appleCompany',
    twitter: 'xSocialNetwork',
    linkedin: 'linkedIn',
    notion: 'notion',
};

interface OauthProviderIconProps {
    provider: Provider | 'email';
    className?: string;
}

export function OauthProviderIcon({ provider, className }: OauthProviderIconProps) {
    const ProviderIcon = providerLogo[provider];

    return <Icon name={ProviderIcon ?? 'Lock'} className={cn('size-4 min-w-4', className)} />;
}
