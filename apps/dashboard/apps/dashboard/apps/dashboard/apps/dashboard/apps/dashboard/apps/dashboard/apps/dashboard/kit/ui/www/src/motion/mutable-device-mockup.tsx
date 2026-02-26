'use client';

import { cn } from '@kit/utils';
import { AnimatePresence, HTMLMotionProps, motion, type TargetAndTransition } from 'framer-motion';
import { BluetoothConnected, LucideSignal, LucideSignalLow, LucideWifi, LucideWifiHigh } from 'lucide-react';
import React, { createContext, JSX, useCallback, useContext, useState } from 'react';
import { Icon } from '../icon';

const DEVICES = ['desktop', 'ios', 'android'] as const;
export type Device = (typeof DEVICES)[number];

interface MobileButtonProps {
    position: 'left' | 'right';
    top: number;
    height: number;
    width: number;
    borderRadius: number;
    className?: string;
    whileHover?: TargetAndTransition;
}

function MobileButton({
    position,
    top,
    height,
    width,
    borderRadius,
    className,
    whileHover,
}: MobileButtonProps): React.JSX.Element {
    const { noResponsive } = useMutableDeviceMockup();
    const isLeft = position === 'left';
    const translateXInitial = isLeft ? '100%' : '-100%';
    const translateXExit = isLeft ? '100%' : '-100%';
    const translateXHover = isLeft ? -4 : 4;
    const translateXTap = isLeft ? width - 2 : -width + 2;
    const translateXOffset = isLeft ? 5 : -5;
    const borderRadiusStyle = isLeft
        ? { borderTopLeftRadius: borderRadius, borderBottomLeftRadius: borderRadius }
        : { borderTopRightRadius: borderRadius, borderBottomRightRadius: borderRadius };

    return (
        <motion.div
            initial={{ top }}
            animate={{ top }}
            className={cn(
                'absolute overflow-hidden',
                isLeft
                    ? cn('right-[calc(100%+10px)]', !noResponsive && 'max-lg:right-[calc(100%+8px)]')
                    : cn('left-[calc(100%+10px)]', !noResponsive && 'max-lg:left-[calc(100%+8px)]'),
            )}
        >
            <motion.div
                initial={{ translateX: translateXInitial }}
                animate={{ translateX: 0 }}
                exit={{ translateX: translateXExit }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={cn('cursor-pointer', isLeft ? 'pl-4' : 'pr-4')}
                whileTap={{ translateX: translateXTap }}
                whileHover={{ translateX: translateXHover }}
            >
                <motion.div
                    initial={{
                        ...borderRadiusStyle,
                        width: width + 5,
                        height,
                        translateX: translateXOffset,
                    }}
                    animate={{
                        ...borderRadiusStyle,
                        width: width + 5,
                        height,
                        translateX: translateXOffset,
                    }}
                    className={cn('bg-neutral-400/50 dark:bg-white/40', className)}
                    whileHover={whileHover}
                />
            </motion.div>
        </motion.div>
    );
}

export type DeviceConfig = {
    desktop: {
        // screen: {
        //     width: number | string;
        //     height: number | string;
        //     borderRadius?: number | string;
        // };
        screen: TargetAndTransition;
        camera: {
            width: number | string;
            height: number | string;
            borderRadius?: number | string;
        };
        concaveRadius: number;
        lentil: {
            size: number;
        };
    };
    ios: {
        screen: TargetAndTransition;
        // screen: {
        //     width: number | string;
        //     height: number | string;
        //     borderRadius?: number | string;
        // };
        camera: {
            width: number | string;
            height: number | string;
            borderRadius?: number | string;
        };
        lentil: {
            size: number;
        };
        concaveRadius: number;
        powerButton: {
            top: number;
            width: number;
            height: number;
            borderRadius: number;
        };
    };
    android: {
        screen: TargetAndTransition;
        // screen: {
        //     width: number | string;
        //     height: number | string;
        //     borderRadius?: number | string;
        // };
        camera: {
            width: number | string;
            height: number | string;
            borderRadius?: number | string;
        };
        powerButton: {
            top: number;
            width: number;
            height: number;
            borderRadius: number;
        };
    };
};

const DEFAULT_CONFIG: DeviceConfig = {
    desktop: {
        screen: {
            width: '100%',
            // height: 220,
            aspectRatio: 16 / 9,
            borderRadius: 20,
        },
        camera: {
            width: 150,
            height: 28,
            borderRadius: 8,
        },
        concaveRadius: 8,
        lentil: {
            size: 24,
        },
    },
    ios: {
        screen: {
            width: 384,
            // height: 200,
            aspectRatio: 9 / 18,
            borderRadius: 55,
        },
        camera: {
            width: 160,
            height: 30,
            borderRadius: 18,
        },
        concaveRadius: 8,
        lentil: {
            size: 16,
        },
        powerButton: {
            top: 116,
            width: 4,
            height: 64,
            borderRadius: 4,
        },
    },
    android: {
        screen: {
            width: 384,
            // height: 200,
            aspectRatio: 9 / 18,
            borderRadius: 24,
        },
        camera: {
            width: 24,
            height: 24,
            borderRadius: 12,
        },
        powerButton: {
            top: 100,
            width: 5,
            height: 54,
            borderRadius: 2,
        },
    },
};

interface MutableDeviceMockupContext {
    config: DeviceConfig;
    toggleDeviceOnClick?: boolean;
    device: Device;
    // cropTop?: boolean;
    noResponsive?: boolean;
    setDevice: React.Dispatch<React.SetStateAction<Device>>;
}

const MutableDeviceMockupContext = createContext<MutableDeviceMockupContext>({
    device: 'desktop',
    config: {} as DeviceConfig,
    toggleDeviceOnClick: false,
    // cropTop: false,
    noResponsive: false,
    setDevice: () => {},
});

const useMutableDeviceMockup = () => {
    const ctx = useContext(MutableDeviceMockupContext);
    if (!ctx) {
        throw new Error('useMutableDeviceMockup must be used within a MutableDeviceMockup');
    }
    return ctx;
};

export interface MutableDeviceMockupRootProps {
    config?: DeviceConfig;
    device?: Device;
    defaultDevice?: Device;
    toggleDeviceOnClick?: boolean;
    // cropTop?: boolean;
    noResponsive?: boolean;
    onDeviceChange?: (device: Device) => void;
    children: React.ReactNode;
}

function MutableDeviceMockupRoot({
    children,
    config = DEFAULT_CONFIG,
    device: deviceProp,
    defaultDevice = 'desktop',
    // cropTop = false,
    noResponsive = false,
    onDeviceChange,
    toggleDeviceOnClick = false,
}: MutableDeviceMockupRootProps): React.JSX.Element {
    const [internalDevice, setInternalDevice] = useState<Device>(defaultDevice);

    const deviceValue = deviceProp !== undefined ? deviceProp : internalDevice;

    const setDevice = useCallback(
        (value: Device | ((prev: Device) => Device)) => {
            const newDevice = typeof value === 'function' ? value(deviceValue) : value;

            if (deviceProp === undefined) {
                // Only update internal state if not controlled
                setInternalDevice(newDevice);
            }

            // Always call onOpenChange if provided
            onDeviceChange?.(newDevice);
        },
        [deviceValue, deviceProp, onDeviceChange],
    );

    return (
        <MutableDeviceMockupContext.Provider
            value={{ config, device: deviceValue, noResponsive, setDevice, toggleDeviceOnClick }}
        >
            {children}
        </MutableDeviceMockupContext.Provider>
    );
}

export interface DeviceSelectorProps {
    itemClassName?: string;
    activeItemClassName?: string;
    items?: Record<
        Device,
        {
            className?: string;
            content?: React.ReactNode;
        }
    >;
}

const DEFAULT_ITEMS: Record<
    Device,
    {
        className?: string;
        content?: React.ReactNode;
    }
> = {
    desktop: {
        content: <Icon name="Laptop" className="size-4" />,
    },
    ios: {
        content: <Icon name="appleCompany" className="size-4" />,
    },
    android: {
        content: <Icon name="android" className="size-4" />,
    },
};

function DeviceSelector({
    items = DEFAULT_ITEMS,
    itemClassName,
    activeItemClassName,
    className,
    ...props
}: DeviceSelectorProps &
    Omit<HTMLMotionProps<'div'>, 'animate' | 'exit' | 'initial' | 'ref' | 'transition'>): React.JSX.Element {
    const { setDevice, device } = useMutableDeviceMockup();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className={cn('flex bg-white/10', className)}
            {...props}
        >
            {DEVICES.map((deviceName) => (
                <button
                    key={deviceName}
                    role="button"
                    aria-label={deviceName}
                    data-active={device === deviceName}
                    onClick={() => setDevice(deviceName)}
                    className={cn(
                        itemClassName,
                        items?.[deviceName]?.className,
                        device === deviceName && activeItemClassName,
                    )}
                >
                    {items?.[deviceName]?.content ?? deviceName}
                </button>
            ))}
        </motion.div>
    );
}

export interface ViewportProps extends React.PropsWithChildren {
    width?: string | number;
    height?: string | number;
    className?: string;
    origin?: 'top' | 'bottom' | 'center' | 'left' | 'right';
    contentClassName?: string;
}

const Viewport: React.FC<ViewportProps> = ({
    children,
    width,
    height,
    className,
    origin = 'center',
    contentClassName,
}) => {
    const { toggleDeviceOnClick, setDevice, device } = useMutableDeviceMockup();

    const handleClick = useCallback(() => {
        if (toggleDeviceOnClick) {
            setDevice((prev) => DEVICES[(DEVICES.indexOf(prev) + 1) % DEVICES.length] as Device);
        }
    }, [toggleDeviceOnClick, setDevice]);

    return (
        <div
            className={cn(
                'group/device-mockup relative w-full overflow-hidden',
                {
                    'cursor-pointer': toggleDeviceOnClick,
                    'min-w-[400px]': device === 'desktop',
                    'min-w-[340px]': device === 'ios' || device === 'android',
                },
                className,
            )}
            data-device={device}
            data-slot="viewport-wrapper"
            style={{
                width,
                height,
            }}
            onClick={toggleDeviceOnClick ? handleClick : undefined}
        >
            <div
                className={cn(
                    'absolute flex w-full flex-col',
                    {
                        'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2': origin === 'center',
                        'top-1/2 left-0.5 -translate-y-1/2': origin === 'left',
                        'top-1/2 right-0.5 -translate-y-1/2': origin === 'right',
                        'top-0.5 left-1/2 -translate-x-1/2': origin === 'top',
                        'bottom-0.5 left-1/2 -translate-x-1/2': origin === 'bottom',
                    },
                    contentClassName,
                )}
                data-slot="viewport-content"
            >
                {children}
            </div>
        </div>
    );
};

const getOverflowClassName = (noResponsive: boolean = false) =>
    cn(
        'absolute overflow-hidden border-transparent',
        'inset-[-8px] border-8',
        !noResponsive && [
            'max-lg:inset-[-6px] max-lg:border-[6px]',
            'group-data-[device=desktop]/device-mockup:max-sm:inset-[-4px]',
            'group-data-[device=desktop]/device-mockup:max-sm:border-[4px]',
        ],
    );

const Screen: React.FC<React.PropsWithChildren & HTMLMotionProps<'div'> & { noAnimation?: boolean }> = ({
    children,
    className,
    noAnimation = false,
    ...props
}) => {
    const { device, config, noResponsive } = useMutableDeviceMockup();
    const c = config[device];

    return (
        <motion.div
            initial={{
                translateY: noAnimation ? 0 : 30,
                opacity: noAnimation ? 1 : 0,
                width: c.screen.width,
                height: c.screen.height,
                borderRadius: c.screen.borderRadius,
            }}
            animate={{
                translateY: 0,
                opacity: 1,
                ...c.screen,
                // borderBottomLeftRadius: cropTop ? 0 : c.screen.borderRadius,
                // borderBottomRightRadius: cropTop ? 0 : c.screen.borderRadius,
            }}
            exit={{ translateY: noAnimation ? 0 : 30, opacity: noAnimation ? 1 : 0 }}
            transition={{ duration: 0.5, type: 'tween', damping: 20, stiffness: 300, mass: 1 }}
            // no overflow-hidden to avoid Lentil cropping
            className={cn(
                'relative mx-auto flex max-w-[92%] flex-col border-8 border-black bg-white/10 shadow-2xl ring-2 shadow-white/10 ring-neutral-400/50 backdrop-blur-3xl dark:ring-white/40',
                !noResponsive && ['max-lg:border-[6px]', device === 'desktop' ? 'max-sm:border-[4px]' : ''],
                // cropTop && 'border-b-0',
                className,
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

const Keyboard: React.FC = () => {
    const { device, noResponsive } = useMutableDeviceMockup();

    return (
        <AnimatePresence>
            {device === 'desktop' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15, delay: 0 } }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className={cn(
                        'relative z-10 -mt-[3%] flex w-full flex-col items-center',
                        !noResponsive ? 'max-sm:-mt-[4%]' : '',
                    )}
                >
                    <div className="w-full max-w-[92%] flex-col">
                        <div className="h-2 w-full border-t-8 border-black"></div>
                        <div className="h-[1.0835vw] w-full bg-gradient-to-b from-[#222] to-[#201F24]"></div>
                    </div>
                    <div className="relative flex w-full flex-col overflow-hidden">
                        <div
                            // className="aspect-[1184/36] w-full overflow-hidden rounded-b-[24px]"
                            className="relative aspect-[1184/36] w-full overflow-hidden rounded-b-[1.5vw]"
                            style={{
                                background:
                                    'linear-gradient(to bottom, #AEAFB4, #AFB0B5 19%,#AFB0B5 38%,#7D7E82 60%, #696A6F 71%, #838489 85%, #ABACB0 93%)',
                            }}
                        >
                            <div className="absolute top-0 left-[0.845%] z-[15] h-[55.555%] w-[1.013%] rounded-br-sm rounded-bl-lg bg-[#D2D2DA] blur-[4px]"></div>
                            <div className="absolute top-0 right-[0.845%] z-[15] h-[55.55%] w-[1.013%] rounded-br-lg rounded-bl-sm bg-[#D2D2DA] blur-[4px]"></div>

                            <div
                                className="absolute top-0 left-[5px] z-[14] h-[70.833%] w-[6.757%]"
                                style={{
                                    background: 'linear-gradient(to right, #65666B00, #65666B 26%, #65666B00)',
                                }}
                            />
                            <div
                                className="absolute top-0 right-[5px] z-[14] h-[70.833%] w-[6.757%]"
                                style={{
                                    background: 'linear-gradient(to left, #65666B00, #65666B 26%, #65666B00)',
                                }}
                            />

                            <div
                                className="absolute top-0 left-1/2 h-[38.889%] w-[17.568%] -translate-x-1/2 rounded-b-[30px] border border-white/10"
                                style={{
                                    background:
                                        'linear-gradient(to left, #25262B 0%, #606166 2%, #9FA0A4 4%, #C8C8CE 5%, #D7D8DD 48%, #CBCBD3 94%, #A7A8AC 97%, #595A5E 98%, #27282C)',
                                }}
                            ></div>
                        </div>
                        <div className="flex w-full justify-between px-[5%]">
                            {Array.from({ length: 2 }).map((_, index) => (
                                <div key={index} className="flex w-[6.757%] flex-col items-center">
                                    <div
                                        className="h-[0.2035vw] w-full rounded-b-lg"
                                        style={{
                                            background:
                                                'linear-gradient(to left, #8C8D91 0%, #525358 17%, #78797D 32%, #A0A0A2 47%, #9A9A9C 69%, #4F5055 83%, #9E9EA0 94%, #848589)',
                                        }}
                                    ></div>
                                    <div
                                        className="h-[0.2035vw] w-[91.25%] rounded-b-lg"
                                        style={{
                                            background:
                                                'linear-gradient(to left, #575757 0%, #2D2D2D 8%, #4E4E4E 49%, #2A2A2A 82%, #5C5C5C)',
                                        }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const Lentil: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
    return (
        <div
            className={cn(
                'relative flex size-full items-center justify-center overflow-hidden rounded-full bg-blue-400/10',
                className,
            )}
            {...props}
        >
            <div className="relative size-1/2 overflow-hidden rounded-full bg-black/50 ring-2 ring-white/5 backdrop-blur-md">
                {/* color diffraction */}
                <div
                    className="absolute inset-0 z-10 opacity-40"
                    style={{
                        background: `linear-gradient(225deg, rgb(225, 92, 233) 10%, transparent 60%),
                    linear-gradient(335deg, rgb(51, 79, 215) 10%, transparent 60%),
                    linear-gradient(115deg, rgb(49, 143, 86) 10%, transparent 60%)`,
                    }}
                ></div>
                {/* inside reflexion */}
                <div
                    className="absolute inset-0 z-20 opacity-60"
                    style={{
                        background: `radial-gradient(circle at 50% 50%, transparent, transparent 48%, white)`,
                        maskImage: `linear-gradient(red 10%, transparent 43%, transparent 75%, red 105%)`,
                    }}
                ></div>
            </div>
            {/* solar reflexion */}
            <div
                className="absolute inset-0 bg-gradient-to-tr from-transparent from-10% to-white opacity-[8%]"
                style={{
                    maskImage: 'linear-gradient(-45deg, transparent 50%, red 50%)',
                }}
            ></div>
        </div>
    );
};

interface MacOSButtonsProps extends HTMLMotionProps<'div'> {}

function MacOSButtons({ className, ...props }: MacOSButtonsProps): React.JSX.Element {
    const { device } = useMutableDeviceMockup();
    return (
        <AnimatePresence>
            {device === 'desktop' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn('absolute top-2 left-2 z-30 flex gap-2', className)}
                    {...props}
                >
                    <div className="h-3 w-3 cursor-pointer rounded-full bg-red-500/80 transition-colors hover:bg-red-400"></div>
                    <div className="h-3 w-3 cursor-pointer rounded-full bg-yellow-500/80 transition-colors hover:bg-yellow-400"></div>
                    <div className="h-3 w-3 cursor-pointer rounded-full bg-green-500/80 transition-colors hover:bg-green-400"></div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

const AppleIcon = {
    notification: (props: React.SVGAttributes<SVGSVGElement>): JSX.Element => (
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" {...props}>
            <g style={{ mixBlendMode: 'hard-light', opacity: 0.76, filter: 'url(#filter0_d_0_92)' }}>
                <path
                    d="M6.32812 8.625H10.6719C11.7266 8.625 12.5586 7.88672 12.5586 6.78906C12.5586 5.69141 11.7266 4.95312 10.6719 4.95312H6.32812C5.27344 4.95312 4.44141 5.69141 4.44141 6.78906C4.44141 7.88672 5.27344 8.625 6.32812 8.625ZM6.32812 7.92187C5.69141 7.92187 5.14453 7.46094 5.14453 6.78906C5.14453 6.11719 5.69141 5.65625 6.32812 5.65625H10.6719C11.3086 5.65625 11.8594 6.11719 11.8594 6.78906C11.8594 7.46094 11.3086 7.92187 10.6719 7.92187H6.32812ZM6.32812 7.66406C6.81641 7.66797 7.20703 7.26953 7.20703 6.78125C7.21094 6.29687 6.81641 5.91016 6.32812 5.91016C5.83984 5.91016 5.45312 6.30078 5.45312 6.78516C5.45312 7.27344 5.83984 7.66016 6.32812 7.66406ZM6.16797 12.5469H10.832C11.793 12.5469 12.5586 11.8711 12.5586 10.8867C12.5586 9.90234 11.793 9.22266 10.832 9.22266H6.16797C5.20703 9.22266 4.44141 9.90234 4.44141 10.8867C4.44141 11.8711 5.20703 12.5469 6.16797 12.5469ZM10.9336 11.8516C10.3945 11.8477 9.96875 11.418 9.96875 10.8828C9.96875 10.3477 10.3945 9.91797 10.9336 9.91797C11.4687 9.91797 11.9062 10.3477 11.9023 10.875C11.8984 11.418 11.4648 11.8555 10.9336 11.8516Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <filter
                    id="filter0_d_0_92"
                    x="1.67855"
                    y="3.5717"
                    width="13.6429"
                    height="13.1195"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="1.38143" />
                    <feGaussianBlur stdDeviation="1.38143" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_0_92" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_0_92" result="shape" />
                </filter>
            </defs>
        </svg>
    ),
    loop: (props: React.SVGAttributes<SVGSVGElement>): JSX.Element => (
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" {...props}>
            <g style={{ mixBlendMode: 'hard-light', opacity: 0.76, filter: 'url(#filter0_d_0_90)' }}>
                <path
                    d="M4.64453 8.03906C4.64453 9.79297 6.07031 11.2187 7.82422 11.2187C8.47656 11.2187 9.07422 11.0195 9.57422 10.6797L11.3711 12.4766C11.4805 12.5898 11.6328 12.6406 11.7852 12.6406C12.1172 12.6406 12.3555 12.3906 12.3555 12.0664C12.3555 11.9102 12.3008 11.7656 12.1953 11.6562L10.4102 9.86719C10.7812 9.35547 11.0039 8.72266 11.0039 8.03906C11.0039 6.28516 9.57812 4.85938 7.82422 4.85938C6.07031 4.85938 4.64453 6.28516 4.64453 8.03906ZM5.47266 8.03906C5.47266 6.74219 6.52344 5.6875 7.82422 5.6875C9.12109 5.6875 10.1758 6.74219 10.1758 8.03906C10.1758 9.33594 9.12109 10.3906 7.82422 10.3906C6.52344 10.3906 5.47266 9.33594 5.47266 8.03906Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <filter
                    id="filter0_d_0_90"
                    x="1.88167"
                    y="3.47795"
                    width="13.2367"
                    height="13.307"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="1.38143" />
                    <feGaussianBlur stdDeviation="1.38143" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_0_90" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_0_90" result="shape" />
                </filter>
            </defs>
        </svg>
    ),
    wifi: (props: React.SVGAttributes<SVGSVGElement>): JSX.Element => (
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" {...props}>
            <g style={{ mixBlendMode: 'hard-light', opacity: 0.76, filter: 'url(#filter0_d_0_88)' }}>
                <path
                    d="M4.55309 8.25781C4.63512 8.33984 4.76403 8.33984 4.84606 8.25C5.8109 7.22656 7.08043 6.6875 8.4984 6.6875C9.92809 6.6875 11.2015 7.23047 12.1586 8.25391C12.2406 8.33594 12.3617 8.33203 12.4476 8.24609L12.9945 7.69922C13.0726 7.62109 13.0687 7.52344 13.0062 7.44531C12.0687 6.28906 10.3187 5.45703 8.4984 5.45703C6.68199 5.45703 4.92809 6.28906 3.99059 7.44531C3.92809 7.52344 3.93199 7.62109 4.00621 7.69922L4.55309 8.25781ZM6.1859 9.88281C6.27965 9.97266 6.39684 9.96094 6.48668 9.86719C6.96324 9.34375 7.72496 8.97656 8.4984 8.98047C9.27965 8.97656 10.0414 9.35547 10.5296 9.87891C10.6078 9.96875 10.7211 9.96484 10.8148 9.87891L11.4281 9.27734C11.5023 9.20703 11.5062 9.10937 11.4437 9.03125C10.8343 8.29687 9.72106 7.76172 8.4984 7.76172C7.27574 7.76172 6.16246 8.29687 5.55699 9.03125C5.49059 9.10937 5.49449 9.20312 5.57262 9.27734L6.1859 9.88281ZM8.4984 12.043C8.59606 12.043 8.67809 12 8.83434 11.8477L9.79137 10.9258C9.86168 10.8594 9.87731 10.7539 9.81481 10.6758C9.54137 10.3281 9.04918 10.0508 8.4984 10.0508C7.9359 10.0508 7.4359 10.3437 7.16637 10.707C7.11949 10.7773 7.14293 10.8594 7.20934 10.9258L8.16637 11.8477C8.32262 11.9961 8.40465 12.043 8.4984 12.043Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <filter
                    id="filter0_d_0_88"
                    x="1.18401"
                    y="4.0756"
                    width="14.632"
                    height="12.1117"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="1.38143" />
                    <feGaussianBlur stdDeviation="1.38143" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_0_88" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_0_88" result="shape" />
                </filter>
            </defs>
        </svg>
    ),
    battery: (props: React.SVGAttributes<SVGSVGElement>): JSX.Element => (
        <svg width="19" height="17" viewBox="0 0 19 17" fill="none" {...props}>
            <g style={{ mixBlendMode: 'hard-light', opacity: 0.76, filter: 'url(#filter0_d_0_86)' }}>
                <path
                    d="M3.54785 12.2358H11.8892C12.8613 12.2358 13.5542 12.1284 14.0537 11.6289C14.5479 11.1348 14.6499 10.4526 14.6499 9.4751V8.03027C14.6499 7.05273 14.5479 6.36523 14.0537 5.87109C13.5542 5.37158 12.8613 5.26416 11.8892 5.26416H3.51562C2.58105 5.26416 1.88818 5.37695 1.38867 5.87109C0.894531 6.37061 0.787109 7.05811 0.787109 7.99268V9.4751C0.787109 10.4526 0.88916 11.1348 1.3833 11.6289C1.88818 12.1284 2.57568 12.2358 3.54785 12.2358ZM3.40283 11.5698C2.77441 11.5698 2.20508 11.4731 1.87207 11.1401C1.54443 10.8125 1.45312 10.2539 1.45312 9.62012V7.91748C1.45312 7.25684 1.54443 6.6875 1.87207 6.35449C2.19971 6.02148 2.77979 5.93018 3.44043 5.93018H12.0342C12.668 5.93018 13.2373 6.03223 13.5649 6.35986C13.8926 6.6875 13.9893 7.24609 13.9893 7.88525V9.62012C13.9893 10.2539 13.8926 10.8125 13.5649 11.1401C13.2373 11.4731 12.668 11.5698 12.0342 11.5698H3.40283ZM3.22021 11.0166H12.2275C12.7109 11.0166 12.9956 10.9468 13.1782 10.7642C13.3608 10.5762 13.436 10.2861 13.436 9.80811V7.69189C13.436 7.2085 13.3608 6.92383 13.1782 6.74121C12.9956 6.55859 12.7056 6.4834 12.2275 6.4834H3.25244C2.73682 6.4834 2.44141 6.55859 2.26416 6.73584C2.08691 6.91846 2.00635 7.21387 2.00635 7.72412V9.80811C2.00635 10.2969 2.08691 10.5762 2.26416 10.7642C2.44678 10.9414 2.74219 11.0166 3.22021 11.0166ZM15.2783 10.0605C15.6758 10.0337 16.2129 9.52344 16.2129 8.75C16.2129 7.98193 15.6758 7.46631 15.2783 7.44482V10.0605Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <filter
                    id="filter0_d_0_86"
                    x="-1.97575"
                    y="3.88273"
                    width="20.9515"
                    height="12.4974"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="1.38143" />
                    <feGaussianBlur stdDeviation="1.38143" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_0_86" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_0_86" result="shape" />
                </filter>
            </defs>
        </svg>
    ),
};

export interface MacOSTopBarProps {
    noAnimation?: boolean;
    icon?: React.ReactNode;
    app?: string;
}

function MacOSTopBar({
    className,
    noAnimation = false,
    icon,
    app,
    ...props
}: MacOSTopBarProps & HTMLMotionProps<'div'>): React.JSX.Element {
    const { device, config, noResponsive } = useMutableDeviceMockup();
    const c = config[device];
    return (
        <AnimatePresence>
            {device === 'desktop' && (
                <motion.div
                    initial={{ opacity: noAnimation ? 1 : 0 }}
                    animate={{ opacity: 1, borderRadius: c.screen.borderRadius }}
                    exit={{ opacity: noAnimation ? 1 : 0, transition: { duration: 0.3, delay: 0 } }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className={cn(getOverflowClassName(noResponsive), className)}
                    {...props}
                >
                    <div
                        className={cn(
                            'text-foreground/80 absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-between gap-4 rounded-t-xl px-3 text-xs backdrop-blur-lg',
                            !noResponsive ? 'max-md:h-6 max-md:text-[8px] max-sm:h-4 max-sm:text-[6px]' : '',
                        )}
                    >
                        <div
                            className={cn(
                                'flex max-w-[50%] items-center justify-start gap-4 overflow-hidden',
                                noResponsive ? '' : 'max-md:gap-2 max-sm:gap-1',
                            )}
                        >
                            {icon ?? (
                                <Icon
                                    name="appleCompany"
                                    className={cn(
                                        'size-4 min-h-4 min-w-4',
                                        noResponsive ? '' : 'max-md:size-2 max-md:min-h-2 max-md:min-w-2',
                                    )}
                                />
                            )}
                            <span className="font-semibold">Safari</span>
                            <span>File</span>
                            <span>Edit</span>
                            <span>View</span>
                            <span>History</span>
                            <span>Develop</span>
                            <span>Window</span>
                            <span>Help</span>
                        </div>

                        <div
                            className={cn(
                                'flex max-w-[50%] items-center justify-end gap-1 overflow-hidden',
                                noResponsive ? '' : 'max-md:gap-1 max-sm:gap-0.5',
                            )}
                        >
                            <AppleIcon.battery
                                className={cn('size-6', noResponsive ? '' : 'max-md:size-4 max-sm:size-3')}
                            />
                            <AppleIcon.wifi
                                className={cn('size-6', noResponsive ? '' : 'max-md:size-4 max-sm:size-3')}
                            />
                            <AppleIcon.loop
                                className={cn('size-6', noResponsive ? '' : 'max-md:size-4 max-sm:size-3')}
                            />
                            <AppleIcon.notification
                                className={cn('size-6', noResponsive ? '' : 'max-md:size-4 max-sm:size-3')}
                            />
                            <span
                                className={cn(
                                    'pl-1 leading-none whitespace-nowrap',
                                    noResponsive ? '' : 'max-sm:pl-0.5',
                                )}
                                suppressHydrationWarning
                            >
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                                {new Date().toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                })}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function IOSTopBar({
    className,
    noAnimation = false,
    ...props
}: HTMLMotionProps<'div'> & { noAnimation?: boolean }): React.JSX.Element {
    const { device, config, noResponsive } = useMutableDeviceMockup();
    const c = config[device];
    return (
        <AnimatePresence>
            {device === 'ios' && (
                <motion.div
                    initial={{ opacity: noAnimation ? 1 : 0 }}
                    animate={{ opacity: 1, borderRadius: c.screen.borderRadius }}
                    exit={{ opacity: noAnimation ? 1 : 0, transition: { duration: 0.3, delay: 0 } }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className={cn(getOverflowClassName(noResponsive), className)}
                    {...props}
                >
                    <div
                        className={cn(
                            'text-foreground/80 absolute inset-x-0 top-0 z-8 flex h-8 items-center justify-between gap-4 rounded-t-xl px-7 text-sm',
                        )}
                    >
                        <span className="whitespace-nowrap" suppressHydrationWarning>
                            {new Date().toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            })}
                        </span>

                        <div className="flex items-center justify-end gap-1">
                            <AppleIcon.wifi className="size-7" />
                            <AppleIcon.battery className="size-7" />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function AndroidTopBar({
    className,
    noAnimation = false,
    ...props
}: HTMLMotionProps<'div'> & { noAnimation?: boolean }): React.JSX.Element {
    const { device, config, noResponsive } = useMutableDeviceMockup();
    const c = config[device];
    return (
        <AnimatePresence>
            {device === 'android' && (
                <motion.div
                    initial={{ opacity: noAnimation ? 1 : 0 }}
                    animate={{ opacity: 1, borderRadius: c.screen.borderRadius }}
                    exit={{ opacity: noAnimation ? 1 : 0, transition: { duration: 0.3, delay: 0 } }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className={cn(getOverflowClassName(noResponsive), className)}
                    {...props}
                >
                    <div
                        className={cn(
                            'text-foreground/80 absolute inset-x-0 top-0 z-8 mt-0.5 flex h-8 items-center justify-between gap-4 rounded-t-xl pr-10 pl-3 text-sm',
                        )}
                    >
                        <span className="whitespace-nowrap" suppressHydrationWarning>
                            {new Date().toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>

                        <div className="flex items-center justify-end gap-2">
                            <div className="relative">
                                <LucideSignal className="text-muted-foreground/30 size-4" />
                                <LucideSignalLow className="absolute top-0 left-0 size-full" />
                            </div>
                            <div className="relative">
                                <LucideWifi className="text-muted-foreground/30 size-4" />
                                <LucideWifiHigh className="absolute top-0 left-0 size-full" />
                            </div>
                            <BluetoothConnected className="size-4" />
                            <div className="flex items-center gap-0.5">
                                <span className="text-muted-foreground text-sm">74%</span>
                                <div className="relative flex flex-col items-center">
                                    <div className="bg-muted-foreground/30 h-0.5 w-1 rounded-t-full"></div>
                                    <div className="bg-muted-foreground/30 relative flex h-3.5 w-3 items-center justify-center overflow-hidden rounded-[2px]">
                                        <div className="bg-muted-foreground absolute inset-x-0 bottom-0 h-2/3"></div>
                                    </div>
                                </div>
                            </div>
                            {/* <AppleIcon.battery className="size-7" /> */}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function AppleTopCamera({ noAnimation = false }: { noAnimation?: boolean }): React.JSX.Element {
    const { device, config, noResponsive } = useMutableDeviceMockup();
    const c = config[device];
    return (
        <AnimatePresence>
            {'concaveRadius' in c && (
                <motion.div
                    initial={{ opacity: noAnimation ? 1 : 0, translateY: noAnimation ? -4 : -10 }}
                    animate={{ opacity: 1, translateY: -4 }}
                    exit={{ opacity: noAnimation ? 1 : 0, translateY: noAnimation ? -4 : -10 }}
                    transition={{ duration: 0.3 }}
                    className={`pointer-events-none relative z-20 flex w-full justify-center overflow-hidden px-2 pt-1`}
                >
                    <motion.div
                        animate={{ ...c.camera, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                        transition={{
                            duration: 0.7,
                            type: 'spring',
                            damping: 20,
                            stiffness: 300,
                            mass: 2,
                        }}
                        className={cn(
                            'relative flex items-center justify-center bg-black',
                            noResponsive
                                ? ''
                                : device === 'ios'
                                  ? 'max-md:max-w-[45%] max-sm:origin-top max-sm:scale-75'
                                  : 'max-md:origin-top max-md:scale-75 max-sm:scale-50',
                        )}
                    >
                        {/* Lentil & Speaker screen */}
                        <motion.div
                            animate={{ translateY: -4, translateX: device === 'ios' ? '33%' : '0%' }}
                            className="grid grid-cols-3 items-center justify-items-center"
                        >
                            {/* Speaker */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: device === 'desktop' ? 0 : 1 }}
                                className="relative h-2.5 w-12 overflow-hidden rounded-full"
                            >
                                <div className="cursed size-full bg-neutral-200/10"></div>
                            </motion.div>

                            <motion.div
                                initial={{ width: c.lentil.size, height: c.lentil.size }}
                                animate={{ width: c.lentil.size, height: c.lentil.size }}
                            >
                                <Lentil />
                            </motion.div>
                        </motion.div>

                        {/* Concave radius */}
                        <div className="absolute top-0 right-0 translate-x-full overflow-hidden">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    width: c.concaveRadius,
                                    height: c.concaveRadius,
                                }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    boxShadow: `-${c.concaveRadius + 1}px -${c.concaveRadius + 1}px 0px ${c.concaveRadius + 1}px  black`,
                                }}
                                className="rounded-tl-full bg-transparent"
                            />
                        </div>

                        {/* Concave radius */}
                        <div className="absolute top-0 left-0 -translate-x-full overflow-hidden">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    width: c.concaveRadius,
                                    height: c.concaveRadius,
                                }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    boxShadow: `${c.concaveRadius + 1}px -${c.concaveRadius + 1}px 0px ${c.concaveRadius + 1}px  black`,
                                }}
                                className="rounded-tr-full bg-transparent"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function AndroidFloatingCamera({ noAnimation = false }: { noAnimation?: boolean }): React.JSX.Element {
    const { device, config } = useMutableDeviceMockup();
    const c = config[device];
    return (
        <AnimatePresence>
            {device === 'android' && (
                <motion.div
                    initial={{
                        scale: noAnimation ? 1 : 0,
                        width: c.camera.width,
                        height: c.camera.height,
                    }}
                    animate={{ ...c.camera, scale: 1 }}
                    exit={{
                        scale: noAnimation ? 1 : 0,
                        width: c.camera.width,
                        height: c.camera.height,
                        transition: { duration: 0.3, type: 'tween' },
                    }}
                    transition={{
                        duration: 0.7,
                        type: 'spring',
                        damping: 20,
                        stiffness: 300,
                        mass: 2,
                    }}
                    className="absolute top-1.5 right-1.5 flex origin-center items-center justify-center bg-black"
                >
                    <Lentil className="size-4/5" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function PowerButton(): React.JSX.Element {
    const { device, config } = useMutableDeviceMockup();
    const c = config[device];
    return (
        <AnimatePresence>
            {'powerButton' in c && (
                <MobileButton
                    position="right"
                    top={c.powerButton.top}
                    height={c.powerButton.height}
                    width={c.powerButton.width}
                    borderRadius={c.powerButton.borderRadius}
                    className="transition-colors"
                    whileHover={{
                        backgroundColor: 'var(--primary)',
                    }}
                />
            )}
        </AnimatePresence>
    );
}

function IOSButtons(): React.JSX.Element {
    const { device, config } = useMutableDeviceMockup();
    const c = config[device];
    return (
        <AnimatePresence>
            {device === 'ios' && 'powerButton' in c && (
                <>
                    <MobileButton
                        position="left"
                        top={90}
                        height={50}
                        width={c.powerButton.width}
                        borderRadius={c.powerButton.borderRadius}
                    />
                    <MobileButton
                        position="left"
                        top={150}
                        height={50}
                        width={c.powerButton.width}
                        borderRadius={c.powerButton.borderRadius}
                    />
                </>
            )}
        </AnimatePresence>
    );
}

function AndroidButtons(): React.JSX.Element {
    const { device, config } = useMutableDeviceMockup();
    const c = config[device];
    return (
        <AnimatePresence>
            {device === 'android' && 'powerButton' in c && (
                <MobileButton
                    position="right"
                    top={170}
                    height={50}
                    width={c.powerButton.width}
                    borderRadius={c.powerButton.borderRadius}
                />
            )}
        </AnimatePresence>
    );
}

export interface DeviceContentProps {
    visibleIf: Device | Device[];
    visibleAfter?: number;
    container?: HTMLMotionProps<'div'>;
    noAnimation?: boolean;
}

function DeviceContent({
    visibleIf,
    className,
    noAnimation = false,
    visibleAfter,
    container: { className: containerClassName, ...containerProps } = {},
    ...props
}: DeviceContentProps & React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
    const { device, config, noResponsive } = useMutableDeviceMockup();
    const c = config[device];

    return (
        <AnimatePresence>
            {(Array.isArray(visibleIf) ? visibleIf.includes(device) : visibleIf === device) && (
                <motion.div
                    initial={{ opacity: noAnimation ? 1 : 0 }}
                    animate={{ opacity: 1, borderRadius: c.screen.borderRadius }}
                    exit={{ opacity: noAnimation ? 1 : 0, transition: { duration: 0.3, delay: 0 } }}
                    transition={{ duration: 0.3, delay: visibleAfter }}
                    className={cn(getOverflowClassName(noResponsive), containerClassName)}
                    {...containerProps}
                >
                    <div
                        className={cn(
                            'mt-9 size-full',
                            {
                                'mt-8': device === 'desktop',
                                'max-sm:mt-4': device === 'desktop' && !noResponsive,
                            },
                            className,
                        )}
                        {...props}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* __________________________ Higher level components __________________________ */

// shortcut component
function MobileButtons(): React.JSX.Element {
    return (
        <>
            <PowerButton />
            <IOSButtons />
            <AndroidButtons />
        </>
    );
}

// shortcut component
function TopBar({ noAnimation = false }: { noAnimation?: boolean }): React.JSX.Element {
    return (
        <>
            <MacOSTopBar noAnimation={noAnimation} />
            <IOSTopBar noAnimation={noAnimation} />
            <AndroidTopBar noAnimation={noAnimation} />
        </>
    );
}

// shortcut component
function Camera({ noAnimation = false }: { noAnimation?: boolean }): React.JSX.Element {
    return (
        <>
            <AppleTopCamera noAnimation={noAnimation} />
            <AndroidFloatingCamera noAnimation={noAnimation} />
        </>
    );
}

// shortcut component
function MutableDeviceMockup({
    children,
    ...props
}: Omit<MutableDeviceMockupRootProps, 'children'> & { children?: React.ReactNode }): React.JSX.Element {
    return (
        <MutableDeviceMockupRoot {...props}>
            <Viewport>
                <Screen>
                    <Camera />
                    <TopBar />
                    <MobileButtons />

                    {children}
                </Screen>
            </Viewport>
        </MutableDeviceMockupRoot>
    );
}

export {
    AndroidButtons,
    AndroidFloatingCamera,
    AndroidTopBar,
    AppleTopCamera,
    Camera,
    DeviceContent,
    DeviceSelector,
    IOSButtons,
    IOSTopBar,
    Keyboard,
    MacOSButtons,
    MacOSTopBar,
    MobileButtons,
    MutableDeviceMockup,
    MutableDeviceMockupRoot,
    PowerButton,
    Screen,
    TopBar,
    Viewport,
};
