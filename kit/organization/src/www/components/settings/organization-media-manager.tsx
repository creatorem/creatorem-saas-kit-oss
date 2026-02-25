'use client';

import { useOrganization } from '@kit/organization/shared';
import { MediaManager, MediaManagerContent, MediaManagerSkeleton, MediaManagerTrigger } from '@kit/ui/media-manager';
import React, { useCallback, useEffect } from 'react';
import { useOrganizationMediaControllers } from '../../../shared/hooks/use-organization-media-controllers';

interface InnerOrganizationMediaManagerProps<TMultiple extends boolean, TIsUrl extends boolean>
    extends Omit<
        React.ComponentPropsWithoutRef<typeof MediaManager<TMultiple, TIsUrl>>,
        'medias' | 'rootPath' | 'onPathChange' | 'getUrl'
    > {
    organizationId: string;
    triggerClassName?: string;
    imageClassName?: string;
    placeholder?: React.ReactNode;
}

function InnerOrganizationMediaManager<TMultiple extends boolean, TIsUrl extends boolean>({
    disabled,
    onValueChange,
    multiple,
    isUrl,
    organizationId,
    triggerClassName,
    imageClassName,
    placeholder,
    ...props
}: InnerOrganizationMediaManagerProps<TMultiple, TIsUrl>) {
    const { medias, loadMedias, isMediaLoading, uploadMedia, getUrl, updateMedia, deleteMedia } =
        useOrganizationMediaControllers({ organizationId });

    useEffect(() => {
        loadMedias([organizationId]);
    }, [loadMedias, organizationId]);

    const handleUpload = useCallback(
        async ({ file, path }: { file: File; path: string[] }) => {
            return uploadMedia({
                fileName: file.name,
                path,
                file,
            });
        },
        [loadMedias],
    );

    return (
        <MediaManager
            {...props}
            rootPath={[organizationId]}
            multiple={multiple}
            isUrl={isUrl}
            disabled={disabled || isMediaLoading}
            onValueChange={onValueChange}
            medias={medias}
            onPathChange={loadMedias}
            getUrl={getUrl}
            onUpdate={updateMedia}
            onDelete={deleteMedia}
            onUpload={handleUpload}
        >
            <MediaManagerTrigger
                className={triggerClassName}
                imageClassName={imageClassName}
                placeholder={placeholder}
            />
            <MediaManagerContent />
        </MediaManager>
    );
}

interface OrganizationMediaManagerProps<TMultiple extends boolean, TIsUrl extends boolean>
    extends Omit<
        React.ComponentPropsWithoutRef<typeof MediaManager<TMultiple, TIsUrl>>,
        'medias' | 'rootPath' | 'onPathChange' | 'getUrl'
    > {
    triggerClassName?: string;
    imageClassName?: string;
    placeholder?: React.ReactNode;
}

export function OrganizationMediaManager<TMultiple extends boolean, TIsUrl extends boolean>(
    props: OrganizationMediaManagerProps<TMultiple, TIsUrl>,
) {
    const { organization } = useOrganization();

    if (!organization?.id) {
        return <MediaManagerSkeleton className={props.triggerClassName} />;
    }

    return <InnerOrganizationMediaManager {...props} organizationId={organization.id} />;
}
