'use client';

import { User } from '@kit/drizzle';
import React, { useContext } from 'react';

export type UserContextType = {
    user: User;
};

const UserContext = React.createContext<UserContextType>({
    user: {} as User,
});

export const useUser = (): User => {
    const { user } = useContext(UserContext);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

export const UserProvider = ({ children, user }: { children: React.ReactNode } & UserContextType) => {
    return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};
