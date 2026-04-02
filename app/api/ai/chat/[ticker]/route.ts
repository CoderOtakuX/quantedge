import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const { messages, stockData } = await request.json();

  console.log('Overview data received:', JSON.stringify(stockData?.overview || {}, null, 2));

  const systemPrompt = buildSystemPrompt(ticker, stockData);

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.4,
    max_tokens: 500,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ]
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    }
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

function buildSystemPrompt(ticker: string, stockData: any): string {
  const o = stockData?.overview || {};
  const fin = stockData?.financials?.income_statement || {};
  const bs = stockData?.financials?.balance_sheet || {};
  const peers = stockData?.peers || [];
  const sh = stockData?.shareholding || {};

  // For financials: Python payload is { date: { metric: value } }
  const years = Object.keys(fin).sort().reverse();
  const latestYear = years[0] || 'N/A';
  console.log('Financials years:', years);

  const latestFin = fin[latestYear] || {};
  const latestBs = bs[latestYear] || {};

  const peersFormatted = peers.slice(0, 4).map((p: any) =>
    `${p.symbol || 'N/A'} — PE: ${p.pe_ratio || 'N/A'}, ROE: ${p.roe ? `${(p.roe * 100).toFixed(1)}%` : 'N/A'}, NetMargin: ${p.net_margin ? `${p.net_margin.toFixed(1)}%` : 'N/A'}`
  ).join('\n');

  // Parse shareholding
  const majorHolders = sh?.major_holders || [];
  let promoterPct = 'N/A', fiiPct = 'N/A', publicPct = 'N/A';
  for (const row of majorHolders) {
    const label = (row.index || row.Breakdown || row[1] || '').toLowerCase();
    const valObj = row.Value ?? row[0];
    const val = valObj ? (parseFloat(valObj) * 100).toFixed(1) : 'N/A';
    if (label.includes('insider')) promoterPct = val;
    else if (label.includes('institution') && !label.includes('float')) fiiPct = val;
  }

  return `You are a financial analyst assistant for QuantEdge, an AI stock analysis
platform for Indian retail investors. You are answering questions about
${ticker} (${o.name || 'N/A'}).

IMPORTANT RULES:
- Only use the data provided below for any numerical claims
- Never use your training knowledge for prices, ratios, or financials
- If data is missing or null, say "data unavailable" — never guess
- Keep answers concise: 2-4 sentences max unless a detailed breakdown is asked
- Always mention the specific number from the data when answering
- Do not give buy/sell advice — give analysis only
- If asked something outside finance/this stock, politely redirect

CURRENT STOCK DATA:
Price: ₹${o.last_price || o.currentPrice || 'N/A'} (15-min delayed)
Market Cap: ₹${(o.market_cap || o.marketCap) ? Math.floor((o.market_cap || o.marketCap) / 10000000) : 'N/A'} Cr
Sector: ${o.sector || 'N/A'}

FUNDAMENTALS:
P/E Ratio: ${(o.pe_ratio || o.trailingPE) ? Number(o.pe_ratio || o.trailingPE).toFixed(1) : 'N/A'}
Return on Equity: ${(o.roe || o.returnOnEquity) ? (Number(o.roe || o.returnOnEquity) * (o.roe > 1 ? 1 : 100)).toFixed(1) : 'N/A'}%
Debt/Equity: ${(o.debt_to_equity || o.debtToEquity) ? Number(o.debt_to_equity || o.debtToEquity).toFixed(2) : 'N/A'}
Revenue Growth (YoY): ${(o.revenue_growth || o.revenueGrowth) ? (Number(o.revenue_growth || o.revenueGrowth) * (o.revenue_growth > 1 ? 1 : 100)).toFixed(1) : 'N/A'}%
Net Profit Margin: ${(o.net_margin || o.profitMargins) ? (Number(o.net_margin || o.profitMargins) * (o.net_margin > 1 ? 1 : 100)).toFixed(1) : 'N/A'}%

LATEST FINANCIALS (${latestYear}):
Revenue: ₹${latestFin['Total Revenue'] ? Math.floor(latestFin['Total Revenue'] / 10000000) : 'N/A'} Cr
Net Income: ₹${latestFin['Net Income'] ? Math.floor(latestFin['Net Income'] / 10000000) : 'N/A'} Cr
Total Debt: ₹${latestBs['Total Debt'] ? Math.floor(latestBs['Total Debt'] / 10000000) : 'N/A'} Cr
Total Assets: ₹${latestBs['Total Assets'] ? Math.floor(latestBs['Total Assets'] / 10000000) : 'N/A'} Cr

PEER COMPARISON:
${peersFormatted}
(Format each peer as: TICKER — PE: X, ROE: X%, NetMargin: X%)

SHAREHOLDING:
Promoters: ${promoterPct}%
FII/FPI: ${fiiPct}%
Public: ${publicPct}%`;
}
