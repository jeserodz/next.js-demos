import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/GitHub';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db/client';

const nextAuth = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [GitHub],
});

export const { auth, handlers, signIn, signOut } = nextAuth;
