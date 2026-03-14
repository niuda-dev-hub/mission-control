import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/routing';

const i18nMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
  alternateLinks: false,
});

const MC_API_TOKEN = process.env.MC_API_TOKEN;
if (!MC_API_TOKEN) {
  console.warn('[SECURITY WARNING] MC_API_TOKEN not set - API authentication is DISABLED (local dev mode)');
}

function isSameOriginRequest(request: NextRequest): boolean {
  const host = request.headers.get('host');
  if (!host) return false;

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (!origin && !referer) return false;

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host === host) return true;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host === host) return true;
    } catch {
      return false;
    }
  }

  return false;
}

const DEMO_MODE = process.env.DEMO_MODE === 'true';
if (DEMO_MODE) {
  console.log('[DEMO] Running in demo mode — all write operations are blocked');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;


  if (!pathname.startsWith('/api/')) {
    const response = i18nMiddleware(request);
    if (DEMO_MODE) {
      response.headers.set('X-Demo-Mode', 'true');
    }
    return response;
  }

  if (DEMO_MODE) {
    const method = request.method.toUpperCase();
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      return NextResponse.json(
        { error: 'Demo mode — this is a read-only instance. Visit github.com/crshdn/mission-control to run your own!' },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/webhooks/')) {
    return NextResponse.next();
  }

  if (!MC_API_TOKEN) {
    return NextResponse.next();
  }

  if (isSameOriginRequest(request)) {
    return NextResponse.next();
  }

  if (pathname === '/api/events/stream') {
    const queryToken = request.nextUrl.searchParams.get('token');
    if (queryToken && queryToken === MC_API_TOKEN) {
      return NextResponse.next();
    }
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  if (token !== MC_API_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/api/:path*'],
};
