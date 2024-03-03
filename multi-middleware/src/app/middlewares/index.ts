import { NextRequest, NextResponse } from 'next/server';

export async function processMiddlewares(
  request: NextRequest,
  middlewares: (( request: NextRequest, response: NextResponse ) => Promise<void | NextResponse>)[] // prettier-ignore
) {
  const response = new NextResponse();

  for (const middleware of middlewares) {
    const result = await middleware(request, response);
    if (result?.headers?.get('location')) {
      return NextResponse.redirect(String(result.headers.get('location')), {
        headers: response.headers,
      });
    }
  }

  return NextResponse.next(response);
}
