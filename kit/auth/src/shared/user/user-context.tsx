'use client';

import { User } from '@kit/drizzle';
import React, { useContext } from 'react';

export type UserContextType = {
    user: User | null;
};

const UserContext = React.createContext<UserContextType>({
    user: {} as User | null,
});

export const useUser = <Optional extends boolean>({ optional }: { optional?: Optional } = {}): Optional extends true ? User | null : User => {
    const ctx = useContext(UserContext);

    if (!ctx) {
        throw new Error('User not found');
    }

    if (!optional && !ctx.user) {
        throw new Error('User not found');
    }

    return ctx.user as Optional extends true ? User | null : User
};

export const UserProvider = ({ children, user }: { children: React.ReactNode } & UserContextType) => {
    return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};
