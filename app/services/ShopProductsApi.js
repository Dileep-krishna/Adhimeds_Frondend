import { NextResponse } from 'next/server';

export async function POST(req) {
  // 1. Authenticate the request (example using Bearer token)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validate and parse body
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { shopId } = body;
  if (!shopId || typeof shopId !== 'string') {
    return NextResponse.json({ error: 'shopId is required and must be a string' }, { status: 400 });
  }

  // 3. Check credentials
  const username = process.env.MEDISOFT_API_USERNAME;
  const password = process.env.MEDISOFT_API_PASSWORD;
  if (!username || !password) {
    console.error('Missing Medisoft credentials');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // 4. Optional: check if the authenticated user is allowed to access this shopId
  // const user = await getUserFromSession(req);
  // if (!user.shops.includes(shopId)) {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  // }

  // 5. Set up timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch('https://api.medisoft.in/adhapi/stock/getstockdetails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, id: shopId }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await res.json();

    // 6. Sanitize response (example: remove internal fields)
    const sanitizedData = {
      success: res.ok,
      products: data.products || [],  // assuming structure
      total: data.total || 0,
    };

    // 7. Return appropriate status
    if (!res.ok) {
      console.error(`Medisoft error for shop ${shopId}:`, data);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: res.status });
    }

    return NextResponse.json(sanitizedData);
  } catch (error) {
    console.error('Products API Error:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'External API timeout' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}