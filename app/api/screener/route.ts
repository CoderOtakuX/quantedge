import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = new URLSearchParams();
    if (body.min_pe) params.set("min_pe", body.min_pe);
    if (body.max_pe) params.set("max_pe", body.max_pe);
    if (body.min_roe) params.set("min_roe", body.min_roe);
    if (body.min_market_cap) params.set("min_market_cap", body.min_market_cap);
    if (body.sector) params.set("sector", body.sector);

    const res = await fetch(`${BACKEND}/api/screener?${params.toString()}`, {
      method: "POST",
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error(`Python service error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Screener failed" }, { status: 500 });
  }
}
