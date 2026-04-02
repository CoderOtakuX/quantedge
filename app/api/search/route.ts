import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  
  if (q.length < 1) return NextResponse.json([]);
  
  try {
    const res = await fetch(`${BACKEND}/api/search?q=${encodeURIComponent(q)}`, {
        next: { revalidate: 300 } // Short cache since universe is static locally but searching queries is standard
    });
    if (!res.ok) throw new Error(`Python service error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 });
  }
}
