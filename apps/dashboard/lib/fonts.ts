import { cn } from '@kit/utils';
import { Inter as FontSans } from 'next/font/google';

const fontSans = FontSans({
    subsets: ['latin'],
    variable: '--font-sans',
    weight: ['300', '400', '500', '600', '700'],
});

export const fontVariables = cn(fontSans.variable);
