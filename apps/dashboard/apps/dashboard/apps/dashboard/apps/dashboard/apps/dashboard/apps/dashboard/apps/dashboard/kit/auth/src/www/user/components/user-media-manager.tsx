'use client';

import { useUser } from '@kit/auth/shared/user';
import { MediaManager, MediaManagerContent, MediaManagerSkeleton, MediaManagerTrigger } from '@kit/ui/media-manager';
import React, { useCallback, useEffect } from 'react';
import { useMediaControllers } from '../../../shared/user/hooks/use-media-controllers';

interface InnerUserMediaManagerProps<TMultiple extends boolean, TIsUrl extends boolean>
    extends Omit<
        React.ComponentPropsWithoutRef<typeof MediaManager<TMultiple, TIsUrl>>,
        'medias' | 'rootPath' | 'onPathChange' | 'getUrl'
    > {
    userAuthId: string;
    triggerClassName?: string;
    imageClassName?: string;
    placeholder?: React.ReactNode;
}

function InnerUserMediaManager<TMultiple extends boolean, TIsUrl extends boolean>({
    disabled,
    onValueChange,
    multiple,
    isUrl,
    userAuthId,
    triggerClassName,
    imageClassName,
    placeholder,
    ...props
}: InnerUserMediaManagerProps<TMultiple, TIsUrl>) {
    const { medias, loadMedias, isMediaLoading, uploadMedia, getUrl, updateMedia, deleteMedia } = useMediaControllers();

    useEffect(() => {
        loadMedias([userAuthId]);
    }, [loadMedias, userAuthId]);

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
            rootPath={[userAuthId]}
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

interface UserMediaManagerProps<TMultiple extends boolean, TIsUrl extends boolean>
    extends Omit<
        React.ComponentPropsWithoutRef<typeof MediaManager<TMultiple, TIsUrl>>,
        'medias' | 'rootPath' | 'onPathChange' | 'getUrl'
    > {
    triggerClassName?: string;
    imageClassName?: string;
    placeholder?: React.ReactNode;
}

export function UserMediaManager<TMultiple extends boolean, TIsUrl extends boolean>(
    props: UserMediaManagerProps<TMultiple, TIsUrl>,
) {
    const user = useUser();

    if (!user?.authUserId) {
        return <MediaManagerSkeleton className={props.triggerClassName} />;
    }

    return <InnerUserMediaManager {...props} userAuthId={user.authUserId} />;
}
