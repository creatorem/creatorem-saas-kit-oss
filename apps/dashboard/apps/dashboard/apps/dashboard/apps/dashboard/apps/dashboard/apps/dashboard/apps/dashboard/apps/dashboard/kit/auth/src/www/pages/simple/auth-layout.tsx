import { LanguageSelectorBase } from '@kit/i18n/www/ui/language-selector';
import { Card } from '@kit/ui/card';
import { ThemeToggle } from '@kit/ui/theme-toggle';
import Link from 'next/link';
import { AuthPageProps } from '../with-auth-config';

export const AuthLayout: React.FC<
    React.PropsWithChildren<
        {
            Logo: React.ComponentType;
        } & Pick<AuthPageProps, 'authConfig'>
    >
> = ({ children, Logo, authConfig }) => {
    return (
        <main className="dark:bg-background flex h-screen flex-col items-center justify-center bg-gray-50 px-4">
            <div className="fade-in-30 mx-auto w-full max-w-sm space-y-6 py-12">
                <Link href={authConfig.urls.exit} className="mx-auto block w-fit">
                    <Logo />
                </Link>
                <Card className="relative">{children}</Card>
            </div>
            <LanguageSelectorBase square className="fixed right-4 top-4 rounded-full" />
            <ThemeToggle className="fixed right-4 bottom-4 rounded-full" />
        </main>
    );
};
