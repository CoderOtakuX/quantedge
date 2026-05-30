import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

async function groqCall(prompt: string, systemPrompt: string): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 1000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

function parseGroqJSON(text: string): any {
  if (!text) return null;
  // Remove markdown code blocks if present
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  try {
    // Attempt to extract the FIRST JSON object found in the text
    const match = cleaned.match(/\{[\s\S]*?\}/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON parse failed for:", cleaned);
    // If it's a multi-line object that failed non-greedy, try greedy as last resort
    try {
      const greedyMatch = cleaned.match(/\{[\s\S]*\}/);
      if (greedyMatch) return JSON.parse(greedyMatch[0]);
    } catch {}
    throw new Error("Failed to parse AI response as JSON");
  }
}

async function safeFetch(url: string, timeoutMs = 30000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured in environment variables" }, { status: 500 });
  }
  
  try {
    // Fetch overview and news first (essential), then financials and peers (best-effort)
    const [overview, newsRaw] = await Promise.all([
      safeFetch(`${BACKEND}/api/stock/${ticker}/overview`),
      safeFetch(`${BACKEND}/api/stock/${ticker}/news`),
    ]);

    if (!overview) {
      return NextResponse.json({ error: "Could not fetch stock overview" }, { status: 502 });
    }

    // Fetch peers and financials separately to avoid overwhelming the Python backend
    const [financials, peersRaw] = await Promise.all([
      safeFetch(`${BACKEND}/api/stock/${ticker}/financials`, 45000),
      safeFetch(`${BACKEND}/api/stock/${ticker}/peers`, 45000),
    ]);

    const peers = Array.isArray(peersRaw) ? peersRaw : [];
    const newsItems = Array.isArray(newsRaw) ? newsRaw : [];

    // Prepare concise data summaries for prompts
    const financialSummary = JSON.stringify({
      name: overview.name,
      sector: overview.sector,
      market_cap: overview.market_cap,
      pe_ratio: overview.pe_ratio,
      pb_ratio: overview.pb_ratio,
      roe: overview.roe,
      debt_to_equity: overview.debt_to_equity,
      net_margin: overview.net_margin,
      operating_margin: overview.operating_margin,
      revenue: overview.revenue,
      net_income: overview.net_income,
      eps: overview.eps,
      free_cash_flow: overview.free_cash_flow,
      dividend_yield: overview.dividend_yield,
      beta: overview.beta,
      current_ratio: overview.current_ratio,
    });

    const newsSummary = newsItems.length > 0
      ? newsItems
          .slice(0, 10)
          .map((n: any, i: number) => `${i + 1}. ${n.title} (${n.source})`)
          .join("\n")
      : "No recent news available.";

    const peerSummary = peers.length > 0
      ? JSON.stringify(
          peers.slice(0, 6).map((p: any) => ({
            symbol: p.symbol,
            pe_ratio: p.pe_ratio,
            pb_ratio: p.pb_ratio,
            roe: p.roe,
            market_cap: p.market_cap,
            net_margin: p.net_margin,
          }))
        )
      : "No peer data available.";

    const STRICT_SYSTEM = `You are a strict quantitative financial analyst. 
Use ONLY the data provided to you. 
Do NOT use any training knowledge for numerical figures. 
Do NOT invent statistics. 
Respond ONLY with valid JSON. No preamble, no explanation, no markdown.`;

    // STEP 1 — Financial Analysis
    const step1Raw = await groqCall(
      `Analyze this company's financial data and return JSON only:
${financialSummary}

Return this exact JSON structure:
{
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string", "string"],
  "growth_verdict": "string (one sentence)",
  "financial_health_score": number between 0-100
}`,
      STRICT_SYSTEM
    );
    console.log('Step 1 response:', step1Raw);
    const step1 = parseGroqJSON(step1Raw);

    // STEP 2 — News Sentiment
    const step2Raw = await groqCall(
      `Analyze these news headlines for ${ticker} and return JSON only:
${newsSummary}

Return this exact JSON structure:
{
  "sentiment": "Bullish" | "Bearish" | "Neutral",
  "sentiment_score": number between -100 to 100,
  "catalysts": ["string", "string"],
  "risks": ["string", "string"],
  "news_summary": "string (one sentence)"
}`,
      STRICT_SYSTEM
    );
    console.log('Step 2 response:', step2Raw);
    const step2 = parseGroqJSON(step2Raw);

    // STEP 3 — Peer Benchmarking
    const step3Raw = await groqCall(
      `Compare ${ticker} against its sector peers using this data:

${ticker} metrics: ${financialSummary}

Peers: ${peerSummary}

Return this exact JSON structure:
{
  "relative_position": "Leader" | "Above Average" | "Average" | "Below Average" | "Laggard",
  "pe_commentary": "string",
  "roe_commentary": "string",
  "margin_commentary": "string",
  "valuation_verdict": "Overvalued" | "Fairly Valued" | "Undervalued"
}`,
      STRICT_SYSTEM
    );
    console.log('Step 3 response:', step3Raw);
    const step3 = parseGroqJSON(step3Raw);

    // STEP 4 — Final Synthesis
    const step4Raw = await groqCall(
      `You are synthesizing a final investment verdict for ${ticker}. 
      
      You MUST use the following WEIGHTED SCORING RUBRIC (0-100 scale):
      1. Valuation (P/E vs Sector Average): 25% 
         - Score 100 if P/E is 50% below sector, 0 if 100% above.
      2. Profitability (ROE): 20%
         - Score 100 if ROE > 25%, 0 if ROE < 5%.
      3. Financial Health (Debt/Equity): 20%
         - Score 100 if D/E < 0.5, 0 if D/E > 2.0.
      4. Cash Flow (FCF Trend): 15%
         - Score 100 if FCF is positive and growing, 0 if negative.
      5. News Sentiment: 20%
         - Score 100 if Bullish, 0 if Bearish.

      VERDICT THRESHOLDS:
      - Score 75-100: Strong Buy
      - Score 60-74: Buy
      - Score 40-59: Hold
      - Score 20-39: Sell
      - Score 0-19: Strong Sell

      Data for Synthesis:
      Financial analysis: ${JSON.stringify(step1)}
      News sentiment: ${JSON.stringify(step2)}
      Peer benchmarking: ${JSON.stringify(step3)}
      Company overview: name=${overview.name}, sector=${overview.sector}, current_price=${overview.last_price}, market_cap=${overview.market_cap}

      Return this exact JSON structure:
      {
        "weighted_score": number (0-100),
        "verdict": "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell",
        "confidence": number between 0-100,
        "summary": "string (2-3 sentences explaining the core logic based on the scoring)",
        "bull_case": ["string", "string", "string"],
        "bear_case": ["string", "string", "string"],
        "outlook_1_2yr": "string (1-2 sentences)",
        "key_risks": ["string", "string"],
        "alternatives": ["TICKER1", "TICKER2"]
      }`,
      STRICT_SYSTEM
    );
    console.log('Step 4 response:', step4Raw);
    const step4 = parseGroqJSON(step4Raw);

    // Return full analysis
    return NextResponse.json({
      ticker,
      company_name: overview.name,
      generated_at: new Date().toISOString(),
      step1_financials: step1,
      step2_sentiment: step2,
      step3_peers: step3,
      verdict: step4,
    });

  } catch (err: any) {
    console.error("AI analysis error:", err);
    return NextResponse.json(
      { error: "AI analysis failed", detail: err.message },
      { status: 500 }
    );
  }
}
