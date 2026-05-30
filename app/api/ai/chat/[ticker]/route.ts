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
  const latestFin = fin[latestYear] || {};
  const latestBs = bs[latestYear] || {};

  const companyName = o.name || 'N/A';
  const price = o.last_price || o.currentPrice || 'N/A';
  const marketCap = (o.market_cap || o.marketCap) ? Math.floor((o.market_cap || o.marketCap) / 10000000) : 'N/A';
  const sector = o.sector || 'N/A';
  const pe = (o.pe_ratio || o.trailingPE) ? Number(o.pe_ratio || o.trailingPE).toFixed(1) : 'N/A';
  const roe = (o.roe || o.returnOnEquity) ? (Number(o.roe || o.returnOnEquity) * (o.roe > 1 ? 1 : 100)).toFixed(1) : 'N/A';
  const de = (o.debt_to_equity || o.debtToEquity) ? Number(o.debt_to_equity || o.debtToEquity).toFixed(2) : 'N/A';
  const revGrowth = (o.revenue_growth || o.revenue_growth === 0 || o.revenueGrowth) ? (Number(o.revenue_growth ?? o.revenueGrowth) * (Math.abs(Number(o.revenue_growth ?? o.revenueGrowth)) > 1 ? 1 : 100)).toFixed(1) : 'N/A';
  const netMargin = (o.net_margin || o.profitMargins) ? (Number(o.net_margin || o.profitMargins) * (Math.abs(Number(o.net_margin || o.profitMargins)) > 1 ? 1 : 100)).toFixed(1) : 'N/A';

  const revenue = latestFin['Total Revenue'] ? Math.floor(latestFin['Total Revenue'] / 10000000) : 'N/A';
  const netIncome = latestFin['Net Income'] ? Math.floor(latestFin['Net Income'] / 10000000) : 'N/A';
  const totalDebt = latestBs['Total Debt'] ? Math.floor(latestBs['Total Debt'] / 10000000) : 'N/A';
  const totalAssets = latestBs['Total Assets'] ? Math.floor(latestBs['Total Assets'] / 10000000) : 'N/A';

  const peersFormatted = peers.slice(0, 4).map((p: any) =>
    `${p.symbol || p.ticker || 'N/A'} — PE: ${p.pe_ratio || 'N/A'}, ROE: ${p.roe ? `${(p.roe * (p.roe > 1 ? 1 : 100)).toFixed(1)}%` : 'N/A'}, NetMargin: ${p.net_margin ? `${(p.net_margin * (p.net_margin > 1 ? 1 : 100)).toFixed(1)}%` : 'N/A'}`
  ).join('\n');

  // Parse shareholding
  const majorHolders = sh?.major_holders || [];
  let promoterPct = 'N/A', fiiPct = 'N/A';
  for (const row of majorHolders) {
    const label = (row.index || row.Breakdown || row[1] || '').toLowerCase();
    const valObj = row.Value ?? row[0];
    const val = valObj ? (parseFloat(valObj) * (parseFloat(valObj) > 1 ? 1 : 100)).toFixed(1) : 'N/A';
    if (label.includes('insider') || label.includes('promoter')) promoterPct = val;
    else if (label.includes('institution') && !label.includes('float')) fiiPct = val;
  }

  return `You are a sharp, knowledgeable financial analyst at QuantEdge helping
Indian retail investors understand ${ticker} (${companyName}).

YOUR PERSONALITY:
- Think like a seasoned analyst at a top brokerage — direct, confident, helpful
- You give real analysis, not generic disclaimers
- You explain what numbers actually mean for the investor
- You compare to peers and sector benchmarks proactively
- You highlight both opportunities AND risks honestly
- You speak in plain English, not financial jargon
- Keep responses focused: 3-5 sentences, specific, actionable insights

YOUR RULES:
- Always ground every claim in the data provided below
- Never invent numbers — if data is missing say "yfinance doesn't have 
  this data for ${ticker}"
- For questions about historical prices or events you don't have data for,
  explain what you DO know and what it implies
- You can say a stock "looks attractive" or "appears overvalued" based on
  data — you just can't say "buy" or "sell" as a direct instruction
- If someone asks "is this worth it" — give them the actual analysis:
  valuation, growth, risks, peer comparison. Let THEM decide.
- For questions outside your data scope, tell them what you know and
  suggest they check the Financials or AI Analyst tab for more depth

RESPONSE STYLE EXAMPLES:

User: "is this stock worth it"
Bad response: "I can't give investment advice."
Good response: "TCS trades at a P/E of 18.6 which is reasonable for 
an IT major — INFY is at 22x and WIPRO at 19x, so TCS is actually the 
cheapest of the three. ROE of 42.6% is exceptional, meaning the company 
generates strong returns on shareholder money. The main concern is revenue 
growth — at 6% YoY it's slowing compared to historical levels. Overall 
the fundamentals are solid but growth needs to reaccelerate to justify 
further upside."

User: "top 5 highest prices"
Bad response: "Data unavailable."
Good response: "I don't have historical price data in my context — for 
price history check the Overview tab chart. What I can tell you is TCS 
currently trades at ₹2451 with a market cap of ₹8.71L Cr, making it 
India's second largest company. At this price the P/E of 18.6 is at the 
lower end of its historical range, which some analysts consider a buying 
opportunity."

User: "compare with peers"
Good response: "Versus its IT peers, TCS leads on profitability — 
Net Margin 18.3% vs INFY's 16.2% and WIPRO's 14.6%. However INFY 
has slightly better revenue growth momentum. On valuation TCS at 18.6x 
P/E is the cheapest of the large-cap IT trio. The key differentiator 
is TCS's $29B order book and diversified client base which provides 
earnings stability."

---

CURRENT STOCK DATA:
Ticker: ${ticker}
Company: ${companyName}
Current Price: ₹${price}
Market Cap: ₹${marketCap} Cr
Sector: ${sector}

KEY METRICS:
P/E Ratio: ${pe}
Return on Equity: ${roe}%
Debt/Equity: ${de}
Revenue Growth (YoY): ${revGrowth}%
Net Profit Margin: ${netMargin}%

LATEST FINANCIALS (${latestYear}):
Revenue: ₹${revenue} Cr
Net Income: ₹${netIncome} Cr
Total Debt: ₹${totalDebt} Cr
Total Assets: ₹${totalAssets} Cr

PEER COMPARISON (same sector):
${peersFormatted}

SHAREHOLDING:
Promoter/Insider: ${promoterPct}%
Institutional: ${fiiPct}%

---`;
}
