import enPOrg from './locales/en/p_org.json';
import enOrgOnboarding from './locales/en/p_org-onboarding.json';
import enOrgSettings from './locales/en/p_org-settings.json';
import frPOrg from './locales/fr/p_org.json';
import frOrgOnboarding from './locales/fr/p_org-onboarding.json';
import frOrgSettings from './locales/fr/p_org-settings.json';

const I18N_ORGANIZATION_NAMESPACES = ['p_org', 'p_org-settings', 'p_org-onboarding'] as const;

export { I18N_ORGANIZATION_NAMESPACES, enOrgOnboarding, enOrgSettings, enPOrg, frOrgOnboarding, frOrgSettings, frPOrg };
