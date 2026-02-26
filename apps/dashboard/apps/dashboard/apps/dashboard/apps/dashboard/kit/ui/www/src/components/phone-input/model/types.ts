import { MuiTelInputCountry } from './constants/countries';

export type MuiTelInputReason = 'country' | 'input';

export type MuiTelInputFlagElement = React.ReactNode;

export type GetFlagElement = (
    isoCode: MuiTelInputCountry,
    {
        countryName,
        isSelected,
        imgProps,
    }: {
        countryName: string;
        isSelected: boolean;
        imgProps: React.ComponentPropsWithRef<'img'>;
    },
) => MuiTelInputFlagElement;
