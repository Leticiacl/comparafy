import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = String(req.query.url || "");
  if (!/^https?:\/\//i.test(url)) return res.status(400).json({ error: "missing_or_invalid_url" });

  const allow = [
    "nfce", "sefaz", "fazenda", "fazenda.sp.gov.br", "fazenda.mg.gov.br", "fazenda.pr.gov.br",
    "fazenda.rs.gov.br", "fazenda.ba.gov.br", "fazenda.ce.gov.br", "fazenda.go.gov.br",
    "portalsped.fazenda"
  ];
  try {
    const u = new URL(url);
    if (!allow.some((k) => u.host.includes(k))) {
      return res.status(400).json({ error: "domain_not_allowed", host: u.host });
    }

    const r = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const html = await r.text();
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=86400");
    return res.status(200).json({ html, status: r.status });
  } catch (e: any) {
    return res.status(500).json({ error: "fetch_failed", message: e?.message || String(e) });
  }
}
