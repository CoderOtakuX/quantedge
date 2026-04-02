import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  try {
    const res = await fetch(`${BACKEND}/api/stock/${ticker}/overview`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) throw new Error(`Python service error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch overview" }, { status: 500 });
  }
}
