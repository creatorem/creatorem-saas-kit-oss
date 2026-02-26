import initAiFilters from '@kit/ai/www/cross-env-filters';
import initAuthFilters from '@kit/auth/www/cross-env-filters';
/**
 * We need a new init server filters for translations because we need a function that can be called on server and client side.
 */
export const initCrossEnvFilters = () => {
    initAuthFilters();
    initAiFilters();
};
