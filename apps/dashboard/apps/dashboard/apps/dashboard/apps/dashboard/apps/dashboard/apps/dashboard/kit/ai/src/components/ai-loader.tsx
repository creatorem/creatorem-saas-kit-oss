'use client';

import { motion, type Transition } from 'motion/react';

interface AiLoaderProps {
    className?: string;
}

const loaderTransition: Transition = {
    repeat: Infinity,
    duration: 2,
    times: [0, 0.25, 0.75, 1],
};

export const AiLoader = ({ className }: AiLoaderProps) => {
    return (
        <motion.div
            animate={{ rotateZ: [0, 720] }}
            transition={{
                delay: 0.5,
                repeatDelay: 1,
                repeat: Infinity,
                duration: 1,
            }}
        >
            <motion.svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className={className}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ rotateZ: [0, -720, -720, 0] }}
                transition={loaderTransition}
            >
                <motion.path
                    initial={{ pathLength: -10 }}
                    animate={{ pathLength: [0, 1, 1, 0] }}
                    transition={loaderTransition}
                    d="M22 12a1 1 0 0 1-10 0 1 1 0 0 0-10 0"
                ></motion.path>
                <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: [0, 1, 1, 0] }}
                    transition={loaderTransition}
                    d="M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6"
                ></motion.path>
                <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: [0, 1, 1, 0] }}
                    transition={loaderTransition}
                    d="M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6"
                ></motion.path>
                <motion.circle
                    cx="12"
                    cy="12"
                    r="10"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: [0, 1, 1, 0] }}
                    transition={loaderTransition}
                ></motion.circle>
            </motion.svg>
        </motion.div>
    );
};
