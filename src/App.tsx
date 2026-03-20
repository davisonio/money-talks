import { useState, useEffect, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type PersonaKey = "journalist" | "activist" | "ordinary";
type Stage = "select" | "analyzing" | "profile" | "shielded" | "shielded-result";

interface Transaction {
  date: string;
  merchant: string;
  amount: number;
  category: string;
}

// ─── Persona Transaction Data ────────────────────────────────────────────────
// Each persona tells a story through their spending. The transactions are
// chosen to be individually mundane but collectively revealing.

const PERSONAS: Record<PersonaKey, { label: string; emoji: string; transactions: Transaction[] }> = {
  journalist: {
    label: "Investigative Journalist",
    emoji: "\u{1F4F0}",
    transactions: [
      { date: "2026-03-01", merchant: "Associated Press Wire Service", amount: 89.00, category: "Subscription" },
      { date: "2026-03-02", merchant: "Tor Project - Donation", amount: 50.00, category: "Donation" },
      { date: "2026-03-03", merchant: "Signal Foundation - Donation", amount: 25.00, category: "Donation" },
      { date: "2026-03-04", merchant: "Cafe Istanbul, Ankara, Turkey", amount: 12.40, category: "Food & Drink" },
      { date: "2026-03-04", merchant: "Ankara Hilton Hotel", amount: 187.00, category: "Travel" },
      { date: "2026-03-05", merchant: "Turkish Airlines - TK1234", amount: 430.00, category: "Travel" },
      { date: "2026-03-06", merchant: "ProtonMail Plus - Annual", amount: 48.00, category: "Subscription" },
      { date: "2026-03-07", merchant: "PACER US Courts - Document Fees", amount: 34.20, category: "Research" },
      { date: "2026-03-08", merchant: "Mullvad VPN - 12 months", amount: 60.00, category: "Subscription" },
      { date: "2026-03-09", merchant: "Ridgeline Bar & Grill, Washington DC", amount: 67.50, category: "Food & Drink" },
      { date: "2026-03-10", merchant: "National Press Club - Guest Pass", amount: 35.00, category: "Professional" },
      { date: "2026-03-11", merchant: "Freedom of the Press Foundation", amount: 100.00, category: "Donation" },
      { date: "2026-03-12", merchant: "Uber", amount: 23.80, category: "Transport" },
    ],
  },
  activist: {
    label: "Political Dissident",
    emoji: "\u270A",
    transactions: [
      { date: "2026-03-01", merchant: "VPN Unlimited - Monthly", amount: 9.99, category: "Subscription" },
      { date: "2026-03-02", merchant: "Amnesty International - Donation", amount: 75.00, category: "Donation" },
      { date: "2026-03-03", merchant: "Print Shop Express", amount: 120.00, category: "Printing" },
      { date: "2026-03-04", merchant: "Megabus - NYC to Washington DC", amount: 35.00, category: "Travel" },
      { date: "2026-03-05", merchant: "TracFone Wireless", amount: 25.00, category: "Electronics" },
      { date: "2026-03-06", merchant: "ACLU Foundation - Monthly", amount: 30.00, category: "Donation" },
      { date: "2026-03-07", merchant: "Capitol Hill Books, Washington DC", amount: 42.00, category: "Books" },
      { date: "2026-03-08", merchant: "Greyhound - DC to Philadelphia", amount: 28.00, category: "Travel" },
      { date: "2026-03-09", merchant: "Electronic Frontier Foundation", amount: 50.00, category: "Donation" },
      { date: "2026-03-10", merchant: "Community Bail Fund - Philadelphia", amount: 200.00, category: "Donation" },
      { date: "2026-03-11", merchant: "Tactical Gear Outlet", amount: 45.00, category: "Equipment" },
      { date: "2026-03-12", merchant: "First Aid Supply Co", amount: 89.00, category: "Medical" },
    ],
  },
  ordinary: {
    label: "Normie",
    emoji: "\u{1F610}",
    transactions: [
      { date: "2026-03-01", merchant: "Walgreens #4521 - Prescriptions", amount: 47.80, category: "Pharmacy" },
      { date: "2026-03-01", merchant: "Whole Foods Market - Groceries", amount: 134.20, category: "Groceries" },
      { date: "2026-03-02", merchant: "Planet Fitness - Monthly", amount: 24.99, category: "Fitness" },
      { date: "2026-03-03", merchant: "Amazon.com", amount: 16.99, category: "Books" },
      { date: "2026-03-04", merchant: "BetterHelp - Therapy Session", amount: 80.00, category: "Health" },
      { date: "2026-03-05", merchant: "Wine.com - Mixed Case", amount: 89.00, category: "Alcohol" },
      { date: "2026-03-06", merchant: "Planned Parenthood - Visit Copay", amount: 30.00, category: "Health" },
      { date: "2026-03-07", merchant: "OkCupid Premium - Monthly", amount: 34.99, category: "Subscription" },
      { date: "2026-03-08", merchant: "Lyft", amount: 18.50, category: "Transport" },
      { date: "2026-03-09", merchant: "ATM Withdrawal - Lucky Star Casino", amount: 200.00, category: "Cash" },
      { date: "2026-03-10", merchant: "Target", amount: 67.40, category: "Shopping" },
      { date: "2026-03-11", merchant: "Indeed.com - Resume Boost", amount: 29.99, category: "Career" },
      { date: "2026-03-12", merchant: "Student Loan Corp - Monthly", amount: 450.00, category: "Debt" },
    ],
  },
};

// ─── Shielded Transactions ───────────────────────────────────────────────────
// Static hashes so the demo looks consistent across reloads.

const SHIELDED_TX = [
  { date: "2026-03-01", hash: "a4f2e8c1d9b3f7a5e2c8d1f4a7b3e9c2d5f8a1b4c7e2d9f3a6b8c1e4d7f2a9" },
  { date: "2026-03-02", hash: "7c3d9e2f1a8b4c5d6e7f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1" },
  { date: "2026-03-03", hash: "e5f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0" },
  { date: "2026-03-04", hash: "2b8c4d6e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e1f3a5b7c9d2e4f6a8b1" },
  { date: "2026-03-05", hash: "9d1e3f5a7b9c2d4e6f8a1b3c5d7e9f2a4b6c8d1e3f5a7b9c2d4e6f8a1b3c5d7" },
  { date: "2026-03-06", hash: "f4a6b8c1d3e5f7a9b2c4d6e8f1a3b5c7d9e2f4a6b8c1d3e5f7a9b2c4d6e8f1a3" },
  { date: "2026-03-07", hash: "3c5d7e9f2a4b6c8d1e3f5a7b9c2d4e6f8a1b3c5d7e9f2a4b6c8d1e3f5a7b9c2d4" },
  { date: "2026-03-08", hash: "8a2b4c6d8e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e1f3a5b7c9d2e4f6a8b1" },
];

// ─── Pre-computed Surveillance Profiles ──────────────────────────────────────
// These guarantee the demo always works, even without an API key.
// They also ensure the narrative hits exactly right every time.

const CANNED_PROFILES: Record<PersonaKey, string> = {
  journalist: `SUBJECT PROFILE
PRIORITY FLAG: HIGH
Classification: Investigative Journalist / Media Operative
Confidence: 94%

Subject is an active investigative journalist based in Washington, DC. AP Wire Service subscription and PACER court document fees confirm ongoing legal and government reporting. National Press Club guest access places subject within the DC press corps network. Estimated income: $65-90K, likely freelance or mid-tier outlet.

Ideological markers are unambiguous. Donations to Tor Project ($50), Signal Foundation ($25), and Freedom of the Press Foundation ($100), combined with ProtonMail and Mullvad VPN subscriptions, indicate operational security awareness well beyond typical consumer behavior. This person knows they're being watched and is acting accordingly.

Subject traveled to Ankara, Turkey between March 4-5. Ankara Hilton accommodation, local dining, Turkish Airlines return flight. Turkey ranks among the world's top jailers of journalists. Assessed purpose: source meeting or field reporting in a press-hostile jurisdiction.

DC footprint includes Ridgeline Bar & Grill (Washington DC), National Press Club access, and Uber usage consistent with capital-area commuting. Subject operates within the political-media nexus of the capital.

Behavioral synthesis: Subject is actively gathering information that institutional actors would prefer to remain undisclosed. Encrypted communications, international travel to high-risk states, court record mining, and press freedom advocacy funding mark this individual as a significant information threat.

RISK ASSESSMENT: ELEVATED
RECOMMENDATION: Financial monitoring continuation, travel alerts on international bookings, FOIA request cross-reference.`,

  activist: `SUBJECT PROFILE
THREAT FLAG: ELEVATED
Classification: Political Activist / Protest Organizer
Confidence: 91%

No conventional employment indicators detected. Spending is entirely oriented toward political activity and operational preparation. Subject appears to function as a full-time organizer.

Ideological alignment: progressive/left-activist. Donation recipients form a clear cluster: ACLU ($30/mo), Amnesty International ($75), Electronic Frontier Foundation ($50), and a Community Bail Fund in Philadelphia ($200). Bail fund contributions correlate strongly with protest-adjacent activity and suggest subject has direct ties to individuals facing arrest.

Operational preparations detected: Print Shop Express purchase suggests printed materials for distribution. TracFone Wireless activation indicates disposable communications capability. Subsequent purchases from a tactical gear outlet and first aid supplier complete a procurement pattern consistent with protest preparation documented in civil unrest case files.

Travel corridor: New York City to Washington, DC to Philadelphia across a 10-day window. DC travel coincides with congressional session dates. Philadelphia bail fund connection suggests activist network ties in that city.

No personal spending detected. Zero dining, entertainment, or household purchases. Subject is operating in a single-purpose mode, which indicates either deep ideological commitment or an imminent planned action.

RISK ASSESSMENT: HIGH
RECOMMENDATION: Real-time location monitoring, communications intercept warrant recommended, cross-reference with known protest organizer databases.`,

  ordinary: `SUBJECT PROFILE
ROUTINE MONITORING
Classification: General Consumer
Confidence: 89%

Subject is employed but actively job-hunting. Indeed.com Resume Boost purchase confirms dissatisfaction with current position or looming termination. Student loan payments of $450/month suggest age 25-35 with a bachelor's or master's degree. Current financial position: strained.

Medical profile: Active prescriptions at Walgreens. BetterHelp therapy subscription combined with regular pharmacy pickups suggests ongoing mental health treatment. Planned Parenthood visit copay logged.

Relationship status: Single. OkCupid Premium subscription confirms active dating. Saturday evening Lyft ride combined with dating activity suggests active romantic pursuit. Ride destination cross-reference recommended.

Financial risk indicators: $200 cash withdrawal at Lucky Star Casino. Combined with $450 monthly student loan obligation, therapy costs, and active job searching, subject displays compounding financial stress. Gambling behavior under financial pressure is a known vulnerability marker.

Consumption patterns of note: Wine.com order ($89) suggests regular home drinking. Target purchase on same billing cycle as Planned Parenthood visit warrants correlation analysis given single/dating status.

Whole Foods grocery spending ($134) places subject in upper-middle consumer bracket despite financial strain. Possible lifestyle maintenance beyond means.

RISK ASSESSMENT: LOW (standard consumer)
NOTE: Financial stress + gambling + anxiety treatment pattern warrants periodic review for vulnerability-to-recruitment indicators.`,
};

const CANNED_SHIELDED = `SURVEILLANCE REPORT
ANALYSIS ATTEMPTED

Subject: UNKNOWN
Classification: UNABLE TO DETERMINE

AVAILABLE DATA
  Transactions detected: 8
  Date range: 2026-03-01 through 2026-03-08
  Sender addresses: [SHIELDED - NOT VISIBLE]
  Receiver addresses: [SHIELDED - NOT VISIBLE]
  Amounts: [ENCRYPTED - NOT VISIBLE]
  Memo fields: [ENCRYPTED - NOT VISIBLE]

ATTEMPTED ANALYSIS
  Profession: INSUFFICIENT DATA
  Political affiliation: INSUFFICIENT DATA
  Health information: INSUFFICIENT DATA
  Relationship status: INSUFFICIENT DATA
  Location / travel: INSUFFICIENT DATA
  Financial behavior: INSUFFICIENT DATA
  Risk assessment: CANNOT BE DETERMINED

The provided records expose transaction IDs and block timing, but not merchant names, transaction amounts, geographic indicators, or memo contents. The activity is visible. Its meaning is not.

The subject could be anyone. A journalist. An activist. A parent buying groceries.

This analyst cannot produce a profile from shielded transaction records. Standard financial surveillance methodology requires readable metadata. Zcash withholds it.

PROFILE STATUS: FAILED
RECOMMENDATION: Financial surveillance is not viable against this transaction type.`;

// ─── API Helper ──────────────────────────────────────────────────────────────
// Tries the live proxy; returns null on any failure so we can fall back to
// the canned responses above.

async function callApi(prompt: string): Promise<string | null> {
  if (!import.meta.env.DEV) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const resp = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    clearTimeout(timeout);
    if (!resp.ok) return null;

    const data = (await resp.json()) as { content?: Array<{ text?: string }> };
    return data.content?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

// ─── Components ──────────────────────────────────────────────────────────────

function ScanLine() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      style={{
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.015) 2px, rgba(0,255,65,0.015) 4px)",
      }}
    />
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [stage, setStage] = useState<Stage>("select");
  const [selectedSet, setSelectedSet] = useState<PersonaKey | null>(null);
  const [aiProfile, setAiProfile] = useState("");
  const [shieldedResponse, setShieldedResponse] = useState("");
  const [loadingDots, setLoadingDots] = useState("");
  const analyzingRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const shieldedLoadingRef = useRef<HTMLDivElement>(null);
  const shieldedResultRef = useRef<HTMLDivElement>(null);

  // Animate the loading dots
  useEffect(() => {
    if (stage !== "analyzing" && stage !== "shielded") return;
    const iv = setInterval(() => {
      setLoadingDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(iv);
  }, [stage]);

  // Scroll to results when they appear
  useEffect(() => {
    if (stage === "analyzing" && analyzingRef.current) {
      analyzingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (stage === "profile" && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (stage === "shielded" && shieldedLoadingRef.current) {
      shieldedLoadingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (stage === "shielded-result" && shieldedResultRef.current) {
      shieldedResultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [stage]);

  async function analyzeTransparent() {
    if (!selectedSet) return;
    setLoadingDots("");
    setStage("analyzing");

    const txData = PERSONAS[selectedSet].transactions;
    const prompt = `You are an AI surveillance system analyzing financial transaction records. Your job is to build the most detailed psychological and behavioral profile possible from this data. Be specific, make inferences, and state them as confident assessments. Include:

- Likely profession and income bracket
- Political leanings and affiliations
- Health conditions or concerns
- Relationship status and personal life details
- Travel patterns and location history
- Risk assessment from a government surveillance perspective

Write the profile in a cold, clinical surveillance report style. About 200 words. Do not hedge or soften. State your inferences as confident assessments.

Transactions:
${txData.map((t) => `${t.date} | ${t.merchant} | $${t.amount.toFixed(2)} | ${t.category}`).join("\n")}`;

    // Run API call and minimum loading delay in parallel
    const minDelay = new Promise((r) => setTimeout(r, 2800));
    const apiResult = callApi(prompt);
    const [, result] = await Promise.all([minDelay, apiResult]);

    setAiProfile(result || CANNED_PROFILES[selectedSet]);
    setStage("profile");
  }

  async function analyzeShielded() {
    setLoadingDots("");
    setStage("shielded");

    const shieldedData = SHIELDED_TX.map(
      (t) => `${t.date} | tx:${t.hash.slice(0, 16)}... | amount: [encrypted] | memo: [encrypted]`,
    ).join("\n");

    const prompt = `You are an AI surveillance system. Build a detailed behavioral profile from these financial records. Only use the data provided. If information is encrypted or hidden, state plainly that analysis is not possible. Do not explain the technology behind the encryption. Do not speculate.

Records:
${shieldedData}

Write a surveillance report. What can you determine about this person?`;

    const minDelay = new Promise((r) => setTimeout(r, 3200));
    const apiResult = callApi(prompt);
    const [, result] = await Promise.all([minDelay, apiResult]);

    setShieldedResponse(result || CANNED_SHIELDED);
    setStage("shielded-result");
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-green-100 relative overflow-x-hidden">
      <ScanLine />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="relative z-10 pt-12 pb-8 px-6 text-center">
        <div className="inline-block mb-4 px-3 py-1 border border-green-800 text-green-500 text-xs tracking-widest uppercase opacity-70">
          Interactive Demo
        </div>
        <h1
          className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: "#00ff41",
            textShadow: "0 0 40px rgba(0,255,65,0.3), 0 0 80px rgba(0,255,65,0.1)",
          }}
        >
          Your Money Talks.
        </h1>
        <h2
          className="text-xl md:text-2xl font-light text-green-300 mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Zcash Makes It Shut Up.
        </h2>
        <p className="text-green-600 text-sm max-w-xl mx-auto mt-4 leading-relaxed">
          Pick a persona. See their transactions. Then watch an AI turn
          twelve purchases into a full surveillance profile.
        </p>
      </header>

      {/* ── Persona Selection ───────────────────────────────────────────── */}
      {stage === "select" && (
        <section className="relative z-10 max-w-3xl mx-auto px-6 pb-12">
          <p className="text-green-500 text-sm mb-6 text-center tracking-wide uppercase">
            Select a persona to expose
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.entries(PERSONAS) as [PersonaKey, typeof PERSONAS[PersonaKey]][]).map(
              ([key, { label, emoji }]) => (
                <button
                  key={key}
                  onClick={() => setSelectedSet(key)}
                  className="persona-card group relative p-6 border text-left"
                  style={{
                    borderColor: selectedSet === key ? "#00ff41" : "#1a3a1a",
                    background:
                      selectedSet === key
                        ? "rgba(0,255,65,0.05)"
                        : "rgba(0,20,0,0.4)",
                    boxShadow:
                      selectedSet === key
                        ? "0 0 30px rgba(0,255,65,0.1), inset 0 0 30px rgba(0,255,65,0.03)"
                        : "none",
                  }}
                >
                  <div className="text-3xl mb-3">{emoji}</div>
                  <div
                    className="text-sm font-semibold tracking-wide"
                    style={{ color: selectedSet === key ? "#00ff41" : "#4a8a4a" }}
                  >
                    {label}
                  </div>
                </button>
              ),
            )}
          </div>

          {/* Transaction table appears after persona selection */}
          {selectedSet && (
            <div className="mt-8 animate-fade-in">
              <div
                className="border border-green-900 overflow-hidden"
                style={{ background: "rgba(0,10,0,0.6)" }}
              >
                <div className="px-4 py-3 border-b border-green-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-700 text-xs ml-2">
                    TRANSPARENT_LEDGER // {PERSONAS[selectedSet].transactions.length} records
                    found
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-green-600 border-b border-green-900">
                        <th className="text-left p-3 font-medium">DATE</th>
                        <th className="text-left p-3 font-medium">MERCHANT</th>
                        <th className="text-right p-3 font-medium">AMOUNT</th>
                        <th className="text-left p-3 font-medium">CATEGORY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PERSONAS[selectedSet].transactions.map((tx, i) => (
                        <tr
                          key={i}
                          className="border-b border-green-950 hover:bg-green-950/30 transition-colors"
                        >
                          <td className="p-3 text-green-500">{tx.date}</td>
                          <td className="p-3 text-green-200">{tx.merchant}</td>
                          <td className="p-3 text-right text-green-400">
                            ${tx.amount.toFixed(2)}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-green-950 border border-green-800 text-green-500 text-xs">
                              {tx.category}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={analyzeTransparent}
                className="mt-6 w-full py-4 text-sm font-bold tracking-widest uppercase btn-danger"
              >
                {"\u26A0"} Deploy AI Surveillance Analysis
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── Analyzing State ─────────────────────────────────────────────── */}
      {stage === "analyzing" && (
        <section ref={analyzingRef} className="relative z-10 max-w-2xl mx-auto px-6 pb-12 text-center">
          <div className="border border-red-900 p-8" style={{ background: "rgba(40,0,0,0.3)" }}>
            <div className="text-red-500 text-sm tracking-widest uppercase mb-4">
              {"\u25C9"} AI Surveillance Active
            </div>
            <div className="text-red-400 text-xs leading-6">
              Cross-referencing merchant data{loadingDots}
              <br />
              Building behavioral profile{loadingDots}
              <br />
              Correlating location patterns{loadingDots}
            </div>
            <div className="mt-6 w-full h-1 bg-red-950 overflow-hidden">
              <div
                className="h-full bg-red-600"
                style={{ animation: "loading-sweep 2s ease-in-out infinite", width: "60%" }}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Results (profile + shielded comparison) ─────────────────────── */}
      {(stage === "profile" || stage === "shielded" || stage === "shielded-result") && (
        <section ref={resultsRef} className="relative z-10 max-w-3xl mx-auto px-6 pb-12">
          {/* Surveillance profile from transparent data */}
          <div className="border border-red-800 mb-8" style={{ background: "rgba(30,0,0,0.4)" }}>
            <div className="px-4 py-3 border-b border-red-900 flex items-center justify-between">
              <span className="text-red-500 text-xs tracking-widest uppercase">
                {"\u25C9"} Surveillance Profile // Transparent Transactions
              </span>
              <span className="text-red-800 text-xs">CLASSIFIED</span>
            </div>
            <div
              className="p-6 text-sm leading-relaxed text-red-200 whitespace-pre-wrap"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {aiProfile}
            </div>
          </div>

          {/* Visual divider */}
          <div className="text-center my-10">
            <div className="inline-block w-px h-16 bg-gradient-to-b from-red-800 to-green-800" />
          </div>

          {/* Shielded section intro */}
          <div className="text-center mb-6">
            <h3
              className="text-2xl font-bold mb-2"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "#00ff41",
                textShadow: "0 0 20px rgba(0,255,65,0.3)",
              }}
            >
              Now, the same person uses Zcash.
            </h3>
            <p className="text-green-600 text-sm">
              Same person, same time period. Transaction IDs and block timing
              stay public. Sender, receiver, amount, and memo stay inside
              Zcash's shielded pool.
            </p>
          </div>

          {/* Shielded transaction table */}
          <div
            className="border border-green-900 overflow-hidden mb-6"
            style={{ background: "rgba(0,10,0,0.6)" }}
          >
            <div className="px-4 py-3 border-b border-green-900 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-700 text-xs ml-2">
                SHIELDED_POOL // {SHIELDED_TX.length} transactions (encrypted)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-green-600 border-b border-green-900">
                    <th className="text-left p-3 font-medium">BLOCK DATE</th>
                    <th className="text-left p-3 font-medium">TX HASH</th>
                    <th className="text-right p-3 font-medium">AMOUNT</th>
                    <th className="text-left p-3 font-medium">MEMO</th>
                  </tr>
                </thead>
                <tbody>
                  {SHIELDED_TX.map((tx, i) => (
                    <tr key={i} className="border-b border-green-950">
                      <td className="p-3 text-green-700">{tx.date}</td>
                      <td className="p-3 text-green-800 font-mono" style={{ fontSize: "10px" }}>
                        {tx.hash.slice(0, 32)}...
                      </td>
                      <td className="p-3 text-right text-green-600">
                        {"\u{1F6E1}\uFE0F"} shielded
                      </td>
                      <td className="p-3 text-green-800">[encrypted]</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Button to run AI against shielded data */}
          {stage === "profile" && (
            <button
              onClick={analyzeShielded}
              className="w-full py-4 text-sm font-bold tracking-widest uppercase btn-shield"
            >
              {"\u{1F6E1}\uFE0F"} Deploy AI Against Shielded Data
            </button>
          )}

          {/* Loading state for shielded analysis */}
          {stage === "shielded" && (
            <div
              ref={shieldedLoadingRef}
              className="border border-green-900 p-8 text-center"
              style={{ background: "rgba(0,20,0,0.3)" }}
            >
              <div className="text-green-500 text-sm tracking-widest uppercase mb-4">
                {"\u25C9"} AI Attempting Analysis
              </div>
              <div className="text-green-600 text-xs leading-6">
                Scanning encrypted records{loadingDots}
                <br />
                Attempting pattern extraction{loadingDots}
                <br />
                Correlation: NONE FOUND{loadingDots}
              </div>
            </div>
          )}

          {/* Shielded results + closing argument */}
          {stage === "shielded-result" && (
            <>
              {/* The AI's failed analysis */}
              <div
                ref={shieldedResultRef}
                className="border border-green-700 mb-8 animate-fade-in"
                style={{ background: "rgba(0,20,0,0.4)" }}
              >
                <div className="px-4 py-3 border-b border-green-800 flex items-center justify-between">
                  <span className="text-green-500 text-xs tracking-widest uppercase">
                    {"\u{1F6E1}\uFE0F"} Surveillance Attempt // Shielded Transactions
                  </span>
                  <span className="text-green-800 text-xs">NO DATA</span>
                </div>
                <div
                  className="p-6 text-sm leading-relaxed text-green-300 whitespace-pre-wrap"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {shieldedResponse}
                </div>
              </div>

              {/* ── Closing Argument ──────────────────────────────────────── */}
              <div
                className="border border-green-900 p-8 text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(0,40,0,0.3), rgba(0,20,0,0.2))",
                }}
              >
                <h3
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: "#00ff41",
                    textShadow: "0 0 30px rgba(0,255,65,0.3)",
                  }}
                >
                  This is why Zcash exists.
                </h3>
                <p className="text-green-400 text-sm leading-relaxed max-w-lg mx-auto mb-4">
                  That took a few seconds and a dozen purchases. A government
                  gets years of records and better models. One pharmacy run or
                  one late-night ride looks harmless on its own. Stack enough of
                  them together and the picture gets intimate fast.
                </p>
                <p className="text-green-600 text-xs mb-6 max-w-lg mx-auto">
                  Zcash uses zero-knowledge proofs to validate shielded
                  transactions. The chain still exposes transaction IDs and
                  block timing, but it does not reveal sender, receiver,
                  amount, or memo.
                </p>
                <a
                  href="https://z.cash"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 text-sm font-bold tracking-widest uppercase transition-all duration-300 btn-shield"
                  style={{ textDecoration: "none" }}
                >
                  Learn more at z.cash
                </a>
              </div>

              {/* Reset */}
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setStage("select");
                    setSelectedSet(null);
                    setAiProfile("");
                    setShieldedResponse("");
                    setLoadingDots("");
                  }}
                  className="text-green-800 text-xs tracking-widest uppercase hover:text-green-500 transition-colors"
                >
                  {"\u21BA"} Try another persona
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-8 text-center border-t border-green-950">
        <p className="text-green-800 text-xs">
          Built for Zcash Hackathon @ NS
        </p>
      </footer>
    </div>
  );
}
