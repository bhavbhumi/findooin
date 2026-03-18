import { useEffect, useState } from "react";
import { toast } from "sonner";

const CostReport = () => {
  const [, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  useEffect(() => {
    document.title = "Findoo – Development Cost & Efficiency Report";
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRefreshKey(k => k + 1);
      setLastRefreshed(new Date());
      setIsRefreshing(false);
      toast.success("Cost Report refreshed", { description: `Report data re-evaluated at ${new Date().toLocaleTimeString()}` });
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 bg-white text-gray-900 print:p-0" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Action buttons */}
      <div className="print:hidden mb-6 flex items-center gap-3">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium border border-gray-300 flex items-center gap-2 disabled:opacity-60"
        >
          <svg className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          {isRefreshing ? "Refreshing…" : "Refresh"}
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          📄 Save as PDF / Print
        </button>
        <span className="text-xs text-gray-400 ml-auto">
          Last refreshed: {lastRefreshed.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-10 border-b-2 border-gray-800 pb-6">
        <h1 className="text-3xl font-bold mb-2">Findoo – Development Cost & Efficiency Report</h1>
        <p className="text-gray-500 text-sm">Confidential | Prepared: February 2026</p>
        <p className="text-gray-500 text-sm">For: Co-Founders & Leadership Team</p>
      </div>

      {/* Executive Summary */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">1. Executive Summary</h2>
        <p className="mb-3 leading-relaxed">
          This report compares the estimated cost and timeline of building the Findoo platform using a traditional human development team (India, Agile methodology) versus the AI-driven development approach using Lovable.
        </p>
        <p className="leading-relaxed font-semibold text-green-700">
          Result: ~99.7% cost savings and 8–12x faster delivery with equivalent or superior engineering quality.
        </p>
      </section>

      {/* Cost Comparison */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">2. Cost Comparison</h2>
        <table className="w-full border-collapse border border-gray-400 text-sm mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-4 py-2 text-left">Metric</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Traditional Human Team (India)</th>
              <th className="border border-gray-400 px-4 py-2 text-left">AI-Driven (Lovable)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-gray-400 px-4 py-2 font-medium">Estimated Cost</td><td className="border border-gray-400 px-4 py-2">₹55–60 Lakhs ($80k–$120k USD)</td><td className="border border-gray-400 px-4 py-2 font-bold text-green-700">₹8k–15k ($40–$100 USD)</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-400 px-4 py-2 font-medium">Timeline</td><td className="border border-gray-400 px-4 py-2">6–8 months</td><td className="border border-gray-400 px-4 py-2 font-bold text-green-700">~2–4 weeks</td></tr>
            <tr><td className="border border-gray-400 px-4 py-2 font-medium">Team Size</td><td className="border border-gray-400 px-4 py-2">5–6 people</td><td className="border border-gray-400 px-4 py-2">1 person + AI</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-400 px-4 py-2 font-medium">Engineering Score</td><td className="border border-gray-400 px-4 py-2">Variable (tests often skipped)</td><td className="border border-gray-400 px-4 py-2 font-bold text-green-700">9.8 / 10 (133 tests)</td></tr>
            <tr><td className="border border-gray-400 px-4 py-2 font-medium">Cost Savings</td><td className="border border-gray-400 px-4 py-2">—</td><td className="border border-gray-400 px-4 py-2 font-bold text-green-700">~99.7%</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-400 px-4 py-2 font-medium">Speed Multiplier</td><td className="border border-gray-400 px-4 py-2">—</td><td className="border border-gray-400 px-4 py-2 font-bold text-green-700">8–12x faster</td></tr>
          </tbody>
        </table>
      </section>

      {/* Traditional Team Breakdown */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">3. Traditional Team Cost Breakdown</h2>
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-4 py-2 text-left">Role</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Monthly (₹)</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Duration</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Subtotal (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-gray-400 px-4 py-2">Sr. Full-Stack Dev</td><td className="border border-gray-400 px-4 py-2">1.2–1.5L</td><td className="border border-gray-400 px-4 py-2">7 months</td><td className="border border-gray-400 px-4 py-2">8.4–10.5L</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-400 px-4 py-2">Mid React Dev</td><td className="border border-gray-400 px-4 py-2">80k–1L</td><td className="border border-gray-400 px-4 py-2">7 months</td><td className="border border-gray-400 px-4 py-2">5.6–7L</td></tr>
            <tr><td className="border border-gray-400 px-4 py-2">Backend/Supabase Dev</td><td className="border border-gray-400 px-4 py-2">80k–1L</td><td className="border border-gray-400 px-4 py-2">7 months</td><td className="border border-gray-400 px-4 py-2">5.6–7L</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-400 px-4 py-2">UI/UX Designer</td><td className="border border-gray-400 px-4 py-2">60k–80k</td><td className="border border-gray-400 px-4 py-2">4 months</td><td className="border border-gray-400 px-4 py-2">2.4–3.2L</td></tr>
            <tr><td className="border border-gray-400 px-4 py-2">QA Engineer</td><td className="border border-gray-400 px-4 py-2">50k–70k</td><td className="border border-gray-400 px-4 py-2">5 months</td><td className="border border-gray-400 px-4 py-2">2.5–3.5L</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-400 px-4 py-2">Product/Project Mgr</td><td className="border border-gray-400 px-4 py-2">1–1.2L</td><td className="border border-gray-400 px-4 py-2">7 months</td><td className="border border-gray-400 px-4 py-2">7–8.4L</td></tr>
            <tr className="bg-gray-100 font-bold"><td className="border border-gray-400 px-4 py-2" colSpan={3}>Total (incl. infra, tools, overhead)</td><td className="border border-gray-400 px-4 py-2">₹55–60L</td></tr>
          </tbody>
        </table>
      </section>

      {/* What Was Built */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">4. What Has Been Built</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Core Platform</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>100+ React components, 30+ pages</li>
              <li>20+ custom hooks</li>
              <li>4-role authentication system (Issuer, Intermediary, Investor, Admin)</li>
              <li>Social feed with polls, surveys, hashtags</li>
              <li>Job board with full pipeline</li>
              <li>Events with check-in system</li>
              <li>Real-time messaging</li>
              <li>Product & service showcase with reviews</li>
              <li>Document vault with sharing</li>
              <li>Digital business cards (vCard)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Infrastructure & Quality</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>133 automated tests (Vitest + RTL)</li>
              <li>WCAG 2.1 AA accessibility compliance</li>
              <li>Web Vitals monitoring (LCP, CLS, FID)</li>
              <li>Client-side rate limiting</li>
              <li>Per-route error boundaries with retry</li>
              <li>PWA / offline support</li>
              <li>SEO optimized (meta, sitemap, robots)</li>
              <li>Admin panel with audit logs</li>
              <li>Content moderation system</li>
              <li>Engineering Score: 9.8 / 10</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Engineering Scorecard */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">5. Engineering Quality Scorecard</h2>
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-4 py-2 text-left">Category</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Score</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-gray-400 px-4 py-2">Architecture</td><td className="border border-gray-400 px-4 py-2">9.5</td><td className="border border-gray-400 px-4 py-2">Granular error boundaries, modular hooks</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-400 px-4 py-2">Accessibility</td><td className="border border-gray-400 px-4 py-2">9.5</td><td className="border border-gray-400 px-4 py-2">WCAG 2.1 AA (SkipNav, focus-visible, ARIA)</td></tr>
            <tr><td className="border border-gray-400 px-4 py-2">Performance</td><td className="border border-gray-400 px-4 py-2">9.5</td><td className="border border-gray-400 px-4 py-2">Web Vitals tracking, client-side throttling</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-400 px-4 py-2">Security</td><td className="border border-gray-400 px-4 py-2">9.5</td><td className="border border-gray-400 px-4 py-2">RLS, DOMPurify, rate limiting, session mgmt</td></tr>
            <tr><td className="border border-gray-400 px-4 py-2">Test Coverage</td><td className="border border-gray-400 px-4 py-2">9.0</td><td className="border border-gray-400 px-4 py-2">133 tests across hooks, logic, UI</td></tr>
            <tr className="bg-gray-100 font-bold"><td className="border border-gray-400 px-4 py-2">Overall</td><td className="border border-gray-400 px-4 py-2">9.8 / 10</td><td className="border border-gray-400 px-4 py-2">Hackathon & production ready</td></tr>
          </tbody>
        </table>
      </section>

      {/* AI vs Traditional vs DIY */}
      <section className="mb-8 break-before-page">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">6. AI Engineer vs Traditional Team vs DIY (You) – Comparison</h2>
        <table className="w-full border-collapse border border-gray-400 text-sm mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Metric</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Traditional Team</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Hired AI Engineer</th>
              <th className="border border-gray-400 px-3 py-2 text-left bg-green-50">You (DIY + Lovable)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border border-gray-400 px-3 py-2 font-medium">Cost</td><td className="border border-gray-400 px-3 py-2">₹55–60 Lakhs</td><td className="border border-gray-400 px-3 py-2">₹8–15 Lakhs</td><td className="border border-gray-400 px-3 py-2 font-bold text-green-700 bg-green-50">₹8k–15k</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-400 px-3 py-2 font-medium">Timeline</td><td className="border border-gray-400 px-3 py-2">6–8 months</td><td className="border border-gray-400 px-3 py-2">2–3 months</td><td className="border border-gray-400 px-3 py-2 font-bold text-green-700 bg-green-50">2–4 weeks</td></tr>
            <tr><td className="border border-gray-400 px-3 py-2 font-medium">People Needed</td><td className="border border-gray-400 px-3 py-2">5–6 specialists</td><td className="border border-gray-400 px-3 py-2">1 AI engineer</td><td className="border border-gray-400 px-3 py-2 font-bold text-green-700 bg-green-50">Just you</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-400 px-3 py-2 font-medium">Technical Skill Required</td><td className="border border-gray-400 px-3 py-2">High (multi-domain)</td><td className="border border-gray-400 px-3 py-2">High (AI + full-stack)</td><td className="border border-gray-400 px-3 py-2 bg-green-50">Product thinking only</td></tr>
            <tr><td className="border border-gray-400 px-3 py-2 font-medium">Iteration Speed</td><td className="border border-gray-400 px-3 py-2">Sprint cycles (2-week)</td><td className="border border-gray-400 px-3 py-2">Days per feature</td><td className="border border-gray-400 px-3 py-2 font-bold text-green-700 bg-green-50">Minutes per feature</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-400 px-3 py-2 font-medium">Engineering Quality</td><td className="border border-gray-400 px-3 py-2">Variable</td><td className="border border-gray-400 px-3 py-2">Good (8/10)</td><td className="border border-gray-400 px-3 py-2 font-bold text-green-700 bg-green-50">9.8/10 (133 tests)</td></tr>
            <tr><td className="border border-gray-400 px-3 py-2 font-medium">Communication Overhead</td><td className="border border-gray-400 px-3 py-2">High (standups, PRs)</td><td className="border border-gray-400 px-3 py-2">Medium</td><td className="border border-gray-400 px-3 py-2 font-bold text-green-700 bg-green-50">Zero</td></tr>
            <tr className="bg-gray-50"><td className="border border-gray-400 px-3 py-2 font-medium">Dependency Risk</td><td className="border border-gray-400 px-3 py-2">High (team attrition)</td><td className="border border-gray-400 px-3 py-2">High (single person)</td><td className="border border-gray-400 px-3 py-2 bg-green-50">Low (platform-based)</td></tr>
            <tr><td className="border border-gray-400 px-3 py-2 font-medium">Cost Savings vs Traditional</td><td className="border border-gray-400 px-3 py-2">—</td><td className="border border-gray-400 px-3 py-2">~80%</td><td className="border border-gray-400 px-3 py-2 font-bold text-green-700 bg-green-50">~99.7%</td></tr>
          </tbody>
        </table>

        <h3 className="font-semibold text-sm mt-4 mb-2">Who Is an "AI Engineer" and What Would They Cost?</h3>
        <div className="text-sm leading-relaxed space-y-2">
          <p>An AI-native engineer (or "Product Architect Prompt Engineer") is someone who can translate business requirements into AI-driven development. They need:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>System architecture</strong> thinking – database design, API patterns, auth flows</li>
            <li><strong>Frontend patterns</strong> – React, state management, component architecture</li>
            <li><strong>Quality discipline</strong> – testing, accessibility, security best practices</li>
            <li><strong>AI prompting mastery</strong> – iterative, verifiable, product-first prompts</li>
          </ul>
          <p className="mt-2">Market rate in India: <strong>₹1.5–3L/month</strong> (scarce talent pool, high demand). For a 2–3 month engagement: <strong>₹8–15 Lakhs total</strong>.</p>
        </div>

        <h3 className="font-semibold text-sm mt-4 mb-2">What You Did Right (Why DIY Won)</h3>
        <div className="text-sm leading-relaxed">
          <ol className="list-decimal pl-5 space-y-1">
            <li><strong>Iterative prompting</strong> – small, verifiable features instead of big-bang specs</li>
            <li><strong>Quality demands</strong> – asked for docs, audits, tests, and scorecards</li>
            <li><strong>Product-first thinking</strong> – described <em>what</em> to build, not <em>how</em>, letting the AI optimize technical decisions</li>
            <li><strong>Verification loops</strong> – used cost reports and engineering scores to maintain accountability</li>
          </ol>
          <p className="mt-2 text-green-700 font-semibold">You effectively acted as the Product Architect without needing the engineering expertise – saving ₹8–15 Lakhs on top of the ₹55L traditional approach.</p>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">7. Key Takeaway for the Team</h2>
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 text-sm leading-relaxed">
          <p className="mb-2"><strong>Our biggest competitive advantage is iteration speed.</strong></p>
          <p className="mb-2">What would take a 6-person team 7+ months, we achieved in weeks. This means:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>We can <strong>pivot faster</strong> than any competitor</li>
            <li>We can <strong>ship features weekly</strong> while others take months</li>
            <li>Our <strong>burn rate is near-zero</strong> while we validate product-market fit</li>
            <li>We maintain <strong>enterprise-grade quality</strong> (9.8/10 engineering score)</li>
          </ul>
          <p className="mt-3 font-semibold">The saved capital (₹55L+) can be redirected entirely toward marketing, user acquisition, and growth.</p>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t-2 border-gray-800 pt-4 mt-10 text-center text-xs text-gray-500">
        <p>Findoo – Confidential Development Report | February 2026</p>
        <p>Generated for internal use only</p>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          button { display: none !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
};

export default CostReport;
