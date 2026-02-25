import { useSupabase } from '@kit/supabase';
import { ExtendedFileObject } from '@kit/ui/media-manager';
import { toast } from '@kit/ui/sonner';
import { useCallback, useState } from 'react';

type FileBody =
    | ArrayBuffer
    | ArrayBufferView
    | Blob
    | Buffer
    | File
    | FormData
    | NodeJS.ReadableStream
    | ReadableStream<Uint8Array>
    | URLSearchParams
    | string;

export const useOrganizationMediaControllers = ({ organizationId }: { organizationId: string }) => {
    const supabase = useSupabase();
    const [medias, setMedias] = useState<ExtendedFileObject[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadMedias = useCallback(
        async (path: string[]): Promise<ExtendedFileObject[]> => {
            setIsLoading(true);
            try {
                // Fetch organization media using direct query to get metadata
                const { data, error } = await supabase
                    .schema('storage')
                    .from('objects')
                    .select('*')
                    .eq('bucket_id', 'organization_media')
                    .like('name', `${organizationId}%`);

                if (error) {
                    toast.error('Failed to fetch organization medias');
                    return [];
                }

                const mediaList = (data ?? []).map(
                    (d) =>
                        ({
                            ...d,
                            // direct query gives the full path as name, extract just the filename
                            name: d.name?.split('/').pop(),
                        }) as ExtendedFileObject,
                );

                setMedias(mediaList);
                return mediaList;
            } catch (error) {
                toast.error('Failed to fetch organization medias');
                return [];
            } finally {
                setIsLoading(false);
            }
        },
        [supabase, organizationId],
    );

    const uploadMedia = useCallback(
        async ({ path, fileName, file }: { path: string[]; fileName: string; file: FileBody }) => {
            try {
                const filePath = path.length > 0 ? `${path.join('/')}/${fileName}` : fileName;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('organization_media')
                    .upload(filePath, file, {
                        upsert: true,
                        // contentType: 'image/*',
                    });

                if (uploadError || !uploadData) {
                    return {
                        data: null as any,
                        error: uploadError || new Error('Upload failed'),
                    };
                }

                // Refresh the media list and find the uploaded file
                const updatedMedias = await loadMedias(path);
                const uploadedFile = updatedMedias.find((media) => media.name === fileName);

                if (!uploadedFile) {
                    return {
                        data: null as any,
                        error: new Error('Uploaded file not found in media list'),
                    };
                }

                return {
                    data: uploadedFile,
                    error: null,
                };
            } catch (error) {
                return {
                    data: null as any,
                    error: error instanceof Error ? error : new Error('Upload failed'),
                };
            }
        },
        [supabase, loadMedias],
    );

    const getUrl = useCallback(
        (media: ExtendedFileObject, path: string[]) => {
            const filePath = path.length > 0 ? `${path.join('/')}/${media.name}` : media.name;
            const { data } = supabase.storage.from('organization_media').getPublicUrl(filePath);

            return data.publicUrl;
        },
        [supabase],
    );

    const updateMedia = useCallback(
        async ({
            alternativeText,
            path,
            media,
        }: {
            alternativeText: string;
            path: string[];
            media: ExtendedFileObject;
        }) => {
            try {
                const filePath = path.length > 0 ? `${path.join('/')}/${media.name}` : media.name;

                // First, download the existing file to preserve its content
                const { data: fileData, error: downloadError } = await supabase.storage
                    .from('organization_media')
                    .download(filePath);

                if (downloadError || !fileData) {
                    throw new Error(`Failed to download existing file: ${downloadError?.message || 'File not found'}`);
                }

                // Update the file with the same content but new metadata
                const { error: updateError } = await supabase.storage
                    .from('organization_media')
                    .update(filePath, fileData, {
                        upsert: false,
                        metadata: {
                            ...media.user_metadata,
                            alternativeText,
                        },
                    });

                if (updateError) {
                    throw new Error(`Failed to update metadata: ${updateError.message}`);
                }

                return { alternativeText };
            } catch (error) {
                throw error instanceof Error ? error : new Error('Update failed');
            }
        },
        [supabase],
    );

    const deleteMedia = useCallback(
        async ({ path, media }: { path: string[]; media: ExtendedFileObject }) => {
            try {
                const filePath = path.length > 0 ? `${path.join('/')}/${media.name}` : media.name;

                const { error } = await supabase.storage.from('organization_media').remove([filePath]);

                if (error) {
                    throw new Error(`Failed to delete file: ${error.message}`);
                }

                // Refresh the media list after deletion
                await loadMedias(path);
            } catch (error) {
                throw error instanceof Error ? error : new Error('Delete failed');
            }
        },
        [supabase, loadMedias],
    );

    return { medias, loadMedias, isMediaLoading: isLoading, uploadMedia, getUrl, updateMedia, deleteMedia };
};
