'use client';

import {
    MediaManager,
    MediaManagerContent,
    MediaManagerSkeleton,
    MediaManagerTrigger,
} from '@kit/native-ui/media-manager';
import { useOrganization } from '@kit/organization/shared';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
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
        async ({ file, path }: { file: ImagePicker.ImagePickerAsset; path: string[] }) => {
            const fileName = file.fileName ? file.fileName : (Math.random() + 1).toString(36).substring(7);
            const base64 = await new FileSystem.File(file.uri).base64();
            const arrayBuffer = decode(base64);

            return uploadMedia({
                fileName,
                path,
                file: arrayBuffer,
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
