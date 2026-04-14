import {
    ActionSheetSelect,
    ActionSheetSelectContent,
    ActionSheetSelectItem,
    ActionSheetSelectTrigger,
    ActionSheetSelectValue,
} from '@kit/native-ui/action-sheet-select';
import { ActionSheet, ActionSheetContent } from '@kit/native-ui/action-sheet';
import { Button } from '@kit/native-ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@kit/native-ui/empty';
import { useThemeColors } from '@kit/native-ui/hooks/use-theme-colors';
import { Icon } from '@kit/native-ui/icon';
import { Input } from '@kit/native-ui/input';
import { Header } from '@kit/native-ui/layout/header';
import { Skeleton } from '@kit/native-ui/skeleton';
import { toast } from '@kit/native-ui/sonner';
import { Text } from '@kit/native-ui/text';
import { Textarea } from '@kit/native-ui/textarea';
import { useOrganization } from '@kit/organization/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    buildAgendaViewModel,
    type AgendaEventVM,
    type AgendaMode,
    type AgendaSlot,
    type AgendaView,
} from '@planoby/shared/lib/agenda-view-model';
import { BlurView } from 'expo-blur';
import { GlassView as RawGlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { router } from 'expo-router';
import {
    GlassEffectContainer,
    Host,
    HStack,
    Spacer as SwiftSpacer,
    Text as SwiftText,
    Button as IOSButton,
    Menu,
    VStack,
    Group,
    DisclosureGroup,
    List,
    Section,
    Picker,
    ControlGroup,
} from '@expo/ui/swift-ui';
import { frame, glassEffect, opacity, buttonStyle, shadow, tint, padding, foregroundStyle, pickerStyle, tag, labelStyle, controlSize, clipped } from '@expo/ui/swift-ui/modifiers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Animated as RNAnimated,
    Easing as RNEasing,
    Platform,
    ScrollView,
    StyleSheet, Pressable,
    TouchableOpacity,
    type StyleProp,
    View,
    type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgendaV2Renderer } from '~/components/agenda/agenda-renderers-v1';
import { clientTrpc } from '~/utils/trpc-client';
import { NativeButton } from '@kit/native-ui/native-button';
import { withUniwind } from 'uniwind';

const GlassView = withUniwind(RawGlassView);

type AgendaInitData = Awaited<ReturnType<typeof clientTrpc.agendaInit.fetch>>;
type AgendaFindForDaysData = Awaited<ReturnType<typeof clientTrpc.agendaFindForDays.fetch>>;
type AgendaDateMemosData = Awaited<ReturnType<typeof clientTrpc.agendaFindDateMemos.fetch>>;
type BookingFindByOrganizationData = Awaited<ReturnType<typeof clientTrpc.bookingFindByOrganization.fetch>>;
type AgendaDateMemo = AgendaDateMemosData['dateMemos'][number];
type UnslottedBookingRow = BookingFindByOrganizationData['data'][number];

type TeamMode = 'personal' | 'team';
type SlotEditorMode = 'create' | 'edit';
type SlotState = 'confirmed' | 'requested';
type AgendaRendererPlatform = 'ios-native' | 'fallback-list';

type AgendaViewportState = {
    scrollAnchorHour: number;
    zoomDensity: 'compact' | 'regular' | 'comfortable';
};

type AgendaTabTarget = {
    key: 'agenda' | 'bookings' | 'services' | 'profile';
    label: string;
    href: '/(app)/(tabs)/agenda' | '/(app)/(tabs)/bookings' | '/(app)/(tabs)/services' | '/(app)/(tabs)/profile';
};

type SlotDraft = {
    slotId: string | null;
    date: string;
    start: string;
    end: string;
    serviceId: string;
    organizationMemberId: string;
    customLabel: string;
    privateComment: string;
    customColor: string;
    maxParticipant: string;
    state: SlotState;
    visible: boolean;
    frequency: 'once' | 'day' | 'week' | 'month' | 'year';
    metaFrequency: string;
};

type DateMemoDraft = {
    memoId: string | null;
    date: string;
    content: string;
    color: string;
};

interface AgendaCalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    vm: AgendaEventVM;
}

const ACTION_SHEET_NONE_VALUE = '__none__';
const AGENDA_VIEW_OPTIONS = ['day', 'month', 'year'] as const;
const MONTH_FETCH_RADIUS = 1;
const AGENDA_TAB_TARGETS: AgendaTabTarget[] = [
    {
        key: 'agenda',
        label: 'Agenda',
        href: '/(app)/(tabs)/agenda',
    },
    {
        key: 'bookings',
        label: 'Bookings',
        href: '/(app)/(tabs)/bookings',
    },
    {
        key: 'services',
        label: 'Services',
        href: '/(app)/(tabs)/services',
    },
    {
        key: 'profile',
        label: 'Profile',
        href: '/(app)/(tabs)/profile',
    },
];

function FadingPeriodTitle({
    title,
    color,
}: {
    title: string;
    color: string;
}) {
    const [displayTitle, setDisplayTitle] = useState(title);
    const [incomingTitle, setIncomingTitle] = useState<string | null>(null);
    const outgoingOpacity = React.useRef(new RNAnimated.Value(1)).current;
    const incomingOpacity = React.useRef(new RNAnimated.Value(0)).current;

    useEffect(() => {
        if (title === displayTitle) {
            return;
        }

        setIncomingTitle(title);
        outgoingOpacity.stopAnimation();
        incomingOpacity.stopAnimation();
        outgoingOpacity.setValue(1);
        incomingOpacity.setValue(0);

        const animation = RNAnimated.parallel([
            RNAnimated.timing(outgoingOpacity, {
                toValue: 0,
                duration: 140,
                easing: RNEasing.out(RNEasing.cubic),
                useNativeDriver: true,
            }),
            RNAnimated.timing(incomingOpacity, {
                toValue: 1,
                duration: 160,
                easing: RNEasing.out(RNEasing.cubic),
                useNativeDriver: true,
            }),
        ]);

        animation.start(({ finished }) => {
            if (finished) {
                setDisplayTitle(title);
                setIncomingTitle(null);
                outgoingOpacity.setValue(1);
                incomingOpacity.setValue(0);
            }
        });

        return () => animation.stop();
    }, [displayTitle, incomingOpacity, outgoingOpacity, title]);

    const baseTextStyle = {
        fontSize: 18,
        lineHeight: 20,
        fontWeight: '600' as const,
        color,
        marginVertical: 4,
        includeFontPadding: false,
    };

    return (
        <View style={{ minHeight: 28, justifyContent: 'center' }}>
            <RNAnimated.Text numberOfLines={1} style={[baseTextStyle, incomingTitle ? { opacity: outgoingOpacity } : null]}>
                {displayTitle}
            </RNAnimated.Text>

            {incomingTitle ? (
                <RNAnimated.Text
                    numberOfLines={1}
                    style={[
                        baseTextStyle,
                        {
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            opacity: incomingOpacity,
                        },
                    ]}
                >
                    {incomingTitle}
                </RNAnimated.Text>
            ) : null}
        </View>
    );
}

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

const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const monthEnd = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const yearStart = (date: Date) => new Date(date.getFullYear(), 0, 1);

const yearEnd = (date: Date) => new Date(date.getFullYear(), 11, 31);

const parseHour = (value: string, fallback: number) => {
    const [hRaw] = value.split(':');
    const h = Number(hRaw);
    if (!Number.isFinite(h)) {
        return fallback;
    }
    return Math.min(24, Math.max(0, h));
};

const toHHmm = (date: Date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
};

const padTime = (value: string) => {
    if (value.length === 8) return value.slice(0, 5);
    return value;
};

const shiftHHmm = (time: string, minuteDelta: number) => {
    const [hRaw, mRaw] = time.split(':');
    const seed = new Date();
    seed.setHours(Number(hRaw) || 0, Number(mRaw) || 0, 0, 0);
    seed.setMinutes(seed.getMinutes() + minuteDelta);
    return toHHmm(seed);
};

const parseSlotState = (value: unknown): SlotState => (value === 'requested' ? 'requested' : 'confirmed');

const toDraftFrequency = (value: unknown): SlotDraft['frequency'] => {
    if (value === 'day' || value === 'week' || value === 'month' || value === 'year') {
        return value;
    }

    return 'once';
};

const emptyToNull = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const slotToDraft = ({
    slot,
    day,
}: {
    slot: AgendaSlot;
    day: string;
}): SlotDraft => {
    const organizationMemberId =
        slot.companyMemberId ?? slot.organization_member?.id ?? slot.organizationMember?.id ?? ACTION_SHEET_NONE_VALUE;

    return {
        slotId: slot.id,
        date: day,
        start: padTime(slot.start),
        end: padTime(slot.end),
        serviceId: slot.serviceId ?? slot.service?.id ?? ACTION_SHEET_NONE_VALUE,
        organizationMemberId,
        customLabel: slot.customLabel ?? slot.custom_label ?? '',
        privateComment: slot.privateComment ?? slot.private_comment ?? '',
        customColor: slot.customColor ?? slot.custom_color ?? '',
        maxParticipant:
            typeof slot.maxParticipant === 'number'
                ? String(slot.maxParticipant)
                : typeof slot.max_participant === 'number'
                    ? String(slot.max_participant)
                    : '',
        state: parseSlotState(slot.state),
        visible: slot.visible !== false,
        frequency: toDraftFrequency(slot.frequency),
        metaFrequency: slot.metaFrequency ?? '',
    };
};

const defaultSlotDraft = ({
    date,
    start,
    end,
    serviceId,
    organizationMemberId,
}: {
    date: string;
    start: string;
    end: string;
    serviceId?: string;
    organizationMemberId?: string;
}): SlotDraft => ({
    slotId: null,
    date,
    start,
    end,
    serviceId: serviceId ?? ACTION_SHEET_NONE_VALUE,
    organizationMemberId: organizationMemberId ?? ACTION_SHEET_NONE_VALUE,
    customLabel: '',
    privateComment: '',
    customColor: '',
    maxParticipant: '',
    state: 'confirmed',
    visible: true,
    frequency: 'once',
    metaFrequency: '',
});

const getDaysForView = ({
    anchor,
    view,
}: {
    anchor: Date;
    view: AgendaView;
}) => {
    if (view === 'day' || view === 'week' || view === 'month') {
        const start = monthStart(new Date(anchor.getFullYear(), anchor.getMonth() - MONTH_FETCH_RADIUS, 1));
        const end = monthEnd(new Date(anchor.getFullYear(), anchor.getMonth() + MONTH_FETCH_RADIUS, 1));
        const days: string[] = [];

        for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
            days.push(formatDateKey(cursor));
        }

        return days;
    }

    const start = yearStart(anchor);
    const end = yearEnd(anchor);
    const days: string[] = [];

    for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
        days.push(formatDateKey(cursor));
    }

    return days;
};

function GlassCapsule({
    children,
    style,
}: {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}) {
    const colors = useThemeColors();
    const blurTint: 'light' | 'dark' = colors.isDark ? 'dark' : 'light';
    const capsuleStyle: StyleProp<ViewStyle> = [
        {
            borderRadius: 999,
            overflow: 'hidden',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors['--color-border'],
        },
        style,
    ];

    if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
        return (
            <RawGlassView style={capsuleStyle} glassEffectStyle={{ style: 'regular', animate: true }}>
                <View>{children}</View>
            </RawGlassView>
        );
    }

    if (Platform.OS === 'ios') {
        return (
            <BlurView intensity={52} tint={blurTint} style={capsuleStyle}>
                <View>{children}</View>
            </BlurView>
        );
    }

    return (
        <BlurView intensity={40} tint={blurTint} style={capsuleStyle}>
            <View>{children}</View>
        </BlurView>
    );
}

function LiquidBackdropOrnaments({
    insets,
}: {
    insets: { top: number; bottom: number };
}) {
    if (Platform.OS !== 'ios') {
        return null;
    }

    return (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: -10 }]}>
            <Host style={StyleSheet.absoluteFill} ignoreSafeArea="all">
                <GlassEffectContainer spacing={12}>
                    <VStack
                        spacing={0}
                        modifiers={[
                            padding({
                                top: insets.top + 8,
                                leading: 14,
                                trailing: 14,
                                bottom: insets.bottom + 12,
                            }),
                            frame({ maxWidth: Infinity, maxHeight: Infinity, alignment: 'topLeading' }),
                            opacity(0.7),
                        ]}
                    >
                        <HStack spacing={8}>
                            <SwiftText
                                modifiers={[
                                    frame({ width: 132, height: 42 }),
                                    glassEffect({ shape: 'capsule' }),
                                ]}
                            >
                                {' '}
                            </SwiftText>
                            <SwiftSpacer />
                            <SwiftText
                                modifiers={[
                                    frame({ width: 206, height: 42 }),
                                    glassEffect({ shape: 'capsule' }),
                                ]}
                            >
                                {' '}
                            </SwiftText>
                        </HStack>

                        <SwiftSpacer />

                        <HStack spacing={8}>
                            <SwiftText
                                modifiers={[
                                    frame({ width: 118, height: 50 }),
                                    glassEffect({ shape: 'capsule' }),
                                ]}
                            >
                                {' '}
                            </SwiftText>
                            <SwiftSpacer />
                            <SwiftText
                                modifiers={[
                                    frame({ width: 250, height: 50 }),
                                    glassEffect({ shape: 'capsule' }),
                                ]}
                            >
                                {' '}
                            </SwiftText>
                        </HStack>
                    </VStack>
                </GlassEffectContainer>
            </Host>
        </View>
    );
}

export default function AgendaScreen() {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const queryClient = useQueryClient();
    const { organization, permissions } = useOrganization();

    const rendererPlatform: AgendaRendererPlatform = Platform.OS === 'ios' ? 'ios-native' : 'fallback-list';
    const liquidControlIconColor = colors['--color-foreground'];

    const [mode, setMode] = useState<AgendaMode>('slot');
    const [view, setView] = useState<AgendaView>('day');
    const [teamMode, setTeamMode] = useState<TeamMode>('personal');
    const [anchorDate, setAnchorDate] = useState(() => new Date());
    const [daySwipePreviewDayKey, setDaySwipePreviewDayKey] = useState<string | null>(null);
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [eventSheetOpen, setEventSheetOpen] = useState(false);
    const [slotEditorOpen, setSlotEditorOpen] = useState(false);
    const [slotEditorMode, setSlotEditorMode] = useState<SlotEditorMode>('create');
    const [slotDraft, setSlotDraft] = useState<SlotDraft | null>(null);
    const [dateMemoSheetOpen, setDateMemoSheetOpen] = useState(false);
    const [dateMemoDraft, setDateMemoDraft] = useState<DateMemoDraft>({
        memoId: null,
        date: formatDateKey(new Date()),
        content: '',
        color: '',
    });
    const [assignSheetOpen, setAssignSheetOpen] = useState(false);
    const [mergeSheetOpen, setMergeSheetOpen] = useState(false);
    const [unslottedSheetOpen, setUnslottedSheetOpen] = useState(false);
    const [unslottedPage, setUnslottedPage] = useState(1);
    const [isMutating, setIsMutating] = useState(false);
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
    const [tabsSheetOpen, setTabsSheetOpen] = useState(false);
    const [viewportState, setViewportState] = useState<AgendaViewportState>({
        scrollAnchorHour: 9,
        zoomDensity: 'regular',
    });

    useEffect(() => {
        // Week now follows the Apple-style day timeline, so keep the primary selector on day/month/year.
        if (view === 'week') {
            setView('day');
        }
    }, [view]);

    useEffect(() => {
        if (view !== 'day' && daySwipePreviewDayKey !== null) {
            setDaySwipePreviewDayKey(null);
        }
    }, [daySwipePreviewDayKey, view]);

    const canReadAgenda =
        permissions.includes('slot.select') ||
        permissions.includes('slot_admin.select') ||
        permissions.includes('booking.select');

    const canEditBookings = permissions.includes('booking.update');

    const queryAnchorDate = useMemo(() => {
        if (view === 'year') {
            return yearStart(anchorDate);
        }

        return monthStart(anchorDate);
    }, [view, anchorDate.getFullYear(), anchorDate.getMonth()]);

    const visibleDays = useMemo(() => getDaysForView({ anchor: queryAnchorDate, view }), [queryAnchorDate, view]);

    const initQuery = useQuery({
        queryKey: ['agenda-init', organization.id],
        enabled: canReadAgenda,
        queryFn: async (): Promise<AgendaInitData> => clientTrpc.agendaInit.fetch({ orgId: organization.id }),
    });

    const personalMemberId = initQuery.data?.permissions.currentUserId ?? null;

    const memberFilterIds = useMemo(() => {
        if (teamMode === 'personal') {
            if (personalMemberId) {
                return [personalMemberId];
            }

            return selectedMemberIds.length > 0 ? selectedMemberIds : undefined;
        }

        return selectedMemberIds.length > 0 ? selectedMemberIds : undefined;
    }, [teamMode, personalMemberId, selectedMemberIds]);

    const canMutateSlots =
        rendererPlatform === 'ios-native' &&
        (Boolean(initQuery.data?.permissions.canSlotAdminInsert) ||
            Boolean(initQuery.data?.permissions.canSlotAdminUpdate) ||
            Boolean(initQuery.data?.permissions.canSlotAdminDelete));

    const agendaQuery = useQuery({
        queryKey: [
            'agenda-find-for-days',
            organization.id,
            visibleDays.join(','),
            selectedServiceIds.join(','),
            memberFilterIds?.join(',') ?? 'all-members',
        ],
        enabled: canReadAgenda,
        // Keep previously loaded days while fetching the next range to avoid day-swipe flicker.
        placeholderData: (previousData) => previousData,
        queryFn: async (): Promise<AgendaFindForDaysData> => {
            return clientTrpc.agendaFindForDays.fetch({
                orgId: organization.id,
                days: visibleDays,
                filters: {
                    serviceIds: selectedServiceIds.length > 0 ? selectedServiceIds : undefined,
                    memberIds: memberFilterIds && memberFilterIds.length > 0 ? memberFilterIds : undefined,
                },
            });
        },
    });

    const dateMemoQuery = useQuery({
        queryKey: ['agenda-date-memos', organization.id, visibleDays.join(',')],
        enabled: canReadAgenda,
        // Keep memo lane stable during range updates.
        placeholderData: (previousData) => previousData,
        queryFn: async (): Promise<AgendaDateMemosData> => {
            return clientTrpc.agendaFindDateMemos.fetch({
                orgId: organization.id,
                days: visibleDays,
            });
        },
    });

    const unslottedQuery = useQuery({
        queryKey: ['agenda-unslotted-bookings', organization.id, unslottedPage],
        enabled: canReadAgenda && unslottedSheetOpen,
        queryFn: async (): Promise<BookingFindByOrganizationData> => {
            return clientTrpc.bookingFindByOrganization.fetch({
                orgId: organization.id,
                page: unslottedPage,
                pageSize: 25,
                withoutSlotOnly: true,
                excludeCanceled: true,
            });
        },
    });

    const services = initQuery.data?.services ?? [];
    const members = initQuery.data?.members ?? [];
    const slots = (agendaQuery.data?.slots ?? []) as AgendaSlot[];

    const slotById = useMemo(() => {
        return new Map(slots.map((slot) => [slot.id, slot]));
    }, [slots]);

    const agendaViewModel = useMemo(
        () =>
            buildAgendaViewModel({
                mode,
                days: visibleDays,
                slots,
                defaultCurrency: initQuery.data?.settings.currency,
                includeEmptySlotEvents: true,
            }),
        [mode, visibleDays, slots, initQuery.data?.settings.currency],
    );

    const calendarEvents = useMemo<AgendaCalendarEvent[]>(
        () =>
            agendaViewModel.events.map((event) => ({
                id: event.id,
                title: event.bookingTotalLabel ? `${event.bookingTotalLabel} · ${event.title}` : event.title,
                start: event.start,
                end: event.end,
                vm: event,
            })),
        [agendaViewModel.events],
    );

    const dayAccentByDay = useMemo(() => {
        const accentByDay: Record<string, string> = {};
        for (const event of agendaViewModel.events) {
            if (!accentByDay[event.day]) {
                accentByDay[event.day] = event.palette.primary;
            }
        }
        return accentByDay;
    }, [agendaViewModel.events]);

    const selectedEvent = useMemo(() => {
        if (!selectedEventId) {
            return null;
        }

        return calendarEvents.find((event) => event.id === selectedEventId)?.vm ?? null;
    }, [calendarEvents, selectedEventId]);

    const selectedSlot = selectedEvent ? slotById.get(selectedEvent.slotId) ?? null : null;

    const dateMemos: AgendaDateMemo[] = dateMemoQuery.data?.dateMemos ?? [];

    const scheduleStartTime = initQuery.data?.settings.scheduleStartTime ?? '00:00';
    const scheduleEndTime = initQuery.data?.settings.scheduleEndTime ?? '24:00';
    const minHour = rendererPlatform === 'ios-native' ? 0 : parseHour(scheduleStartTime, 0);
    const maxHour = rendererPlatform === 'ios-native' ? 24 : parseHour(scheduleEndTime, 24);

    const selectedDayKey = formatDateKey(anchorDate);
    const effectiveTopDayKey = view === 'day' && daySwipePreviewDayKey ? daySwipePreviewDayKey : selectedDayKey;
    const effectiveTopDate = useMemo(() => parseDateKey(effectiveTopDayKey), [effectiveTopDayKey]);

    const setAnchorDateFast = useCallback((nextDate: Date) => {
        setAnchorDate((current) => {
            if (formatDateKey(current) === formatDateKey(nextDate)) {
                return current;
            }

            return nextDate;
        });
    }, []);

    const slotEventsForSelectedDay = useMemo(() => {
        if (!selectedEvent) {
            return [] as AgendaEventVM[];
        }

        return agendaViewModel.events.filter((event) => event.kind === 'slot' && event.day === selectedEvent.day);
    }, [agendaViewModel.events, selectedEvent]);

    const unslottedRows: UnslottedBookingRow[] = unslottedQuery.data?.data ?? [];
    const unslottedPagination = unslottedQuery.data?.meta.pagination;

    const invalidateAgendaQueries = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['agenda-find-for-days', organization.id] }),
            queryClient.invalidateQueries({ queryKey: ['agenda-date-memos', organization.id] }),
            queryClient.invalidateQueries({ queryKey: ['agenda-unslotted-bookings', organization.id] }),
        ]);
    };

    const runMutation = async ({
        task,
        successMessage,
        errorMessage,
    }: {
        task: () => Promise<void>;
        successMessage?: string;
        errorMessage: string;
    }) => {
        setIsMutating(true);

        try {
            await task();
            await invalidateAgendaQueries();
            if (successMessage) {
                toast.success(successMessage);
            }
        } catch (error) {
            console.error('Agenda mutation failed', error);
            toast.error(errorMessage);
        } finally {
            setIsMutating(false);
        }
    };

    const onNavigateUpView = () => {
        setDaySwipePreviewDayKey(null);
        setView((current) => {
            if (current === 'day' || current === 'week') {
                return 'month';
            }

            if (current === 'month') {
                return 'year';
            }

            return current;
        });
    };

    const onNavigatePeriod = (delta: number) => {
        setDaySwipePreviewDayKey(null);
        setAnchorDate((current) => {
            if (view === 'day' || view === 'week') {
                return addDays(current, delta);
            }

            if (view === 'month') {
                return new Date(current.getFullYear(), current.getMonth() + delta, 1);
            }

            return new Date(current.getFullYear() + delta, 0, 1);
        });
    };

    const onNavigateTab = (href: AgendaTabTarget['href']) => {
        setTabsSheetOpen(false);
        router.push(href);
    };

    const openCreateSlotAt = ({
        day,
        hour,
    }: {
        day: string;
        hour: number;
    }) => {
        if (!canMutateSlots) {
            return;
        }

        const clampedHour = Math.max(minHour, Math.min(maxHour - 1, hour));
        const start = `${String(clampedHour).padStart(2, '0')}:00`;
        const end = `${String(Math.min(clampedHour + 1, 23)).padStart(2, '0')}:00`;

        setSlotDraft(
            defaultSlotDraft({
                date: day,
                start,
                end,
                serviceId: selectedServiceIds[0],
                organizationMemberId: teamMode === 'personal' ? personalMemberId ?? undefined : selectedMemberIds[0],
            }),
        );
        setSlotEditorMode('create');
        setSlotEditorOpen(true);
    };

    const onPressEvent = (event: AgendaCalendarEvent) => {
        setSelectedEventId(event.id);
        setEventSheetOpen(true);
    };

    const openEditSlot = () => {
        if (!selectedSlot || !selectedEvent) {
            return;
        }

        setSlotDraft(
            slotToDraft({
                slot: selectedSlot,
                day: selectedEvent.day,
            }),
        );
        setSlotEditorMode('edit');
        setSlotEditorOpen(true);
    };

    const saveSlotDraft = async () => {
        if (!slotDraft) {
            return;
        }

        const maxParticipant = Number(slotDraft.maxParticipant);
        const hasMaxParticipant = Number.isFinite(maxParticipant) && maxParticipant >= 0;

        const payload = {
            customLabel: emptyToNull(slotDraft.customLabel),
            state: slotDraft.state,
            serviceId: slotDraft.serviceId === ACTION_SHEET_NONE_VALUE ? null : slotDraft.serviceId,
            frequency: slotDraft.frequency,
            metaFrequency: emptyToNull(slotDraft.metaFrequency),
            visible: slotDraft.visible,
            date: slotDraft.date,
            start: slotDraft.start,
            end: slotDraft.end,
            maxParticipant: hasMaxParticipant ? maxParticipant : null,
            organizationMemberId:
                slotDraft.organizationMemberId === ACTION_SHEET_NONE_VALUE ? null : slotDraft.organizationMemberId,
            privateComment: emptyToNull(slotDraft.privateComment),
            customColor: emptyToNull(slotDraft.customColor),
        } as const;

        if (slotEditorMode === 'create') {
            await runMutation({
                task: async () => {
                    await clientTrpc.agendaCreateSlot.fetch({
                        orgId: organization.id,
                        data: payload,
                    });
                    setSlotEditorOpen(false);
                    setEventSheetOpen(false);
                },
                successMessage: 'Slot created',
                errorMessage: 'Failed to create slot',
            });
            return;
        }

        if (!slotDraft.slotId) {
            return;
        }

        await runMutation({
            task: async () => {
                await clientTrpc.agendaUpdateSlot.fetch({
                    slotId: slotDraft.slotId!,
                    data: payload,
                });
                setSlotEditorOpen(false);
                setEventSheetOpen(false);
            },
            successMessage: 'Slot updated',
            errorMessage: 'Failed to update slot',
        });
    };

    const quickMoveSelectedSlot = async (deltaMinutes: number) => {
        if (!selectedEvent || !selectedSlot) {
            return;
        }

        const movedStart = shiftHHmm(padTime(selectedSlot.start), deltaMinutes);
        const movedEnd = shiftHHmm(padTime(selectedSlot.end), deltaMinutes);

        await runMutation({
            task: async () => {
                await clientTrpc.agendaMoveSlot.fetch({
                    slotId: selectedSlot.id,
                    date: selectedEvent.day,
                    start: movedStart,
                    end: movedEnd,
                    organizationMemberId:
                        selectedSlot.companyMemberId ??
                        selectedSlot.organization_member?.id ??
                        selectedSlot.organizationMember?.id ??
                        null,
                });
            },
            successMessage: 'Slot moved',
            errorMessage: 'Failed to move slot',
        });
    };

    const deleteSelectedSlot = async () => {
        if (!selectedEvent) {
            return;
        }

        await runMutation({
            task: async () => {
                await clientTrpc.agendaDeleteSlot.fetch({ slotId: selectedEvent.slotId });
                setEventSheetOpen(false);
            },
            successMessage: 'Slot deleted',
            errorMessage: 'Failed to delete slot',
        });
    };

    const unlinkSelectedSlotOccurrence = async () => {
        if (!selectedEvent) {
            return;
        }

        await runMutation({
            task: async () => {
                await clientTrpc.agendaUnlinkSlot.fetch({
                    slotId: selectedEvent.slotId,
                    date: selectedEvent.day,
                });
                setEventSheetOpen(false);
            },
            successMessage: 'Occurrence unlinked',
            errorMessage: 'Failed to unlink occurrence',
        });
    };

    const mergeSelectedSlot = async (slotToMergeId: string) => {
        if (!selectedEvent) {
            return;
        }

        await runMutation({
            task: async () => {
                await clientTrpc.agendaMergeSlots.fetch({
                    destinationSlotId: selectedEvent.slotId,
                    slotToMergeId,
                });
                setMergeSheetOpen(false);
                setEventSheetOpen(false);
            },
            successMessage: 'Slots merged',
            errorMessage: 'Failed to merge slots',
        });
    };

    const assignBooking = async ({
        bookingId,
        slotId,
        day,
    }: {
        bookingId: string;
        slotId: string | null;
        day: string | null;
    }) => {
        await runMutation({
            task: async () => {
                await clientTrpc.agendaAssignBooking.fetch({ bookingId, slotId, day });
                setAssignSheetOpen(false);
                setEventSheetOpen(false);
            },
            successMessage: slotId ? 'Booking assigned' : 'Booking unassigned',
            errorMessage: 'Failed to assign booking',
        });
    };

    const saveMemoDraft = async () => {
        if (dateMemoDraft.content.trim().length === 0) {
            toast.error('Memo content is required');
            return;
        }

        if (!dateMemoDraft.memoId) {
            await runMutation({
                task: async () => {
                    await clientTrpc.agendaCreateDateMemo.fetch({
                        orgId: organization.id,
                        date: dateMemoDraft.date,
                        content: dateMemoDraft.content.trim(),
                        color: emptyToNull(dateMemoDraft.color),
                        organizationRoleId: null,
                    });

                    setDateMemoDraft({
                        memoId: null,
                        date: visibleDays[0] ?? formatDateKey(new Date()),
                        content: '',
                        color: '',
                    });
                },
                successMessage: 'Memo created',
                errorMessage: 'Failed to create memo',
            });

            return;
        }

        await runMutation({
            task: async () => {
                await clientTrpc.agendaUpdateDateMemo.fetch({
                    memoId: dateMemoDraft.memoId!,
                    data: {
                        content: dateMemoDraft.content.trim(),
                        color: emptyToNull(dateMemoDraft.color),
                        organizationRoleId: null,
                    },
                });
            },
            successMessage: 'Memo updated',
            errorMessage: 'Failed to update memo',
        });
    };

    const deleteMemo = async (memoId: string) => {
        await runMutation({
            task: async () => {
                await clientTrpc.agendaDeleteDateMemo.fetch({ memoId });
                setDateMemoDraft({
                    memoId: null,
                    date: visibleDays[0] ?? formatDateKey(new Date()),
                    content: '',
                    color: '',
                });
            },
            successMessage: 'Memo deleted',
            errorMessage: 'Failed to delete memo',
        });
    };

    if (!canReadAgenda) {
        return (
            <View className="bg-background flex-1">
                <Header title={'Agenda'} />
                <Empty className="flex-1">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Icon name="AlertCircle" className="size-6" />
                        </EmptyMedia>
                        <EmptyTitle>No permission to access agenda</EmptyTitle>
                    </EmptyHeader>
                </Empty>
            </View>
        );
    }

    const showTopLeftSection = view !== 'year';
    const showAgendaLoader =
        (initQuery.isPending && !initQuery.data) ||
        (agendaQuery.isPending && !agendaQuery.data) ||
        (dateMemoQuery.isPending && !dateMemoQuery.data);
    const showMonthCellSkeleton =
        (agendaQuery.isPending && !agendaQuery.data) || (dateMemoQuery.isPending && !dateMemoQuery.data);
    const currentPeriodTitle =
        view === 'day' || view === 'week'
            ? effectiveTopDate.toLocaleDateString(undefined, {
                // weekday: 'short',
                month: 'long',
                // day: 'numeric',
            })
            : view === 'month'
                ? anchorDate.toLocaleDateString(undefined, {
                    // month: 'long',
                    year: 'numeric',
                })
                : '';
    const contentTopInset = rendererPlatform === 'ios-native' ? insets.top + 60 : 0;

    const renderAgendaBody = ({ events }: { events: AgendaCalendarEvent[] }) => (
        <AgendaV2Renderer
            rendererPlatform={rendererPlatform}
            view={view}
            anchorDate={anchorDate}
            selectedDayKey={selectedDayKey}
            minHour={minHour}
            maxHour={maxHour}
            events={events}
            daySummaries={agendaViewModel.daySummaries}
            dayAccentByDay={dayAccentByDay}
            dateMemos={dateMemos}
            visibleDays={visibleDays}
            isMonthLoading={showMonthCellSkeleton}
            viewport={viewportState}
            onPressCell={({ day, hour }) => openCreateSlotAt({ day, hour })}
            onPressEvent={onPressEvent}
            onAnchorDateChange={setAnchorDateFast}
            daySwipePreviewDayKey={view === 'day' ? daySwipePreviewDayKey : null}
            onDaySwipePreviewDayKeyChange={(dayKey) => {
                setDaySwipePreviewDayKey(dayKey);
            }}
            onSelectDay={(day) => {
                setDaySwipePreviewDayKey(null);
                setAnchorDateFast(parseDateKey(day));
            }}
            onDrillDown={({ day, from }) => {
                setDaySwipePreviewDayKey(null);
                setAnchorDateFast(parseDateKey(day));
                setView(from === 'year' ? 'month' : 'day');
            }}
        />
    );

    const renderMainContent = () => {
        if (rendererPlatform === 'fallback-list' && calendarEvents.length === 0) {
            return (
                <Empty className="mt-24 flex-1">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Icon name="Calendar" className="size-6" />
                        </EmptyMedia>
                        <EmptyTitle>No slots or bookings for this selection.</EmptyTitle>
                    </EmptyHeader>
                </Empty>
            );
        }

        return renderAgendaBody({ events: calendarEvents });
    };

    return (
        <View className="flex-1 bg-background">
            {rendererPlatform === 'fallback-list' ? <Header title={'Agenda'} /> : null}

            <View
                className="flex-1"
                style={{
                    paddingTop: contentTopInset,
                }}
            >
                {renderMainContent()}
            </View>

            {rendererPlatform === 'ios-native' ? (
                <LiquidBackdropOrnaments insets={{ top: insets.top, bottom: insets.bottom }} />
            ) : null}

            {showAgendaLoader ? (
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.isDark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.18)',
                        zIndex: 55,
                    }}
                >
                    <GlassCapsule style={{ borderRadius: 999 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10 }}>
                            <ActivityIndicator size="small" color={liquidControlIconColor} />
                            <Text style={{ color: liquidControlIconColor, fontSize: 15, fontWeight: '600' }}>Loading agenda</Text>
                        </View>
                    </GlassCapsule>
                </View>
            ) : null}

            <View
                pointerEvents="box-none"
                className="absolute left-4 right-4 z-40"
                style={{
                    top: insets.top,
                }}
            >
                <View
                    className="flex flex-row items-center gap-2"
                    style={{
                        justifyContent: showTopLeftSection ? 'space-between' : 'flex-end',
                    }}
                >
                    {showTopLeftSection ? (
                        <NativeButton
                            onPress={onNavigateUpView}
                            variant="default"
                            iosIcon={"chevron.left"}
                            title={"Date"}
                            icon="ChevronLeft"
                            iconProps={{
                                size: 18,
                                color: '#111827'
                            }}
                        >
                            <FadingPeriodTitle title={currentPeriodTitle} color={liquidControlIconColor} />
                        </NativeButton>
                    ) : null}

                    {/* <GlassCapsule style={{ borderRadius: 999 }}> */}
                    <GlassView className="flex items-center gap-2 px-2 flex-row ml-auto rounded-full bg-foreground/15 h-11" isInteractive>
                        {/* <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 6 }}> */}
                        <TouchableOpacity
                            style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 }}
                            onPress={() => setFilterSheetOpen(true)}
                            activeOpacity={0.8}
                        >
                            <Icon name="List" size={18} color={liquidControlIconColor} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 }}
                            onPress={() => router.push('/(app)/screens/search')}
                            activeOpacity={0.8}
                        >
                            <Icon name="Search" size={18} color={liquidControlIconColor} />
                        </TouchableOpacity>

                        {rendererPlatform === 'ios-native' && canMutateSlots ? (
                            <TouchableOpacity
                                style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 }}
                                onPress={() =>
                                    openCreateSlotAt({
                                        day: effectiveTopDayKey,
                                        hour: Math.max(minHour, viewportState.scrollAnchorHour),
                                    })
                                }
                                activeOpacity={0.8}
                            >
                                <Icon name="Plus" size={18} color={liquidControlIconColor} />
                            </TouchableOpacity>
                        ) : null}
                    </GlassView>

                    <Host matchContents>
                        <Menu
                            label="Agenda Settings"
                            systemImage="slider.horizontal.3"
                            modifiers={[buttonStyle('glassProminent'), labelStyle('iconOnly'), clipped(false), controlSize('large'), tint(colors['--color-primary'])]}>
                            <IOSButton label="Settings" systemImage="gear" onPress={() => console.log('Settings')} />
                            <Menu label="Submenu" systemImage="gear">
                                <IOSButton label="Sub Item 1" onPress={() => console.log('Sub Item 1')} />
                                <IOSButton label="Sub Item 2" onPress={() => console.log('Sub Item 2')} />
                            </Menu>
                            <ControlGroup>
                                <IOSButton systemImage="plus" label="Add" onPress={() => console.log('Add')} />
                                <IOSButton systemImage="star" label="Favorite" onPress={() => console.log('Favorite')} />
                                <IOSButton
                                    systemImage="square.and.arrow.up"
                                    label="Share"
                                    onPress={() => console.log('Share')}
                                />
                            </ControlGroup>
                            <IOSButton
                                label="Filter"
                                systemImage="line.3.horizontal.decrease"
                                onPress={() => console.log('Filter')}
                            />
                        </Menu>
                    </Host>
                </View>
            </View>

            <View
                pointerEvents="box-none"
                style={{
                    position: 'absolute',
                    bottom: insets.bottom,
                    left: 14,
                    right: 14,
                    zIndex: 40,
                }}
            >
                {/* <View className="flex-row items-center justify-between gap-2"> */}
                {/* <NativeButton
                        onPress={() => {
                            setDaySwipePreviewDayKey(null);
                            setAnchorDateFast(new Date());
                        }}
                        variant="default"
                    >
                        <Text
                            className="text-lg leading-none flex items-center flex-row my-1"
                        >Today</Text>
                    </NativeButton> */}
                <Host matchContents style={{ flex: 1 }}>
                    <HStack alignment='firstTextBaseline' spacing={12}>
                        <Menu
                            label="Today"
                            systemImage="play.circle"
                            modifiers={[buttonStyle(colors.isDark ? "glassProminent" : 'glass'), shadow({ radius: 4, x: 0, y: 2, color: colors.isDark ? '#11111140' : '#11111110' }), labelStyle('titleOnly'), controlSize('large'), ...(colors.isDark ? [tint('#ffffff15')] : []), clipped(false)]}
                            onPrimaryAction={() => {
                                setDaySwipePreviewDayKey(null);
                                setAnchorDateFast(new Date());
                            }}>
                            <IOSButton label="Day" onPress={() => setView('day')} />
                            <IOSButton label="Month" onPress={() => setView('month')} />
                            <IOSButton label="Year" onPress={() => setView('year')} />
                        </Menu>

                        <IOSButton
                            label="Tabs"
                            onPress={() => setTabsSheetOpen(true)}
                            modifiers={[buttonStyle(colors.isDark ? "glassProminent" : 'glass'), shadow({ radius: 4, x: 0, y: 2, color: colors.isDark ? '#11111140' : '#11111110' }), labelStyle('titleOnly'), controlSize('large'), ...(colors.isDark ? [tint('#ffffff15')] : []), clipped(false)]}
                        >
                            <Text
                                className="text-lg leading-none flex items-center flex-row my-1"
                            >Tabs</Text>
                        </IOSButton>
                    </HStack>
                </Host>

                {/* <NativeButton
                        onPress={() => setTabsSheetOpen(true)}
                        variant="default"
                    >
                        <Text
                            className="text-lg leading-none flex items-center flex-row my-1"
                        >Tabs</Text>
                    </NativeButton> */}
                {/* </View> */}
            </View>

            <ActionSheet open={tabsSheetOpen} onOpenChange={setTabsSheetOpen}>
                <ActionSheetContent>
                    <View className="px-4 pb-10 pt-4">
                        <Text className="mb-3 text-lg font-bold">Switch tab</Text>

                        <View className="gap-2">
                            {AGENDA_TAB_TARGETS.map((tabTarget) => (
                                <Button
                                    key={tabTarget.key}
                                    variant={tabTarget.key === 'agenda' ? 'default' : 'outline'}
                                    onPress={() => onNavigateTab(tabTarget.href)}
                                >
                                    <Text>{tabTarget.label}</Text>
                                </Button>
                            ))}
                        </View>
                    </View>
                </ActionSheetContent>
            </ActionSheet>

            <ActionSheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                <ActionSheetContent>
                    <View className="px-4 pb-10 pt-4">
                        <Text className="mb-3 text-lg font-bold">Agenda filters</Text>

                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold">View</Text>
                            <View className="flex-row gap-2">
                                {AGENDA_VIEW_OPTIONS.map((nextView) => (
                                    <Button
                                        key={`view-${nextView}`}
                                        variant={view === nextView ? 'default' : 'outline'}
                                        className="flex-1"
                                        onPress={() => setView(nextView)}
                                    >
                                        <Text>{nextView[0]!.toUpperCase() + nextView.slice(1)}</Text>
                                    </Button>
                                ))}
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold">Mode</Text>
                            <View className="flex-row gap-2">
                                <Button
                                    variant={mode === 'slot' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onPress={() => setMode('slot')}
                                >
                                    <Text>Slot</Text>
                                </Button>
                                <Button
                                    variant={mode === 'booking' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onPress={() => setMode('booking')}
                                >
                                    <Text>Booking</Text>
                                </Button>
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold">Team mode</Text>
                            <View className="flex-row gap-2">
                                <Button
                                    variant={teamMode === 'personal' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onPress={() => setTeamMode('personal')}
                                >
                                    <Text>Personal</Text>
                                </Button>
                                <Button
                                    variant={teamMode === 'team' ? 'default' : 'outline'}
                                    className="flex-1"
                                    onPress={() => setTeamMode('team')}
                                >
                                    <Text>Team</Text>
                                </Button>
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold">Services</Text>
                            <Button
                                variant={selectedServiceIds.length === 0 ? 'default' : 'outline'}
                                className="mb-2"
                                onPress={() => setSelectedServiceIds([])}
                            >
                                <Text>All services</Text>
                            </Button>
                            <View className="flex-row flex-wrap gap-2">
                                {services.map((service) => {
                                    const selected = selectedServiceIds.includes(service.id);
                                    return (
                                        <TouchableOpacity
                                            key={`service-${service.id}`}
                                            className={`rounded-full border px-3 py-1.5 ${selected
                                                ? 'border-primary bg-primary'
                                                : 'border-border bg-card'
                                                }`}
                                            onPress={() =>
                                                setSelectedServiceIds((prev) =>
                                                    prev.includes(service.id)
                                                        ? prev.filter((id) => id !== service.id)
                                                        : [...prev, service.id],
                                                )
                                            }
                                        >
                                            <Text className={selected ? 'text-primary-foreground text-sm' : 'text-sm'}>
                                                {service.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold">Members</Text>
                            <Button
                                variant={selectedMemberIds.length === 0 ? 'default' : 'outline'}
                                className="mb-2"
                                onPress={() => setSelectedMemberIds([])}
                            >
                                <Text>{teamMode === 'personal' ? 'Only me' : 'All members'}</Text>
                            </Button>
                            <View className="flex-row flex-wrap gap-2">
                                {members.map((member) => {
                                    const selected = selectedMemberIds.includes(member.id);
                                    return (
                                        <TouchableOpacity
                                            key={`member-${member.id}`}
                                            className={`rounded-full border px-3 py-1.5 ${selected
                                                ? 'border-primary bg-primary'
                                                : 'border-border bg-card'
                                                }`}
                                            onPress={() =>
                                                setSelectedMemberIds((prev) =>
                                                    prev.includes(member.id)
                                                        ? prev.filter((id) => id !== member.id)
                                                        : [...prev, member.id],
                                                )
                                            }
                                        >
                                            <Text className={selected ? 'text-primary-foreground text-sm' : 'text-sm'}>
                                                {member.name || member.email || member.id}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="mb-2 text-sm font-semibold">Actions</Text>
                            <View className="flex-row gap-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onPress={() => {
                                        setUnslottedPage(1);
                                        setFilterSheetOpen(false);
                                        setUnslottedSheetOpen(true);
                                    }}
                                >
                                    <Text>Unslotted</Text>
                                </Button>
                            </View>
                        </View>

                        <View className="mb-2">
                            <Text className="mb-2 text-sm font-semibold">Timeline density</Text>
                            <View className="flex-row gap-2">
                                {(['compact', 'regular', 'comfortable'] as const).map((density) => (
                                    <Button
                                        key={`density-${density}`}
                                        variant={viewportState.zoomDensity === density ? 'default' : 'outline'}
                                        className="flex-1"
                                        onPress={() =>
                                            setViewportState((prev) => ({
                                                ...prev,
                                                zoomDensity: density,
                                            }))
                                        }
                                    >
                                        <Text>{density[0]!.toUpperCase() + density.slice(1)}</Text>
                                    </Button>
                                ))}
                            </View>
                        </View>
                    </View>
                </ActionSheetContent>
            </ActionSheet>

            <ActionSheet open={eventSheetOpen} onOpenChange={setEventSheetOpen}>
                <ActionSheetContent>
                    <View className="px-4 pb-8 pt-4">
                        {selectedEvent ? (
                            <>
                                <Text className="mb-1 text-lg font-bold">{selectedEvent.title}</Text>
                                <Text className="text-muted-foreground mb-2 text-sm">
                                    {selectedEvent.day} · {toHHmm(selectedEvent.start)} - {toHHmm(selectedEvent.end)}
                                </Text>

                                {selectedEvent.serviceName ? (
                                    <Text className="mb-1 text-sm">Service: {selectedEvent.serviceName}</Text>
                                ) : null}

                                <Text className="mb-1 text-sm">Participants: {selectedEvent.participantCount}</Text>
                                <Text className="mb-1 text-sm">Bookings: {selectedEvent.bookingCount}</Text>

                                {selectedEvent.slotTotalLabel ? (
                                    <Text className="mb-1 text-sm">Slot total: {selectedEvent.slotTotalLabel}</Text>
                                ) : null}

                                {selectedEvent.kind === 'booking' ? (
                                    <View className="mt-3 flex-row gap-2">
                                        <Button
                                            className="flex-1"
                                            onPress={() => {
                                                if (!selectedEvent.bookingId) return;
                                                setEventSheetOpen(false);
                                                router.push(`/(app)/screens/booking-single?id=${selectedEvent.bookingId}` as any);
                                            }}
                                        >
                                            <Text>Open booking</Text>
                                        </Button>
                                        {canEditBookings && rendererPlatform === 'ios-native' ? (
                                            <Button variant="outline" className="flex-1" onPress={() => setAssignSheetOpen(true)}>
                                                <Text>Assign</Text>
                                            </Button>
                                        ) : null}
                                    </View>
                                ) : (
                                    <>
                                        <View className="mt-3 flex-row gap-2">
                                            {canMutateSlots ? (
                                                <Button className="flex-1" onPress={openEditSlot}>
                                                    <Text>Edit slot</Text>
                                                </Button>
                                            ) : null}
                                            {canMutateSlots ? (
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onPress={() => void quickMoveSelectedSlot(15)}
                                                    disabled={isMutating}
                                                >
                                                    <Text>+15 min</Text>
                                                </Button>
                                            ) : null}
                                        </View>

                                        {canMutateSlots ? (
                                            <View className="mt-2 flex-row gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onPress={() => void quickMoveSelectedSlot(-15)}
                                                    disabled={isMutating}
                                                >
                                                    <Text>-15 min</Text>
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onPress={() => setMergeSheetOpen(true)}
                                                    disabled={slotEventsForSelectedDay.length <= 1}
                                                >
                                                    <Text>Merge</Text>
                                                </Button>
                                            </View>
                                        ) : null}

                                        {selectedSlot && selectedSlot.frequency && selectedSlot.frequency !== 'once' ? (
                                            <Button
                                                className="mt-2"
                                                variant="outline"
                                                onPress={() => void unlinkSelectedSlotOccurrence()}
                                                disabled={isMutating}
                                            >
                                                <Text>Unlink occurrence</Text>
                                            </Button>
                                        ) : null}

                                        {canMutateSlots ? (
                                            <Button
                                                className="mt-2"
                                                variant="outline"
                                                onPress={() => void deleteSelectedSlot()}
                                                disabled={isMutating}
                                            >
                                                <Text>Delete slot</Text>
                                            </Button>
                                        ) : null}
                                    </>
                                )}
                            </>
                        ) : (
                            <Text className="text-muted-foreground text-sm">No event selected.</Text>
                        )}
                    </View>
                </ActionSheetContent>
            </ActionSheet>

            <ActionSheet open={slotEditorOpen} onOpenChange={setSlotEditorOpen}>
                <ActionSheetContent>
                    <View className="px-4 pb-8 pt-4">
                        <Text className="mb-3 text-lg font-bold">
                            {slotEditorMode === 'create' ? 'Create slot' : 'Edit slot'}
                        </Text>

                        {slotDraft ? (
                            <>
                                <View className="mb-2">
                                    <Text className="mb-1 text-sm">Date</Text>
                                    <Input
                                        value={slotDraft.date}
                                        onChangeText={(value) => setSlotDraft((prev) => (prev ? { ...prev, date: value } : prev))}
                                    />
                                </View>

                                <View className="mb-2 flex-row gap-2">
                                    <View className="flex-1">
                                        <Text className="mb-1 text-sm">Start</Text>
                                        <Input
                                            value={slotDraft.start}
                                            onChangeText={(value) =>
                                                setSlotDraft((prev) => (prev ? { ...prev, start: value } : prev))
                                            }
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="mb-1 text-sm">End</Text>
                                        <Input
                                            value={slotDraft.end}
                                            onChangeText={(value) =>
                                                setSlotDraft((prev) => (prev ? { ...prev, end: value } : prev))
                                            }
                                        />
                                    </View>
                                </View>

                                <View className="mb-2">
                                    <Text className="mb-1 text-sm">Service</Text>
                                    <ActionSheetSelect
                                        value={slotDraft.serviceId}
                                        onValueChange={(value) => setSlotDraft((prev) => (prev ? { ...prev, serviceId: value } : prev))}
                                        labels={Object.fromEntries([
                                            [ACTION_SHEET_NONE_VALUE, 'None'],
                                            ...services.map((service) => [service.id, service.name]),
                                        ])}
                                    >
                                        <ActionSheetSelectTrigger>
                                            <ActionSheetSelectValue placeholder="Select a service" />
                                        </ActionSheetSelectTrigger>
                                        <ActionSheetSelectContent>
                                            <ActionSheetSelectItem value={ACTION_SHEET_NONE_VALUE} />
                                            {services.map((service) => (
                                                <ActionSheetSelectItem key={service.id} value={service.id} />
                                            ))}
                                        </ActionSheetSelectContent>
                                    </ActionSheetSelect>
                                </View>

                                <View className="mb-2">
                                    <Text className="mb-1 text-sm">Assigned member</Text>
                                    <ActionSheetSelect
                                        value={slotDraft.organizationMemberId}
                                        onValueChange={(value) =>
                                            setSlotDraft((prev) => (prev ? { ...prev, organizationMemberId: value } : prev))
                                        }
                                        labels={Object.fromEntries([
                                            [ACTION_SHEET_NONE_VALUE, 'Unassigned'],
                                            ...members.map((member) => [member.id, member.name || member.email || member.id]),
                                        ])}
                                    >
                                        <ActionSheetSelectTrigger>
                                            <ActionSheetSelectValue placeholder="Select a member" />
                                        </ActionSheetSelectTrigger>
                                        <ActionSheetSelectContent>
                                            <ActionSheetSelectItem value={ACTION_SHEET_NONE_VALUE} />
                                            {members.map((member) => (
                                                <ActionSheetSelectItem key={member.id} value={member.id} />
                                            ))}
                                        </ActionSheetSelectContent>
                                    </ActionSheetSelect>
                                </View>

                                <View className="mb-2">
                                    <Text className="mb-1 text-sm">Label</Text>
                                    <Input
                                        value={slotDraft.customLabel}
                                        onChangeText={(value) =>
                                            setSlotDraft((prev) => (prev ? { ...prev, customLabel: value } : prev))
                                        }
                                    />
                                </View>

                                <View className="mb-2">
                                    <Text className="mb-1 text-sm">Private comment</Text>
                                    <Textarea
                                        value={slotDraft.privateComment}
                                        onChangeText={(value) =>
                                            setSlotDraft((prev) => (prev ? { ...prev, privateComment: value } : prev))
                                        }
                                    />
                                </View>

                                <View className="mb-2 flex-row gap-2">
                                    <View className="flex-1">
                                        <Text className="mb-1 text-sm">Custom color</Text>
                                        <Input
                                            value={slotDraft.customColor}
                                            onChangeText={(value) =>
                                                setSlotDraft((prev) => (prev ? { ...prev, customColor: value } : prev))
                                            }
                                            placeholder="#22C55E"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="mb-1 text-sm">Max participant</Text>
                                        <Input
                                            value={slotDraft.maxParticipant}
                                            onChangeText={(value) =>
                                                setSlotDraft((prev) => (prev ? { ...prev, maxParticipant: value } : prev))
                                            }
                                            keyboardType="number-pad"
                                        />
                                    </View>
                                </View>

                                <View className="mb-2 flex-row gap-2">
                                    <View className="flex-1">
                                        <Text className="mb-1 text-sm">State</Text>
                                        <ActionSheetSelect
                                            value={slotDraft.state}
                                            onValueChange={(value) =>
                                                setSlotDraft((prev) =>
                                                    prev
                                                        ? {
                                                            ...prev,
                                                            state: value === 'requested' ? 'requested' : 'confirmed',
                                                        }
                                                        : prev,
                                                )
                                            }
                                            labels={{ confirmed: 'confirmed', requested: 'requested' }}
                                        >
                                            <ActionSheetSelectTrigger>
                                                <ActionSheetSelectValue placeholder="State" />
                                            </ActionSheetSelectTrigger>
                                            <ActionSheetSelectContent>
                                                <ActionSheetSelectItem value="confirmed" />
                                                <ActionSheetSelectItem value="requested" />
                                            </ActionSheetSelectContent>
                                        </ActionSheetSelect>
                                    </View>

                                    <View className="flex-1">
                                        <Text className="mb-1 text-sm">Frequency</Text>
                                        <ActionSheetSelect
                                            value={slotDraft.frequency}
                                            onValueChange={(value) =>
                                                setSlotDraft((prev) =>
                                                    prev
                                                        ? {
                                                            ...prev,
                                                            frequency:
                                                                value === 'day' ||
                                                                    value === 'week' ||
                                                                    value === 'month' ||
                                                                    value === 'year'
                                                                    ? value
                                                                    : 'once',
                                                        }
                                                        : prev,
                                                )
                                            }
                                            labels={{
                                                once: 'once',
                                                day: 'day',
                                                week: 'week',
                                                month: 'month',
                                                year: 'year',
                                            }}
                                        >
                                            <ActionSheetSelectTrigger>
                                                <ActionSheetSelectValue placeholder="Frequency" />
                                            </ActionSheetSelectTrigger>
                                            <ActionSheetSelectContent>
                                                <ActionSheetSelectItem value="once" />
                                                <ActionSheetSelectItem value="day" />
                                                <ActionSheetSelectItem value="week" />
                                                <ActionSheetSelectItem value="month" />
                                                <ActionSheetSelectItem value="year" />
                                            </ActionSheetSelectContent>
                                        </ActionSheetSelect>
                                    </View>
                                </View>

                                <View className="mb-4">
                                    <Text className="mb-1 text-sm">Meta frequency (RRULE)</Text>
                                    <Input
                                        value={slotDraft.metaFrequency}
                                        onChangeText={(value) =>
                                            setSlotDraft((prev) => (prev ? { ...prev, metaFrequency: value } : prev))
                                        }
                                        placeholder="FREQ=WEEKLY;INTERVAL=1;BYDAY=MO"
                                    />
                                </View>

                                <Button onPress={() => void saveSlotDraft()} disabled={isMutating}>
                                    <Text>{slotEditorMode === 'create' ? 'Create slot' : 'Save changes'}</Text>
                                </Button>
                            </>
                        ) : null}
                    </View>
                </ActionSheetContent>
            </ActionSheet>

            <ActionSheet open={assignSheetOpen} onOpenChange={setAssignSheetOpen}>
                <ActionSheetContent>
                    <View className="px-4 pb-8 pt-4">
                        <Text className="mb-2 text-lg font-bold">Assign booking</Text>
                        {selectedEvent?.kind === 'booking' && selectedEvent.bookingId ? (
                            <>
                                <Button
                                    variant="outline"
                                    className="mb-3"
                                    onPress={() =>
                                        void assignBooking({
                                            bookingId: selectedEvent.bookingId!,
                                            slotId: null,
                                            day: null,
                                        })
                                    }
                                >
                                    <Text>Unassign booking</Text>
                                </Button>

                                {slotEventsForSelectedDay
                                    .filter((event) => event.slotId !== selectedEvent.slotId)
                                    .map((event) => (
                                        <TouchableOpacity
                                            key={`assign-${event.slotId}`}
                                            className="border-border mb-2 rounded-xl border p-3"
                                            onPress={() =>
                                                void assignBooking({
                                                    bookingId: selectedEvent.bookingId!,
                                                    slotId: event.slotId,
                                                    day: event.day,
                                                })
                                            }
                                        >
                                            <Text className="font-semibold">{event.slotLabel}</Text>
                                            <Text className="text-muted-foreground text-xs">
                                                {event.day} · {toHHmm(event.start)} - {toHHmm(event.end)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                            </>
                        ) : (
                            <Text className="text-muted-foreground">Select a booking event first.</Text>
                        )}
                    </View>
                </ActionSheetContent>
            </ActionSheet>

            <ActionSheet open={mergeSheetOpen} onOpenChange={setMergeSheetOpen}>
                <ActionSheetContent>
                    <View className="px-4 pb-8 pt-4">
                        <Text className="mb-2 text-lg font-bold">Merge slots</Text>
                        {selectedEvent ? (
                            slotEventsForSelectedDay
                                .filter((event) => event.slotId !== selectedEvent.slotId)
                                .map((event) => (
                                    <TouchableOpacity
                                        key={`merge-${event.slotId}`}
                                        className="border-border mb-2 rounded-xl border p-3"
                                        onPress={() => void mergeSelectedSlot(event.slotId)}
                                    >
                                        <Text className="font-semibold">{event.slotLabel}</Text>
                                        <Text className="text-muted-foreground text-xs">
                                            {event.day} · {toHHmm(event.start)} - {toHHmm(event.end)}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                        ) : (
                            <Text className="text-muted-foreground">Select a slot first.</Text>
                        )}
                    </View>
                </ActionSheetContent>
            </ActionSheet>

            <ActionSheet open={dateMemoSheetOpen} onOpenChange={setDateMemoSheetOpen}>
                <ActionSheetContent>
                    <View className="px-4 pb-8 pt-4">
                        <Text className="mb-3 text-lg font-bold">Date memos</Text>

                        <View className="mb-2">
                            <Text className="mb-1 text-sm">Date</Text>
                            <Input
                                value={dateMemoDraft.date}
                                onChangeText={(value) =>
                                    setDateMemoDraft((prev) => ({
                                        ...prev,
                                        date: value,
                                    }))
                                }
                            />
                        </View>

                        <View className="mb-2">
                            <Text className="mb-1 text-sm">Content</Text>
                            <Textarea
                                value={dateMemoDraft.content}
                                onChangeText={(value) =>
                                    setDateMemoDraft((prev) => ({
                                        ...prev,
                                        content: value,
                                    }))
                                }
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="mb-1 text-sm">Color</Text>
                            <Input
                                value={dateMemoDraft.color}
                                onChangeText={(value) =>
                                    setDateMemoDraft((prev) => ({
                                        ...prev,
                                        color: value,
                                    }))
                                }
                                placeholder="#F97316"
                            />
                        </View>

                        <View className="mb-4 flex-row gap-2">
                            <Button className="flex-1" onPress={() => void saveMemoDraft()} disabled={isMutating}>
                                <Text>{dateMemoDraft.memoId ? 'Update memo' : 'Create memo'}</Text>
                            </Button>
                            {dateMemoDraft.memoId ? (
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onPress={() => void deleteMemo(dateMemoDraft.memoId!)}
                                    disabled={isMutating}
                                >
                                    <Text>Delete memo</Text>
                                </Button>
                            ) : null}
                        </View>

                        {dateMemos.length > 0 ? (
                            <View className="border-border border-t pt-3">
                                {dateMemos.map((memo) => (
                                    <TouchableOpacity
                                        key={memo.id}
                                        className="border-border mb-2 rounded-xl border p-3"
                                        onPress={() =>
                                            setDateMemoDraft({
                                                memoId: memo.id,
                                                date: memo.date,
                                                content: memo.content,
                                                color: memo.color ?? '',
                                            })
                                        }
                                    >
                                        <Text className="font-semibold">{memo.date}</Text>
                                        <Text className="text-muted-foreground text-xs">{memo.content}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : null}
                    </View>
                </ActionSheetContent>
            </ActionSheet>

            <ActionSheet open={unslottedSheetOpen} onOpenChange={setUnslottedSheetOpen}>
                <ActionSheetContent>
                    <View className="px-4 pb-10 pt-4">
                        <View className="mb-2 flex-row items-center justify-between">
                            <Text className="text-lg font-bold">Bookings without slot</Text>
                            <Text className="text-muted-foreground text-xs">
                                {unslottedPagination ? `${unslottedPagination.total} total` : ''}
                            </Text>
                        </View>

                        <View className="mb-3 flex-row gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                disabled={unslottedPage <= 1}
                                onPress={() => setUnslottedPage((page) => Math.max(1, page - 1))}
                            >
                                <Text>Previous</Text>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                disabled={!unslottedPagination || unslottedPage >= unslottedPagination.pageCount}
                                onPress={() =>
                                    setUnslottedPage((page) =>
                                        unslottedPagination ? Math.min(unslottedPagination.pageCount, page + 1) : page,
                                    )
                                }
                            >
                                <Text>Next</Text>
                            </Button>
                        </View>

                        {unslottedQuery.isPending ? (
                            <View>
                                <Skeleton className="mb-2 h-14 w-full rounded-xl" />
                                <Skeleton className="mb-2 h-14 w-full rounded-xl" />
                                <Skeleton className="mb-2 h-14 w-full rounded-xl" />
                            </View>
                        ) : unslottedRows.length === 0 ? (
                            <Text className="text-muted-foreground">No unslotted bookings.</Text>
                        ) : (
                            unslottedRows.map((row) => {
                                const booking = row.booking;
                                const service = row.service;
                                const fullName = [booking.firstname, booking.lastname]
                                    .filter(Boolean)
                                    .join(' ')
                                    .trim();

                                return (
                                    <View key={booking.id} className="border-border mb-2 rounded-xl border p-3">
                                        <Text className="font-semibold">{fullName || booking.email || booking.id}</Text>
                                        <Text className="text-muted-foreground text-xs">{service?.name || 'No service'}</Text>
                                        <View className="mt-2 flex-row gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onPress={() => router.push(`/(app)/screens/booking-single?id=${booking.id}` as any)}
                                            >
                                                <Text>Open</Text>
                                            </Button>

                                            {selectedEvent?.kind === 'slot' && canEditBookings && canMutateSlots ? (
                                                <Button
                                                    className="flex-1"
                                                    onPress={() =>
                                                        void assignBooking({
                                                            bookingId: booking.id,
                                                            slotId: selectedEvent.slotId,
                                                            day: selectedEvent.day,
                                                        })
                                                    }
                                                >
                                                    <Text>Assign to selected slot</Text>
                                                </Button>
                                            ) : null}
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                </ActionSheetContent>
            </ActionSheet>

        </View>
    );
}
