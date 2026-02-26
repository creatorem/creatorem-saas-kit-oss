import { ImageResponse } from 'next/og';
import React from 'react';
import { appConfig } from '~/config/app.config';

export const runtime = 'edge';

async function loadAssets(): Promise<{ name: string; data: Buffer; weight: 400 | 600; style: 'normal' }[]> {
    const [{ base64Font: normal }, { base64Font: semibold }] = await Promise.all([
        import('./geist-regular-otf.json').then((mod) => mod.default || mod),
        import('./geist-semibold-otf.json').then((mod) => mod.default || mod),
    ]);

    return [
        {
            name: 'Geist',
            data: Buffer.from(normal, 'base64'),
            weight: 400 as const,
            style: 'normal' as const,
        },
        {
            name: 'Geist',
            data: Buffer.from(semibold, 'base64'),
            weight: 600 as const,
            style: 'normal' as const,
        },
    ];
}

interface OpenGraphImageProps {
    title: string;
    description: string;
    primaryColor?: string;
    logo: React.ReactNode;
}

function OpenGraphImage({
    title,
    description,
    primaryColor = '#3b82f6',
    logo,
}: OpenGraphImageProps): React.JSX.Element {
    return (
        <div tw="flex h-full w-full bg-black text-white" style={{ fontFamily: 'Geist Sans' }}>
            <div tw="flex border absolute border-stone-700 border-dashed inset-y-0 left-16 w-[1px]" />
            <div tw="flex border absolute border-stone-700 border-dashed inset-y-0 right-16 w-[1px]" />
            <div tw="flex border absolute border-stone-700 inset-x-0 h-[1px] top-16" />
            <div tw="flex border absolute border-stone-700 inset-x-0 h-[1px] bottom-16" />
            <div tw="flex flex-col absolute items-center justify-center inset-32" style={{ gap: 32 }}>
                <div tw="flex items-center justify-center" style={{ gap: 32 }}>
                    {logo}
                    <div
                        tw="tracking-tight leading-[1.1] w-[380px]"
                        style={{
                            textWrap: 'balance',
                            fontWeight: 600,
                            fontSize: title && title.length > 20 ? 64 : 140,
                            letterSpacing: '-0.04em',
                        }}
                    >
                        {title}
                    </div>
                </div>
                <div
                    tw="text-[40px] leading-[1.5] text-center flex-grow-1 text-stone-400"
                    style={{
                        fontWeight: 400,
                        textWrap: 'balance',
                    }}
                >
                    {description}
                </div>
            </div>
        </div>
    );
}

export async function GET() {
    const [fonts] = await Promise.all([loadAssets()]);

    return new ImageResponse(
        <OpenGraphImage
            primaryColor="#ff8907"
            logo={
                <div
                    style={{
                        display: 'flex',
                        width: 120,
                        height: 120,
                        minWidth: 120,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 30,
                        border: '1px solid #404040',
                        backgroundColor: '#ff8907',
                        color: 'white',
                    }}
                >
                    <svg
                        width="2571"
                        height="2571"
                        viewBox="0 0 2571 2571"
                        fill="none"
                        style={{
                            width: 96,
                            height: 96,
                        }}
                    >
                        <path
                            d="M1285.5 695.844C1285.5 1021.78 1021.22 1286 695.219 1286H104.938V695.844C104.938 369.909 369.216 105.688 695.219 105.688C1021.22 105.688 1285.5 369.909 1285.5 695.844Z"
                            fill="currentColor"
                        />
                        <path
                            d="M1285.5 1876.16C1285.5 1550.22 1549.78 1286 1875.78 1286H2466.06V1876.16C2466.06 2202.09 2201.78 2466.31 1875.78 2466.31C1549.78 2466.31 1285.5 2202.09 1285.5 1876.16Z"
                            fill="currentColor"
                        />
                        <path
                            d="M104.938 1876.16C104.938 2202.09 369.216 2466.31 695.219 2466.31H1285.5V1876.16C1285.5 1550.22 1021.22 1286 695.219 1286C369.216 1286 104.938 1550.22 104.938 1876.16Z"
                            fill="currentColor"
                        />
                        <path
                            d="M2466.06 695.844C2466.06 369.909 2201.78 105.688 1875.78 105.688H1285.5V695.844C1285.5 1021.78 1549.78 1286 1875.78 1286C2201.78 1286 2466.06 1021.78 2466.06 695.844Z"
                            fill="currentColor"
                        />
                        <circle cx="695" cy="696" r="330" fill="#ff8907" />
                    </svg>
                </div>
            }
            title={appConfig.name}
            description={appConfig.description}
        />,
        {
            width: 1200,
            height: 630,
            fonts,
        },
    );
}
