'use client';

import { motion } from 'motion/react';

export const LogoLoader2 = () => {
    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: (i: number) => ({
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { duration: 1.5, delay: i * 0.3 },
                opacity: { duration: 0.2, delay: i * 0.3 },
            },
        }),
    };

    const fillVariants = {
        hidden: { opacity: 0 },
        visible: (i: number) => ({
            opacity: 1,
            transition: { duration: 0.5, delay: i * 0.3 + 1.5 },
        }),
    };

    return (
        <motion.svg
            width="96"
            height="96"
            viewBox="0 0 2571 2571"
            fill="none"
            initial="hidden"
            animate="visible"
            className="size-48"
        >
            <defs>
                <filter id="loader-2-lightning" x="-50%" y="-50%" width="200%" height="200%">
                    <feDiffuseLighting
                        in="SourceGraphic"
                        result="lightEffect"
                        lightingColor="rgba(255, 255, 255, 0.1)"
                        surfaceScale="4"
                        diffuseConstant="2"
                    >
                        <fePointLight x="3085.5" y="1285.5" z="300">
                            <animate
                                attributeName="x"
                                values="3085.5;2785.5;1285.5;-214.5;-514.5;-214.5;1285.5;2785.5;3085.5"
                                dur="4s"
                                begin="3.3s"
                                repeatCount="indefinite"
                            />
                            <animate
                                attributeName="y"
                                values="1285.5;-514.5;-514.5;-214.5;1285.5;2785.5;3085.5;2785.5;1285.5"
                                dur="4s"
                                begin="3.3s"
                                repeatCount="indefinite"
                            />
                        </fePointLight>
                    </feDiffuseLighting>

                    <feComposite
                        in="SourceGraphic"
                        in2="lightEffect"
                        operator="arithmetic"
                        result="comp"
                        k1="0"
                        k2="0.5"
                        k3="0.7"
                        k4="0"
                    />

                    <feComposite in="comp" in2="SourceAlpha" operator="in" />
                </filter>
            </defs>

            <g>
                <motion.path
                    d="M1285.5 695.844C1285.5 1021.78 1021.22 1286 695.219 1286H104.938V695.844C104.938 369.909 369.216 105.688 695.219 105.688C1021.22 105.688 1285.5 369.909 1285.5 695.844Z"
                    className="fill-primary/20"
                    variants={fillVariants}
                    custom={0}
                />
                <motion.path
                    d="M2466.06 695.844C2466.06 369.909 2201.78 105.688 1875.78 105.688H1285.5V695.844C1285.5 1021.78 1549.78 1286 1875.78 1286C2201.78 1286 2466.06 1021.78 2466.06 695.844Z"
                    className="fill-primary/20"
                    variants={fillVariants}
                    custom={1}
                />
                <motion.path
                    d="M104.938 1876.16C104.938 2202.09 369.216 2466.31 695.219 2466.31H1285.5V1876.16C1285.5 1550.22 1021.22 1286 695.219 1286C369.216 1286 104.938 1550.22 104.938 1876.16Z"
                    className="fill-primary/20"
                    variants={fillVariants}
                    custom={2}
                />
                <motion.path
                    d="M1285.5 1876.16C1285.5 1550.22 1549.78 1286 1875.78 1286H2466.06V1876.16C2466.06 2202.09 2201.78 2466.31 1875.78 2466.31C1549.78 2466.31 1285.5 2202.09 1285.5 1876.16Z"
                    className="fill-primary/20"
                    variants={fillVariants}
                    custom={3}
                />
                <motion.circle
                    cx="695"
                    cy="696"
                    r="330"
                    className="fill-sidebar"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 2.8 }}
                />
            </g>

            <g filter="url(#loader-2-lightning)">
                <motion.path
                    d="M1285.5 695.844C1285.5 1021.78 1021.22 1286 695.219 1286H104.938V695.844C104.938 369.909 369.216 105.688 695.219 105.688C1021.22 105.688 1285.5 369.909 1285.5 695.844Z"
                    className="stroke-primary"
                    strokeWidth="80"
                    fill="none"
                    variants={pathVariants}
                    custom={0}
                />
                <motion.path
                    d="M2466.06 695.844C2466.06 369.909 2201.78 105.688 1875.78 105.688H1285.5V695.844C1285.5 1021.78 1549.78 1286 1875.78 1286C2201.78 1286 2466.06 1021.78 2466.06 695.844Z"
                    className="stroke-primary"
                    strokeWidth="80"
                    fill="none"
                    variants={pathVariants}
                    custom={1}
                />
                <motion.path
                    d="M104.938 1876.16C104.938 2202.09 369.216 2466.31 695.219 2466.31H1285.5V1876.16C1285.5 1550.22 1021.22 1286 695.219 1286C369.216 1286 104.938 1550.22 104.938 1876.16Z"
                    className="stroke-primary"
                    strokeWidth="80"
                    fill="none"
                    variants={pathVariants}
                    custom={2}
                />
                <motion.path
                    d="M1285.5 1876.16C1285.5 1550.22 1549.78 1286 1875.78 1286H2466.06V1876.16C2466.06 2202.09 2201.78 2466.31 1875.78 2466.31C1549.78 2466.31 1285.5 2202.09 1285.5 1876.16Z"
                    className="stroke-primary"
                    strokeWidth="80"
                    fill="none"
                    variants={pathVariants}
                    custom={3}
                />
                <motion.circle
                    cx="695"
                    cy="696"
                    r="330"
                    className="stroke-primary"
                    strokeWidth="80"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 1.8 }}
                />
            </g>
        </motion.svg>
    );
};
