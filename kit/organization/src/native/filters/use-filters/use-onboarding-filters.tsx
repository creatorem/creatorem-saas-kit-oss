import { UserSettingMedia } from '@kit/auth/native/user';
import { Icon } from '@kit/native-ui/icon';
import { StepperPrevious } from '@kit/native-ui/stepper';
import { Text, View } from 'react-native';
import { getUseOnboardingFilters } from '../../../shared/filters/use-filters/use-onboarding-filters';
import { OrganizationSettingMedia } from '../../components';
import { PathPreview } from '../../components/path-preview';

const goBackButton = (
    <View>
        <StepperPrevious className="active:bg-muted mr-auto border-none" variant={'ghost'} size="icon">
            <Icon name="ArrowLeft" size={24} className="text-foreground" />
        </StepperPrevious>
    </View>
);

export const useOnboardingFilters = getUseOnboardingFilters({
    Icon,
    OrganizationSettingMedia,
    UserSettingMedia,
    PathPreview,
    getCreateOrgHeader: (t) => (
        <>
            <Text className="text-xl leading-none font-semibold tracking-tight lg:text-2xl">
                {t('steps.organization.header.title')}
            </Text>
            <Text className="text-muted-foreground text-sm lg:text-base">
                {t('steps.organization.header.description')}
            </Text>
        </>
    ),
    settingsPrefix: [
        {
            type: 'ui',
            render: goBackButton,
        },
    ],
});
