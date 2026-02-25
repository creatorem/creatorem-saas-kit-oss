'use client';

/**
 * Client-side helper functions for handling exports from the bulkExportTableEntities action
 */

export interface ExportResult {
    success: boolean;
    exportedCount: number;
    fileName: string;
    mimeType: string;
    fileContent: string; // Base64 encoded
    message: string;
}

/**
 * Downloads a file from the export result
 */
export function downloadExportFile(result: ExportResult): void {
    if (!result.success || !result.fileContent) {
        throw new Error('Export failed or no file content received');
    }

    // Convert base64 to blob
    const byteCharacters = atob(result.fileContent);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: result.mimeType });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.fileName;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Handles export action and automatically downloads the file
 */
export async function handleExportAndDownload(
    exportAction: (params: any) => Promise<ExportResult>,
    params: {
        entityIds: string[];
        entitySlug: string;
        format: 'csv' | 'excel';
        columns?: string[];
    },
): Promise<void> {
    try {
        const result = await exportAction(params);
        downloadExportFile(result);
    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
}
