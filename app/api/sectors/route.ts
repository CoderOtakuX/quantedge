import { NextResponse } from "next/server";

const BACKEND = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';


export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/sectors`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) throw new Error(`Python service error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch sectors" }, { status: 500 });
  }
}
