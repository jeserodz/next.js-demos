# Next.js Demos - Auth with Auth.js

This is a simple example of how to use the `auth.js` library to authenticate a user with a username and password.

## References

- https://authjs.dev/reference/nextjs
- https://www.nexttonone.lol/next-auth

## Setup

### 1. Install the `auth.js` library

```bash
npm install next-auth@beta
```

### 2. Create the setup file `src/auth.ts`

```typescript
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/GitHub';

const nextAuth = NextAuth({
  providers: [GitHub],
});

export const { auth, handlers, signIn, signOut } = nextAuth;
```

### 3. Create the route handler `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

### 4. Create the environment variables `.env.local`

- You can generate an `AUTH_SECRET` using `openssl rand -hex 32`

```env
AUTH_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
```

### 5. Test OAuth login and logout

1. Navigate to http://localhost:3000/api/auth/signin/github
2. Navigate to http://localhost:3000/api/auth/signout

### 6. Setup the database adapter

1. Setup Drizzle ORM (check [Next.js Demos - Database SQLite](../database-sqlite/README.md))
2. Follow the instructions in the [@auth/drizzle-adapter](https://authjs.dev/reference/adapter/drizzle) documentation.

The `src/auth.ts` file should end up looking like this:

```typescript
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/GitHub';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db/client';

const nextAuth = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [GitHub],
});

export const { auth, handlers, signIn, signOut } = nextAuth;
```

### 7. Create an AuthProvider component `src/providers/AuthProvider.tsx`

This is needed to provide the auth data to the client components.

```tsx
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
```

### 8. Usage in a server component

```tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/me');
  }

  return (
    <div>
      {session.user.id}
      {session.user.name}
      {session.user.email}
      <Image src={session.user.image} />
    </div>
  );
}
```

### 9. Usage in a client component

```tsx
'use client';
import { useAuth } from '@/providers/AuthProvider';

export function ProfileAvatar() {
  const { session } = useAuth();

  if (!session?.user) return null;
  return (
    <img
      width={48}
      height={48}
      src={session.user.image ?? undefined}
      alt="avatar"
    />
  );
}
```
