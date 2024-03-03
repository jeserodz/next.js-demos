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
