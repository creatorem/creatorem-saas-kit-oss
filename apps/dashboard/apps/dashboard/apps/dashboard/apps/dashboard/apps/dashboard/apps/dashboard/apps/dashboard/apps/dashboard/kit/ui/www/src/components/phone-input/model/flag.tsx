import Image from 'next/image';
import React from 'react';
import { MuiTelInputCountry } from './constants/countries';
import { FLAGS_SVG } from './constants/flags';

const getImageSrc = (isoCode: MuiTelInputCountry) => {
    // these 2 flags do not exist on flagpedia CDN
    if (isoCode === 'TA' || isoCode === 'AC') {
        return {
            TA: FLAGS_SVG.TA,
            AC: FLAGS_SVG.AC,
        }[isoCode];
    }

    // http://purecatamphetamine.github.io/country-flag-icons/3x2/
    return `https://purecatamphetamine.github.io/country-flag-icons/3x2/${isoCode.toUpperCase()}.svg`;
};

export const getImgProps = ({ isoCode, countryName }: { isoCode: MuiTelInputCountry; countryName: string }) => {
    return {
        src: getImageSrc(isoCode),
        loading: 'lazy',
        width: 0,
        height: 0,
        className: 'w-4 h-auto rounded-xs',
        alt: countryName,
    } satisfies React.ComponentPropsWithoutRef<'img'>;
};

interface Props {
    isoCode: MuiTelInputCountry;
    countryName: string;
}

export const FlagElement: React.FC<Props> = ({ isoCode, countryName }) => {
    // Alt is provided line 33
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image {...getImgProps({ isoCode, countryName })} />;
};
