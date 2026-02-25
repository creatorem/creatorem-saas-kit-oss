'client only';

import { type TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { toast } from '@kit/ui/sonner';
import { contentTypeRouter } from '../router/router';
import type { ContentType } from '../shared/types';

/**
 * Helper function to download exported file from base64 content
 * Supports CSV, Excel, and JSON formats
 */
export function downloadExportedFile(base64Content: string, fileName: string, mimeType: string): void {
    // Decode base64 content
    const binaryString = atob(base64Content);

    // Convert binary string to byte array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // Create blob with appropriate MIME type
    const blob = new Blob([bytes], { type: mimeType });

    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

export const createExportHandler = async (
    clientTrpc: TrpcClientWithQuery<typeof contentTypeRouter>,
    contentType: ContentType,
    format: 'csv' | 'excel' | 'json',
    ids: string[],
) => {
    let loadingToastId;
    try {
        loadingToastId = toast.loading(`Exporting to ${format.toUpperCase()}...`);

        const result = await clientTrpc.bulkExportTableEntities.fetch({
            entityIds: ids,
            entitySlug: contentType,
            format,
        });

        if (!result) {
            toast.error(`Failed to export ${contentType}`);
            return;
        }

        // Use helper function to download file
        downloadExportedFile(
            result.fileContent,
            result.fileName ||
                `${contentType}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`,
            result.mimeType,
        );

        if (ids.length > 1) {
            toast.success(result.message || `Exported ${ids.length} ${contentType}s to ${format.toUpperCase()}`);
        } else {
            toast.success(result.message || `Exported ${contentType} to ${format.toUpperCase()}`);
        }
    } catch (error) {
        console.error('Export error:', error);
        toast.error(`Failed to export ${contentType}`);
    } finally {
        toast.dismiss(loadingToastId);
    }
};

// In Next.js 15, server actions automatically revalidate the current route after they complete. so the UI will be updated automatically.
export const createDeleteHandler = async (
    clientTrpc: TrpcClientWithQuery<typeof contentTypeRouter>,
    contentType: ContentType,
    ids: string[],
) => {
    let loadingToastId;
    try {
        loadingToastId = toast.loading('Deleting...');

        const result = await clientTrpc.bulkDeleteTableEntities.fetch({
            entityIds: ids,
            entitySlug: contentType,
        });

        if (!result) {
            toast.error(`Failed to delete ${contentType}`);
            return;
        }

        if (ids.length > 1) {
            toast.success(result.message || `Successfully deleted ${ids.length} ${contentType}s`);
        } else {
            toast.success(result.message || `Successfully deleted ${contentType}`);
        }
    } catch (error) {
        console.error('Delete error:', error);
        toast.error(`Failed to delete ${contentType}`);
    } finally {
        toast.dismiss(loadingToastId);
    }
};
