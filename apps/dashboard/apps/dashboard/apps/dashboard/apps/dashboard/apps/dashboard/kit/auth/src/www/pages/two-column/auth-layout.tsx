import { LanguageSelectorBase } from '@kit/i18n/www/ui/language-selector';
import { ThemeToggle } from '@kit/ui/theme-toggle';
import Image from 'next/image';
import Link from 'next/link';
import { AuthPageProps } from '../with-auth-config';

export const AuthLayout: React.FC<
    React.PropsWithChildren<
        {
            Logo: React.ComponentType;
        } & Pick<AuthPageProps, 'authConfig'>
    >
> = ({ children, Logo, authConfig }) => {
    if (authConfig.environment !== 'www' || authConfig.variant?.type !== 'two-column') {
        throw new Error('You must use the www environement value in your config object.');
    }
    return (
        <main className="grid min-h-svh lg:grid-cols-2">
            <div className="relative flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href={authConfig.urls.exit} className="mr-auto block w-fit">
                        <Logo />
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-sm">
                        {/* <Card> */}
                        {children}
                        {/* </Card> */}
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <Image
                    src={authConfig.variant.rightImageUrl}
                    alt={'Authentication page image.'}
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                    fill
                />
            </div>
            <LanguageSelectorBase square className="fixed border-background right-4 top-4 rounded-full" />
            <ThemeToggle className="fixed right-4 bottom-4 rounded-full" />
        </main>
    );
};
