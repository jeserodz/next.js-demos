# Next.js Demos - Multi-Middleware

This is a simple Next.js project that demonstrates how to use multiple middleware in a Next.js application.

## The Problem

Next.js does not have a built-in way to use multiple middleware in a single application. It has the `middleware.ts` file, but it only allows for a single middleware to be used.

## The Solution

The solution is to create a custom middleware that can be used to chain multiple middleware together. This is done by creating a function that takes an array of middleware functions and returns a single middleware function that chains them together.

```typescript
import { processMiddlewares } from '@/app/middlewares';
import { redirectMiddleware } from '@/app/middlewares/redirect.middleware';
import { sessionMiddleware } from '@/app/middlewares/session.middleware';
import { urlMiddleware } from '@/app/middlewares/url.middleware';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await processMiddlewares(request, [
    sessionMiddleware,
    urlMiddleware,
    redirectMiddleware,
  ]);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```
