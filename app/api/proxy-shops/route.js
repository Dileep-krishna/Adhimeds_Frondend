import { NextResponse } from 'next/server';
import https from 'https';
import { API_USERNAME, API_PASSWORD } from '../../../config/secrets.js';

export async function POST() {
  const USERNAME = API_USERNAME;
  const PASSWORD = API_PASSWORD;

  if (!USERNAME || !PASSWORD) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  const apiUrl = 'https://api.medisoft.in/adhapi/shops/getshopslist';
  const body = JSON.stringify({ username: USERNAME, password: PASSWORD });
  const url = new URL(apiUrl);

  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'curl/8.19.0',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve(new NextResponse(data, {
          status: res.statusCode,
          headers: { 'Content-Type': 'application/json' },
        }));
      });
    });
    req.on('error', (err) => {
      console.error("Proxy error:", err);
      resolve(NextResponse.json({ error: err.message }, { status: 500 }));
    });
    req.write(body);
    req.end();
  });
}