import { MessagePartState } from '@assistant-ui/react';
import { AiTool, AiToolErrorItem, AiToolIfCompleted, AiToolLoader, AiToolSuccessItem } from '@kit/ai/ui/ai-tool';
import { Button } from '@kit/ui/button';
import { Icon } from '@kit/ui/icon';
import { ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@kit/ui/item';
import Link from 'next/link';
import { useState } from 'react';

const args = {
    newProduct: {
        name: 'Car',
        description: 'Car description',
        imageUrl: 'https://via.placeholder.com/150',
        price: 100,
        currency: 'USD',
    },
};

const result = {
    data: {
        redirectUrl: 'https://www.google.com',
        product: {
            name: 'Car',
        },
    },
};

export const AiToolSandbox = () => {
    const [status, setStatus] = useState<MessagePartState['status']>({ type: 'running' });

    return (
        <>
            <div className="mb-2 flex gap-2">
                <Button aria-label="Run" onClick={() => setStatus({ type: 'running' })}>
                    Run
                </Button>
                <Button
                    aria-label="Action Required"
                    // @ts-expect-error - reason is not assignable to type 'interrupt'
                    onClick={() => setStatus({ type: 'requires-action', reason: 'tool-calls' })}
                >
                    Action Required
                </Button>
                <Button
                    aria-label="Action Required"
                    onClick={() => setStatus({ type: 'requires-action', reason: 'interrupt' })}
                >
                    Pause
                </Button>
                <Button aria-label="Incomplete" onClick={() => setStatus({ type: 'incomplete', reason: 'cancelled' })}>
                    Incomplete
                </Button>
                <Button aria-label="Error" onClick={() => setStatus({ type: 'incomplete', reason: 'error' })}>
                    Error
                </Button>
                <Button aria-label="Other Error" onClick={() => setStatus({ type: 'incomplete', reason: 'other' })}>
                    Other Error
                </Button>
                <Button aria-label="Complete" onClick={() => setStatus({ type: 'complete' })}>
                    Complete
                </Button>
            </div>

            <AiTool status={status} name="product creation" coverAllStatuses>
                <AiToolLoader
                    action={
                        <div className="rounded-md border p-2">
                            <Icon name="ShoppingCart" className="size-4" />
                        </div>
                    }
                >
                    Creating product{args?.newProduct?.name ? ` ${args.newProduct.name}` : ''}...
                </AiToolLoader>

                <AiToolIfCompleted>
                    {result?.data ? (
                        <AiToolSuccessItem confetti>
                            <Link href={result.data.redirectUrl}>
                                <ItemMedia>
                                    <Icon name="Check" className="size-4" />
                                </ItemMedia>

                                <ItemContent>
                                    <ItemTitle>Product {result.data.product.name} created</ItemTitle>
                                    <ItemDescription>
                                        Product {result.data.product.name} has been created successfully.
                                    </ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <Icon name="ArrowRight" className="size-4" />
                                </ItemActions>
                            </Link>
                        </AiToolSuccessItem>
                    ) : (
                        <AiToolErrorItem>
                            <ItemMedia>
                                <Icon name="AlertCircle" className="size-4" />
                            </ItemMedia>

                            <ItemContent>
                                <ItemTitle>No result data found.</ItemTitle>
                                <ItemDescription>
                                    The `result.data` or `result` object is empty. Please try again.
                                    <br />
                                    The result object is: {JSON.stringify(result)}
                                </ItemDescription>
                            </ItemContent>
                        </AiToolErrorItem>
                    )}
                </AiToolIfCompleted>
            </AiTool>
        </>
    );
};
