import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params
    const body = await request.json()
    
    const backendUrl = process.env.PYTHON_BACKEND_URL || '${BACKEND}'
    const response = await fetch(
      `${backendUrl}/api/report/${ticker}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )
    
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`Backend error: ${response.status} ${response.statusText}`, errText);
      return NextResponse.json({ error: 'Failed to generate report', detail: errText }, { status: response.status });
    }
    
    const blob = await response.blob()
    
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${ticker.toUpperCase()}_QuantEdge_Report.pptx"`,
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error while generating report' }, { status: 500 })
  }
}
