import { Checkbox } from '@kit/ui/checkbox';
import { FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';
import { Label } from '@kit/ui/label';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';

export function TermsCheckbox() {
    const { t } = useTranslation('p_auth');
    return (
        <FormField
            name={'acceptTerms'}
            render={({ field }) => {
                return (
                    <FormItem>
                        <FormControl>
                            <Label className="hover:bg-accent/50 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/10 dark:has-[[aria-checked=true]]:border-primary/80 dark:has-[[aria-checked=true]]:bg-primary/10 flex items-start gap-3 rounded-lg border p-3">
                                <Checkbox
                                    required
                                    name={field.name}
                                    className="data-[state=checked]:border-primary data-[state=checked]:bg-primary dark:data-[state=checked]:border-primary/80 dark:data-[state=checked]:bg-primary/80 data-[state=checked]:text-white"
                                />
                                <div className="grid gap-1.5 font-normal">
                                    <p className="text-sm leading-none font-medium">{t('termsCheckboxLabel')}</p>

                                    <div className={'text-muted-foreground text-sm'}>
                                        <Trans
                                            i18nKey="acceptTermsAndConditions"
                                            ns="p_auth"
                                            components={{
                                                TermsOfServiceLink: (
                                                    <Link
                                                        target={'_blank'}
                                                        className={'text-foreground underline'}
                                                        href={'/terms-of-service'}
                                                    >
                                                        {t('termsOfService')}
                                                    </Link>
                                                ),
                                                PrivacyPolicyLink: (
                                                    <Link
                                                        target={'_blank'}
                                                        className={'text-foreground underline'}
                                                        href={'/privacy-policy'}
                                                    >
                                                        {t('privacyPolicy')}
                                                    </Link>
                                                ),
                                            }}
                                        />
                                    </div>
                                </div>
                            </Label>
                        </FormControl>

                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
