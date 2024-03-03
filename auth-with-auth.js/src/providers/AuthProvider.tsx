'use client';

import { Session } from 'next-auth';
import { createContext, useContext } from 'react';

export const AuthContext = createContext({
  session: null as Session | null,
  user: null as Session['user'] | null,
});

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
