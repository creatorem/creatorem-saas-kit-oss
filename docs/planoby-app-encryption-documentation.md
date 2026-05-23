# Planoby App Encryption Documentation

This file captures the App Store Connect and ANSSI encryption declaration data for Planoby iOS releases.

## Current Documentation Status

- Technical annex: complete at `output/pdf/planoby-app-encryption-technical-annex.pdf`.
- Official ANSSI blank form: downloaded at `output/pdf/anssi-crypto-declaration-form-blank.pdf`.
- Final Apple upload file: not complete until the ANSSI form is filled with applicant identity details, dated, signed, and exported/scanned as a PDF.

Do not upload this markdown file to App Store Connect. Upload the completed and signed French encryption declaration PDF. If App Store Connect allows only one file, merge the signed ANSSI declaration and the technical annex into one PDF before upload.

## App Store Connect Answers

- App: Planoby
- Bundle ID: `com.planoby.app`
- Current submitted version: `1.0.0`
- Current submitted iOS build: `7`
- App Store Connect App ID: `6772179219`
- Encryption category to select: `Standard encryption algorithms instead of, or in addition to, using or accessing the encryption within Apple's operating system`
- Proprietary or non-standard encryption: `No`
- Standard encryption outside Apple OS encryption: `Yes`

## Technical Encryption Summary

Planoby uses standard cryptography only. It does not implement proprietary, unpublished, or non-standard cryptographic algorithms.

The iOS app uses:

- `aes-js` `3.1.2` for local AES encryption in `@kit/supabase-client/native/large-secure-store`.
- AES in CTR mode with a 256-bit random key generated on device.
- `expo-secure-store` for storing key material through the iOS Keychain.
- HTTPS/TLS for network communication with Planoby, Supabase, Google, Expo, and Apple services.

The app-level AES layer is used to protect locally persisted authentication/session/cache data before values are stored in local app storage. The encryption is not used to provide a standalone cryptographic product, cryptanalysis capability, VPN, secure messaging system, or custom security protocol.

## ANSSI Submission Notes

Use the ANSSI form named:

`Declaration et demande d'autorisation d'operations relatives a un moyen de cryptologie`

ANSSI instructions page:

https://cyber.gouv.fr/controle-reglementaire-sur-la-cryptographie-les-formulaires

Email destination from ANSSI page:

`controle@ssi.gouv.fr`

Recommended email subject:

`[formalites] Planoby - Planoby iOS app`

Attachments expected by ANSSI:

- Completed and signed scanned form.
- Completed saved electronic form.
- Required documentation in `.pdf`, `.xls`, or `.doc` format.

Suggested technical text for the ANSSI form:

```text
Planoby is a mobile business management application for bookings, schedules, clients, services, invoices, and team operations.

The iOS application uses standard cryptographic mechanisms only. It uses AES-CTR through the open-source aes-js library version 3.1.2 to encrypt local persisted authentication/session/cache values before storage. A random 256-bit encryption key is generated on device, and key material is stored using expo-secure-store, which relies on the iOS Keychain. The application also uses HTTPS/TLS for communications with Planoby backend services, Supabase authentication/database services, Google sign-in services, Expo services, and Apple platform services.

The application does not implement proprietary or unpublished cryptographic algorithms, does not provide cryptanalysis features, does not provide VPN or secure messaging functionality, and does not expose cryptographic services as a product feature.
```

## Future Build Configuration

The Expo config already sets:

```ts
ios: {
    config: {
        usesNonExemptEncryption: true,
    },
}
```

After Apple approves the encryption documentation, App Store Connect should provide an export compliance code. Add it to `apps/planoby-mobile/app.config.ts` before the next production build:

```ts
ios: {
    config: {
        usesNonExemptEncryption: true,
    },
    infoPlist: {
        ITSEncryptionExportComplianceCode: '<APPLE_PROVIDED_CODE>',
    },
}
```

Then build and submit a new iOS production binary:

```bash
cd apps/planoby-mobile
pnpm exec eas build -p ios --profile production
pnpm exec eas submit -p ios --latest
```
