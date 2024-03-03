import { NextRequest, NextResponse } from 'next/server';

/**
 * Adds the request URL and Method to the request headers object.
 */
export async function urlMiddleware(
  request: NextRequest,
  response: NextResponse
) {
  console.log('urlMiddleware');
  request.headers.set('url', request.nextUrl.href);
  request.headers.set('method', request.method);
}
