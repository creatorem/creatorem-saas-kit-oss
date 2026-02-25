import { UserSettingMedia } from '@kit/auth/www/user';
import { Icon } from '@kit/ui/icon';
import { getUseOnboardingFilters } from '../../../shared/filters/use-filters/use-onboarding-filters';
import { OrganizationSettingMedia } from '../../components';
import { PathPreview } from '../../components/path-preview';

export const useOnboardingFilters = getUseOnboardingFilters({
    Icon,
    OrganizationSettingMedia,
    UserSettingMedia,
    PathPreview,
    getCreateOrgHeader: (t) => (
        <>
            <h1 className="text-xl leading-none font-semibold tracking-tight lg:text-2xl">
                {t('steps.organization.header.title')}
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">{t('steps.organization.header.description')}</p>
        </>
    ),
});
