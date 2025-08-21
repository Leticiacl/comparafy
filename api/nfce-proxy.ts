// api/nfce-proxy.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS para permitir chamadas do seu front (Stackblitz / Vercel)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const target = (req.query.url as string) || '';
  if (!target || !/^https?:\/\//i.test(target)) {
    res.status(400).json({ error: 'missing_or_invalid_url' });
    return;
  }

  try {
    const r = await fetch(target, {
      redirect: 'follow',
      headers: {
        // alguns portais exigem user-agent de browser
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const html = await r.text();
    res.status(200).json({ html, status: r.status, finalUrl: r.url });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'fetch_failed' });
  }
}
