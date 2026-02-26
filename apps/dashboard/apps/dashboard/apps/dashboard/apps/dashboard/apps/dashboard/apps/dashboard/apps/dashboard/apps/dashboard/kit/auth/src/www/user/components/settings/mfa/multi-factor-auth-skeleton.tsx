import { Card, CardContent, CardFooter } from '@kit/ui/card';
import { Separator } from '@kit/ui/separator';
import { Skeleton } from '@kit/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kit/ui/table';
import { cn } from '@kit/utils';

interface MultiFactorAuthSkeletonProps {
    className?: string;
    factorCount?: number;
    variant?: 'empty' | 'withFactors';
}

export function MultiFactorAuthSkeleton({
    className,
    factorCount = 2,
    variant = 'withFactors',
}: MultiFactorAuthSkeletonProps) {
    if (variant === 'empty') {
        return (
            <Card className={cn(className)}>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="mt-2 space-y-1">
                        <Skeleton className="h-4 w-full max-w-md" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </CardContent>
                <Separator />
                <CardFooter className="justify-end">
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className={cn(className)}>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Skeleton className="h-4 w-20" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-16" />
                            </TableHead>
                            <TableHead>
                                <Skeleton className="h-4 w-16" />
                            </TableHead>
                            <TableHead />
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {Array.from({ length: factorCount }).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Skeleton className="h-4 w-24 sm:w-32" />
                                </TableCell>

                                <TableCell>
                                    <Skeleton className="h-5 w-12 rounded-full" />
                                </TableCell>

                                <TableCell>
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </TableCell>

                                <TableCell className="flex justify-end">
                                    <Skeleton className="h-8 w-8 rounded" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <Separator />
            <CardFooter className="justify-end">
                <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    );
}
