import {
    ActionSheetSelect,
    ActionSheetSelectContent,
    ActionSheetSelectItem,
    ActionSheetSelectTrigger,
    ActionSheetSelectValue,
} from '@kit/native-ui/action-sheet-select';
import { Button } from '@kit/native-ui/button';
import { Header } from '@kit/native-ui/layout/header';
import { Input } from '@kit/native-ui/input';
import { Icon } from '@kit/native-ui/icon';
import { Image } from '@kit/native-ui/react-native';
import { Skeleton } from '@kit/native-ui/skeleton';
import { toast } from '@kit/native-ui/sonner';
import { Text } from '@kit/native-ui/text';
import { Textarea } from '@kit/native-ui/textarea';
import { OrganizationMediaManager } from '@kit/organization/native/ui';
import { useOrganization } from '@kit/organization/shared';
import { useClientSettings } from '@kit/settings/shared';
import { normalizeServiceGalleryImages, type ServiceGalleryImage } from '@planoby/shared/lib/service-gallery';
import {
    createDefaultParticipantDisplayCondition,
    normalizeParticipantDisplayCondition,
    type ParticipantDisplaySourceType,
} from '../../../../../packages/planoby/utils/src/participant-visibility';
import {
    dataSchemaSchema,
    participantDisplayConditionSchema,
    participantTableSchema,
    pricesSchema,
    type ParticipantDisplayCondition,
} from '../../../../../packages/planoby/utils/src/legacy-types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import z from 'zod';
import { normalizeBoolean } from '~/components/settings/utils';
import { clientTrpc } from '~/utils/trpc-client';

const SERVICE_STATES = ['draft', 'published', 'archived'] as const;
type ServiceState = (typeof SERVICE_STATES)[number];

type SingleServiceResponse = Awaited<ReturnType<typeof clientTrpc.singleService.fetch>>;
type ServiceEntity = NonNullable<SingleServiceResponse> & { prices?: unknown };
type Prices = z.infer<typeof pricesSchema>;
type ParticipantSchemaConfig = z.infer<typeof dataSchemaSchema>;
type ParticipantSchemaType = ParticipantSchemaConfig['type'];

type ParticipantSchemaRow = {
    id: string;
    name: string;
    slug: string;
    schema: unknown;
    displayAccordingToId: string | null;
};

type OrganizationTax = {
    id: string;
    name: string;
    rate: number | string;
    mode: 'inclusive' | 'exclusive';
    enabled: boolean;
    sortOrder: number;
};

type TaxMode = 'all' | 'custom';

type TextFieldKey = 'confirmationPageMessage' | 'emailContent' | 'smsContent';
type TextFields = Record<TextFieldKey, string>;

type MetaDraft = {
    name: string;
    featuredImage: string;
    state: ServiceState;
    duration: string;
    minParticipant: string;
    maxParticipant: string;
    location: string;
    calendarColor: string;
};

type EditableParticipantSchema = {
    tempId: string;
    id?: string;
    name: string;
    slug: string;
    schema: ParticipantSchemaConfig;
    displayAccordingToId: string | null;
};

const DEFAULT_PRICES: Prices = {
    table: {
        values: [[10]],
    },
    extra: [],
};

const DEFAULT_CALENDAR_COLOR = '#3B82F6';

const DEFAULT_TEXT_FIELDS: TextFields = {
    confirmationPageMessage: '',
    emailContent: '',
    smsContent: '',
};

const schemaTypeLabels: Record<ParticipantSchemaType, string> = {
    text: 'Text',
    number: 'Number',
    boolean: 'Boolean',
    calculation: 'Calculation',
};

const displayConditionOperatorLabels: Record<ParticipantDisplayCondition['operator'], string> = {
    is_true: 'is true',
    is_false: 'is false',
    gt: 'greater than',
    gte: 'greater than or equal',
    lt: 'less than',
    lte: 'less than or equal',
    eq: 'equal to',
    equals: 'equals',
    length_gt: 'length greater than',
    length_lt: 'length less than',
    length_eq: 'length equals',
};

const labelFromState = (value: string) =>
    value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase());

const emptyToUndefined = (value: string | undefined) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
};

const emptyToNullableString = (value: string | undefined) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};

const emptyToNullableNumber = (value: string | undefined) => {
    const normalized = value?.trim();
    if (!normalized) {
        return null;
    }

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
        return null;
    }

    return parsed;
};

const toNumberOrZero = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const toCurrency = (value: number) => {
    return `${Number.isFinite(value) ? value.toFixed(2) : '0.00'} EUR`;
};

const formatDurationLabel = (duration: string | null | undefined) => {
    if (!duration) return 'Not set';

    const match = duration.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match) {
        return duration;
    }

    const hours = Number(match[1] ?? 0);
    const minutes = Number(match[2] ?? 0);

    if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (hours > 0) {
        return `${hours}h`;
    }

    return `${minutes}m`;
};

const formatParticipantLabel = (minParticipant: number | null | undefined, maxParticipant: number | null | undefined) => {
    const min = minParticipant ?? 0;
    if (maxParticipant == null) {
        return `${min}+ participants`;
    }

    return `${min} - ${maxParticipant} participants`;
};

const formatServiceIdentity = (relativeId: number | null | undefined, state: string) => {
    const idLabel = relativeId != null ? `#${relativeId}` : '#-';
    return `${idLabel} · ${labelFromState(state)}`;
};

const normalizePrices = (input: unknown): Prices => {
    const parsed = pricesSchema.safeParse(input);
    if (parsed.success) {
        return parsed.data;
    }

    return DEFAULT_PRICES;
};

const normalizeSchema = (input: unknown): ParticipantSchemaConfig => {
    const parsed = dataSchemaSchema.safeParse(input);
    if (parsed.success) {
        return {
            ...parsed.data,
            display_condition: parsed.data.display_condition ?? null,
        } as ParticipantSchemaConfig;
    }

    return {
        type: 'text',
        default: null,
        unit: null,
        min_length: null,
        max_length: null,
        required: false,
        display_condition: null,
    };
};

const getDisplaySourceType = (schema: ParticipantSchemaConfig): ParticipantDisplaySourceType | null => {
    switch (schema.type) {
        case 'text':
        case 'number':
        case 'boolean':
            return schema.type;
        default:
            return null;
    }
};

const createDefaultSchema = (type: ParticipantSchemaType): ParticipantSchemaConfig => {
    switch (type) {
        case 'text':
            return {
                type: 'text',
                default: null,
                unit: null,
                min_length: null,
                max_length: null,
                required: false,
                display_condition: null,
            };
        case 'number':
            return {
                type: 'number',
                default: null,
                unit: null,
                min: null,
                max: null,
                required: false,
                display_condition: null,
            };
        case 'boolean':
            return {
                type: 'boolean',
                default: null,
                display_condition: null,
            };
        case 'calculation':
            return {
                type: 'calculation',
                visible: true,
                table: {
                    values: [[0]],
                },
                display_condition: null,
            };
    }
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

const normalizeGalleryDraftFromUrls = (selectedUrls: string[], previousImages: ServiceGalleryImage[]): ServiceGalleryImage[] => {
    const previousAltByUrl = new Map(previousImages.map((image) => [image.url, image.alt ?? null]));
    const dedupedUrls = Array.from(
        new Set(
            selectedUrls
                .filter((url): url is string => typeof url === 'string')
                .map((url) => url.trim())
                .filter(Boolean),
        ),
    );

    return dedupedUrls.map((url) => ({
        url,
        alt: previousAltByUrl.get(url) ?? null,
    }));
};

const createMetaDraft = (service: ServiceEntity | null): MetaDraft => ({
    name: service?.name ?? '',
    featuredImage: typeof service?.featuredImage === 'string' ? service.featuredImage : '',
    state: (service?.state as ServiceState | undefined) ?? 'draft',
    duration: service?.duration ?? '',
    minParticipant: String(service?.minParticipant ?? 0),
    maxParticipant: service?.maxParticipant == null ? '' : String(service.maxParticipant),
    location: service?.location ?? '',
    calendarColor: service?.calendarColor ?? DEFAULT_CALENDAR_COLOR,
});

const createTempId = () => `tmp_${Math.random().toString(36).slice(2, 10)}`;

const toEditableSchema = (row: ParticipantSchemaRow): EditableParticipantSchema => ({
    tempId: createTempId(),
    id: row.id,
    name: row.name,
    slug: row.slug,
    schema: normalizeSchema(row.schema),
    displayAccordingToId: row.displayAccordingToId ?? null,
});

function SectionCard({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <View className="mt-4 rounded-3xl border border-border bg-card px-5 py-5">
            <View className="mb-4 flex-row items-start justify-between gap-3">
                <View className="flex-1">
                    <Text className="text-xl font-bold">{title}</Text>
                    {subtitle ? <Text className="text-muted-foreground mt-1 text-sm">{subtitle}</Text> : null}
                </View>
            </View>
            {children}
        </View>
    );
}

function SectionActions({
    isEditing,
    isSaving,
    onEdit,
    onCancel,
    onSave,
    disabled,
}: {
    isEditing: boolean;
    isSaving: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    disabled?: boolean;
}) {
    return isEditing ? (
        <View className="flex-row gap-2">
            <Button variant="outline" className="h-8 px-3" onPress={onCancel} disabled={isSaving}>
                <Text>Cancel</Text>
            </Button>
            <Button className="h-8 px-3" onPress={onSave} disabled={isSaving}>
                <Text>{isSaving ? 'Saving...' : 'Save'}</Text>
            </Button>
        </View>
    ) : (
        <Button variant="outline" className="h-8 px-3" onPress={onEdit} disabled={disabled}>
            <Text>Edit</Text>
        </Button>
    );
}

export default function ServiceSingleScreen() {
    const { t } = useTranslation('common');
    const { id, isNew } = useLocalSearchParams<{ id?: string; isNew?: string }>();
    const queryClient = useQueryClient();
    const { organization, permissions } = useOrganization();

    const creating = isNew === 'true';
    const canCreate = permissions.includes('service.insert');
    const canUpdate = permissions.includes('service.update');

    const settingsValues = useClientSettings({
        clientTrpc,
        settingKeys: ['tax_enabled'],
    });

    const serviceQuery = useQuery({
        queryKey: ['single-service', id],
        queryFn: async (): Promise<SingleServiceResponse> => {
            return await clientTrpc.singleService.fetch({ id: id as string });
        },
        enabled: typeof id === 'string' && creating === false,
    });

    const [serviceEntity, setServiceEntity] = useState<ServiceEntity | null>(null);

    const [metaDraft, setMetaDraft] = useState<MetaDraft>(() => createMetaDraft(null));
    const [isMetaEditing, setIsMetaEditing] = useState(creating);
    const [isSavingMeta, setIsSavingMeta] = useState(false);

    const [descriptionValue, setDescriptionValue] = useState('');
    const [descriptionDraft, setDescriptionDraft] = useState('');
    const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
    const [isSavingDescription, setIsSavingDescription] = useState(false);

    const [textValues, setTextValues] = useState<TextFields>(DEFAULT_TEXT_FIELDS);
    const [textDrafts, setTextDrafts] = useState<TextFields>(DEFAULT_TEXT_FIELDS);
    const [editingTextKey, setEditingTextKey] = useState<TextFieldKey | null>(null);
    const [savingTextKey, setSavingTextKey] = useState<TextFieldKey | null>(null);

    const [pricingValue, setPricingValue] = useState<Prices>(DEFAULT_PRICES);
    const [pricingDraft, setPricingDraft] = useState<Prices>(DEFAULT_PRICES);
    const [isPricingEditing, setIsPricingEditing] = useState(false);
    const [isSavingPricing, setIsSavingPricing] = useState(false);

    const [participantSchemas, setParticipantSchemas] = useState<EditableParticipantSchema[]>([]);
    const [participantSchemasDraft, setParticipantSchemasDraft] = useState<EditableParticipantSchema[]>([]);
    const [otherSchemas, setOtherSchemas] = useState<EditableParticipantSchema[]>([]);
    const [isLoadingSchemas, setIsLoadingSchemas] = useState(false);
    const [isSchemasEditing, setIsSchemasEditing] = useState(false);
    const [isSavingSchemas, setIsSavingSchemas] = useState(false);

    const [galleryValue, setGalleryValue] = useState<ServiceGalleryImage[]>([]);
    const [galleryDraft, setGalleryDraft] = useState<ServiceGalleryImage[]>([]);
    const [isGalleryEditing, setIsGalleryEditing] = useState(false);
    const [isSavingGallery, setIsSavingGallery] = useState(false);

    const [availableTaxes, setAvailableTaxes] = useState<OrganizationTax[]>([]);
    const [isLoadingTaxes, setIsLoadingTaxes] = useState(false);
    const [isTaxesEditing, setIsTaxesEditing] = useState(false);
    const [isSavingTaxes, setIsSavingTaxes] = useState(false);
    const [taxMode, setTaxMode] = useState<TaxMode>('all');
    const [savedTaxMode, setSavedTaxMode] = useState<TaxMode>('all');
    const [selectedTaxIds, setSelectedTaxIds] = useState<string[]>([]);

    const serviceStateLabels = useMemo<Record<string, React.ReactNode>>(() => {
        return Object.fromEntries(SERVICE_STATES.map((state) => [state, labelFromState(state)]));
    }, []);

    const booleanValueLabels = useMemo<Record<string, React.ReactNode>>(
        () => ({
            __none__: 'Unset',
            true: 'True',
            false: 'False',
        }),
        [],
    );

    const taxModeLabels = useMemo<Record<string, React.ReactNode>>(
        () => ({
            all: 'Apply all organization taxes',
            custom: 'Use custom taxes',
        }),
        [],
    );

    const textFieldLabels: Record<TextFieldKey, string> = {
        confirmationPageMessage: t('services.fields.confirmationPageMessage'),
        emailContent: t('services.fields.emailContent'),
        smsContent: t('services.fields.smsContent'),
    };

    useEffect(() => {
        if (serviceQuery.data == null) {
            return;
        }

        setServiceEntity(serviceQuery.data as ServiceEntity);
    }, [serviceQuery.data]);

    useEffect(() => {
        if (serviceEntity == null) {
            if (creating) {
                setMetaDraft(createMetaDraft(null));
            }
            return;
        }

        if (!isMetaEditing) {
            setMetaDraft(createMetaDraft(serviceEntity));
        }

        if (!isDescriptionEditing) {
            const nextDescription = serviceEntity.description ?? '';
            setDescriptionValue(nextDescription);
            setDescriptionDraft(nextDescription);
        }

        if (editingTextKey == null) {
            const nextValues: TextFields = {
                confirmationPageMessage: serviceEntity.confirmationPageMessage ?? '',
                emailContent: serviceEntity.emailContent ?? '',
                smsContent: serviceEntity.smsContent ?? '',
            };
            setTextValues(nextValues);
            setTextDrafts(nextValues);
        }

        if (!isPricingEditing) {
            const nextPrices = normalizePrices((serviceEntity as ServiceEntity & { prices?: unknown }).prices);
            setPricingValue(nextPrices);
            setPricingDraft(nextPrices);
        }

        if (!isGalleryEditing) {
            const nextGallery = normalizeServiceGalleryImages(serviceEntity.images);
            setGalleryValue(nextGallery);
            setGalleryDraft(nextGallery);
        }
    }, [
        creating,
        editingTextKey,
        isDescriptionEditing,
        isGalleryEditing,
        isMetaEditing,
        isPricingEditing,
        serviceEntity,
    ]);

    const patchService = useCallback((patch: Partial<ServiceEntity>) => {
        setServiceEntity((previous) => {
            if (previous == null) {
                return previous;
            }

            return {
                ...previous,
                ...patch,
            };
        });
    }, []);

    const canEditSections = creating ? canCreate : canUpdate;

    const loadParticipantSchemas = useCallback(async () => {
        if (!serviceEntity?.id || !organization?.id) {
            setParticipantSchemas([]);
            setParticipantSchemasDraft([]);
            setOtherSchemas([]);
            return;
        }

        setIsLoadingSchemas(true);
        try {
            const [orgResponse, serviceResponse] = await Promise.all([
                clientTrpc.participantDataSchemaFindByOrganization.fetch({
                    orgId: organization.id,
                    page: 1,
                    pageSize: 200,
                }),
                clientTrpc.participantDataSchemaFindByService.fetch({
                    orgId: organization.id,
                    serviceId: serviceEntity.id,
                }),
            ]);

            const orgRows = (orgResponse.data ?? []) as ParticipantSchemaRow[];
            const serviceRows = (serviceResponse.data ?? []) as ParticipantSchemaRow[];
            const usedIds = new Set(serviceRows.map((row) => row.id));

            const normalizedUsed = serviceRows.map(toEditableSchema);
            const normalizedOther = orgRows.filter((row) => !usedIds.has(row.id)).map(toEditableSchema);

            setParticipantSchemas(normalizedUsed);
            setParticipantSchemasDraft(normalizedUsed);
            setOtherSchemas(normalizedOther);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load participant schemas';
            toast.error(message);
        } finally {
            setIsLoadingSchemas(false);
        }
    }, [organization?.id, serviceEntity?.id]);

    useEffect(() => {
        if (!serviceEntity?.id || creating) {
            return;
        }

        void loadParticipantSchemas();
    }, [creating, loadParticipantSchemas, serviceEntity?.id]);

    const taxEnabled = normalizeBoolean(settingsValues.data?.tax_enabled, false);

    const loadTaxConfiguration = useCallback(async () => {
        if (!taxEnabled || !serviceEntity?.id || !organization?.id) {
            setAvailableTaxes([]);
            setTaxMode('all');
            setSavedTaxMode('all');
            setSelectedTaxIds([]);
            return;
        }

        setIsLoadingTaxes(true);
        try {
            const [taxesResponse, configResponse] = await Promise.all([
                clientTrpc.organizationTaxList.fetch({ orgId: organization.id }),
                clientTrpc.serviceTaxConfigurationGet.fetch({
                    orgId: organization.id,
                    serviceId: serviceEntity.id,
                }),
            ]);

            const taxes = ((taxesResponse.data ?? []) as OrganizationTax[])
                .filter((tax) => tax.enabled)
                .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
            const config = (configResponse.data ?? {}) as {
                taxMode?: TaxMode;
                taxIds?: string[];
            };

            const nextMode: TaxMode = config.taxMode === 'custom' ? 'custom' : 'all';
            const nextTaxIds = Array.isArray(config.taxIds)
                ? config.taxIds.filter((taxId): taxId is string => typeof taxId === 'string')
                : [];

            setAvailableTaxes(taxes);
            setTaxMode(nextMode);
            setSavedTaxMode(nextMode);
            setSelectedTaxIds(nextTaxIds);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load service taxes';
            toast.error(message);
            setAvailableTaxes([]);
            setTaxMode('all');
            setSavedTaxMode('all');
            setSelectedTaxIds([]);
        } finally {
            setIsLoadingTaxes(false);
        }
    }, [organization?.id, serviceEntity?.id, taxEnabled]);

    useEffect(() => {
        if (creating) {
            return;
        }

        void loadTaxConfiguration();
    }, [creating, loadTaxConfiguration]);

    const saveMetadata = async () => {
        if (creating && !canCreate) {
            toast.error(t('permissions.noAccess'));
            return;
        }

        if (!creating && !canUpdate) {
            toast.error(t('permissions.noAccess'));
            return;
        }

        const minParticipant = emptyToNullableNumber(metaDraft.minParticipant) ?? 0;
        const maxParticipant = emptyToNullableNumber(metaDraft.maxParticipant);

        const payload = {
            name: metaDraft.name.trim(),
            featuredImage: emptyToUndefined(metaDraft.featuredImage) ?? null,
            state: metaDraft.state,
            duration: emptyToUndefined(metaDraft.duration),
            minParticipant,
            maxParticipant,
            location: emptyToUndefined(metaDraft.location),
            calendarColor: emptyToUndefined(metaDraft.calendarColor) ?? DEFAULT_CALENDAR_COLOR,
        };

        if (payload.name.length === 0) {
            toast.error(t('services.fields.name'));
            return;
        }

        setIsSavingMeta(true);
        try {
            if (creating) {
                const created = await clientTrpc.createService.fetch({
                    orgId: organization.id,
                    data: {
                        ...payload,
                        description: emptyToUndefined(descriptionDraft),
                        confirmationPageMessage: emptyToNullableString(textDrafts.confirmationPageMessage),
                        emailContent: emptyToNullableString(textDrafts.emailContent),
                        smsContent: emptyToNullableString(textDrafts.smsContent),
                        images: galleryDraft.length > 0 ? galleryDraft : null,
                        prices: pricingDraft,
                    },
                });

                if (!created) {
                    throw new Error('Service create failed');
                }

                toast.success(t('services.created'));
                router.replace(`/screens/service-single?id=${created.id}` as any);
                return;
            }

            if (!serviceEntity?.id) {
                toast.error(t('services.notFound'));
                return;
            }

            const response = await clientTrpc.updateService.fetch({
                serviceId: serviceEntity.id,
                data: payload,
            });

            if (!response.success) {
                toast.error(response.error ?? t('services.updateFailed'));
                return;
            }

            patchService({
                name: payload.name,
                featuredImage: payload.featuredImage,
                state: payload.state,
                duration: payload.duration ?? null,
                minParticipant: payload.minParticipant,
                maxParticipant: payload.maxParticipant,
                location: payload.location ?? null,
                calendarColor: payload.calendarColor,
            } as Partial<ServiceEntity>);

            setIsMetaEditing(false);
            toast.success(t('services.updated'));
            await queryClient.invalidateQueries({ queryKey: ['archiveServicesInfinite', organization.id] });
        } catch (error) {
            const message = error instanceof Error ? error.message : t('services.updateFailed');
            toast.error(message);
        } finally {
            setIsSavingMeta(false);
        }
    };

    const cancelMetadataEdition = () => {
        setMetaDraft(createMetaDraft(serviceEntity));
        setIsMetaEditing(false);
    };

    const saveDescription = async () => {
        if (!serviceEntity?.id || !canUpdate) {
            toast.error(t('permissions.noAccess'));
            return;
        }

        const normalizedDescription = emptyToUndefined(descriptionDraft);

        setIsSavingDescription(true);
        try {
            const response = await clientTrpc.updateService.fetch({
                serviceId: serviceEntity.id,
                data: {
                    description: normalizedDescription,
                },
            });

            if (!response.success) {
                toast.error(response.error ?? t('services.updateFailed'));
                return;
            }

            setDescriptionValue(normalizedDescription ?? '');
            setDescriptionDraft(normalizedDescription ?? '');
            patchService({ description: normalizedDescription ?? null } as Partial<ServiceEntity>);
            setIsDescriptionEditing(false);
            toast.success(t('services.updated'));
        } catch (error) {
            const message = error instanceof Error ? error.message : t('services.updateFailed');
            toast.error(message);
        } finally {
            setIsSavingDescription(false);
        }
    };

    const saveTextField = async (field: TextFieldKey) => {
        if (!serviceEntity?.id || !canUpdate) {
            toast.error(t('permissions.noAccess'));
            return;
        }

        const normalizedValue = emptyToNullableString(textDrafts[field]);

        setSavingTextKey(field);
        try {
            const response = await clientTrpc.updateService.fetch({
                serviceId: serviceEntity.id,
                data: {
                    [field]: normalizedValue,
                },
            });

            if (!response.success) {
                toast.error(response.error ?? t('services.updateFailed'));
                return;
            }

            setTextValues((previous) => ({
                ...previous,
                [field]: normalizedValue ?? '',
            }));
            setTextDrafts((previous) => ({
                ...previous,
                [field]: normalizedValue ?? '',
            }));
            patchService({ [field]: normalizedValue } as Partial<ServiceEntity>);
            setEditingTextKey(null);
            toast.success(t('services.updated'));
        } catch (error) {
            const message = error instanceof Error ? error.message : t('services.updateFailed');
            toast.error(message);
        } finally {
            setSavingTextKey(null);
        }
    };

    const sanitizePrices = (draft: Prices): Prices => {
        const normalizedRows = draft.table.values.map((row) => row.map((value) => toNumberOrZero(value)));
        const rowCount = Math.max(normalizedRows.length, 1);
        const colCount = Math.max(...normalizedRows.map((row) => row.length), 1);

        const expandedRows = Array.from({ length: rowCount }).map((_, rowIndex) => {
            const sourceRow = normalizedRows[rowIndex] ?? [];
            return Array.from({ length: colCount }).map((__, colIndex) => sourceRow[colIndex] ?? 0);
        });

        const normalizeConstraintArray = (input: unknown, targetLength: number) => {
            if (!Array.isArray(input)) {
                return Array.from({ length: targetLength }).map(() => ({
                    type: 'interval' as const,
                    start: 0,
                    end: 0,
                }));
            }

            return Array.from({ length: targetLength }).map((_, index) => {
                const item = input[index] as any;
                if (!item || typeof item !== 'object') {
                    return {
                        type: 'interval' as const,
                        start: 0,
                        end: 0,
                    };
                }

                if (item.type === 'literal') {
                    return {
                        type: 'literal' as const,
                        value: item.value ?? null,
                    };
                }

                return {
                    type: 'interval' as const,
                    start: Number.isFinite(Number(item.start)) ? Number(item.start) : null,
                    end: Number.isFinite(Number(item.end)) ? Number(item.end) : null,
                };
            });
        };

        const rowSchemaId = draft.table.rows?.schemaDocId?.trim() ?? '';
        const colSchemaId = draft.table.cols?.schemaDocId?.trim() ?? '';

        const next: Prices = {
            table: {
                values: expandedRows,
                ...(rowSchemaId
                    ? {
                          rows: {
                              schemaDocId: rowSchemaId,
                              value: normalizeConstraintArray(draft.table.rows?.value, rowCount),
                          },
                      }
                    : {}),
                ...(colSchemaId
                    ? {
                          cols: {
                              schemaDocId: colSchemaId,
                              value: normalizeConstraintArray(draft.table.cols?.value, colCount),
                          },
                      }
                    : {}),
            },
            extra: draft.extra.map((extra) => ({
                schemaDocId: extra.schemaDocId,
                default: Boolean(extra.default),
                amount: toNumberOrZero(extra.amount),
                description: extra.description,
            })),
        };

        if (draft.table.fallback != null && Number.isFinite(Number(draft.table.fallback))) {
            next.table.fallback = Number(draft.table.fallback);
        }

        const parsed = pricesSchema.safeParse(next);
        return parsed.success ? parsed.data : DEFAULT_PRICES;
    };

    const savePricing = async () => {
        if (!serviceEntity?.id || !canUpdate) {
            toast.error(t('permissions.noAccess'));
            return;
        }

        const normalized = sanitizePrices(pricingDraft);

        setIsSavingPricing(true);
        try {
            const response = await clientTrpc.updateService.fetch({
                serviceId: serviceEntity.id,
                data: {
                    prices: normalized,
                },
            });

            if (!response.success) {
                toast.error(response.error ?? t('services.updateFailed'));
                return;
            }

            setPricingValue(normalized);
            setPricingDraft(normalized);
            patchService({ prices: normalized } as Partial<ServiceEntity>);
            setIsPricingEditing(false);
            toast.success('Prices updated');
        } catch (error) {
            const message = error instanceof Error ? error.message : t('services.updateFailed');
            toast.error(message);
        } finally {
            setIsSavingPricing(false);
        }
    };

    const updateGridCell = (rowIndex: number, colIndex: number, value: string) => {
        setPricingDraft((previous) => {
            const nextRows = previous.table.values.map((row) => [...row]);
            const parsedValue = Number(value);
            if (!nextRows[rowIndex]) {
                nextRows[rowIndex] = [];
            }
            nextRows[rowIndex]![colIndex] = Number.isFinite(parsedValue) ? parsedValue : 0;

            return {
                ...previous,
                table: {
                    ...previous.table,
                    values: nextRows,
                },
            };
        });
    };

    const addPricingRow = () => {
        setPricingDraft((previous) => {
            const colCount = Math.max(...previous.table.values.map((row) => row.length), 1);
            const nextRows = [...previous.table.values, Array.from({ length: colCount }).map(() => 0)];
            const nextRowValues = previous.table.rows?.value ?? [];

            return {
                ...previous,
                table: {
                    ...previous.table,
                    values: nextRows,
                    ...(previous.table.rows
                        ? {
                              rows: {
                                  ...previous.table.rows,
                                  value: [
                                      ...nextRowValues,
                                      {
                                          type: 'interval' as const,
                                          start: 0,
                                          end: 0,
                                      },
                                  ],
                              },
                          }
                        : {}),
                },
            };
        });
    };

    const addPricingColumn = () => {
        setPricingDraft((previous) => {
            const nextRows = previous.table.values.map((row) => [...row, 0]);
            const nextColValues = previous.table.cols?.value ?? [];

            return {
                ...previous,
                table: {
                    ...previous.table,
                    values: nextRows,
                    ...(previous.table.cols
                        ? {
                              cols: {
                                  ...previous.table.cols,
                                  value: [
                                      ...nextColValues,
                                      {
                                          type: 'interval' as const,
                                          start: 0,
                                          end: 0,
                                      },
                                  ],
                              },
                          }
                        : {}),
                },
            };
        });
    };

    const removePricingRow = (rowIndex: number) => {
        setPricingDraft((previous) => {
            if (previous.table.values.length <= 1) return previous;
            const nextRows = previous.table.values.filter((_, index) => index !== rowIndex);
            const nextRowRanges = previous.table.rows?.value?.filter((_, index) => index !== rowIndex);

            return {
                ...previous,
                table: {
                    ...previous.table,
                    values: nextRows,
                    ...(previous.table.rows
                        ? {
                              rows: {
                                  ...previous.table.rows,
                                  value: nextRowRanges ?? [],
                              },
                          }
                        : {}),
                },
            };
        });
    };

    const removePricingColumn = (columnIndex: number) => {
        setPricingDraft((previous) => {
            const maxCols = Math.max(...previous.table.values.map((row) => row.length), 1);
            if (maxCols <= 1) return previous;

            const nextRows = previous.table.values.map((row) => row.filter((_, index) => index !== columnIndex));
            const nextColRanges = previous.table.cols?.value?.filter((_, index) => index !== columnIndex);

            return {
                ...previous,
                table: {
                    ...previous.table,
                    values: nextRows,
                    ...(previous.table.cols
                        ? {
                              cols: {
                                  ...previous.table.cols,
                                  value: nextColRanges ?? [],
                              },
                          }
                        : {}),
                },
            };
        });
    };

    const loadSchemaIntoDraft = (schemaId: string) => {
        const source = otherSchemas.find((schema) => schema.id === schemaId);
        if (!source) {
            return;
        }

        setParticipantSchemasDraft((previous) => {
            if (previous.some((schema) => schema.id === schemaId)) {
                return previous;
            }
            return [
                ...previous,
                {
                    ...source,
                    tempId: createTempId(),
                },
            ];
        });

        setOtherSchemas((previous) => previous.filter((schema) => schema.id !== schemaId));
    };

    const updateSchemaDraft = (
        tempId: string,
        updater: (schema: EditableParticipantSchema) => EditableParticipantSchema,
    ) => {
        setParticipantSchemasDraft((previous) => previous.map((schema) => (schema.tempId === tempId ? updater(schema) : schema)));
    };

    const removeSchemaDraft = (tempId: string) => {
        setParticipantSchemasDraft((previous) => {
            const removed = previous.find((schema) => schema.tempId === tempId);
            const removedId = removed?.id ?? null;

            if (removed?.id) {
                setOtherSchemas((otherPrevious) => {
                    if (otherPrevious.some((schema) => schema.id === removed.id)) {
                        return otherPrevious;
                    }

                    return [
                        ...otherPrevious,
                        {
                            ...removed,
                            tempId: createTempId(),
                        },
                    ];
                });
            }

            return previous
                .filter((schema) => schema.tempId !== tempId)
                .map((schema) => {
                    if (removedId && schema.displayAccordingToId === removedId) {
                        return {
                            ...schema,
                            displayAccordingToId: null,
                            schema: {
                                ...schema.schema,
                                display_condition: null,
                            } as ParticipantSchemaConfig,
                        };
                    }

                    return schema;
                });
        });
    };

    const setSchemaDisplaySource = (targetTempId: string, sourceId: string | null) => {
        setParticipantSchemasDraft((previous) => {
            const source = sourceId ? previous.find((schema) => schema.id === sourceId) : null;
            const sourceType = source ? getDisplaySourceType(source.schema) : null;

            return previous.map((schema) => {
                if (schema.tempId !== targetTempId) {
                    return schema;
                }

                if (!source || !sourceType || !source.id) {
                    return {
                        ...schema,
                        displayAccordingToId: null,
                        schema: {
                            ...schema.schema,
                            display_condition: null,
                        } as ParticipantSchemaConfig,
                    };
                }

                const normalizedCondition =
                    normalizeParticipantDisplayCondition(schema.schema.display_condition ?? null, sourceType) ??
                    createDefaultParticipantDisplayCondition(sourceType);

                return {
                    ...schema,
                    displayAccordingToId: source.id,
                    schema: {
                        ...schema.schema,
                        display_condition: normalizedCondition,
                    } as ParticipantSchemaConfig,
                };
            });
        });
    };

    const updateSchemaOperator = (targetTempId: string, operator: ParticipantDisplayCondition['operator']) => {
        setParticipantSchemasDraft((previous) => {
            const target = previous.find((schema) => schema.tempId === targetTempId);
            if (!target) {
                return previous;
            }

            const source = target.displayAccordingToId
                ? previous.find((schema) => schema.id === target.displayAccordingToId)
                : null;
            const sourceType = source ? getDisplaySourceType(source.schema) : null;

            if (!sourceType) {
                return previous;
            }

            return previous.map((schema) => {
                if (schema.tempId !== targetTempId) {
                    return schema;
                }

                const existing =
                    normalizeParticipantDisplayCondition(schema.schema.display_condition ?? null, sourceType) ??
                    createDefaultParticipantDisplayCondition(sourceType);

                let nextCondition: ParticipantDisplayCondition = existing;
                if (sourceType === 'boolean') {
                    nextCondition = {
                        sourceType: 'boolean',
                        operator: operator === 'is_false' ? 'is_false' : 'is_true',
                    };
                } else if (sourceType === 'number') {
                    nextCondition = {
                        sourceType: 'number',
                        operator:
                            operator === 'gte' || operator === 'lt' || operator === 'lte' || operator === 'eq'
                                ? operator
                                : 'gt',
                        value: existing.sourceType === 'number' ? existing.value : 0,
                    };
                } else if (operator === 'length_gt' || operator === 'length_lt' || operator === 'length_eq') {
                    nextCondition = {
                        sourceType: 'text',
                        operator,
                        value:
                            existing.sourceType === 'text' && typeof existing.value === 'number'
                                ? Math.max(0, Math.floor(existing.value))
                                : 0,
                    };
                } else {
                    nextCondition = {
                        sourceType: 'text',
                        operator: 'equals',
                        value: existing.sourceType === 'text' && typeof existing.value === 'string' ? existing.value : '',
                    };
                }

                return {
                    ...schema,
                    schema: {
                        ...schema.schema,
                        display_condition: nextCondition,
                    } as ParticipantSchemaConfig,
                };
            });
        });
    };

    const updateSchemaConditionValue = (targetTempId: string, rawValue: string) => {
        setParticipantSchemasDraft((previous) => {
            const target = previous.find((schema) => schema.tempId === targetTempId);
            if (!target) {
                return previous;
            }

            const source = target.displayAccordingToId
                ? previous.find((schema) => schema.id === target.displayAccordingToId)
                : null;
            const sourceType = source ? getDisplaySourceType(source.schema) : null;
            if (!sourceType) {
                return previous;
            }

            return previous.map((schema) => {
                if (schema.tempId !== targetTempId) {
                    return schema;
                }

                const existing =
                    normalizeParticipantDisplayCondition(schema.schema.display_condition ?? null, sourceType) ??
                    createDefaultParticipantDisplayCondition(sourceType);

                let nextCondition: ParticipantDisplayCondition;

                if (sourceType === 'number') {
                    const parsed = Number(rawValue);
                    nextCondition = {
                        sourceType: 'number',
                        operator: existing.sourceType === 'number' ? existing.operator : 'gt',
                        value: Number.isFinite(parsed) ? parsed : 0,
                    };
                } else if (sourceType === 'text') {
                    if (
                        existing.sourceType === 'text' &&
                        (existing.operator === 'length_gt' || existing.operator === 'length_lt' || existing.operator === 'length_eq')
                    ) {
                        const parsed = Number(rawValue);
                        nextCondition = {
                            sourceType: 'text',
                            operator: existing.operator,
                            value: Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0,
                        };
                    } else {
                        nextCondition = {
                            sourceType: 'text',
                            operator: 'equals',
                            value: rawValue,
                        };
                    }
                } else {
                    nextCondition = existing;
                }

                return {
                    ...schema,
                    schema: {
                        ...schema.schema,
                        display_condition: nextCondition,
                    } as ParticipantSchemaConfig,
                };
            });
        });
    };

    const saveParticipantSchemas = async () => {
        if (!serviceEntity?.id || !organization?.id || !canUpdate) {
            toast.error(t('permissions.noAccess'));
            return;
        }

        if (participantSchemasDraft.some((schema) => schema.name.trim().length === 0)) {
            toast.error('Each participant field needs a name.');
            return;
        }

        setIsSavingSchemas(true);
        try {
            const persistedById = new Map(
                participantSchemasDraft
                    .filter((schema): schema is EditableParticipantSchema & { id: string } => Boolean(schema.id))
                    .map((schema) => [schema.id, schema]),
            );

            const finalSchemaIds: string[] = [];

            for (const schema of participantSchemasDraft) {
                const cleanName = schema.name.trim();
                const slug = slugify(schema.slug || cleanName) || 'participant-field';

                const sourceSchema = schema.displayAccordingToId
                    ? persistedById.get(schema.displayAccordingToId) ?? null
                    : null;
                const sourceType = sourceSchema ? getDisplaySourceType(sourceSchema.schema) : null;

                const normalizedCondition = sourceType
                    ? normalizeParticipantDisplayCondition(schema.schema.display_condition ?? null, sourceType) ??
                      createDefaultParticipantDisplayCondition(sourceType)
                    : null;

                const payloadSchema = {
                    ...schema.schema,
                    display_condition: normalizedCondition,
                } as ParticipantSchemaConfig;

                const payload = {
                    name: cleanName,
                    slug,
                    schema: payloadSchema as unknown as Record<string, unknown>,
                    displayAccordingToId: sourceSchema?.id ?? null,
                };

                if (schema.id) {
                    await clientTrpc.participantDataSchemaUpdate.fetch({
                        schemaId: schema.id,
                        data: payload,
                    });
                    finalSchemaIds.push(schema.id);
                } else {
                    const created = await clientTrpc.participantDataSchemaCreate.fetch({
                        orgId: organization.id,
                        data: payload,
                    });

                    if (created.data?.id) {
                        finalSchemaIds.push(created.data.id);
                    }
                }
            }

            await clientTrpc.participantDataSchemaUpdateServiceAssociations.fetch({
                serviceId: serviceEntity.id,
                orgId: organization.id,
                schemaIds: finalSchemaIds,
            });

            setIsSchemasEditing(false);
            toast.success('Participant schemas updated');
            await loadParticipantSchemas();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update participant schemas';
            toast.error(message);
        } finally {
            setIsSavingSchemas(false);
        }
    };

    const saveGallery = async () => {
        if (!serviceEntity?.id || !canUpdate) {
            toast.error(t('permissions.noAccess'));
            return;
        }

        setIsSavingGallery(true);
        try {
            const response = await clientTrpc.updateService.fetch({
                serviceId: serviceEntity.id,
                data: {
                    images: galleryDraft.length > 0 ? galleryDraft : null,
                },
            });

            if (!response.success) {
                toast.error(response.error ?? t('services.updateFailed'));
                return;
            }

            setGalleryValue(galleryDraft);
            patchService({ images: galleryDraft.length > 0 ? galleryDraft : null } as Partial<ServiceEntity>);
            setIsGalleryEditing(false);
            toast.success('Gallery updated');
        } catch (error) {
            const message = error instanceof Error ? error.message : t('services.updateFailed');
            toast.error(message);
        } finally {
            setIsSavingGallery(false);
        }
    };

    const saveTaxConfiguration = async () => {
        if (!serviceEntity?.id || !organization?.id || !canUpdate) {
            toast.error(t('permissions.noAccess'));
            return;
        }

        setIsSavingTaxes(true);
        try {
            await clientTrpc.serviceTaxConfigurationSet.fetch({
                orgId: organization.id,
                serviceId: serviceEntity.id,
                taxMode,
                taxIds: taxMode === 'custom' ? selectedTaxIds : [],
            });

            setSavedTaxMode(taxMode);
            setIsTaxesEditing(false);
            toast.success('Service taxes updated');
            await loadTaxConfiguration();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update service taxes';
            toast.error(message);
        } finally {
            setIsSavingTaxes(false);
        }
    };

    if (creating && canCreate === false) {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('services.title')} />
                <View className="flex-1 items-center justify-center px-6">
                    <Icon name="AlertCircle" size={64} className="text-muted-foreground mb-4" />
                    <Text className="mb-2 text-2xl font-bold">{t('permissions.noAccess')}</Text>
                </View>
            </View>
        );
    }

    if (creating === false && typeof id !== 'string') {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('services.title')} />
                <View className="flex-1 items-center justify-center px-6">
                    <Icon name="FileX" size={64} className="text-muted-foreground mb-4" />
                    <Text className="mb-2 text-2xl font-bold">{t('services.notFound')}</Text>
                </View>
            </View>
        );
    }

    if (creating === false && serviceQuery.isPending) {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('services.title')} />
                <View className="px-4 pt-4">
                    <Skeleton className="mb-3 h-12 w-full rounded-xl" />
                    <Skeleton className="mb-3 h-12 w-full rounded-xl" />
                    <Skeleton className="mb-3 h-12 w-full rounded-xl" />
                    <Skeleton className="mb-3 h-64 w-full rounded-xl" />
                </View>
            </View>
        );
    }

    if (creating === false && serviceEntity == null) {
        return (
            <View className="bg-background flex-1">
                <Header showBackButton title={t('services.title')} />
                <View className="flex-1 items-center justify-center px-6">
                    <Icon name="FileX" size={64} className="text-muted-foreground mb-4" />
                    <Text className="mb-2 text-2xl font-bold">{t('services.notFound')}</Text>
                    <Text className="text-muted-foreground text-center">{t('services.notFoundDescription')}</Text>
                </View>
            </View>
        );
    }

    const currentServiceTitle = serviceEntity?.name || metaDraft.name || t('services.new');
    const heroImage =
        typeof serviceEntity?.featuredImage === 'string'
            ? serviceEntity.featuredImage
            : metaDraft.featuredImage || null;

    const pricingRows = pricingDraft.table.values;
    const pricingColumns = Math.max(...pricingRows.map((row) => row.length), 1);

    return (
        <View className="bg-background flex-1">
            <Header showBackButton title={creating ? t('services.new') : t('services.details')} />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 92 }}>
                <View className="px-4 py-4">
                    <View className="overflow-hidden rounded-[34px] border border-border bg-card">
                        <View className="relative h-[430px] w-full">
                            {heroImage ? (
                                <Image
                                    source={{ uri: heroImage }}
                                    className="absolute left-0 top-0 h-full w-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="absolute left-0 top-0 h-full w-full items-center justify-center bg-neutral-800">
                                    <Icon name="Image" size={36} className="text-neutral-300" />
                                </View>
                            )}

                            <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-5 pb-6 pt-20">
                                <View className="mb-3 flex-row items-start justify-between gap-3">
                                    <Text className="flex-1 text-[40px] font-extrabold leading-[44px] text-white" numberOfLines={2}>
                                        {currentServiceTitle}
                                    </Text>
                                    <View
                                        className="h-11 w-11 rounded-full border border-white/40"
                                        style={{
                                            backgroundColor:
                                                serviceEntity?.calendarColor ?? metaDraft.calendarColor ?? DEFAULT_CALENDAR_COLOR,
                                        }}
                                    />
                                </View>

                                <Text className="text-white/85 text-base">
                                    {formatServiceIdentity(serviceEntity?.relativeId ?? null, serviceEntity?.state ?? metaDraft.state)}
                                </Text>

                                <View className="mt-4 flex-row flex-wrap gap-2">
                                    <View className="rounded-full bg-white/15 px-3 py-1.5">
                                        <Text className="text-xs font-semibold text-white">
                                            {formatDurationLabel(serviceEntity?.duration ?? metaDraft.duration)}
                                        </Text>
                                    </View>
                                    <View className="rounded-full bg-white/15 px-3 py-1.5">
                                        <Text className="text-xs font-semibold text-white">
                                            {formatParticipantLabel(
                                                serviceEntity?.minParticipant ?? emptyToNullableNumber(metaDraft.minParticipant),
                                                serviceEntity?.maxParticipant ?? emptyToNullableNumber(metaDraft.maxParticipant),
                                            )}
                                        </Text>
                                    </View>
                                    {(serviceEntity?.location ?? metaDraft.location) ? (
                                        <View className="rounded-full bg-white/15 px-3 py-1.5">
                                            <Text className="text-xs font-semibold text-white" numberOfLines={1}>
                                                {serviceEntity?.location ?? metaDraft.location}
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                        </View>
                    </View>

                    <SectionCard title="Overview" subtitle="Edit core service properties and publishing metadata.">
                        <View className="mb-4 flex-row items-center justify-between">
                            <Text className="text-muted-foreground text-sm">Service properties</Text>
                            <SectionActions
                                isEditing={isMetaEditing}
                                isSaving={isSavingMeta}
                                onEdit={() => setIsMetaEditing(true)}
                                onCancel={cancelMetadataEdition}
                                onSave={saveMetadata}
                                disabled={!canEditSections}
                            />
                        </View>

                        {isMetaEditing ? (
                            <View className="gap-3">
                                <View className="gap-2">
                                    <Text className="text-sm font-medium">{t('services.fields.name')}</Text>
                                    <Input
                                        value={metaDraft.name}
                                        onChangeText={(value) => setMetaDraft((prev) => ({ ...prev, name: value }))}
                                        placeholder="Service name"
                                    />
                                </View>

                                <View className="gap-2">
                                    <Text className="text-sm font-medium">Thumbnail</Text>
                                    <OrganizationMediaManager
                                        value={metaDraft.featuredImage || null}
                                        onValueChange={(value) =>
                                            setMetaDraft((prev) => ({
                                                ...prev,
                                                featuredImage: typeof value === 'string' ? value : '',
                                            }))
                                        }
                                        multiple={false}
                                        isUrl={true}
                                        triggerClassName="h-44 w-full rounded-xl"
                                        imageClassName="h-full w-full object-cover"
                                        placeholder={
                                            <View className="h-full w-full items-center justify-center rounded-xl border border-dashed border-border">
                                                <Icon name="UploadCloud" size={18} />
                                                <Text className="mt-2 text-sm">Upload service image</Text>
                                            </View>
                                        }
                                    />
                                </View>

                                <View className="gap-2">
                                    <Text className="text-sm font-medium">{t('services.fields.state')}</Text>
                                    <ActionSheetSelect
                                        labels={serviceStateLabels}
                                        value={metaDraft.state}
                                        onValueChange={(value) =>
                                            setMetaDraft((prev) => ({ ...prev, state: value as ServiceState }))
                                        }
                                    >
                                        <ActionSheetSelectTrigger>
                                            <ActionSheetSelectValue placeholder={t('services.fields.state')} />
                                        </ActionSheetSelectTrigger>
                                        <ActionSheetSelectContent>
                                            {SERVICE_STATES.map((state) => (
                                                <ActionSheetSelectItem key={state} value={state} />
                                            ))}
                                        </ActionSheetSelectContent>
                                    </ActionSheetSelect>
                                </View>

                                <View className="gap-2">
                                    <Text className="text-sm font-medium">{t('services.fields.duration')}</Text>
                                    <Input
                                        value={metaDraft.duration}
                                        onChangeText={(value) => setMetaDraft((prev) => ({ ...prev, duration: value }))}
                                        placeholder="03:00"
                                    />
                                </View>

                                <View className="flex-row gap-3">
                                    <View className="flex-1 gap-2">
                                        <Text className="text-sm font-medium">{t('services.fields.minParticipant')}</Text>
                                        <Input
                                            value={metaDraft.minParticipant}
                                            onChangeText={(value) =>
                                                setMetaDraft((prev) => ({ ...prev, minParticipant: value }))
                                            }
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View className="flex-1 gap-2">
                                        <Text className="text-sm font-medium">{t('services.fields.maxParticipant')}</Text>
                                        <Input
                                            value={metaDraft.maxParticipant}
                                            onChangeText={(value) =>
                                                setMetaDraft((prev) => ({ ...prev, maxParticipant: value }))
                                            }
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <View className="gap-2">
                                    <Text className="text-sm font-medium">{t('services.fields.location')}</Text>
                                    <Input
                                        value={metaDraft.location}
                                        onChangeText={(value) => setMetaDraft((prev) => ({ ...prev, location: value }))}
                                    />
                                </View>

                                <View className="gap-2">
                                    <Text className="text-sm font-medium">{t('services.fields.calendarColor')}</Text>
                                    <Input
                                        value={metaDraft.calendarColor}
                                        onChangeText={(value) =>
                                            setMetaDraft((prev) => ({
                                                ...prev,
                                                calendarColor: value,
                                            }))
                                        }
                                    />
                                </View>
                            </View>
                        ) : (
                            <View className="gap-3">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-muted-foreground text-sm">Status</Text>
                                    <Text className="text-sm font-semibold">{labelFromState(metaDraft.state)}</Text>
                                </View>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-muted-foreground text-sm">Duration</Text>
                                    <Text className="text-sm font-semibold">{formatDurationLabel(metaDraft.duration)}</Text>
                                </View>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-muted-foreground text-sm">Participants</Text>
                                    <Text className="text-sm font-semibold">
                                        {formatParticipantLabel(
                                            emptyToNullableNumber(metaDraft.minParticipant),
                                            emptyToNullableNumber(metaDraft.maxParticipant),
                                        )}
                                    </Text>
                                </View>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-muted-foreground text-sm">Location</Text>
                                    <Text className="text-sm font-semibold">{metaDraft.location || 'Not set'}</Text>
                                </View>
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-muted-foreground text-sm">Slot color</Text>
                                    <View className="flex-row items-center gap-2">
                                        <View
                                            className="h-4 w-4 rounded-full"
                                            style={{ backgroundColor: metaDraft.calendarColor || DEFAULT_CALENDAR_COLOR }}
                                        />
                                        <Text className="text-sm font-semibold">{metaDraft.calendarColor || DEFAULT_CALENDAR_COLOR}</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </SectionCard>

                    {creating ? null : (
                        <SectionCard
                            title="Service Taxes"
                            subtitle="Keep inherited taxes or select custom taxes for this service."
                        >
                            <View className="mb-4 flex-row items-center justify-between">
                                <Text className="text-muted-foreground text-sm">Tax behavior</Text>
                                <SectionActions
                                    isEditing={isTaxesEditing}
                                    isSaving={isSavingTaxes}
                                    onEdit={() => setIsTaxesEditing(true)}
                                    onCancel={() => {
                                        setTaxMode(savedTaxMode);
                                        setIsTaxesEditing(false);
                                    }}
                                    onSave={saveTaxConfiguration}
                                    disabled={!canEditSections || !taxEnabled}
                                />
                            </View>

                            {!taxEnabled ? (
                                <Text className="text-muted-foreground text-sm">
                                    Taxes are disabled in organization settings.
                                </Text>
                            ) : isLoadingTaxes ? (
                                <View className="gap-2">
                                    <Skeleton className="h-10 w-full rounded-lg" />
                                    <Skeleton className="h-10 w-full rounded-lg" />
                                </View>
                            ) : isTaxesEditing ? (
                                <View className="gap-3">
                                    <ActionSheetSelect
                                        labels={taxModeLabels}
                                        value={taxMode}
                                        onValueChange={(value) => setTaxMode(value as TaxMode)}
                                    >
                                        <ActionSheetSelectTrigger>
                                            <ActionSheetSelectValue placeholder="Tax mode" />
                                        </ActionSheetSelectTrigger>
                                        <ActionSheetSelectContent>
                                            <ActionSheetSelectItem value="all" />
                                            <ActionSheetSelectItem value="custom" />
                                        </ActionSheetSelectContent>
                                    </ActionSheetSelect>

                                    {taxMode === 'custom' ? (
                                        <View className="gap-2 rounded-lg border border-border p-3">
                                            {availableTaxes.length === 0 ? (
                                                <Text className="text-muted-foreground text-sm">
                                                    No enabled taxes available in this organization.
                                                </Text>
                                            ) : (
                                                availableTaxes.map((tax) => {
                                                    const selected = selectedTaxIds.includes(tax.id);
                                                    return (
                                                        <TouchableOpacity
                                                            key={tax.id}
                                                            className="flex-row items-center justify-between rounded-md border border-border px-3 py-2"
                                                            onPress={() =>
                                                                setSelectedTaxIds((previous) =>
                                                                    selected
                                                                        ? previous.filter((idValue) => idValue !== tax.id)
                                                                        : [...previous, tax.id],
                                                                )
                                                            }
                                                        >
                                                            <View className="flex-1 pr-3">
                                                                <Text className="text-sm font-medium">{tax.name}</Text>
                                                                <Text className="text-muted-foreground text-xs">
                                                                    {Number(tax.rate).toFixed(2)}% · {tax.mode}
                                                                </Text>
                                                            </View>
                                                            <Switch
                                                                value={selected}
                                                                onValueChange={(checked) =>
                                                                    setSelectedTaxIds((previous) =>
                                                                        checked
                                                                            ? Array.from(new Set([...previous, tax.id]))
                                                                            : previous.filter((idValue) => idValue !== tax.id),
                                                                    )
                                                                }
                                                            />
                                                        </TouchableOpacity>
                                                    );
                                                })
                                            )}
                                        </View>
                                    ) : null}
                                </View>
                            ) : (
                                <View className="gap-2">
                                    <Text className="text-sm">
                                        {savedTaxMode === 'custom'
                                            ? 'Custom taxes enabled for this service.'
                                            : 'This service inherits organization taxes.'}
                                    </Text>
                                    {savedTaxMode === 'custom' ? (
                                        <View className="gap-1">
                                            {selectedTaxIds.length === 0 ? (
                                                <Text className="text-muted-foreground text-sm">No taxes selected.</Text>
                                            ) : (
                                                selectedTaxIds.map((taxId) => {
                                                    const tax = availableTaxes.find((row) => row.id === taxId);
                                                    return (
                                                        <Text key={taxId} className="text-muted-foreground text-sm">
                                                            {tax ? `${tax.name} (${Number(tax.rate).toFixed(2)}%)` : taxId}
                                                        </Text>
                                                    );
                                                })
                                            )}
                                        </View>
                                    ) : null}
                                </View>
                            )}
                        </SectionCard>
                    )}

                    <SectionCard title={t('services.fields.description')} subtitle="Public description shown to users.">
                        <View className="mb-4 flex-row items-center justify-between">
                            <Text className="text-muted-foreground text-sm">Description text</Text>
                            <SectionActions
                                isEditing={isDescriptionEditing}
                                isSaving={isSavingDescription}
                                onEdit={() => setIsDescriptionEditing(true)}
                                onCancel={() => {
                                    setDescriptionDraft(descriptionValue);
                                    setIsDescriptionEditing(false);
                                }}
                                onSave={saveDescription}
                                disabled={!canEditSections || creating}
                            />
                        </View>

                        {isDescriptionEditing ? (
                            <Textarea value={descriptionDraft} onChangeText={setDescriptionDraft} placeholder="Describe this service..." />
                        ) : (
                            <Text className="text-muted-foreground text-base leading-6">
                                {descriptionValue?.trim() || 'No description configured.'}
                            </Text>
                        )}
                    </SectionCard>

                    <SectionCard
                        title="Texts"
                        subtitle="Edit confirmation page, email and SMS messages independently."
                    >
                        <View className="gap-4">
                            {(Object.keys(textValues) as TextFieldKey[]).map((field) => {
                                const isEditingCurrentField = editingTextKey === field;
                                const isSavingCurrentField = savingTextKey === field;
                                const isAnotherFieldEditing = editingTextKey !== null && editingTextKey !== field;

                                return (
                                    <View key={field} className="rounded-2xl border border-border p-4">
                                        <View className="mb-3 flex-row items-center justify-between gap-2">
                                            <Text className="text-base font-semibold">{textFieldLabels[field]}</Text>
                                            {isEditingCurrentField ? (
                                                <View className="flex-row gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="h-8 px-3"
                                                        onPress={() => {
                                                            setTextDrafts((previous) => ({
                                                                ...previous,
                                                                [field]: textValues[field],
                                                            }));
                                                            setEditingTextKey(null);
                                                        }}
                                                        disabled={isSavingCurrentField}
                                                    >
                                                        <Text>Cancel</Text>
                                                    </Button>
                                                    <Button
                                                        className="h-8 px-3"
                                                        onPress={() => {
                                                            void saveTextField(field);
                                                        }}
                                                        disabled={isSavingCurrentField}
                                                    >
                                                        <Text>{isSavingCurrentField ? 'Saving...' : 'Save'}</Text>
                                                    </Button>
                                                </View>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    className="h-8 px-3"
                                                    onPress={() => {
                                                        setTextDrafts((previous) => ({
                                                            ...previous,
                                                            [field]: textValues[field],
                                                        }));
                                                        setEditingTextKey(field);
                                                    }}
                                                    disabled={!canEditSections || creating || isAnotherFieldEditing}
                                                >
                                                    <Text>Edit</Text>
                                                </Button>
                                            )}
                                        </View>

                                        {isEditingCurrentField ? (
                                            <Textarea
                                                value={textDrafts[field]}
                                                onChangeText={(value) =>
                                                    setTextDrafts((previous) => ({
                                                        ...previous,
                                                        [field]: value,
                                                    }))
                                                }
                                                placeholder={`Configure ${textFieldLabels[field].toLowerCase()}...`}
                                            />
                                        ) : (
                                            <Text className="text-muted-foreground text-sm leading-5">
                                                {textValues[field]?.trim() || 'Not configured.'}
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </SectionCard>

                    <SectionCard
                        title="Pricing"
                        subtitle="Support simple and dynamic matrix pricing based on participant schemas."
                    >
                        <View className="mb-4 flex-row items-center justify-between">
                            <Text className="text-muted-foreground text-sm">Grid + extras</Text>
                            <SectionActions
                                isEditing={isPricingEditing}
                                isSaving={isSavingPricing}
                                onEdit={() => setIsPricingEditing(true)}
                                onCancel={() => {
                                    setPricingDraft(pricingValue);
                                    setIsPricingEditing(false);
                                }}
                                onSave={() => {
                                    void savePricing();
                                }}
                                disabled={!canEditSections || creating || isLoadingSchemas}
                            />
                        </View>

                        {isLoadingSchemas ? (
                            <View className="gap-2">
                                <Skeleton className="h-10 w-full rounded-lg" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                                <Skeleton className="h-24 w-full rounded-lg" />
                            </View>
                        ) : (
                            <View className="gap-4">
                                <View className="gap-2">
                                    <Text className="text-sm font-medium">Matrix dimensions</Text>
                                    {isPricingEditing ? (
                                        <View className="flex-row gap-2">
                                            <Button variant="outline" className="h-8 px-3" onPress={addPricingRow}>
                                                <Text>Add row</Text>
                                            </Button>
                                            <Button variant="outline" className="h-8 px-3" onPress={addPricingColumn}>
                                                <Text>Add column</Text>
                                            </Button>
                                        </View>
                                    ) : (
                                        <Text className="text-muted-foreground text-sm">
                                            {pricingRows.length} row(s) × {pricingColumns} column(s)
                                        </Text>
                                    )}
                                </View>

                                <View className="gap-2">
                                    <Text className="text-sm font-medium">Row schema</Text>
                                    <ActionSheetSelect
                                        labels={Object.fromEntries([
                                            ['__none__', 'No row schema'],
                                            ...participantSchemas.map((schema) => [schema.id ?? schema.tempId, schema.name]),
                                        ])}
                                        value={pricingDraft.table.rows?.schemaDocId || '__none__'}
                                        onValueChange={(value) => {
                                            if (!isPricingEditing) return;
                                            setPricingDraft((previous) => {
                                                if (value === '__none__') {
                                                    return {
                                                        ...previous,
                                                        table: {
                                                            ...previous.table,
                                                            rows: undefined,
                                                        },
                                                    };
                                                }

                                                const rowCount = previous.table.values.length;
                                                return {
                                                    ...previous,
                                                    table: {
                                                        ...previous.table,
                                                        rows: {
                                                            schemaDocId: value,
                                                            value: Array.from({ length: rowCount }).map((_, index) => {
                                                                const existing = previous.table.rows?.value?.[index] as any;
                                                                if (existing?.type === 'literal') {
                                                                    return {
                                                                        type: 'literal' as const,
                                                                        value: existing.value ?? null,
                                                                    };
                                                                }
                                                                return {
                                                                    type: 'interval' as const,
                                                                    start: Number(existing?.start ?? 0),
                                                                    end: Number(existing?.end ?? 0),
                                                                };
                                                            }),
                                                        },
                                                    },
                                                };
                                            });
                                        }}
                                    >
                                        <ActionSheetSelectTrigger>
                                            <ActionSheetSelectValue placeholder="Row schema" />
                                        </ActionSheetSelectTrigger>
                                        <ActionSheetSelectContent>
                                            <ActionSheetSelectItem value="__none__" />
                                            {participantSchemas
                                                .filter((schema) => Boolean(schema.id))
                                                .map((schema) => (
                                                    <ActionSheetSelectItem key={schema.id} value={schema.id as string} />
                                                ))}
                                        </ActionSheetSelectContent>
                                    </ActionSheetSelect>
                                </View>

                                <View className="gap-2">
                                    <Text className="text-sm font-medium">Column schema</Text>
                                    <ActionSheetSelect
                                        labels={Object.fromEntries([
                                            ['__none__', 'No column schema'],
                                            ...participantSchemas.map((schema) => [schema.id ?? schema.tempId, schema.name]),
                                        ])}
                                        value={pricingDraft.table.cols?.schemaDocId || '__none__'}
                                        onValueChange={(value) => {
                                            if (!isPricingEditing) return;
                                            setPricingDraft((previous) => {
                                                if (value === '__none__') {
                                                    return {
                                                        ...previous,
                                                        table: {
                                                            ...previous.table,
                                                            cols: undefined,
                                                        },
                                                    };
                                                }

                                                const colCount = Math.max(...previous.table.values.map((row) => row.length), 1);
                                                return {
                                                    ...previous,
                                                    table: {
                                                        ...previous.table,
                                                        cols: {
                                                            schemaDocId: value,
                                                            value: Array.from({ length: colCount }).map((_, index) => {
                                                                const existing = previous.table.cols?.value?.[index] as any;
                                                                if (existing?.type === 'literal') {
                                                                    return {
                                                                        type: 'literal' as const,
                                                                        value: existing.value ?? null,
                                                                    };
                                                                }
                                                                return {
                                                                    type: 'interval' as const,
                                                                    start: Number(existing?.start ?? 0),
                                                                    end: Number(existing?.end ?? 0),
                                                                };
                                                            }),
                                                        },
                                                    },
                                                };
                                            });
                                        }}
                                    >
                                        <ActionSheetSelectTrigger>
                                            <ActionSheetSelectValue placeholder="Column schema" />
                                        </ActionSheetSelectTrigger>
                                        <ActionSheetSelectContent>
                                            <ActionSheetSelectItem value="__none__" />
                                            {participantSchemas
                                                .filter((schema) => Boolean(schema.id))
                                                .map((schema) => (
                                                    <ActionSheetSelectItem key={schema.id} value={schema.id as string} />
                                                ))}
                                        </ActionSheetSelectContent>
                                    </ActionSheetSelect>
                                </View>

                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View className="gap-2 pr-4">
                                        <View className="flex-row gap-2">
                                            <View className="h-10 w-20 items-center justify-center rounded-lg border border-border">
                                                <Text className="text-xs text-muted-foreground">Row/Col</Text>
                                            </View>
                                            {Array.from({ length: pricingColumns }).map((_, colIndex) => (
                                                <View key={`col-${colIndex}`} className="w-20 gap-1">
                                                    <Input
                                                        value={String(colIndex + 1)}
                                                        editable={false}
                                                        className="h-10 text-center"
                                                    />
                                                    {isPricingEditing ? (
                                                        <Button
                                                            variant="outline"
                                                            className="h-7 px-2"
                                                            onPress={() => removePricingColumn(colIndex)}
                                                            disabled={pricingColumns <= 1}
                                                        >
                                                            <Text>Del</Text>
                                                        </Button>
                                                    ) : null}
                                                </View>
                                            ))}
                                        </View>

                                        {pricingDraft.table.cols?.value?.length ? (
                                            <View className="flex-row gap-2">
                                                <View className="h-10 w-20 items-center justify-center rounded-lg border border-border">
                                                    <Text className="text-[11px] text-muted-foreground">Col range</Text>
                                                </View>
                                                {pricingDraft.table.cols.value.map((constraint, colIndex) => (
                                                    <View key={`col-range-${colIndex}`} className="w-20 gap-1">
                                                        {constraint.type === 'literal' ? (
                                                            <Input
                                                                value={String(constraint.value ?? '')}
                                                                editable={isPricingEditing}
                                                                placeholder="Value"
                                                                onChangeText={(value) =>
                                                                    setPricingDraft((previous) => {
                                                                        const next = [...(previous.table.cols?.value ?? [])];
                                                                        next[colIndex] = {
                                                                            type: 'literal',
                                                                            value,
                                                                        };
                                                                        return {
                                                                            ...previous,
                                                                            table: {
                                                                                ...previous.table,
                                                                                cols: previous.table.cols
                                                                                    ? {
                                                                                          ...previous.table.cols,
                                                                                          value: next,
                                                                                      }
                                                                                    : undefined,
                                                                            },
                                                                        };
                                                                    })
                                                                }
                                                            />
                                                        ) : (
                                                            <Input
                                                                value={`${constraint.start ?? 0}-${constraint.end ?? 0}`}
                                                                editable={isPricingEditing}
                                                                placeholder="0-0"
                                                                onChangeText={(value) => {
                                                                    const [rawStart, rawEnd] = value.split('-');
                                                                    const start = Number(rawStart);
                                                                    const end = Number(rawEnd);
                                                                    setPricingDraft((previous) => {
                                                                        const next = [...(previous.table.cols?.value ?? [])];
                                                                        next[colIndex] = {
                                                                            type: 'interval',
                                                                            start: Number.isFinite(start) ? start : 0,
                                                                            end: Number.isFinite(end) ? end : 0,
                                                                        };
                                                                        return {
                                                                            ...previous,
                                                                            table: {
                                                                                ...previous.table,
                                                                                cols: previous.table.cols
                                                                                    ? {
                                                                                          ...previous.table.cols,
                                                                                          value: next,
                                                                                      }
                                                                                    : undefined,
                                                                            },
                                                                        };
                                                                    });
                                                                }}
                                                            />
                                                        )}
                                                    </View>
                                                ))}
                                            </View>
                                        ) : null}

                                        {pricingDraft.table.values.map((row, rowIndex) => (
                                            <View key={`row-${rowIndex}`} className="flex-row gap-2">
                                                <View className="w-20 gap-1">
                                                    <Input value={`R${rowIndex + 1}`} editable={false} className="h-10 text-center" />
                                                    {isPricingEditing ? (
                                                        <Button
                                                            variant="outline"
                                                            className="h-7 px-2"
                                                            onPress={() => removePricingRow(rowIndex)}
                                                            disabled={pricingDraft.table.values.length <= 1}
                                                        >
                                                            <Text>Del</Text>
                                                        </Button>
                                                    ) : null}
                                                </View>
                                                {Array.from({ length: pricingColumns }).map((_, colIndex) => (
                                                    <Input
                                                        key={`cell-${rowIndex}-${colIndex}`}
                                                        value={String(row[colIndex] ?? 0)}
                                                        editable={isPricingEditing}
                                                        keyboardType="decimal-pad"
                                                        className="h-10 w-20 text-center"
                                                        onChangeText={(value) => updateGridCell(rowIndex, colIndex, value)}
                                                    />
                                                ))}
                                            </View>
                                        ))}

                                        {pricingDraft.table.rows?.value?.length ? (
                                            <View className="gap-2">
                                                <Text className="text-[11px] text-muted-foreground">Row ranges</Text>
                                                {pricingDraft.table.rows.value.map((constraint, rowIndex) => (
                                                    <Input
                                                        key={`row-range-${rowIndex}`}
                                                        value={
                                                            constraint.type === 'literal'
                                                                ? String(constraint.value ?? '')
                                                                : `${constraint.start ?? 0}-${constraint.end ?? 0}`
                                                        }
                                                        editable={isPricingEditing}
                                                        placeholder={constraint.type === 'literal' ? 'Value' : '0-0'}
                                                        onChangeText={(value) => {
                                                            setPricingDraft((previous) => {
                                                                const next = [...(previous.table.rows?.value ?? [])];
                                                                if (constraint.type === 'literal') {
                                                                    next[rowIndex] = {
                                                                        type: 'literal',
                                                                        value,
                                                                    };
                                                                } else {
                                                                    const [rawStart, rawEnd] = value.split('-');
                                                                    const start = Number(rawStart);
                                                                    const end = Number(rawEnd);
                                                                    next[rowIndex] = {
                                                                        type: 'interval',
                                                                        start: Number.isFinite(start) ? start : 0,
                                                                        end: Number.isFinite(end) ? end : 0,
                                                                    };
                                                                }

                                                                return {
                                                                    ...previous,
                                                                    table: {
                                                                        ...previous.table,
                                                                        rows: previous.table.rows
                                                                            ? {
                                                                                  ...previous.table.rows,
                                                                                  value: next,
                                                                              }
                                                                            : undefined,
                                                                    },
                                                                };
                                                            });
                                                        }}
                                                    />
                                                ))}
                                            </View>
                                        ) : null}
                                    </View>
                                </ScrollView>

                                <View className="gap-2">
                                    <Text className="text-sm font-medium">Fallback price</Text>
                                    <Input
                                        value={pricingDraft.table.fallback == null ? '' : String(pricingDraft.table.fallback)}
                                        editable={isPricingEditing}
                                        keyboardType="decimal-pad"
                                        placeholder="Optional"
                                        onChangeText={(value) => {
                                            const parsed = Number(value);
                                            setPricingDraft((previous) => ({
                                                ...previous,
                                                table: {
                                                    ...previous.table,
                                                    fallback: Number.isFinite(parsed) ? parsed : undefined,
                                                },
                                            }));
                                        }}
                                    />
                                </View>

                                <View className="gap-2 rounded-xl border border-border p-3">
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-sm font-medium">Extra prices</Text>
                                        {isPricingEditing ? (
                                            <Button
                                                variant="outline"
                                                className="h-8 px-3"
                                                onPress={() =>
                                                    setPricingDraft((previous) => ({
                                                        ...previous,
                                                        extra: [
                                                            ...previous.extra,
                                                            {
                                                                schemaDocId: participantSchemas[0]?.id ?? '',
                                                                default: false,
                                                                amount: 0,
                                                                description: '',
                                                            },
                                                        ],
                                                    }))
                                                }
                                            >
                                                <Text>Add</Text>
                                            </Button>
                                        ) : null}
                                    </View>

                                    {pricingDraft.extra.length === 0 ? (
                                        <Text className="text-muted-foreground text-sm">No extra price configured.</Text>
                                    ) : (
                                        pricingDraft.extra.map((extra, index) => (
                                            <View key={`extra-${index}`} className="gap-2 rounded-lg border border-border p-3">
                                                <ActionSheetSelect
                                                    labels={Object.fromEntries(
                                                        participantSchemas.map((schema) => [schema.id ?? schema.tempId, schema.name]),
                                                    )}
                                                    value={extra.schemaDocId}
                                                    onValueChange={(value) =>
                                                        setPricingDraft((previous) => ({
                                                            ...previous,
                                                            extra: previous.extra.map((entry, entryIndex) =>
                                                                entryIndex === index
                                                                    ? {
                                                                          ...entry,
                                                                          schemaDocId: value,
                                                                      }
                                                                    : entry,
                                                            ),
                                                        }))
                                                    }
                                                >
                                                    <ActionSheetSelectTrigger>
                                                        <ActionSheetSelectValue placeholder="Participant field" />
                                                    </ActionSheetSelectTrigger>
                                                    <ActionSheetSelectContent>
                                                        {participantSchemas
                                                            .filter((schema) => Boolean(schema.id))
                                                            .map((schema) => (
                                                                <ActionSheetSelectItem
                                                                    key={schema.id}
                                                                    value={schema.id as string}
                                                                />
                                                            ))}
                                                    </ActionSheetSelectContent>
                                                </ActionSheetSelect>

                                                <Input
                                                    value={String(extra.amount)}
                                                    editable={isPricingEditing}
                                                    keyboardType="decimal-pad"
                                                    placeholder="Amount"
                                                    onChangeText={(value) =>
                                                        setPricingDraft((previous) => ({
                                                            ...previous,
                                                            extra: previous.extra.map((entry, entryIndex) =>
                                                                entryIndex === index
                                                                    ? {
                                                                          ...entry,
                                                                          amount: Number(value) || 0,
                                                                      }
                                                                    : entry,
                                                            ),
                                                        }))
                                                    }
                                                />

                                                <Input
                                                    value={extra.description}
                                                    editable={isPricingEditing}
                                                    placeholder="Description"
                                                    onChangeText={(value) =>
                                                        setPricingDraft((previous) => ({
                                                            ...previous,
                                                            extra: previous.extra.map((entry, entryIndex) =>
                                                                entryIndex === index
                                                                    ? {
                                                                          ...entry,
                                                                          description: value,
                                                                      }
                                                                    : entry,
                                                            ),
                                                        }))
                                                    }
                                                />

                                                <View className="flex-row items-center justify-between">
                                                    <Text className="text-sm">Default enabled</Text>
                                                    <Switch
                                                        value={extra.default}
                                                        onValueChange={(value) =>
                                                            setPricingDraft((previous) => ({
                                                                ...previous,
                                                                extra: previous.extra.map((entry, entryIndex) =>
                                                                    entryIndex === index
                                                                        ? {
                                                                              ...entry,
                                                                              default: value,
                                                                          }
                                                                        : entry,
                                                                ),
                                                            }))
                                                        }
                                                        disabled={!isPricingEditing}
                                                    />
                                                </View>

                                                {isPricingEditing ? (
                                                    <Button
                                                        variant="outline"
                                                        className="h-8 px-3"
                                                        onPress={() =>
                                                            setPricingDraft((previous) => ({
                                                                ...previous,
                                                                extra: previous.extra.filter((_, entryIndex) => entryIndex !== index),
                                                            }))
                                                        }
                                                    >
                                                        <Text>Remove</Text>
                                                    </Button>
                                                ) : (
                                                    <Text className="text-muted-foreground text-xs">
                                                        {toCurrency(extra.amount)}
                                                    </Text>
                                                )}
                                            </View>
                                        ))
                                    )}
                                </View>
                            </View>
                        )}
                    </SectionCard>

                    <SectionCard
                        title="Participant data schema"
                        subtitle="Create, attach and edit participant data fields for this service."
                    >
                        <View className="mb-4 flex-row items-center justify-between">
                            <Text className="text-muted-foreground text-sm">Schemas linked to this service</Text>
                            <SectionActions
                                isEditing={isSchemasEditing}
                                isSaving={isSavingSchemas}
                                onEdit={() => {
                                    setParticipantSchemasDraft(participantSchemas.map((schema) => ({ ...schema, tempId: createTempId() })));
                                    setIsSchemasEditing(true);
                                }}
                                onCancel={() => {
                                    setParticipantSchemasDraft(participantSchemas.map((schema) => ({ ...schema, tempId: createTempId() })));
                                    setIsSchemasEditing(false);
                                }}
                                onSave={() => {
                                    void saveParticipantSchemas();
                                }}
                                disabled={!canEditSections || creating || isLoadingSchemas}
                            />
                        </View>

                        {isLoadingSchemas ? (
                            <View className="gap-2">
                                <Skeleton className="h-10 w-full rounded-lg" />
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </View>
                        ) : isSchemasEditing ? (
                            <View className="gap-3">
                                <View className="flex-row gap-2">
                                    <Button
                                        variant="outline"
                                        className="h-8 px-3"
                                        onPress={() =>
                                            setParticipantSchemasDraft((previous) => [
                                                ...previous,
                                                {
                                                    tempId: createTempId(),
                                                    name: '',
                                                    slug: '',
                                                    schema: createDefaultSchema('text'),
                                                    displayAccordingToId: null,
                                                },
                                            ])
                                        }
                                    >
                                        <Text>Add new field</Text>
                                    </Button>
                                </View>

                                {otherSchemas.length > 0 ? (
                                    <View className="gap-2 rounded-lg border border-border p-3">
                                        <Text className="text-sm font-medium">Attach existing org fields</Text>
                                        {otherSchemas.map((schema) => (
                                            <TouchableOpacity
                                                key={schema.tempId}
                                                className="flex-row items-center justify-between rounded-md border border-border px-3 py-2"
                                                onPress={() => {
                                                    if (schema.id) {
                                                        loadSchemaIntoDraft(schema.id);
                                                    }
                                                }}
                                            >
                                                <View>
                                                    <Text className="text-sm font-medium">{schema.name}</Text>
                                                    <Text className="text-muted-foreground text-xs">
                                                        {schemaTypeLabels[schema.schema.type]}
                                                    </Text>
                                                </View>
                                                <Text className="text-sm font-semibold">Add</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : null}

                                {participantSchemasDraft.length === 0 ? (
                                    <Text className="text-muted-foreground text-sm">No participant schema selected.</Text>
                                ) : (
                                    participantSchemasDraft.map((schema, index) => {
                                        const sourceCandidates = participantSchemasDraft.filter(
                                            (candidate) => candidate.tempId !== schema.tempId && Boolean(candidate.id),
                                        );
                                        const sourceSchema = schema.displayAccordingToId
                                            ? sourceCandidates.find((candidate) => candidate.id === schema.displayAccordingToId) ?? null
                                            : null;
                                        const sourceType = sourceSchema ? getDisplaySourceType(sourceSchema.schema) : null;
                                        const normalizedCondition = sourceType
                                            ? normalizeParticipantDisplayCondition(schema.schema.display_condition ?? null, sourceType) ??
                                              createDefaultParticipantDisplayCondition(sourceType)
                                            : null;

                                        return (
                                            <View key={schema.tempId} className="gap-2 rounded-xl border border-border p-3">
                                                <View className="flex-row items-center justify-between">
                                                    <Text className="text-sm font-semibold">Field {index + 1}</Text>
                                                    <Button
                                                        variant="outline"
                                                        className="h-8 px-3"
                                                        onPress={() => removeSchemaDraft(schema.tempId)}
                                                    >
                                                        <Text>Remove</Text>
                                                    </Button>
                                                </View>

                                                <Input
                                                    value={schema.name}
                                                    onChangeText={(value) =>
                                                        updateSchemaDraft(schema.tempId, (previous) => ({
                                                            ...previous,
                                                            name: value,
                                                        }))
                                                    }
                                                    placeholder="Field name"
                                                />
                                                <Input
                                                    value={schema.slug}
                                                    onChangeText={(value) =>
                                                        updateSchemaDraft(schema.tempId, (previous) => ({
                                                            ...previous,
                                                            slug: value,
                                                        }))
                                                    }
                                                    placeholder="field-slug"
                                                />

                                                <ActionSheetSelect
                                                    labels={Object.fromEntries(
                                                        (Object.keys(schemaTypeLabels) as ParticipantSchemaType[]).map((key) => [
                                                            key,
                                                            schemaTypeLabels[key],
                                                        ]),
                                                    )}
                                                    value={schema.schema.type}
                                                    onValueChange={(value) =>
                                                        updateSchemaDraft(schema.tempId, (previous) => ({
                                                            ...previous,
                                                            schema: createDefaultSchema(value as ParticipantSchemaType),
                                                            displayAccordingToId: null,
                                                        }))
                                                    }
                                                >
                                                    <ActionSheetSelectTrigger>
                                                        <ActionSheetSelectValue placeholder="Schema type" />
                                                    </ActionSheetSelectTrigger>
                                                    <ActionSheetSelectContent>
                                                        {(Object.keys(schemaTypeLabels) as ParticipantSchemaType[]).map((type) => (
                                                            <ActionSheetSelectItem key={type} value={type} />
                                                        ))}
                                                    </ActionSheetSelectContent>
                                                </ActionSheetSelect>

                                                {(schema.schema.type === 'text' || schema.schema.type === 'number') ? (
                                                    <View className="gap-2">
                                                        <View className="flex-row items-center justify-between">
                                                            <Text className="text-sm">Required</Text>
                                                            <Switch
                                                                value={Boolean(schema.schema.required)}
                                                                onValueChange={(value) =>
                                                                    updateSchemaDraft(schema.tempId, (previous) => ({
                                                                        ...previous,
                                                                        schema: {
                                                                            ...previous.schema,
                                                                            required: value,
                                                                        } as ParticipantSchemaConfig,
                                                                    }))
                                                                }
                                                            />
                                                        </View>

                                                        <Input
                                                            value={
                                                                schema.schema.type === 'text'
                                                                    ? (schema.schema.default ?? '')
                                                                    : schema.schema.default == null
                                                                      ? ''
                                                                      : String(schema.schema.default)
                                                            }
                                                            onChangeText={(value) =>
                                                                updateSchemaDraft(schema.tempId, (previous) => {
                                                                    if (previous.schema.type === 'text') {
                                                                        return {
                                                                            ...previous,
                                                                            schema: {
                                                                                ...previous.schema,
                                                                                default: value.trim() ? value : null,
                                                                            },
                                                                        };
                                                                    }

                                                                    if (previous.schema.type === 'number') {
                                                                        const parsed = Number(value);
                                                                        return {
                                                                            ...previous,
                                                                            schema: {
                                                                                ...previous.schema,
                                                                                default: Number.isFinite(parsed) ? parsed : null,
                                                                            },
                                                                        };
                                                                    }

                                                                    return previous;
                                                                })
                                                            }
                                                            placeholder="Default"
                                                        />

                                                        <Input
                                                            value={schema.schema.type === 'text' ? (schema.schema.unit ?? '') : (schema.schema.unit ?? '')}
                                                            onChangeText={(value) =>
                                                                updateSchemaDraft(schema.tempId, (previous) => {
                                                                    if (previous.schema.type === 'text' || previous.schema.type === 'number') {
                                                                        return {
                                                                            ...previous,
                                                                            schema: {
                                                                                ...previous.schema,
                                                                                unit: value.trim() ? value : null,
                                                                            },
                                                                        };
                                                                    }

                                                                    return previous;
                                                                })
                                                            }
                                                            placeholder="Unit"
                                                        />

                                                        {schema.schema.type === 'text' ? (
                                                            <View className="flex-row gap-2">
                                                                <Input
                                                                    value={
                                                                        schema.schema.min_length == null
                                                                            ? ''
                                                                            : String(schema.schema.min_length)
                                                                    }
                                                                    keyboardType="numeric"
                                                                    onChangeText={(value) =>
                                                                        updateSchemaDraft(schema.tempId, (previous) => {
                                                                            if (previous.schema.type !== 'text') return previous;
                                                                            const parsed = Number(value);
                                                                            return {
                                                                                ...previous,
                                                                                schema: {
                                                                                    ...previous.schema,
                                                                                    min_length: Number.isFinite(parsed)
                                                                                        ? parsed
                                                                                        : null,
                                                                                },
                                                                            };
                                                                        })
                                                                    }
                                                                    placeholder="Min length"
                                                                />
                                                                <Input
                                                                    value={
                                                                        schema.schema.max_length == null
                                                                            ? ''
                                                                            : String(schema.schema.max_length)
                                                                    }
                                                                    keyboardType="numeric"
                                                                    onChangeText={(value) =>
                                                                        updateSchemaDraft(schema.tempId, (previous) => {
                                                                            if (previous.schema.type !== 'text') return previous;
                                                                            const parsed = Number(value);
                                                                            return {
                                                                                ...previous,
                                                                                schema: {
                                                                                    ...previous.schema,
                                                                                    max_length: Number.isFinite(parsed)
                                                                                        ? parsed
                                                                                        : null,
                                                                                },
                                                                            };
                                                                        })
                                                                    }
                                                                    placeholder="Max length"
                                                                />
                                                            </View>
                                                        ) : (
                                                            <View className="flex-row gap-2">
                                                                <Input
                                                                    value={schema.schema.min == null ? '' : String(schema.schema.min)}
                                                                    keyboardType="decimal-pad"
                                                                    onChangeText={(value) =>
                                                                        updateSchemaDraft(schema.tempId, (previous) => {
                                                                            if (previous.schema.type !== 'number') return previous;
                                                                            const parsed = Number(value);
                                                                            return {
                                                                                ...previous,
                                                                                schema: {
                                                                                    ...previous.schema,
                                                                                    min: Number.isFinite(parsed) ? parsed : null,
                                                                                },
                                                                            };
                                                                        })
                                                                    }
                                                                    placeholder="Min"
                                                                />
                                                                <Input
                                                                    value={schema.schema.max == null ? '' : String(schema.schema.max)}
                                                                    keyboardType="decimal-pad"
                                                                    onChangeText={(value) =>
                                                                        updateSchemaDraft(schema.tempId, (previous) => {
                                                                            if (previous.schema.type !== 'number') return previous;
                                                                            const parsed = Number(value);
                                                                            return {
                                                                                ...previous,
                                                                                schema: {
                                                                                    ...previous.schema,
                                                                                    max: Number.isFinite(parsed) ? parsed : null,
                                                                                },
                                                                            };
                                                                        })
                                                                    }
                                                                    placeholder="Max"
                                                                />
                                                            </View>
                                                        )}
                                                    </View>
                                                ) : null}

                                                {schema.schema.type === 'boolean' ? (
                                                    <ActionSheetSelect
                                                        labels={booleanValueLabels}
                                                        value={
                                                            schema.schema.default == null
                                                                ? '__none__'
                                                                : schema.schema.default
                                                                  ? 'true'
                                                                  : 'false'
                                                        }
                                                        onValueChange={(value) =>
                                                            updateSchemaDraft(schema.tempId, (previous) => {
                                                                if (previous.schema.type !== 'boolean') return previous;
                                                                return {
                                                                    ...previous,
                                                                    schema: {
                                                                        ...previous.schema,
                                                                        default:
                                                                            value === '__none__'
                                                                                ? null
                                                                                : value === 'true',
                                                                    },
                                                                };
                                                            })
                                                        }
                                                    >
                                                        <ActionSheetSelectTrigger>
                                                            <ActionSheetSelectValue placeholder="Default value" />
                                                        </ActionSheetSelectTrigger>
                                                        <ActionSheetSelectContent>
                                                            <ActionSheetSelectItem value="__none__" />
                                                            <ActionSheetSelectItem value="true" />
                                                            <ActionSheetSelectItem value="false" />
                                                        </ActionSheetSelectContent>
                                                    </ActionSheetSelect>
                                                ) : null}

                                                {schema.schema.type === 'calculation' ? (
                                                    <View className="gap-2">
                                                        <View className="flex-row items-center justify-between">
                                                            <Text className="text-sm">Visible</Text>
                                                            <Switch
                                                                value={schema.schema.visible}
                                                                onValueChange={(value) =>
                                                                    updateSchemaDraft(schema.tempId, (previous) => {
                                                                        if (previous.schema.type !== 'calculation') return previous;
                                                                        return {
                                                                            ...previous,
                                                                            schema: {
                                                                                ...previous.schema,
                                                                                visible: value,
                                                                            },
                                                                        };
                                                                    })
                                                                }
                                                            />
                                                        </View>
                                                        <Input
                                                            value={String(
                                                                schema.schema.table?.values?.[0]?.[0] ?? 0,
                                                            )}
                                                            keyboardType="decimal-pad"
                                                            placeholder="Base calculated amount"
                                                            onChangeText={(value) => {
                                                                updateSchemaDraft(schema.tempId, (previous) => {
                                                                    if (previous.schema.type !== 'calculation') return previous;
                                                                    const parsed = Number(value);
                                                                    const firstValue = Number.isFinite(parsed) ? parsed : 0;
                                                                    const nextTable = participantTableSchema.safeParse(previous.schema.table)
                                                                        .success
                                                                        ? participantTableSchema.parse(previous.schema.table)
                                                                        : { values: [[0]] };
                                                                    const nextValues = nextTable.values.map((row) => [...row]);
                                                                    if (!nextValues[0]) nextValues[0] = [0];
                                                                    nextValues[0]![0] = firstValue;
                                                                    return {
                                                                        ...previous,
                                                                        schema: {
                                                                            ...previous.schema,
                                                                            table: {
                                                                                ...nextTable,
                                                                                values: nextValues,
                                                                            },
                                                                        },
                                                                    };
                                                                });
                                                            }}
                                                        />
                                                    </View>
                                                ) : null}

                                                <View className="gap-2 rounded-lg border border-dashed border-border p-3">
                                                    <Text className="text-sm font-medium">Display condition</Text>

                                                    <ActionSheetSelect
                                                        labels={Object.fromEntries([
                                                            ['__always__', 'Always visible'],
                                                            ...sourceCandidates
                                                                .filter((candidate) => Boolean(candidate.id))
                                                                .map((candidate) => [candidate.id as string, candidate.name]),
                                                        ])}
                                                        value={schema.displayAccordingToId ?? '__always__'}
                                                        onValueChange={(value) =>
                                                            setSchemaDisplaySource(
                                                                schema.tempId,
                                                                value === '__always__' ? null : value,
                                                            )
                                                        }
                                                    >
                                                        <ActionSheetSelectTrigger>
                                                            <ActionSheetSelectValue placeholder="Condition source field" />
                                                        </ActionSheetSelectTrigger>
                                                        <ActionSheetSelectContent>
                                                            <ActionSheetSelectItem value="__always__" />
                                                            {sourceCandidates
                                                                .filter((candidate) => Boolean(candidate.id))
                                                                .map((candidate) => (
                                                                    <ActionSheetSelectItem
                                                                        key={candidate.id}
                                                                        value={candidate.id as string}
                                                                    />
                                                                ))}
                                                        </ActionSheetSelectContent>
                                                    </ActionSheetSelect>

                                                    {sourceType && normalizedCondition ? (
                                                        <>
                                                            <ActionSheetSelect
                                                                labels={Object.fromEntries(
                                                                    (
                                                                        sourceType === 'boolean'
                                                                            ? ['is_true', 'is_false']
                                                                            : sourceType === 'number'
                                                                              ? ['gt', 'gte', 'lt', 'lte', 'eq']
                                                                              : ['equals', 'length_gt', 'length_lt', 'length_eq']
                                                                    ).map((operator) => [
                                                                        operator,
                                                                        displayConditionOperatorLabels[
                                                                            operator as ParticipantDisplayCondition['operator']
                                                                        ],
                                                                    ]),
                                                                )}
                                                                value={normalizedCondition.operator}
                                                                onValueChange={(value) =>
                                                                    updateSchemaOperator(
                                                                        schema.tempId,
                                                                        value as ParticipantDisplayCondition['operator'],
                                                                    )
                                                                }
                                                            >
                                                                <ActionSheetSelectTrigger>
                                                                    <ActionSheetSelectValue placeholder="Operator" />
                                                                </ActionSheetSelectTrigger>
                                                                <ActionSheetSelectContent>
                                                                    {(sourceType === 'boolean'
                                                                        ? ['is_true', 'is_false']
                                                                        : sourceType === 'number'
                                                                          ? ['gt', 'gte', 'lt', 'lte', 'eq']
                                                                          : ['equals', 'length_gt', 'length_lt', 'length_eq']
                                                                    ).map((operator) => (
                                                                        <ActionSheetSelectItem key={operator} value={operator} />
                                                                    ))}
                                                                </ActionSheetSelectContent>
                                                            </ActionSheetSelect>

                                                            {sourceType === 'boolean' ? null : (
                                                                <Input
                                                                    value={String(
                                                                        sourceType === 'number'
                                                                            ? normalizedCondition.sourceType === 'number'
                                                                                ? normalizedCondition.value
                                                                                : 0
                                                                            : normalizedCondition.sourceType === 'text'
                                                                              ? normalizedCondition.value
                                                                              : '',
                                                                    )}
                                                                    keyboardType={
                                                                        sourceType === 'number' ||
                                                                        (sourceType === 'text' &&
                                                                            normalizedCondition.operator !== 'equals')
                                                                            ? 'decimal-pad'
                                                                            : 'default'
                                                                    }
                                                                    onChangeText={(value) =>
                                                                        updateSchemaConditionValue(schema.tempId, value)
                                                                    }
                                                                    placeholder="Condition value"
                                                                />
                                                            )}
                                                        </>
                                                    ) : null}
                                                </View>
                                            </View>
                                        );
                                    })
                                )}
                            </View>
                        ) : participantSchemas.length === 0 ? (
                            <Text className="text-muted-foreground text-sm">No participant schema configured for this service.</Text>
                        ) : (
                            <View className="gap-2">
                                {participantSchemas.map((schema) => {
                                    const typeLabel = schemaTypeLabels[schema.schema.type];
                                    const condition = participantDisplayConditionSchema.safeParse(
                                        schema.schema.display_condition ?? null,
                                    );
                                    const conditionLabel =
                                        schema.displayAccordingToId && condition.success
                                            ? `${displayConditionOperatorLabels[condition.data.operator]} ${
                                                  'value' in condition.data ? String(condition.data.value) : ''
                                              }`
                                            : null;

                                    return (
                                        <View key={schema.tempId} className="rounded-xl border border-border px-3 py-3">
                                            <Text className="text-sm font-semibold">{schema.name || 'Untitled field'}</Text>
                                            <Text className="text-muted-foreground text-xs">{typeLabel}</Text>
                                            {conditionLabel ? (
                                                <Text className="text-muted-foreground mt-1 text-xs">{conditionLabel}</Text>
                                            ) : null}
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </SectionCard>

                    <SectionCard
                        title="Gallery"
                        subtitle="Manage additional images shown on checkout pages."
                    >
                        <View className="mb-4 flex-row items-center justify-between">
                            <Text className="text-muted-foreground text-sm">Service gallery images</Text>
                            <SectionActions
                                isEditing={isGalleryEditing}
                                isSaving={isSavingGallery}
                                onEdit={() => setIsGalleryEditing(true)}
                                onCancel={() => {
                                    setGalleryDraft(galleryValue);
                                    setIsGalleryEditing(false);
                                }}
                                onSave={() => {
                                    void saveGallery();
                                }}
                                disabled={!canEditSections || creating}
                            />
                        </View>

                        <View className="gap-3">
                            <OrganizationMediaManager
                                value={(isGalleryEditing ? galleryDraft : galleryValue).map((image) => image.url)}
                                onValueChange={(value) => {
                                    if (!isGalleryEditing) return;
                                    const urls = Array.isArray(value) ? value : [];
                                    setGalleryDraft((previous) => normalizeGalleryDraftFromUrls(urls, previous));
                                }}
                                multiple={true}
                                isUrl={true}
                                triggerClassName="h-28 w-full rounded-xl"
                                imageClassName="h-full w-full object-cover"
                                disabled={!isGalleryEditing}
                            />

                            {(isGalleryEditing ? galleryDraft : galleryValue).length === 0 ? (
                                <Text className="text-muted-foreground text-sm">No gallery image configured.</Text>
                            ) : (
                                <View className="gap-3">
                                    {(isGalleryEditing ? galleryDraft : galleryValue).map((image, index) => (
                                        <View key={`${image.url}-${index}`} className="rounded-xl border border-border p-3">
                                            <View className="bg-muted mb-2 aspect-video overflow-hidden rounded-lg">
                                                <Image
                                                    source={{ uri: image.url }}
                                                    className="h-full w-full"
                                                    resizeMode="cover"
                                                />
                                            </View>

                                            {isGalleryEditing ? (
                                                <View className="gap-2">
                                                    <Input
                                                        value={image.alt ?? ''}
                                                        onChangeText={(value) =>
                                                            setGalleryDraft((previous) =>
                                                                previous.map((entry, entryIndex) =>
                                                                    entryIndex === index
                                                                        ? {
                                                                              ...entry,
                                                                              alt: value.trim() ? value : null,
                                                                          }
                                                                        : entry,
                                                                ),
                                                            )
                                                        }
                                                        placeholder="Alt text"
                                                    />

                                                    <View className="flex-row gap-2">
                                                        <Button
                                                            variant="outline"
                                                            className="h-8 px-3"
                                                            onPress={() => {
                                                                if (index === 0) return;
                                                                setGalleryDraft((previous) => {
                                                                    const next = [...previous];
                                                                    const current = next[index];
                                                                    const before = next[index - 1];
                                                                    if (!current || !before) return previous;
                                                                    next[index] = before;
                                                                    next[index - 1] = current;
                                                                    return next;
                                                                });
                                                            }}
                                                            disabled={index === 0}
                                                        >
                                                            <Text>Up</Text>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="h-8 px-3"
                                                            onPress={() => {
                                                                if (index === galleryDraft.length - 1) return;
                                                                setGalleryDraft((previous) => {
                                                                    const next = [...previous];
                                                                    const current = next[index];
                                                                    const after = next[index + 1];
                                                                    if (!current || !after) return previous;
                                                                    next[index] = after;
                                                                    next[index + 1] = current;
                                                                    return next;
                                                                });
                                                            }}
                                                            disabled={index === galleryDraft.length - 1}
                                                        >
                                                            <Text>Down</Text>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="h-8 px-3"
                                                            onPress={() =>
                                                                setGalleryDraft((previous) =>
                                                                    previous.filter((_, entryIndex) => entryIndex !== index),
                                                                )
                                                            }
                                                        >
                                                            <Text>Remove</Text>
                                                        </Button>
                                                    </View>
                                                </View>
                                            ) : (
                                                <Text className="text-muted-foreground text-xs">{image.alt || 'No alt text'}</Text>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </SectionCard>
                </View>
            </ScrollView>
        </View>
    );
}
