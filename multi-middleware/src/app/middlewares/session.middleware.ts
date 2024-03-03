import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Checks for the session cookie in the request.
 *
 * If it exists, it will decode the cookie and
 * attach the session data to the request headers object.
 *
 * If the session cookie does not exist, it will create a new session and
 * attach it to the request headers object, and set the session cookie in the response.
 */
export async function sessionMiddleware(
  request: NextRequest,
  response: NextResponse
) {
  console.log('sessionMiddleware');

  const sessionCookie = request.cookies.get('session');

  if (sessionCookie) {
    request.headers.set('session', JSON.parse(sessionCookie.value));
  } else {
    const newSession = JSON.stringify({
      id: Math.random().toString(36).substring(7),
      user: null,
    });

    request.headers.set('session', newSession);
    response.cookies.set('session', newSession);
  }
}
