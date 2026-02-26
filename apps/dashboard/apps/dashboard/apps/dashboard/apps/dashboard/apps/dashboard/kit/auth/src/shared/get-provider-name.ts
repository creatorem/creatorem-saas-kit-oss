import type { Provider } from '@supabase/supabase-js';

const providerName: {
    [key in Provider | 'email']?: string;
} = {
    email: 'Email & Password',
    google: 'Google',
    github: 'GitHub',
    facebook: 'Facebook',
    apple: 'Apple',
    twitter: 'X (Twitter)',
    discord: 'Discord',
    linkedin: 'LinkedIn',
    notion: 'Notion',
};

function capitalizeFirstLetter(value: string): string {
    return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function extractProviderNameFromDomain(providerId: string): string {
    if (providerId.endsWith('.com')) {
        return providerId.split('.com')[0]!;
    }
    return providerId;
}

export function getProviderName(providerId: Provider | 'email') {
    if (providerId in providerName) {
        return providerName[providerId];
    }
    const baseName = extractProviderNameFromDomain(providerId);
    return capitalizeFirstLetter(baseName);
}
