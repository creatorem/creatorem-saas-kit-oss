'use client';

import { type TrpcClientWithQuery } from '@creatorem/next-trpc/query-client';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { ConfirmButton } from '@kit/ui/confirm-button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@kit/ui/dropdown-menu';
import { MediaQueries } from '@kit/ui/hooks/use-media-query';
import { Icon } from '@kit/ui/icon';
import { ResponsiveScrollArea } from '@kit/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext } from 'react';
import { contentTypeRouter } from '../../../router/router';
import type { ContentType } from '../../../shared/types';
import { createDeleteHandler, createExportHandler } from '../../utils';

interface ContentTypeMetaContextType {
    contentType: ContentType;
    clientTrpc: TrpcClientWithQuery<typeof contentTypeRouter>;
    data: {
        id: string;
        createdAt: string;
        updatedAt: string;
    };
}

const ContentTypeMetaContext = createContext<ContentTypeMetaContextType | null>(null);

const useContentTypeMetaContext = () => {
    const context = useContext(ContentTypeMetaContext);
    if (!context) {
        throw new Error('useContentTypeMetaContext must be used within a ContentTypeMetaProvider');
    }
    return context;
};

interface ContentTypeMetaProps extends ContentTypeMetaContextType {
    children: React.ReactNode;
}

export function ContentTypeMeta({ contentType, clientTrpc, data, children }: ContentTypeMetaProps) {
    return (
        <ContentTypeMetaContext.Provider value={{ contentType, clientTrpc, data }}>
            <ResponsiveScrollArea
                breakpoint={MediaQueries.MdUp}
                mediaQueryOptions={{ ssr: true }}
                className="h-full md:border-r"
            >
                <div className="size-full divide-y border-b md:w-[360px] md:min-w-[360px]">
                    <Card className="bg-background rounded-none border-0 shadow-none">
                        <CardContent className="flex flex-col gap-6 px-0">{children}</CardContent>
                    </Card>
                </div>
            </ResponsiveScrollArea>
        </ContentTypeMetaContext.Provider>
    );
}

export function ContentTypeMetaDates() {
    const { data } = useContentTypeMetaContext();
    return (
        <div className="flex flex-wrap gap-2 px-6">
            <Badge variant="outline" className="rounded-full">
                <Icon name="Calendar" className="h-4 w-4" />
                <span className="text-muted-foreground font-medium">Created</span>
                {new Date(data.createdAt ?? '').toLocaleDateString()}
            </Badge>
            <Badge variant="outline" className="rounded-full">
                <Icon name="PencilRuler" className="h-4 w-4" />
                <span className="text-muted-foreground font-medium">Last Updated</span>
                {new Date(data.updatedAt ?? '').toLocaleDateString()}
            </Badge>
        </div>
    );
}

interface ContentTypeMetaActionsProps {
    children?: React.ReactNode;
    gobackUrl: string;
}
export function ContentTypeMetaActions({ children, gobackUrl }: ContentTypeMetaActionsProps) {
    return (
        <div className="space-y-2 px-6">
            {children}
            <ContentTypeMetaExportButton />
            <ContentTypeMetaDeleteButton gobackUrl={gobackUrl} />
        </div>
    );
}

export function ContentTypeMetaExportButton() {
    const { data, contentType, clientTrpc } = useContentTypeMetaContext();

    const handleExport = useCallback(
        async (format: 'csv' | 'excel' | 'json') => {
            await createExportHandler(clientTrpc, contentType, format, [data.id]);
        },
        [clientTrpc, contentType, data.id],
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="w-full" variant="outline" size="sm" aria-label="Export">
                    <Icon name="Download" className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleExport('csv')}>
                    <Icon name="FileBarChart" className="mr-2 h-4 w-4" />
                    Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleExport('excel')}>
                    <Icon name="Table" className="mr-2 h-4 w-4" />
                    Export to Excel
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleExport('json')}>
                    <Icon name="FileJson" className="mr-2 h-4 w-4" />
                    Export to JSON
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

interface ContentTypeMetaDeleteButtonProps {
    gobackUrl: string;
}

export function ContentTypeMetaDeleteButton({ gobackUrl }: ContentTypeMetaDeleteButtonProps) {
    const { data, contentType, clientTrpc } = useContentTypeMetaContext();
    const router = useRouter();

    const handleDelete = useCallback(async () => {
        await createDeleteHandler(clientTrpc, contentType, [data.id]);
        router.push(gobackUrl);
    }, [clientTrpc, contentType, data.id, gobackUrl, router]);

    return (
        <ConfirmButton
            variant="outline_destructive"
            size="sm"
            aria-label="Delete item"
            className="w-full"
            onConfirmation={handleDelete}
            template="delete"
        >
            <Icon name="Trash" className="mr-2 h-4 w-4" />
            Delete
        </ConfirmButton>
    );
}
