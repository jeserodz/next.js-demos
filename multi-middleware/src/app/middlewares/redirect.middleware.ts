import { urlMiddleware } from '@/app/middlewares/url.middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function redirectMiddleware(
  request: NextRequest,
  response: NextResponse
) {
  console.log('redirectMiddleware');

  if (request.nextUrl.pathname.includes('/redirect')) {
    const url = new URL('/', request.nextUrl.origin);
    return NextResponse.redirect(url);
  }
}
