import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

async function proxyRequest(request: NextRequest) {
  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(`/api/v1/${incomingUrl.pathname.split('/api/v1/')[1] ?? ''}`, API_INTERNAL_URL);
  upstreamUrl.search = incomingUrl.search;

  const headers = new Headers();
  for (const name of ['accept', 'authorization', 'content-type', 'cookie', 'origin', 'user-agent', 'x-request-id']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const method = request.method;
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer();

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      cache: 'no-store',
      redirect: 'manual',
    });

    const responseHeaders = new Headers();
    for (const name of ['content-type', 'cache-control', 'x-request-id']) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    // Preserve every Set-Cookie header, including the HttpOnly refresh cookie.
    for (const cookie of upstream.headers.getSetCookie()) {
      responseHeaders.append('set-cookie', cookie);
    }

    return new Response(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      { statusCode: 502, message: 'The PanelForge API is currently unavailable.' },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
