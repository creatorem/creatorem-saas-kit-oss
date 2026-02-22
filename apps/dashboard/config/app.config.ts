import { parseAppConfig } from '@kit/utils/config';

export const appConfig = parseAppConfig({
    name: 'Acme',
    title: 'Acme | Create your next idea with our kit.',
    description: 'Acme is a platform for creating and managing your projects and ideas.',
    theme: 'light',
    email: {
        template: {
            logo: {
                url: 'https://creatorem.com/logo.png',
                width: 176,
                height: 32,
            },
        },
        contactEmail: 'hello@creatorem.com',
        supportEmail: 'hello@creatorem.com',
    },
});
