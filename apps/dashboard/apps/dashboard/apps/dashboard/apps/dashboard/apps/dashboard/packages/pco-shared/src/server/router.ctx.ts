import { CtxRouter } from '@creatorem/next-trpc';
import { type NextRequest } from 'next/server';
import { getDBClient } from './get-db-client';

export const createRouterContext = async (request: NextRequest) => {
    const bearer = request.headers.get('Authorization');
    const jwt = bearer?.replace('Bearer ', '');

    if (!jwt) {
        throw new Error('No authorization token provided.');
    }

    const db = await getDBClient(jwt);
    return { db };
};

export const ctx = new CtxRouter<Awaited<ReturnType<typeof createRouterContext>>>();
