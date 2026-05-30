import requests
import json

payload = {
    "verdict": "BUY",
    "confidence": 75,
    "summary": "Test summary for report generation.",
    "bull_case": "Strong fundamentals and growth potential.",
    "bear_case": "High debt and market volatility.",
    "outlook_1_2yr": "Positive outlook with expected revenue growth.",
    "key_risks": ["Market risk", "Regulatory risk"],
    "alternatives": ["ONGC", "BPCL"],
    "sentiment": "Positive",
    "sentiment_score": 60,
    "catalysts": ["New partnerships", "Cost reduction"],
    "news_summary": "Generally positive news sentiment."
}

# Test direct backend
print("=== Testing Backend Directly ===")
r = requests.post("http://localhost:8000/api/report/RELIANCE", json=payload)
ct = r.headers.get("content-type", "")
cd = r.headers.get("content-disposition", "")
print(f"Status: {r.status_code}")
print(f"Content-Type: {ct}")
print(f"Content-Disposition: {cd}")
print(f"Content length: {len(r.content)} bytes")
magic = r.content[:4]
print(f"File magic bytes: {magic.hex()} (PK zip/pptx = 504b0304)")

with open("test_backend.pptx", "wb") as f:
    f.write(r.content)
print("Saved to test_backend.pptx")

# Test via Next.js API route
print("\n=== Testing via Next.js API Route ===")
r2 = requests.post("http://localhost:3000/api/report/RELIANCE", json=payload)
ct2 = r2.headers.get("content-type", "")
cd2 = r2.headers.get("content-disposition", "")
print(f"Status: {r2.status_code}")
print(f"Content-Type: {ct2}")
print(f"Content-Disposition: {cd2}")
print(f"Content length: {len(r2.content)} bytes")
magic2 = r2.content[:4]
print(f"File magic bytes: {magic2.hex()} (PK zip/pptx = 504b0304)")

with open("test_nextjs.pptx", "wb") as f:
    f.write(r2.content)
print("Saved to test_nextjs.pptx")

# Check if file is valid PPTX
if magic2.hex() == "504b0304":
    print("\n✅ Next.js route returns valid PPTX (zip header)")
else:
    print(f"\n❌ Next.js route does NOT return valid PPTX!")
    print(f"   First 200 bytes: {r2.content[:200]}")
