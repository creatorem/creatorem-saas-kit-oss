import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Text } from '@kit/native-ui/text';
import type {
    AgendaDaySummary,
    AgendaEventVM,
    AgendaView,
} from '@planoby/shared/lib/agenda-view-model';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    AppState,
    type AppStateStatus,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import Animated, {
    Easing,
    cancelAnimation,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
// import MaskedView from "@react-native-masked-view/masked-view";
// import { easeGradient } from "react-native-easing-gradient";
// import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from '@kit/utils';

export interface AgendaCalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    vm: AgendaEventVM;
}

export interface AgendaViewportState {
    scrollAnchorHour: number;
    zoomDensity: 'compact' | 'regular' | 'comfortable';
}

export interface AgendaDateMemoItem {
    id: string;
    date: string;
    content: string;
    color?: string | null;
}

export type AgendaCanvasLevel = 'day' | 'month' | 'year';

export type AgendaNavigationAction =
    | { type: 'drill_up' }
    | { type: 'drill_down'; dayKey: string }
    | { type: 'period'; delta: number }
    | { type: 'swipe'; delta: number };

export interface AgendaVisibleRange {
    level: AgendaCanvasLevel;
    anchorDay: string;
    startDay: string;
    endDay: string;
}

interface AgendaV2RendererProps {
    rendererPlatform: 'ios-native' | 'fallback-list';
    view: AgendaView;
    anchorDate: Date;
    selectedDayKey: string;
    minHour: number;
    maxHour: number;
    events: AgendaCalendarEvent[];
    daySummaries: Record<string, AgendaDaySummary>;
    dayAccentByDay: Record<string, string>;
    dateMemos: AgendaDateMemoItem[];
    visibleDays: string[];
    isMonthLoading?: boolean;
    viewport: AgendaViewportState;
    onPressCell: (payload: { day: string; hour: number }) => void;
    onPressEvent: (event: AgendaCalendarEvent) => void;
    onSelectDay: (day: string) => void;
    onDrillDown: (payload: { day: string; from: 'month' | 'year' }) => void;
    onAnchorDateChange: (date: Date) => void;
    daySwipePreviewDayKey?: string | null;
    onDaySwipePreviewDayKeyChange?: (dayKey: string | null) => void;
    onVisibleRangeChange?: (range: AgendaVisibleRange) => void;
}

type MonthItem = {
    id: string;
    date: Date;
};

type YearItem = {
    id: string;
    year: number;
};

type MonthDaySelection = {
    day: string;
    weekIndex?: number;
};

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

let APPLE_BG = 'transparent';
let APPLE_SURFACE = 'transparent';
let APPLE_TEXT = 'transparent';
let APPLE_MUTED = 'transparent';
let APPLE_LINE = 'transparent';
let APPLE_TODAY = 'transparent';
let APPLE_SELECTED = 'transparent';
let APPLE_SELECTED_TEXT = 'transparent';
let APPLE_NEUTRAL_TILE = 'transparent';

const DAY_WINDOW_RADIUS = 12;
const MONTH_ITEM_HEIGHT = 612;
const MONTH_INITIAL_RANGE_BEFORE = 18;
const MONTH_INITIAL_RANGE_AFTER = 18;
const MONTH_EXTENSION_CHUNK = 12;
const MONTH_EDGE_BUFFER = 4;
const MONTH_LIST_WINDOW_SIZE = 4;
const MONTH_LIST_INITIAL_RENDER = 1;
const MONTH_LIST_MAX_BATCH = 1;
const YEAR_ITEM_HEIGHT = 980;
const YEAR_INITIAL_RANGE_BEFORE = 6;
const YEAR_INITIAL_RANGE_AFTER = 6;
const YEAR_EXTENSION_CHUNK = 3;
const YEAR_EDGE_BUFFER = 2;
const YEAR_LIST_WINDOW_SIZE = 2;
const YEAR_LIST_INITIAL_RENDER = 1;
const YEAR_LIST_MAX_BATCH = 1;
const VIEW_TRANSITION_SCALE_DELTA = 0.16;
const VIEW_TRANSITION_VERTICAL_TRAVEL = 34;
const MONTH_WEEK_ROW_HEIGHT = 84;

const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseDateKey = (value: string) => new Date(`${value}T00:00:00`);

const addDays = (base: Date, amount: number) => {
    const next = new Date(base);
    next.setDate(next.getDate() + amount);
    return next;
};

const addMonths = (base: Date, amount: number) => new Date(base.getFullYear(), base.getMonth() + amount, 1);

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const startOfYear = (date: Date) => new Date(date.getFullYear(), 0, 1);

const endOfYear = (date: Date) => new Date(date.getFullYear(), 11, 31);

const getMondayIndex = (date: Date) => (date.getDay() + 6) % 7;

const startOfWeekMonday = (date: Date) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() - getMondayIndex(copy));
    return copy;
};

const getWeekIndexInMonth = (date: Date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthCellIndex = getMondayIndex(firstDayOfMonth) + date.getDate() - 1;
    return Math.floor(monthCellIndex / 7);
};

const buildMonthCells = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const monthLength = new Date(year, month + 1, 0).getDate();
    const mondayOffset = getMondayIndex(firstDay);

    return Array.from({ length: 42 }).map((_, index) => {
        const dayOfMonth = index - mondayOffset + 1;
        if (dayOfMonth < 1 || dayOfMonth > monthLength) {
            return null;
        }

        const date = new Date(year, month, dayOfMonth);
        return {
            date,
            dayOfMonth,
            dayKey: formatDateKey(date),
        };
    });
};

const formatHourLabel = (hour24: number) => {
    if (hour24 === 0) return '12 AM';
    if (hour24 === 12) return 'Noon';
    if (hour24 < 12) return `${hour24} AM`;
    return `${hour24 - 12} PM`;
};

const formatNowBadge = (date: Date) =>
    date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
    });

const getDayStartMinute = (date: Date) => date.getHours() * 60 + date.getMinutes();

const getRangeForEvent = ({
    event,
    minHour,
    maxHour,
}: {
    event: AgendaCalendarEvent;
    minHour: number;
    maxHour: number;
}) => {
    const startMinute = getDayStartMinute(event.start);
    const endMinute = getDayStartMinute(event.end);
    const minMinute = minHour * 60;
    const maxMinute = maxHour * 60;

    const clampedStart = Math.max(minMinute, Math.min(maxMinute, startMinute));
    const clampedEnd = Math.max(clampedStart + 15, Math.min(maxMinute, endMinute));

    return {
        startMinute: clampedStart,
        endMinute: clampedEnd,
        durationMinute: clampedEnd - clampedStart,
    };
};

const layoutDayEvents = ({
    events,
    minHour,
    maxHour,
}: {
    events: AgendaCalendarEvent[];
    minHour: number;
    maxHour: number;
}) => {
    const sorted = [...events].sort((a, b) => {
        const delta = a.start.getTime() - b.start.getTime();
        if (delta !== 0) return delta;
        return a.end.getTime() - b.end.getTime();
    });

    const assignments = new Map<string, number>();
    const active: Array<{ id: string; end: number; column: number }> = [];
    let maxColumns = 1;

    for (const event of sorted) {
        const { startMinute, endMinute } = getRangeForEvent({ event, minHour, maxHour });

        for (let i = active.length - 1; i >= 0; i -= 1) {
            if (active[i]!.end <= startMinute) {
                active.splice(i, 1);
            }
        }

        let column = 0;
        while (active.some((entry) => entry.column === column)) {
            column += 1;
        }

        active.push({ id: event.id, end: endMinute, column });
        assignments.set(event.id, column);
        maxColumns = Math.max(maxColumns, active.length);
    }

    return {
        maxColumns,
        assignments,
    };
};

const compactEventTitle = (event: AgendaCalendarEvent) =>
    event.vm.kind === 'slot'
        ? event.vm.slotLabel || event.vm.title
        : event.vm.bookingName || event.vm.title;

const getMonthId = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const makeMonthItem = (date: Date): MonthItem => ({
    id: getMonthId(date),
    date: startOfMonth(date),
});

const buildMonthRange = (anchorDate: Date, beforeCount: number, afterCount: number) => {
    const items: MonthItem[] = [];
    for (let i = -beforeCount; i <= afterCount; i += 1) {
        items.push(makeMonthItem(addMonths(anchorDate, i)));
    }
    return items;
};

const makeYearItem = (year: number): YearItem => ({
    id: `year-${year}`,
    year,
});

const getCanvasLevelFromView = (view: AgendaView): AgendaCanvasLevel => {
    if (view === 'month' || view === 'year') {
        return view;
    }

    return 'day';
};

const getCanvasLevelWeight = (level: AgendaCanvasLevel) => {
    if (level === 'day') return 0;
    if (level === 'month') return 1;
    return 2;
};

const getClampedDayIndexFromOffset = ({
    offsetX,
    width,
    maxIndex,
}: {
    offsetX: number;
    width: number;
    maxIndex: number;
}) => {
    const safeWidth = Math.max(1, width);
    const rawIndex = Math.round(offsetX / safeWidth);
    return Math.max(0, Math.min(maxIndex, rawIndex));
};

const getTargetDayIndexFromEndDrag = ({
    nativeEvent,
    width,
    maxIndex,
}: {
    nativeEvent: NativeScrollEvent;
    width: number;
    maxIndex: number;
}) => {
    const targetOffsetX = nativeEvent.targetContentOffset?.x ?? nativeEvent.contentOffset.x;
    return getClampedDayIndexFromOffset({
        offsetX: targetOffsetX,
        width,
        maxIndex,
    });
};

const buildYearRange = (anchorYear: number, beforeCount: number, afterCount: number) => {
    const items: YearItem[] = [];
    for (let year = anchorYear - beforeCount; year <= anchorYear + afterCount; year += 1) {
        items.push(makeYearItem(year));
    }
    return items;
};

function MinimalEventPill({
    event,
    onPress,
}: {
    event: AgendaCalendarEvent;
    onPress: (event: AgendaCalendarEvent) => void;
}) {
    return (
        <Pressable
            onPress={() => onPress(event)}
            style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: event.vm.palette.primary,
                backgroundColor: event.vm.palette.backgroundColor,
                paddingHorizontal: 7,
                paddingVertical: 4,
            }}
        >
            <Text numberOfLines={1} style={{ color: event.vm.palette.primary, fontSize: 11, fontWeight: '700' }}>
                {compactEventTitle(event)}
            </Text>
        </Pressable>
    );
}

function WeekdayLettersRow({
    hideLetters = false,
}: {
    hideLetters?: boolean;
}) {
    return (
        <View className="flex-row pb-1 -translate-x-px">
            {WEEKDAY_LETTERS.map((label, index) => (
                <View key={`weekday-letters-${index}`} className="flex-1 items-center">
                    <Text
                        className={cn("text-muted-foreground text-xs", hideLetters ? 'opacity-0' : null, index > 4 ? 'opacity-50' : 0)}
                    >
                        {label}
                    </Text>
                </View>
            ))}
        </View>
    );
}

function WeekStripDayPill({
    day,
    dayKey,
    isSelected,
    isToday,
    onSelectDay,
    isWeekendDay
}: {
    day: Date;
    dayKey: string;
    isSelected: boolean;
    isToday: boolean;
    isWeekendDay: boolean;
    onSelectDay: (day: string) => void;
}) {
    const circleScale = useSharedValue(isSelected ? 1 : 0);

    useEffect(() => {
        circleScale.value = withTiming(isSelected ? 1 : 0, {
            duration: 240,
            easing: Easing.out(Easing.cubic),
        });
    }, [circleScale, isSelected]);

    const animatedCircleStyle = useAnimatedStyle(() => {
        return {
            opacity: circleScale.value,
            transform: [{ scale: circleScale.value }],
        };
    });

    return (
        <Pressable onPress={() => onSelectDay(dayKey)} style={{ flex: 1, alignItems: 'center' }}>
            <View
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Animated.View
                    pointerEvents="none"
                    style={[
                        {
                            position: 'absolute',
                            width: 32,
                            height: 32,
                            borderRadius: 999,
                            backgroundColor: isToday ? APPLE_TODAY : APPLE_SELECTED,
                        },
                        animatedCircleStyle,
                    ]}
                />
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: '600',
                        opacity: isWeekendDay && !isToday && !isSelected ? 0.5 : 1,
                        color: isSelected ? isToday ? APPLE_TEXT : APPLE_SELECTED_TEXT : isToday ? APPLE_TODAY : APPLE_TEXT,
                    }}
                >
                    {day.getDate()}
                </Text>
            </View>
        </Pressable>
    );
}

function WeekStrip({
    anchorDate,
    selectedDay,
    onSelectDay,
    hideWeekdayLetters = false,
    hideWeekNumbers = false,
}: {
    anchorDate: Date;
    selectedDay: string;
    onSelectDay: (day: string) => void;
    hideWeekdayLetters?: boolean;
    hideWeekNumbers?: boolean;
}) {
    const weekStart = startOfWeekMonday(anchorDate);
    const weekStartKey = formatDateKey(weekStart);
    const [displayWeekStart, setDisplayWeekStart] = useState(weekStart);
    const [incomingWeekStart, setIncomingWeekStart] = useState<Date | null>(null);
    const [transitionDir, setTransitionDir] = useState<1 | -1>(1);
    const transitionProgress = useSharedValue(1);
    const transitionIdRef = useRef(0);
    const { width } = useWindowDimensions();
    const slideDistance = width;
    const transitionDurationMs = 280;
    const todayKey = formatDateKey(new Date());

    const buildWeekDays = useCallback((weekDate: Date) => {
        return Array.from({ length: 7 }).map((_, index) => addDays(weekDate, index));
    }, []);

    const commitWeekTransition = useCallback(
        (transitionId: number, nextWeekTs: number) => {
            if (transitionIdRef.current !== transitionId) {
                return;
            }

            const nextWeek = new Date(nextWeekTs);
            setDisplayWeekStart(nextWeek);
            setIncomingWeekStart(null);
            transitionProgress.value = 1;
        },
        [transitionProgress],
    );

    useEffect(() => {
        return () => {
            transitionIdRef.current += 1;
            cancelAnimation(transitionProgress);
        };
    }, [transitionProgress]);

    useEffect(() => {
        const currentWeekKey = formatDateKey(displayWeekStart);
        const incomingWeekKey = incomingWeekStart ? formatDateKey(incomingWeekStart) : null;

        if (weekStartKey === currentWeekKey) {
            return;
        }

        // Prevent re-triggering the same transition on every render while it is already in-flight.
        if (incomingWeekKey === weekStartKey) {
            return;
        }

        const direction = weekStart.getTime() > displayWeekStart.getTime() ? 1 : -1;
        setTransitionDir(direction);
        setIncomingWeekStart(weekStart);
        const targetWeekTimestamp = weekStart.getTime();
        const transitionId = transitionIdRef.current + 1;
        transitionIdRef.current = transitionId;

        transitionProgress.value = 0;
        transitionProgress.value = withTiming(1, {
            duration: transitionDurationMs,
            easing: Easing.out(Easing.cubic),
        }, (finished) => {
            if (finished) {
                runOnJS(commitWeekTransition)(transitionId, targetWeekTimestamp);
            }
        });
    }, [displayWeekStart, incomingWeekStart, transitionProgress, weekStart, weekStartKey]);

    const outgoingRowStyle = useAnimatedStyle(() => {
        if (!incomingWeekStart) {
            return {
                opacity: 1,
                transform: [{ translateX: 0 }],
            };
        }

        const directionMultiplier = transitionDir === 1 ? -1 : 1;
        return {
            opacity: 1 - transitionProgress.value,
            transform: [{ translateX: transitionProgress.value * slideDistance * directionMultiplier }],
        };
    }, [incomingWeekStart, slideDistance, transitionDir]);

    const incomingRowStyle = useAnimatedStyle(() => {
        if (!incomingWeekStart) {
            return {
                opacity: 0,
                transform: [{ translateX: 0 }],
            };
        }

        const directionMultiplier = transitionDir === 1 ? 1 : -1;
        return {
            opacity: transitionProgress.value,
            transform: [{ translateX: (1 - transitionProgress.value) * slideDistance * directionMultiplier }],
        };
    }, [incomingWeekStart, slideDistance, transitionDir]);

    const renderWeekRow = useCallback(
        ({ weekStartDate, keyPrefix }: { weekStartDate: Date; keyPrefix: string }) => {
            const days = buildWeekDays(weekStartDate);

            return (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {days.map((day, index) => {
                        const dayKey = formatDateKey(day);
                        const isSelected = dayKey === selectedDay;
                        const isToday = dayKey === todayKey;

                        return (
                            <WeekStripDayPill
                                key={`${keyPrefix}-${dayKey}`}
                                day={day}
                                dayKey={dayKey}
                                isSelected={isSelected}
                                isToday={isToday}
                                onSelectDay={onSelectDay}
                                isWeekendDay={index > 4}
                            />
                        );
                    })}
                </View>
            );
        },
        [buildWeekDays, onSelectDay, selectedDay, todayKey],
    );

    return (
        <View
            className="border-border border-b -mt-2 px-2 pb-2"
        >
            <WeekdayLettersRow hideLetters={hideWeekdayLetters} />
            <View
                style={{
                    minHeight: 36,
                    opacity: hideWeekNumbers ? 0 : 1,
                    overflow: 'hidden',
                }}
            >
                <Animated.View style={[StyleSheet.absoluteFillObject, outgoingRowStyle]}>
                    {renderWeekRow({
                        weekStartDate: displayWeekStart,
                        keyPrefix: 'week-strip-current',
                    })}
                </Animated.View>

                <Animated.View style={[StyleSheet.absoluteFillObject, incomingRowStyle]} pointerEvents="none">
                    {renderWeekRow({
                        weekStartDate: incomingWeekStart ?? displayWeekStart,
                        keyPrefix: 'week-strip-next',
                    })}
                </Animated.View>

                <View style={{ opacity: 0 }} pointerEvents="none">
                    {renderWeekRow({
                        weekStartDate: incomingWeekStart ?? displayWeekStart,
                        keyPrefix: 'week-strip-layout',
                    })}
                </View>
            </View>
        </View>
    );
}

function WeekNumbersBridgeRow({
    days,
    selectedDay,
}: {
    days: string[];
    selectedDay: string;
}) {
    const todayKey = formatDateKey(new Date());

    return (
        <View style={{ flexDirection: 'row' }}>
            {days.map((dayKey) => {
                const dayDate = parseDateKey(dayKey);
                const isSelected = dayKey === selectedDay;
                const isToday = dayKey === todayKey;

                return (
                    <View key={`bridge-week-day-${dayKey}`} style={{ flex: 1, alignItems: 'center' }}>
                        <View
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 999,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isSelected ? APPLE_SELECTED : 'transparent',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: '600',
                                    color: isSelected ? APPLE_SELECTED_TEXT : isToday ? APPLE_TODAY : APPLE_TEXT,
                                }}
                            >
                                {dayDate.getDate()}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

function AllDayStrip(_: {
    day: string;
    dateMemos: AgendaDateMemoItem[];
}) {
    return null;
}

function DayCanvas({
    day,
    events,
    minHour,
    maxHour,
    dateMemos,
    onPressCell,
    onPressEvent,
    viewport,
}: {
    day: string;
    events: AgendaCalendarEvent[];
    minHour: number;
    maxHour: number;
    dateMemos: AgendaDateMemoItem[];
    onPressCell: (payload: { day: string; hour: number }) => void;
    onPressEvent: (event: AgendaCalendarEvent) => void;
    viewport: AgendaViewportState;
}) {
    const hourHeight = viewport.zoomDensity === 'compact' ? 52 : viewport.zoomDensity === 'comfortable' ? 78 : 64;
    const totalHours = Math.max(1, maxHour - minHour);
    const timelineHeight = totalHours * hourHeight;

    const layout = useMemo(() => layoutDayEvents({ events, minHour, maxHour }), [events, minHour, maxHour]);
    const [now, setNow] = useState(() => new Date());
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 15000);
        return () => clearInterval(interval);
    }, []);

    const isToday = day === formatDateKey(now);
    const nowMinute = now.getHours() * 60 + now.getMinutes();
    const minMinute = minHour * 60;
    const maxMinute = maxHour * 60;
    const showNowLine = isToday && nowMinute >= minMinute && nowMinute <= maxMinute;
    const nowLineTop = ((nowMinute - minMinute) / 60) * hourHeight;


    const themeColors = useThemeColors();

    // const { colors, locations } = easeGradient({
    //     colorStops: {
    //         // 0: { color: "rgba(0,0,0,0.99)" },
    //         0: { color: "transparent" },
    //         // 0: { color: "black" },
    //         1: { color: "black" },
    //         // 1: { color: "transparent" },
    //     },
    // });


    return (
        <View className="bg-background flex-1">
            {/* // <View className="bg-green-400 flex-1"> */}
            <AllDayStrip day={day} dateMemos={dateMemos} />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 70 + insets.bottom, paddingTop: 12 }} showsVerticalScrollIndicator={false}>
                {/* <View className="bg-blue-400" style={{ height: timelineHeight + 2 }}> */}
                <View style={{ height: timelineHeight + 2 }}>
                    {Array.from({ length: totalHours + 1 }).map((_, index) => {
                        const hour = minHour + index;
                        const top = index * hourHeight;

                        return (
                            <View
                                key={`hour-line-${day}-${hour}`}
                                style={{ position: 'absolute', top, left: 0, right: 0, height: hourHeight }}
                            >
                                <Pressable
                                    onPress={() => onPressCell({ day, hour: Math.min(hour, 23) })}
                                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                                />
                                <View className='ml-10 mr-3 border-border border-b' />
                                {hour <= maxHour ? (
                                    <Text
                                        className='absolute left-9 text-[10px] text-right text-muted-foreground'
                                        style={{ transform: 'translate(-100%, -50%)' }}
                                    >
                                        {formatHourLabel(hour)}
                                    </Text>
                                ) : null}
                            </View>
                        );
                    })}

                    {showNowLine ? (
                        <View style={{ position: 'absolute', top: nowLineTop, left: 2, right: 0 }}>
                            <View className='absolute left-0 -translate-y-[5px] z-10'>
                                <View
                                    className='bg-primary rounded-full py-0 px-0.5'
                                >
                                    <Text className='text-[10px] leading-none text-foreground mt-0.5'>{formatNowBadge(now)}</Text>
                                </View>
                            </View>

                            <View className='z-5 mx-3 items-center flex-row'>
                                <View style={{ height: 2, flex: 1, backgroundColor: APPLE_TODAY }} />
                            </View>
                        </View>
                    ) : null}

                    {events.map((event) => {
                        const { startMinute, durationMinute } = getRangeForEvent({ event, minHour, maxHour });
                        const top = ((startMinute - minHour * 60) / 60) * hourHeight;
                        const height = Math.max(34, (durationMinute / 60) * hourHeight);
                        const maxColumns = layout.maxColumns;
                        const column = layout.assignments.get(event.id) ?? 0;
                        const widthPercent = 100 / maxColumns;
                        const leftPercent = widthPercent * column;

                        return (
                            <View
                                key={event.id}
                                style={{
                                    position: 'absolute',
                                    top,
                                    left: 44,
                                    right: 12,
                                    height,
                                }}
                            >
                                <View
                                    style={{
                                        position: 'absolute',
                                        left: `${leftPercent}%`,
                                        width: `${widthPercent}%`,
                                        paddingRight: 4,
                                    }}
                                >
                                    <MinimalEventPill event={event} onPress={onPressEvent} />
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: insets.bottom + 40,
                // backgroundColor: 'blue'
            }}>

                <MaskedView
                    // className="bg-red-400"
                    maskElement={
                        <LinearGradient
                            locations={locations as any}
                            colors={colors as any}
                            style={StyleSheet.absoluteFill}
                        />
                    }
                    style={[StyleSheet.absoluteFill]}
                >
                    <LinearGradient
                        // colors={["black", "rgba(0, 0, 0, 0.2)"]}
                        colors={["rgba(0, 0, 0, 0)", themeColors['--color-background'], themeColors['--color-background']]}
                        // colors={[themeColors['--color-background'], "rgba(0, 0, 0, 0.2)"]}
                        style={StyleSheet.absoluteFill}
                    />
                    <BlurView
                        intensity={15}
                        tint={
                            Platform.OS === "ios"
                                ? "systemChromeMaterialDark"
                                : "systemMaterialDark"
                        }
                        style={[StyleSheet.absoluteFill]}
                    />
                </MaskedView>
            </View> */}
            <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: insets.bottom + 40,
            }}>

                <LinearGradient
                    colors={[themeColors.isDark ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)", themeColors['--color-background']]}
                    style={StyleSheet.absoluteFill}
                />
            </View>
        </View>
    );
}

function DayHorizontalPager({
    anchorDate,
    events,
    minHour,
    maxHour,
    dateMemosByDay,
    onPressCell,
    onPressEvent,
    onAnchorDateChange,
    daySwipePreviewDayKey,
    onDaySwipePreviewDayKeyChange,
    viewport,
    hideWeekdayLetters = false,
    hideWeekNumbers = false,
}: {
    anchorDate: Date;
    events: AgendaCalendarEvent[];
    minHour: number;
    maxHour: number;
    dateMemosByDay: Record<string, AgendaDateMemoItem[]>;
    onPressCell: (payload: { day: string; hour: number }) => void;
    onPressEvent: (event: AgendaCalendarEvent) => void;
    onAnchorDateChange: (date: Date) => void;
    daySwipePreviewDayKey?: string | null;
    onDaySwipePreviewDayKeyChange?: (dayKey: string | null) => void;
    viewport: AgendaViewportState;
    hideWeekdayLetters?: boolean;
    hideWeekNumbers?: boolean;
}) {
    const { width } = useWindowDimensions();
    const listRef = useRef<FlatList<Date>>(null);
    const hasMomentumRef = useRef(false);
    const pendingReleaseDayRef = useRef<Date | null>(null);
    const noMomentumCommitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const windowDays = useMemo(() => {
        return Array.from({ length: DAY_WINDOW_RADIUS * 2 + 1 }).map((_, index) => addDays(anchorDate, index - DAY_WINDOW_RADIUS));
    }, [anchorDate]);
    const anchorDayKey = useMemo(() => formatDateKey(anchorDate), [anchorDate]);
    const weekReferenceDate = useMemo(() => {
        if (!daySwipePreviewDayKey) {
            return anchorDate;
        }

        return parseDateKey(daySwipePreviewDayKey);
    }, [anchorDate, daySwipePreviewDayKey]);
    const eventsByDay = useMemo(() => {
        const grouped: Record<string, AgendaCalendarEvent[]> = {};

        for (const event of events) {
            const dayKey = event.vm.day;
            if (!grouped[dayKey]) {
                grouped[dayKey] = [];
            }

            grouped[dayKey]!.push(event);
        }

        for (const dayKey of Object.keys(grouped)) {
            grouped[dayKey]!.sort((a, b) => a.start.getTime() - b.start.getTime());
        }

        return grouped;
    }, [events]);

    const clearNoMomentumCommitTimer = useCallback(() => {
        if (!noMomentumCommitTimerRef.current) {
            return;
        }

        clearTimeout(noMomentumCommitTimerRef.current);
        noMomentumCommitTimerRef.current = null;
    }, []);

    const resolveWindowDay = useCallback(
        (index: number) => {
            if (windowDays.length === 0) {
                return null;
            }

            const clampedIndex = Math.max(0, Math.min(windowDays.length - 1, index));
            return windowDays[clampedIndex] ?? null;
        },
        [windowDays],
    );

    const publishPreviewDay = useCallback(
        (dayDate: Date | null) => {
            if (!onDaySwipePreviewDayKeyChange) {
                return;
            }

            onDaySwipePreviewDayKeyChange(dayDate ? formatDateKey(dayDate) : null);
        },
        [onDaySwipePreviewDayKeyChange],
    );

    const triggerDaySwipeHaptic = useCallback(() => {
        if (Platform.OS !== 'ios') {
            return;
        }

        void Haptics.selectionAsync().catch(() => undefined);
    }, []);

    useEffect(() => {
        return () => {
            clearNoMomentumCommitTimer();
        };
    }, [clearNoMomentumCommitTimer]);

    useEffect(() => {
        // Keep the selected day centered without remounting the pager.
        listRef.current?.scrollToIndex({
            index: DAY_WINDOW_RADIUS,
            animated: false,
            viewPosition: 0,
        });
    }, [anchorDate, width]);

    return (
        <View className="bg-background flex-1">
            <WeekStrip
                anchorDate={weekReferenceDate}
                selectedDay={daySwipePreviewDayKey ?? formatDateKey(anchorDate)}
                hideWeekdayLetters={hideWeekdayLetters}
                hideWeekNumbers={hideWeekNumbers}
                onSelectDay={(nextDay) => {
                    publishPreviewDay(null);
                    onAnchorDateChange(parseDateKey(nextDay));
                }}
            />

            <FlatList
                ref={listRef}
                key={`day-pager-${viewport.zoomDensity}`}
                data={windowDays}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={DAY_WINDOW_RADIUS}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                windowSize={3}
                initialNumToRender={1}
                maxToRenderPerBatch={1}
                removeClippedSubviews
                onScrollToIndexFailed={() => {
                    // Ignore occasional race during dimension/layout updates.
                }}
                onScrollEndDrag={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
                    const targetIndex = getTargetDayIndexFromEndDrag({
                        nativeEvent: event.nativeEvent,
                        width,
                        maxIndex: Math.max(0, windowDays.length - 1),
                    });
                    const targetDay = resolveWindowDay(targetIndex);
                    if (!targetDay) {
                        publishPreviewDay(null);
                        return;
                    }

                    pendingReleaseDayRef.current = targetDay;
                    hasMomentumRef.current = false;
                    publishPreviewDay(targetDay);
                    clearNoMomentumCommitTimer();

                    noMomentumCommitTimerRef.current = setTimeout(() => {
                        if (hasMomentumRef.current) {
                            return;
                        }

                        const pendingDay = pendingReleaseDayRef.current;
                        pendingReleaseDayRef.current = null;
                        if (!pendingDay) {
                            publishPreviewDay(null);
                            return;
                        }

                        if (formatDateKey(pendingDay) === anchorDayKey) {
                            publishPreviewDay(null);
                            return;
                        }

                        triggerDaySwipeHaptic();
                        onAnchorDateChange(pendingDay);
                        publishPreviewDay(null);
                    }, 120);
                }}
                onMomentumScrollBegin={() => {
                    hasMomentumRef.current = true;
                    clearNoMomentumCommitTimer();
                }}
                onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
                    clearNoMomentumCommitTimer();
                    hasMomentumRef.current = false;

                    const index = getClampedDayIndexFromOffset({
                        offsetX: event.nativeEvent.contentOffset.x,
                        width,
                        maxIndex: Math.max(0, windowDays.length - 1),
                    });
                    const dayDate = resolveWindowDay(index) ?? pendingReleaseDayRef.current;
                    pendingReleaseDayRef.current = null;
                    if (!dayDate) {
                        publishPreviewDay(null);
                        return;
                    }
                    if (formatDateKey(dayDate) === anchorDayKey) {
                        publishPreviewDay(null);
                        return;
                    }
                    triggerDaySwipeHaptic();
                    onAnchorDateChange(dayDate);
                    publishPreviewDay(null);
                }}
                renderItem={({ item }) => {
                    const day = formatDateKey(item);
                    const dayEvents = eventsByDay[day] ?? [];

                    return (
                        <View style={{ width }}>
                            <DayCanvas
                                day={day}
                                events={dayEvents}
                                minHour={minHour}
                                maxHour={maxHour}
                                dateMemos={dateMemosByDay[day] ?? []}
                                onPressCell={onPressCell}
                                onPressEvent={onPressEvent}
                                viewport={viewport}
                            />
                        </View>
                    );
                }}
                keyExtractor={(item) => formatDateKey(item)}
            />
        </View>
    );
}

function MonthDayIndicator({
    dayEvents,
    dayMemos,
    daySummary,
    dayAccent,
}: {
    dayEvents: AgendaCalendarEvent[];
    dayMemos: AgendaDateMemoItem[];
    daySummary?: AgendaDaySummary;
    dayAccent?: string;
}) {
    if (dayMemos.length > 0) {
        return (
            <View
                style={{
                    borderRadius: 999,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    backgroundColor: dayMemos[0]?.color ?? APPLE_NEUTRAL_TILE,
                    alignSelf: 'flex-start',
                }}
            >
                <Text numberOfLines={1} style={{ fontSize: 9, color: APPLE_TEXT, fontWeight: '600', maxWidth: 70 }}>
                    {dayMemos[0]?.content}
                </Text>
            </View>
        );
    }

    if (dayEvents.length > 0) {
        return (
            <View
                style={{
                    borderRadius: 999,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    backgroundColor: dayEvents[0]!.vm.palette.backgroundColor,
                    borderWidth: 1,
                    borderColor: dayEvents[0]!.vm.palette.primary,
                    alignSelf: 'flex-start',
                }}
            >
                <Text numberOfLines={1} style={{ color: dayEvents[0]!.vm.palette.primary, fontSize: 9, fontWeight: '600', maxWidth: 68 }}>
                    {compactEventTitle(dayEvents[0]!)}
                </Text>
            </View>
        );
    }

    const hasActivity = Boolean(daySummary && (daySummary.bookingCount > 0 || daySummary.slotCount > 0));
    if (!hasActivity) {
        return null;
    }

    return (
        <View
            style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                backgroundColor: dayAccent ?? APPLE_MUTED,
                marginTop: 4,
                marginLeft: 2,
            }}
        />
    );
}

function MonthSection({
    monthDate,
    events,
    daySummaries,
    dayAccentByDay,
    dateMemosByDay,
    loadedDayKeys,
    isLoading,
    selectedDay,
    onSelectDay,
    hideWeekdayLetters = false,
    hideSelectedWeekNumbers = false,
}: {
    monthDate: Date;
    events: AgendaCalendarEvent[];
    daySummaries: Record<string, AgendaDaySummary>;
    dayAccentByDay: Record<string, string>;
    dateMemosByDay: Record<string, AgendaDateMemoItem[]>;
    loadedDayKeys: Set<string>;
    isLoading: boolean;
    selectedDay: string;
    onSelectDay: (payload: MonthDaySelection) => void;
    hideWeekdayLetters?: boolean;
    hideSelectedWeekNumbers?: boolean;
}) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const monthCells = buildMonthCells(year, month);
    const today = formatDateKey(new Date());
    const selectedDate = parseDateKey(selectedDay);
    const selectedWeekIndex =
        selectedDate.getFullYear() === year && selectedDate.getMonth() === month
            ? getWeekIndexInMonth(selectedDate)
            : null;

    return (
        <View className="bg-background" style={{ height: MONTH_ITEM_HEIGHT }}>
            <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
                <Text className="text-foreground" style={{ fontSize: 58, lineHeight: 62, fontWeight: '800' }}>
                    {monthDate.toLocaleDateString(undefined, { month: 'long' })}
                </Text>
            </View>

            <View className="border-border bg-card border-t py-1.5">
                <WeekdayLettersRow hideLetters={hideWeekdayLetters} />
            </View>

            <View className="flex-1">
                {Array.from({ length: 6 }).map((_, weekIndex) => (
                    <View
                        key={`week-row-${year}-${month}-${weekIndex}`}
                        style={{
                            flexDirection: 'row',
                            borderTopWidth: 1,
                            borderTopColor: APPLE_LINE,
                            height: 84,
                        }}
                    >
                        {Array.from({ length: 7 }).map((__, dayOffset) => {
                            const cell = monthCells[weekIndex * 7 + dayOffset];

                            if (!cell) {
                                return <View key={`month-empty-${year}-${month}-${weekIndex}-${dayOffset}`} style={{ width: '14.2857%' }} />;
                            }

                            const isCellLoading = isLoading || !loadedDayKeys.has(cell.dayKey);
                            const dayEvents = isCellLoading
                                ? []
                                : events
                                    .filter((event) => event.vm.day === cell.dayKey)
                                    .sort((a, b) => a.start.getTime() - b.start.getTime());
                            const daySummary = isCellLoading ? undefined : daySummaries[cell.dayKey];
                            const dayMemos = isCellLoading ? [] : (dateMemosByDay[cell.dayKey] ?? []);
                            const isToday = cell.dayKey === today;
                            const hideCellNumber =
                                hideSelectedWeekNumbers &&
                                selectedWeekIndex !== null &&
                                weekIndex === selectedWeekIndex;

                            return (
                                <TouchableOpacity
                                    key={cell.dayKey}
                                    onPress={() =>
                                        onSelectDay({
                                            day: cell.dayKey,
                                            weekIndex,
                                        })
                                    }
                                    activeOpacity={0.82}
                                    style={{
                                        width: '14.2857%',
                                        paddingHorizontal: 4,
                                        paddingVertical: 4,
                                    }}
                                >
                                    {isCellLoading ? (
                                        <View style={{ gap: 6 }}>
                                            <View
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 999,
                                                    backgroundColor: APPLE_NEUTRAL_TILE,
                                                }}
                                            />
                                            <View
                                                style={{
                                                    width: '88%',
                                                    height: 10,
                                                    borderRadius: 999,
                                                    backgroundColor: APPLE_NEUTRAL_TILE,
                                                }}
                                            />
                                        </View>
                                    ) : (
                                        <>
                                            <View
                                                style={
                                                    isToday
                                                        ? {
                                                            width: 38,
                                                            height: 38,
                                                            borderRadius: 999,
                                                            backgroundColor: APPLE_TODAY,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginBottom: 3,
                                                            opacity: hideCellNumber ? 0 : 1,
                                                        }
                                                        : {
                                                            width: 38,
                                                            height: 38,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginBottom: 3,
                                                            opacity: hideCellNumber ? 0 : 1,
                                                        }
                                                }
                                            >
                                                <Text style={{ fontSize: 16, fontWeight: '600', color: isToday ? APPLE_SELECTED_TEXT : APPLE_TEXT }}>
                                                    {cell.dayOfMonth}
                                                </Text>
                                            </View>

                                            <View style={{ opacity: hideCellNumber ? 0 : 1 }}>
                                                <MonthDayIndicator
                                                    dayEvents={dayEvents}
                                                    dayMemos={dayMemos}
                                                    daySummary={daySummary}
                                                    dayAccent={dayAccentByDay[cell.dayKey]}
                                                />
                                            </View>
                                        </>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
}

function MonthVerticalScroller({
    anchorDate,
    selectedDay,
    events,
    daySummaries,
    dayAccentByDay,
    dateMemosByDay,
    loadedDayKeys,
    isLoading,
    onSelectDay,
    onAnchorDateChange,
    hideWeekdayLetters = false,
}: {
    anchorDate: Date;
    selectedDay: string;
    events: AgendaCalendarEvent[];
    daySummaries: Record<string, AgendaDaySummary>;
    dayAccentByDay: Record<string, string>;
    dateMemosByDay: Record<string, AgendaDateMemoItem[]>;
    loadedDayKeys: Set<string>;
    isLoading: boolean;
    onSelectDay: (day: string) => void;
    onAnchorDateChange: (date: Date) => void;
    hideWeekdayLetters?: boolean;
}) {
    const listRef = useRef<FlatList<MonthItem>>(null);
    const [months, setMonths] = useState(() =>
        buildMonthRange(startOfMonth(anchorDate), MONTH_INITIAL_RANGE_BEFORE, MONTH_INITIAL_RANGE_AFTER),
    );
    const monthIndexById = useMemo(() => {
        const lookup = new Map<string, number>();
        months.forEach((item, index) => {
            lookup.set(item.id, index);
        });
        return lookup;
    }, [months]);
    const initialScrollIndex = Math.max(0, monthIndexById.get(getMonthId(anchorDate)) ?? MONTH_INITIAL_RANGE_BEFORE);
    const didMountRef = useRef(false);
    const currentVisibleIndexRef = useRef(initialScrollIndex);
    const isUserInteractingRef = useRef(false);
    const pendingPrependCountRef = useRef(0);
    const lastScrollOffsetRef = useRef(initialScrollIndex * MONTH_ITEM_HEIGHT);
    const edgeTriggerStateRef = useRef({
        canExtendBefore: true,
        canExtendAfter: true,
    });

    const extendBefore = () => {
        setMonths((prev) => {
            const firstMonth = prev[0]?.date;
            if (!firstMonth) {
                return prev;
            }

            const added: MonthItem[] = [];
            for (let offset = MONTH_EXTENSION_CHUNK; offset >= 1; offset -= 1) {
                added.push(makeMonthItem(addMonths(firstMonth, -offset)));
            }

            pendingPrependCountRef.current += added.length;
            return [...added, ...prev];
        });
    };

    const extendAfter = () => {
        setMonths((prev) => {
            const lastMonth = prev[prev.length - 1]?.date;
            if (!lastMonth) {
                return prev;
            }

            const added: MonthItem[] = [];
            for (let offset = 1; offset <= MONTH_EXTENSION_CHUNK; offset += 1) {
                added.push(makeMonthItem(addMonths(lastMonth, offset)));
            }

            return [...prev, ...added];
        });
    };

    useEffect(() => {
        if (pendingPrependCountRef.current <= 0) {
            return;
        }

        const addedCount = pendingPrependCountRef.current;
        pendingPrependCountRef.current = 0;
        lastScrollOffsetRef.current += addedCount * MONTH_ITEM_HEIGHT;
        currentVisibleIndexRef.current = Math.max(0, Math.round(lastScrollOffsetRef.current / MONTH_ITEM_HEIGHT));
        const nextOffset = lastScrollOffsetRef.current;
        const frame = setTimeout(() => {
            listRef.current?.scrollToOffset({
                offset: nextOffset,
                animated: false,
            });
        }, 0);

        return () => clearTimeout(frame);
    }, [months.length]);

    const maybeExtendForIndex = (index: number) => {
        if (index <= MONTH_EDGE_BUFFER) {
            if (edgeTriggerStateRef.current.canExtendBefore) {
                edgeTriggerStateRef.current.canExtendBefore = false;
                extendBefore();
            }
        } else {
            edgeTriggerStateRef.current.canExtendBefore = true;
        }

        if (index >= months.length - 1 - MONTH_EDGE_BUFFER) {
            if (edgeTriggerStateRef.current.canExtendAfter) {
                edgeTriggerStateRef.current.canExtendAfter = false;
                extendAfter();
            }
        } else {
            edgeTriggerStateRef.current.canExtendAfter = true;
        }
    };

    const commitVisibleMonthFromOffset = (offsetY: number) => {
        lastScrollOffsetRef.current = offsetY;
        const rawIndex = Math.floor((offsetY + MONTH_ITEM_HEIGHT * 0.5) / MONTH_ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(rawIndex, months.length - 1));

        if (clampedIndex !== currentVisibleIndexRef.current) {
            currentVisibleIndexRef.current = clampedIndex;
            const nextMonth = months[clampedIndex];
            if (nextMonth) {
                onAnchorDateChange(nextMonth.date);
            }
        }

        maybeExtendForIndex(clampedIndex);
    };

    useEffect(() => {
        const monthId = getMonthId(anchorDate);
        const targetIndex = monthIndexById.get(monthId);
        if (typeof targetIndex !== 'number') {
            const rebasedMonths = buildMonthRange(
                startOfMonth(anchorDate),
                MONTH_INITIAL_RANGE_BEFORE,
                MONTH_INITIAL_RANGE_AFTER,
            );

            setMonths(rebasedMonths);
            const rebasedIndex = Math.max(0, rebasedMonths.findIndex((item) => item.id === monthId));
            currentVisibleIndexRef.current = rebasedIndex;
            lastScrollOffsetRef.current = rebasedIndex * MONTH_ITEM_HEIGHT;

            const frame = setTimeout(() => {
                listRef.current?.scrollToIndex({
                    index: rebasedIndex,
                    animated: false,
                    viewPosition: 0,
                });
            }, 0);

            return () => clearTimeout(frame);
        }

        maybeExtendForIndex(targetIndex);

        if (!didMountRef.current) {
            didMountRef.current = true;
            currentVisibleIndexRef.current = targetIndex;
            lastScrollOffsetRef.current = targetIndex * MONTH_ITEM_HEIGHT;
            return;
        }

        if (targetIndex === currentVisibleIndexRef.current || isUserInteractingRef.current) {
            return;
        }

        const frame = setTimeout(() => {
            listRef.current?.scrollToIndex({
                index: targetIndex,
                animated: true,
                viewPosition: 0,
            });
            currentVisibleIndexRef.current = targetIndex;
            lastScrollOffsetRef.current = targetIndex * MONTH_ITEM_HEIGHT;
        }, 0);

        return () => clearTimeout(frame);
    }, [anchorDate, monthIndexById, months.length]);

    return (
        <FlatList
            ref={listRef}
            data={months}
            initialScrollIndex={initialScrollIndex}
            bounces
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            windowSize={MONTH_LIST_WINDOW_SIZE}
            initialNumToRender={MONTH_LIST_INITIAL_RENDER}
            maxToRenderPerBatch={MONTH_LIST_MAX_BATCH}
            updateCellsBatchingPeriod={80}
            getItemLayout={(_, index) => ({ length: MONTH_ITEM_HEIGHT, offset: MONTH_ITEM_HEIGHT * index, index })}
            keyExtractor={(item) => item.id}
            onScrollBeginDrag={() => {
                isUserInteractingRef.current = true;
            }}
            onScroll={(event) => {
                const offsetY = event.nativeEvent.contentOffset.y;
                lastScrollOffsetRef.current = offsetY;

                if (isUserInteractingRef.current) {
                    commitVisibleMonthFromOffset(offsetY);
                }
            }}
            scrollEventThrottle={16}
            onScrollEndDrag={(event) => {
                const velocity = event.nativeEvent.velocity?.y ?? 0;
                if (Math.abs(velocity) < 0.05) {
                    isUserInteractingRef.current = false;
                    commitVisibleMonthFromOffset(event.nativeEvent.contentOffset.y);
                }
            }}
            onMomentumScrollBegin={() => {
                isUserInteractingRef.current = true;
            }}
            onMomentumScrollEnd={(event) => {
                isUserInteractingRef.current = false;
                commitVisibleMonthFromOffset(event.nativeEvent.contentOffset.y);
            }}
            onScrollToIndexFailed={({ index }) => {
                const clamped = Math.max(0, Math.min(index, months.length - 1));
                setTimeout(() => {
                    const fallbackOffset = clamped * MONTH_ITEM_HEIGHT;
                    lastScrollOffsetRef.current = fallbackOffset;
                    listRef.current?.scrollToOffset({ offset: fallbackOffset, animated: false });
                }, 20);
            }}
            renderItem={({ item }) => (
                <MonthSection
                    monthDate={item.date}
                    events={events}
                    daySummaries={daySummaries}
                    dayAccentByDay={dayAccentByDay}
                    dateMemosByDay={dateMemosByDay}
                    loadedDayKeys={loadedDayKeys}
                    isLoading={isLoading}
                    selectedDay={selectedDay}
                    onSelectDay={({ day }) => {
                        onSelectDay(day);
                    }}
                    hideWeekdayLetters={hideWeekdayLetters}
                    hideSelectedWeekNumbers={hideWeekdayLetters}
                />
            )}
        />
    );
}

function YearMonthMini({
    year,
    monthIndex,
    selectedDay,
    onSelectDay,
}: {
    year: number;
    monthIndex: number;
    selectedDay: string;
    onSelectDay: (day: string) => void;
}) {
    const monthDate = new Date(year, monthIndex, 1);
    const monthLabel = monthDate.toLocaleDateString(undefined, { month: 'short' });
    const cells = buildMonthCells(year, monthIndex);
    const today = formatDateKey(new Date());

    return (
        <View style={{ width: '33.3333%', paddingHorizontal: 6, paddingVertical: 6 }}>
            <Text className="text-foreground" style={{ fontSize: 19, fontWeight: '700', marginBottom: 4 }}>
                {monthLabel}
            </Text>

            <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                {WEEKDAY_LETTERS.map((label, idx) => (
                    <View key={`mini-dow-${year}-${monthIndex}-${idx}`} style={{ width: '14.2857%', alignItems: 'center' }}>
                        <Text className="text-muted-foreground" style={{ fontSize: 8, fontWeight: '600' }}>
                            {label}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {cells.map((cell, index) => {
                    if (!cell) {
                        return <View key={`mini-empty-${year}-${monthIndex}-${index}`} style={{ width: '14.2857%', height: 18 }} />;
                    }

                    const isToday = cell.dayKey === today;
                    const isSelected = selectedDay === cell.dayKey;
                    const isEmphasized = isToday || isSelected;
                    const backgroundColor = isToday ? APPLE_TODAY : APPLE_NEUTRAL_TILE;

                    return (
                        <Pressable
                            key={`mini-day-${cell.dayKey}`}
                            onPress={() => onSelectDay(cell.dayKey)}
                            style={{
                                width: '14.2857%',
                                height: 18,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 999,
                                backgroundColor: isEmphasized ? backgroundColor : 'transparent',
                            }}
                        >
                            <Text style={{ fontSize: 8, color: isToday ? APPLE_SELECTED_TEXT : APPLE_TEXT, fontWeight: '600' }}>
                                {cell.dayOfMonth}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

function YearSection({
    year,
    selectedDay,
    onSelectDay,
}: {
    year: number;
    selectedDay: string;
    onSelectDay: (day: string) => void;
}) {
    return (
        <View className="bg-background" style={{ height: YEAR_ITEM_HEIGHT }}>
            <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 }}>
                <Text style={{ fontSize: 68, lineHeight: 72, color: APPLE_TODAY, fontWeight: '700' }}>{year}</Text>
            </View>

            <View className="border-border border-t" style={{ paddingTop: 8, paddingHorizontal: 8 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {Array.from({ length: 12 }).map((_, monthIndex) => (
                        <YearMonthMini
                            key={`year-month-${year}-${monthIndex}`}
                            year={year}
                            monthIndex={monthIndex}
                            selectedDay={selectedDay}
                            onSelectDay={onSelectDay}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
}

function YearVerticalScroller({
    anchorDate,
    selectedDay,
    onSelectDay,
}: {
    anchorDate: Date;
    selectedDay: string;
    onSelectDay: (day: string) => void;
}) {
    const anchorYear = anchorDate.getFullYear();
    const listRef = useRef<FlatList<YearItem>>(null);
    const [years, setYears] = useState(() =>
        buildYearRange(anchorYear, YEAR_INITIAL_RANGE_BEFORE, YEAR_INITIAL_RANGE_AFTER),
    );
    const yearIndexByValue = useMemo(() => {
        const lookup = new Map<number, number>();
        years.forEach((item, index) => {
            lookup.set(item.year, index);
        });
        return lookup;
    }, [years]);
    const initialScrollIndex = Math.max(0, yearIndexByValue.get(anchorYear) ?? YEAR_INITIAL_RANGE_BEFORE);
    const didMountRef = useRef(false);
    const currentVisibleIndexRef = useRef(initialScrollIndex);
    const isUserInteractingRef = useRef(false);
    const pendingPrependCountRef = useRef(0);
    const lastScrollOffsetRef = useRef(initialScrollIndex * YEAR_ITEM_HEIGHT);
    const edgeTriggerStateRef = useRef({
        canExtendBefore: true,
        canExtendAfter: true,
    });

    const extendBefore = () => {
        setYears((prev) => {
            const firstYear = prev[0]?.year;
            if (typeof firstYear !== 'number') {
                return prev;
            }

            const added: YearItem[] = [];
            for (let offset = YEAR_EXTENSION_CHUNK; offset >= 1; offset -= 1) {
                added.push(makeYearItem(firstYear - offset));
            }

            pendingPrependCountRef.current += added.length;
            return [...added, ...prev];
        });
    };

    const extendAfter = () => {
        setYears((prev) => {
            const lastYear = prev[prev.length - 1]?.year;
            if (typeof lastYear !== 'number') {
                return prev;
            }

            const added: YearItem[] = [];
            for (let offset = 1; offset <= YEAR_EXTENSION_CHUNK; offset += 1) {
                added.push(makeYearItem(lastYear + offset));
            }

            return [...prev, ...added];
        });
    };

    useEffect(() => {
        if (pendingPrependCountRef.current <= 0) {
            return;
        }

        const addedCount = pendingPrependCountRef.current;
        pendingPrependCountRef.current = 0;
        lastScrollOffsetRef.current += addedCount * YEAR_ITEM_HEIGHT;
        currentVisibleIndexRef.current = Math.max(0, Math.round(lastScrollOffsetRef.current / YEAR_ITEM_HEIGHT));
        const nextOffset = lastScrollOffsetRef.current;
        const frame = setTimeout(() => {
            listRef.current?.scrollToOffset({
                offset: nextOffset,
                animated: false,
            });
        }, 0);

        return () => clearTimeout(frame);
    }, [years.length]);

    const maybeExtendForIndex = (index: number) => {
        if (index <= YEAR_EDGE_BUFFER) {
            if (edgeTriggerStateRef.current.canExtendBefore) {
                edgeTriggerStateRef.current.canExtendBefore = false;
                extendBefore();
            }
        } else {
            edgeTriggerStateRef.current.canExtendBefore = true;
        }

        if (index >= years.length - 1 - YEAR_EDGE_BUFFER) {
            if (edgeTriggerStateRef.current.canExtendAfter) {
                edgeTriggerStateRef.current.canExtendAfter = false;
                extendAfter();
            }
        } else {
            edgeTriggerStateRef.current.canExtendAfter = true;
        }
    };

    const commitVisibleYearFromOffset = (offsetY: number) => {
        lastScrollOffsetRef.current = offsetY;
        const rawIndex = Math.floor((offsetY + YEAR_ITEM_HEIGHT * 0.5) / YEAR_ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(rawIndex, years.length - 1));
        currentVisibleIndexRef.current = clampedIndex;
        maybeExtendForIndex(clampedIndex);
    };

    useEffect(() => {
        const targetIndex = yearIndexByValue.get(anchorYear);
        if (typeof targetIndex !== 'number') {
            const rebasedYears = buildYearRange(anchorYear, YEAR_INITIAL_RANGE_BEFORE, YEAR_INITIAL_RANGE_AFTER);
            setYears(rebasedYears);
            const rebasedIndex = Math.max(0, rebasedYears.findIndex((item) => item.year === anchorYear));
            currentVisibleIndexRef.current = rebasedIndex;
            lastScrollOffsetRef.current = rebasedIndex * YEAR_ITEM_HEIGHT;

            const frame = setTimeout(() => {
                listRef.current?.scrollToIndex({
                    index: rebasedIndex,
                    animated: false,
                    viewPosition: 0,
                });
            }, 0);

            return () => clearTimeout(frame);
        }

        maybeExtendForIndex(targetIndex);

        if (!didMountRef.current) {
            didMountRef.current = true;
            currentVisibleIndexRef.current = targetIndex;
            lastScrollOffsetRef.current = targetIndex * YEAR_ITEM_HEIGHT;
            return;
        }

        if (targetIndex === currentVisibleIndexRef.current || isUserInteractingRef.current) {
            return;
        }

        const frame = setTimeout(() => {
            listRef.current?.scrollToIndex({
                index: targetIndex,
                animated: true,
                viewPosition: 0,
            });
            currentVisibleIndexRef.current = targetIndex;
            lastScrollOffsetRef.current = targetIndex * YEAR_ITEM_HEIGHT;
        }, 0);

        return () => clearTimeout(frame);
    }, [anchorYear, yearIndexByValue, years.length]);

    return (
        <FlatList
            ref={listRef}
            data={years}
            initialScrollIndex={initialScrollIndex}
            bounces
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            windowSize={YEAR_LIST_WINDOW_SIZE}
            initialNumToRender={YEAR_LIST_INITIAL_RENDER}
            maxToRenderPerBatch={YEAR_LIST_MAX_BATCH}
            updateCellsBatchingPeriod={80}
            getItemLayout={(_, index) => ({ length: YEAR_ITEM_HEIGHT, offset: YEAR_ITEM_HEIGHT * index, index })}
            keyExtractor={(item) => item.id}
            onScrollBeginDrag={() => {
                isUserInteractingRef.current = true;
            }}
            onScroll={(event) => {
                lastScrollOffsetRef.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            onScrollEndDrag={(event) => {
                const velocity = event.nativeEvent.velocity?.y ?? 0;
                if (Math.abs(velocity) < 0.05) {
                    isUserInteractingRef.current = false;
                    commitVisibleYearFromOffset(event.nativeEvent.contentOffset.y);
                }
            }}
            onMomentumScrollBegin={() => {
                isUserInteractingRef.current = true;
            }}
            onMomentumScrollEnd={(event) => {
                isUserInteractingRef.current = false;
                commitVisibleYearFromOffset(event.nativeEvent.contentOffset.y);
            }}
            onScrollToIndexFailed={({ index }) => {
                const clamped = Math.max(0, Math.min(index, years.length - 1));
                setTimeout(() => {
                    const fallbackOffset = clamped * YEAR_ITEM_HEIGHT;
                    lastScrollOffsetRef.current = fallbackOffset;
                    listRef.current?.scrollToOffset({ offset: fallbackOffset, animated: false });
                }, 20);
            }}
            renderItem={({ item }) => (
                <YearSection
                    year={item.year}
                    selectedDay={selectedDay}
                    onSelectDay={onSelectDay}
                />
            )}
        />
    );
}

function FallbackAgendaList({
    events,
    visibleDays,
    onPressEvent,
}: {
    events: AgendaCalendarEvent[];
    visibleDays: string[];
    onPressEvent: (event: AgendaCalendarEvent) => void;
}) {
    return (
        <ScrollView className="bg-background flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
            <View style={{ paddingHorizontal: 14, paddingTop: 8 }}>
                <View
                    className="border-border bg-card border"
                    style={{
                        marginBottom: 12,
                        borderRadius: 14,
                        borderWidth: 1,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                    }}
                >
                    <Text className="text-foreground" style={{ fontSize: 14, fontWeight: '600' }}>
                        iOS-first agenda experience
                    </Text>
                    <Text className="text-muted-foreground" style={{ fontSize: 12, marginTop: 2 }}>
                        This platform currently uses a read-only fallback list.
                    </Text>
                </View>

                {visibleDays.map((day) => {
                    const dayEvents = events
                        .filter((event) => event.vm.day === day)
                        .sort((a, b) => a.start.getTime() - b.start.getTime());

                    return (
                        <View key={`fallback-day-${day}`} style={{ marginBottom: 14 }}>
                            <Text className="text-foreground" style={{ marginBottom: 6, fontSize: 16, fontWeight: '700' }}>
                                {day}
                            </Text>
                            {dayEvents.length === 0 ? (
                                <Text className="text-muted-foreground" style={{ fontSize: 13 }}>
                                    No events.
                                </Text>
                            ) : (
                                <View style={{ gap: 8 }}>
                                    {dayEvents.map((event) => (
                                        <Pressable
                                            key={`fallback-event-${event.id}`}
                                            className="border-border bg-card border"
                                            style={{
                                                borderRadius: 12,
                                                borderWidth: 1,
                                                paddingHorizontal: 12,
                                                paddingVertical: 10,
                                            }}
                                            onPress={() => onPressEvent(event)}
                                        >
                                            <Text className="text-foreground" style={{ fontSize: 14, fontWeight: '600' }}>
                                                {event.vm.title}
                                            </Text>
                                            <Text className="text-muted-foreground" style={{ fontSize: 12 }}>
                                                {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                                                {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                            {event.vm.serviceName ? (
                                                <Text className="text-muted-foreground" style={{ fontSize: 12 }}>
                                                    {event.vm.serviceName}
                                                </Text>
                                            ) : null}
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

export function AgendaV2Renderer({
    rendererPlatform,
    view,
    anchorDate,
    selectedDayKey,
    minHour,
    maxHour,
    events,
    daySummaries,
    dayAccentByDay,
    dateMemos,
    visibleDays,
    isMonthLoading = false,
    viewport,
    onPressCell,
    onPressEvent,
    onSelectDay,
    onDrillDown,
    onAnchorDateChange,
    daySwipePreviewDayKey = null,
    onDaySwipePreviewDayKeyChange,
    onVisibleRangeChange,
}: AgendaV2RendererProps) {
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
    const colors = useThemeColors();
    APPLE_BG = colors['--color-background'];
    APPLE_SURFACE = colors['--color-surface'] ?? colors['--color-card'] ?? colors['--color-background'];
    APPLE_TEXT = colors['--color-foreground'];
    APPLE_MUTED = colors['--color-muted-foreground'];
    APPLE_LINE = colors['--color-border'];
    APPLE_TODAY = colors['--color-primary'] ?? colors['--color-foreground'];
    APPLE_SELECTED = colors['--color-selection'] ?? colors['--color-foreground'];
    APPLE_SELECTED_TEXT = colors['--color-selection-foreground'] ?? colors['--color-background'];
    APPLE_NEUTRAL_TILE = colors['--color-muted'] ?? colors['--color-border'] ?? colors['--color-background'];

    const canvasLevel = getCanvasLevelFromView(view);
    const previousCanvasLevelRef = useRef<AgendaCanvasLevel>(canvasLevel);
    const transitionProgress = useSharedValue(1);
    const transitionDirection = useSharedValue<1 | -1>(1);
    const transitionScaleDelta = useSharedValue(VIEW_TRANSITION_SCALE_DELTA);
    const transitionVerticalTravel = useSharedValue(VIEW_TRANSITION_VERTICAL_TRAVEL);

    const dateMemosByDay = useMemo(() => {
        const byDay: Record<string, AgendaDateMemoItem[]> = {};

        for (const memo of dateMemos) {
            if (!byDay[memo.date]) {
                byDay[memo.date] = [];
            }

            byDay[memo.date]!.push(memo);
        }

        return byDay;
    }, [dateMemos]);
    const loadedDayKeys = useMemo(() => new Set(visibleDays), [visibleDays]);

    useEffect(() => {
        if (!onVisibleRangeChange) {
            return;
        }

        const anchorDay = formatDateKey(anchorDate);

        if (canvasLevel === 'day') {
            onVisibleRangeChange({
                level: canvasLevel,
                anchorDay,
                startDay: anchorDay,
                endDay: anchorDay,
            });
            return;
        }

        if (canvasLevel === 'month') {
            onVisibleRangeChange({
                level: canvasLevel,
                anchorDay,
                startDay: formatDateKey(startOfMonth(anchorDate)),
                endDay: formatDateKey(endOfMonth(anchorDate)),
            });
            return;
        }

        onVisibleRangeChange({
            level: canvasLevel,
            anchorDay,
            startDay: formatDateKey(startOfYear(anchorDate)),
            endDay: formatDateKey(endOfYear(anchorDate)),
        });
    }, [anchorDate, canvasLevel, onVisibleRangeChange]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            setAppState(nextState);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        if (rendererPlatform !== 'ios-native') {
            previousCanvasLevelRef.current = canvasLevel;
            transitionProgress.value = 1;
            return;
        }

        const previousLevel = previousCanvasLevelRef.current;
        if (previousLevel === canvasLevel) {
            return;
        }

        const isZoomIn = getCanvasLevelWeight(canvasLevel) < getCanvasLevelWeight(previousLevel);
        const isYearMonth =
            (previousLevel === 'year' && canvasLevel === 'month') ||
            (previousLevel === 'month' && canvasLevel === 'year');
        transitionDirection.value = isZoomIn ? 1 : -1;
        transitionScaleDelta.value = isYearMonth ? 0.22 : VIEW_TRANSITION_SCALE_DELTA;
        transitionVerticalTravel.value = isYearMonth ? 44 : VIEW_TRANSITION_VERTICAL_TRAVEL;

        transitionProgress.value = 0;
        transitionProgress.value = withTiming(
            1,
            {
                duration: 260,
                easing: Easing.out(Easing.cubic),
            },
            undefined,
        );
        previousCanvasLevelRef.current = canvasLevel;
    }, [canvasLevel, rendererPlatform, transitionDirection, transitionProgress, transitionScaleDelta, transitionVerticalTravel]);

    useEffect(() => {
        return () => {
            transitionProgress.value = 1;
        };
    }, [transitionProgress]);

    const canvasTransitionStyle = useAnimatedStyle(() => {
        const progress = transitionProgress.value;
        const scaleDelta = transitionScaleDelta.value;
        const verticalTravel = transitionVerticalTravel.value;
        const startScale = transitionDirection.value === 1 ? 1 - scaleDelta : 1 + scaleDelta;
        const startTranslateY = transitionDirection.value === 1 ? verticalTravel : -verticalTravel;

        return {
            opacity: 0.82 + 0.18 * progress,
            transform: [
                { perspective: 1000 },
                { scale: startScale + (1 - startScale) * progress },
                { translateY: startTranslateY * (1 - progress) },
            ],
        };
    });

    const renderCanvas = useCallback(({
        level,
        anchor,
        selectedDay,
    }: {
        level: AgendaCanvasLevel;
        anchor: Date;
        selectedDay: string;
    }) => {
        if (level === 'day') {
            return (
                <DayHorizontalPager
                    anchorDate={anchor}
                    events={events}
                    minHour={minHour}
                    maxHour={maxHour}
                    dateMemosByDay={dateMemosByDay}
                    onPressCell={onPressCell}
                    onPressEvent={onPressEvent}
                    onAnchorDateChange={onAnchorDateChange}
                    daySwipePreviewDayKey={daySwipePreviewDayKey}
                    onDaySwipePreviewDayKeyChange={onDaySwipePreviewDayKeyChange}
                    viewport={viewport}
                />
            );
        }

        if (level === 'month') {
            return (
                <MonthVerticalScroller
                    anchorDate={anchor}
                    selectedDay={selectedDay}
                    events={events}
                    daySummaries={daySummaries}
                    dayAccentByDay={dayAccentByDay}
                    dateMemosByDay={dateMemosByDay}
                    loadedDayKeys={loadedDayKeys}
                    isLoading={isMonthLoading}
                    onSelectDay={(day) => {
                        onDrillDown({
                            day,
                            from: 'month',
                        });
                    }}
                    onAnchorDateChange={onAnchorDateChange}
                />
            );
        }

        if (appState !== 'active') {
            return <View className="bg-background flex-1" />;
        }

        return (
            <YearVerticalScroller
                anchorDate={anchor}
                selectedDay={selectedDay}
                onSelectDay={(day) => {
                    onDrillDown({
                        day,
                        from: 'year',
                    });
                }}
            />
        );
    }, [
        appState,
        dateMemosByDay,
        dayAccentByDay,
        daySummaries,
        events,
        isMonthLoading,
        loadedDayKeys,
        maxHour,
        minHour,
        onAnchorDateChange,
        onDaySwipePreviewDayKeyChange,
        onPressCell,
        onPressEvent,
        onDrillDown,
        onSelectDay,
        daySwipePreviewDayKey,
        viewport,
    ]);

    if (rendererPlatform === 'fallback-list') {
        return <FallbackAgendaList events={events} visibleDays={visibleDays} onPressEvent={onPressEvent} />;
    }

    return (
        <View className="bg-background flex-1">
            <Animated.View style={[StyleSheet.absoluteFillObject, canvasTransitionStyle]}>
                {renderCanvas({
                    level: canvasLevel,
                    anchor: anchorDate,
                    selectedDay: selectedDayKey,
                })}
            </Animated.View>
        </View>
    );
}
