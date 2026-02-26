import type { CountryCallingCode, CountryCode, MetadataJson } from 'libphonenumber-js';
import metadatas from 'libphonenumber-js/metadata.min.json';
import { getKeys } from './object';

export const COUNTRIES: MetadataJson['countries'] = metadatas.countries;

export const ISO_CODES = getKeys(COUNTRIES);

export type MuiTelInputCountry = (typeof ISO_CODES)[number];

export const DEFAULT_ISO_CODE: MuiTelInputCountry = 'US';

export const NUMBER_TO_ISO_CODE: Record<CountryCallingCode, CountryCode> = (() => {
    const l: Record<CountryCallingCode, CountryCode> = {};

    for (const k in COUNTRIES) {
        // @ts-expect-error
        l[COUNTRIES[k][0] as CountryCallingCode] = k as CountryCode;
    }

    return l;
})();
