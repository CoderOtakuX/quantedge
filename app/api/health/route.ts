import { NextResponse } from "next/server";

const BACKEND = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';


export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/health`);
    const data = await res.json();
    return NextResponse.json({ nextjs: "ok", python: data });
  } catch (err) {
    return NextResponse.json({ nextjs: "ok", python: "unreachable" }, { status: 200 });
  }
}
