import { createI18nServerInstance } from '@kit/i18n/www/server';
import { cache } from 'react';
import { i18nConfig } from '~/config/i18n.config';

export const getServerI18n = cache(() => createI18nServerInstance(i18nConfig));
