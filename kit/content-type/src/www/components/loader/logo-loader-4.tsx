'use client';

import { motion } from 'motion/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const LogoLoader4 = () => {
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Wait for client-side mount to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Use resolvedTheme (handles 'system') and default to 'light' for SSR
    const currentTheme = mounted ? resolvedTheme || theme : 'light';

    return (
        <motion.svg
            width="96"
            height="96"
            viewBox="0 0 2571 2571"
            fill="none"
            className="size-48"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <defs>
                <filter id="loader-4-lightning" x="-50%" y="-50%" width="200%" height="200%">
                    <feDiffuseLighting
                        in="SourceGraphic"
                        result="diffuseLightEffect"
                        lightingColor="oklch(0.58 0.23 277.07)"
                        surfaceScale="10"
                    >
                        <feSpotLight
                            x="-1000"
                            y="1000"
                            z={currentTheme === 'dark' ? '80' : '20'}
                            limitingConeAngle="25"
                            pointsAtX="-300"
                            pointsAtY="-2000"
                            pointsAtZ="0"
                        >
                            <animate
                                attributeName="y"
                                values="1000;1571;1571"
                                dur="2s"
                                begin="1s"
                                repeatCount="indefinite"
                            />
                            <animate
                                attributeName="pointsAtY"
                                values="-2000;4571"
                                dur="2s"
                                begin="1s"
                                repeatCount="indefinite"
                            />
                            <animate
                                attributeName="pointsAtX"
                                values="-300;2285;-300"
                                dur="2s"
                                begin="1s"
                                repeatCount="indefinite"
                            />
                        </feSpotLight>
                    </feDiffuseLighting>

                    <feComposite
                        in="SourceGraphic"
                        in2="diffuseLightEffect"
                        operator="arithmetic"
                        result="comp"
                        k1="0"
                        k2={currentTheme === 'dark' ? '1' : '0.8'}
                        k3={currentTheme === 'dark' ? '3' : '30'}
                        k4="0"
                    />
                    <feComposite in="comp" in2="SourceAlpha" operator="in" />
                </filter>

                <filter id="loader-4-bg-lightning" x="-50%" y="-50%" width="200%" height="200%">
                    <feDiffuseLighting
                        in="SourceGraphic"
                        result="diffuseLightEffect"
                        lightingColor="oklch(0.58 0.23 277.07)"
                        surfaceScale="10"
                    >
                        <feSpotLight
                            x="-1000"
                            y="1000"
                            z="80"
                            limitingConeAngle="25"
                            pointsAtX="-300"
                            pointsAtY="-2000"
                            pointsAtZ="0"
                        >
                            <animate
                                attributeName="y"
                                values="1000;1571;1571"
                                dur="2s"
                                begin="1s"
                                repeatCount="indefinite"
                            />
                            <animate
                                attributeName="pointsAtY"
                                values="-2000;4571"
                                dur="2s"
                                begin="1s"
                                repeatCount="indefinite"
                            />
                            <animate
                                attributeName="pointsAtX"
                                values="-300;2285;-300"
                                dur="2s"
                                begin="1s"
                                repeatCount="indefinite"
                            />
                        </feSpotLight>
                    </feDiffuseLighting>

                    <feComposite
                        in="SourceGraphic"
                        in2="diffuseLightEffect"
                        operator="arithmetic"
                        result="comp"
                        k1="0"
                        k2="1"
                        k3="3"
                        k4="0"
                    />
                    <feComposite in="comp" in2="SourceAlpha" operator="in" />
                </filter>
            </defs>

            <g filter="url(#loader-4-bg-lightning)">
                <g>
                    <defs>
                        <mask id="myMask">
                            <path
                                d="M1285.5 695.844C1285.5 1021.78 1021.22 1286 695.219 1286H104.938V695.844C104.938 369.909 369.216 105.688 695.219 105.688C1021.22 105.688 1285.5 369.909 1285.5 695.844Z"
                                fill="white"
                            />
                            <circle cx="695" cy="696" r="330" fill="black" />
                        </mask>
                    </defs>
                    <path
                        d="M1285.5 695.844C1285.5 1021.78 1021.22 1286 695.219 1286H104.938V695.844C104.938 369.909 369.216 105.688 695.219 105.688C1021.22 105.688 1285.5 369.909 1285.5 695.844Z"
                        className="fill-primary/40 dark:fill-sidebar"
                        mask="url(#myMask)"
                    />
                </g>
                <path
                    d="M2466.06 695.844C2466.06 369.909 2201.78 105.688 1875.78 105.688H1285.5V695.844C1285.5 1021.78 1549.78 1286 1875.78 1286C2201.78 1286 2466.06 1021.78 2466.06 695.844Z"
                    className="fill-primary/40 dark:fill-sidebar"
                />
                <path
                    d="M104.938 1876.16C104.938 2202.09 369.216 2466.31 695.219 2466.31H1285.5V1876.16C1285.5 1550.22 1021.22 1286 695.219 1286C369.216 1286 104.938 1550.22 104.938 1876.16Z"
                    className="fill-primary/40 dark:fill-sidebar"
                />
                <path
                    d="M1285.5 1876.16C1285.5 1550.22 1549.78 1286 1875.78 1286H2466.06V1876.16C2466.06 2202.09 2201.78 2466.31 1875.78 2466.31C1549.78 2466.31 1285.5 2202.09 1285.5 1876.16Z"
                    className="fill-primary/40 dark:fill-sidebar"
                />
            </g>

            <g filter="url(#loader-4-lightning)">
                <path
                    d="M1285.5 695.844C1285.5 1021.78 1021.22 1286 695.219 1286H104.938V695.844C104.938 369.909 369.216 105.688 695.219 105.688C1021.22 105.688 1285.5 369.909 1285.5 695.844Z"
                    className="stroke-primary dark:stroke-sidebar"
                    strokeWidth="80"
                    fill="none"
                />
                <path
                    d="M2466.06 695.844C2466.06 369.909 2201.78 105.688 1875.78 105.688H1285.5V695.844C1285.5 1021.78 1549.78 1286 1875.78 1286C2201.78 1286 2466.06 1021.78 2466.06 695.844Z"
                    className="stroke-primary dark:stroke-sidebar"
                    strokeWidth="80"
                    fill="none"
                />
                <path
                    d="M104.938 1876.16C104.938 2202.09 369.216 2466.31 695.219 2466.31H1285.5V1876.16C1285.5 1550.22 1021.22 1286 695.219 1286C369.216 1286 104.938 1550.22 104.938 1876.16Z"
                    className="stroke-primary dark:stroke-sidebar"
                    strokeWidth="80"
                    fill="none"
                />
                <path
                    d="M1285.5 1876.16C1285.5 1550.22 1549.78 1286 1875.78 1286H2466.06V1876.16C2466.06 2202.09 2201.78 2466.31 1875.78 2466.31C1549.78 2466.31 1285.5 2202.09 1285.5 1876.16Z"
                    className="stroke-primary dark:stroke-sidebar"
                    strokeWidth="80"
                    fill="none"
                />
                <circle
                    cx="695"
                    cy="696"
                    r="330"
                    className="stroke-primary dark:stroke-sidebar"
                    strokeWidth="80"
                    fill="none"
                />
            </g>
        </motion.svg>
    );
};
