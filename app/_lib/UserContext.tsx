'use client';

import { createContext, useContext } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

interface UserContextType {
  user: User | null;
}

const UserContext = createContext<UserContextType>({ user: null });

export const UserProvider = ({ children, user }: { children: React.ReactNode; user: User | null }) => {
  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);