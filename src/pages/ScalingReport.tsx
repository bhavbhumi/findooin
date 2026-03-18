import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from "recharts";

const infraCostData = [
  { scale: "1K", infra: 2.5, marketing: 50, total: 52.5 },
  { scale: "5K", infra: 5, marketing: 100, total: 105 },
  { scale: "10K", infra: 12, marketing: 200, total: 212 },
  { scale: "100K", infra: 120, marketing: 500, total: 620 },
  { scale: "1M", infra: 800, marketing: 1500, total: 2300 },
];

const burnBreakdownData = [
  { name: "Database", value: 35 },
  { name: "Auth & Identity", value: 12 },
  { name: "Storage / CDN", value: 18 },
  { name: "Edge Functions", value: 10 },
  { name: "Marketing", value: 25 },
];

const COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#dc2626"];

const breakpointData = [
  { users: "1K", capacity: 100 },
  { users: "3K", capacity: 85 },
  { users: "5K", capacity: 60 },
  { users: "10K", capacity: 40 },
  { users: "25K", capacity: 20 },
  { users: "50K", capacity: 8 },
  { users: "100K", capacity: 0 },
];

const ScalingReport = () => {
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    document.title = "Findoo – Infrastructure Scaling & Cost Report";
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 bg-white text-gray-900 print:p-0" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Action buttons */}
      <div className="print:hidden mb-6 flex gap-3">
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium border border-gray-300"
        >
          🔄 Refresh
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          📄 Save as PDF / Print
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-10 border-b-2 border-gray-800 pb-6">
        <h1 className="text-3xl font-bold mb-2">Findoo – Infrastructure Scaling & Cost Report</h1>
        <p className="text-gray-500 text-sm">Confidential | Prepared: February 2026</p>
        <p className="text-gray-500 text-sm">For: Co-Founders, Leadership & Investors</p>
      </div>

      {/* 1. Executive Summary */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">1. Executive Summary</h2>
        <p className="mb-3 leading-relaxed text-sm">
          This report provides a detailed analysis of infrastructure costs, scaling breakpoints, upgrade milestones, and marketing budget required to operate FindOO from 1,000 to 1,000,000 concurrent users. The current architecture (React SPA + Lovable Cloud) is production-ready and can handle up to <strong>~5K concurrent users with zero infrastructure changes</strong>.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 text-sm">
          <p className="font-semibold">Key Finding:</p>
          <p>Total monthly burn at 10K users is <strong>~₹2.1L/month</strong>, scaling to <strong>~₹23L/month</strong> at 1M users. The first engineering intervention is needed at ~3K concurrent users (connection pooling).</p>
        </div>
      </section>

      {/* 2. Monthly Infrastructure Cost */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">2. Monthly Infrastructure Cost by Scale</h2>
        <table className="w-full border-collapse border border-gray-400 text-sm mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Concurrent Users</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Database</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Auth</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Storage</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Edge Functions</th>
              <th className="border border-gray-400 px-3 py-2 text-left">CDN</th>
              <th className="border border-gray-400 px-3 py-2 text-left font-bold">Total/mo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-2 font-medium">1K</td>
              <td className="border border-gray-400 px-3 py-2">₹0–2K</td>
              <td className="border border-gray-400 px-3 py-2">Free</td>
              <td className="border border-gray-400 px-3 py-2">~1GB (Free)</td>
              <td className="border border-gray-400 px-3 py-2">Minimal</td>
              <td className="border border-gray-400 px-3 py-2">Free</td>
              <td className="border border-gray-400 px-3 py-2 font-bold text-green-700">₹0–2,500</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-2 font-medium">5K</td>
              <td className="border border-gray-400 px-3 py-2">Pro (₹2K)</td>
              <td className="border border-gray-400 px-3 py-2">Included</td>
              <td className="border border-gray-400 px-3 py-2">~5GB (₹500)</td>
              <td className="border border-gray-400 px-3 py-2">~500K inv. (₹0)</td>
              <td className="border border-gray-400 px-3 py-2">Free</td>
              <td className="border border-gray-400 px-3 py-2 font-bold text-blue-700">₹2,500–5,000</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 font-medium">10K</td>
              <td className="border border-gray-400 px-3 py-2">Pro + Replica (₹6K)</td>
              <td className="border border-gray-400 px-3 py-2">Pro</td>
              <td className="border border-gray-400 px-3 py-2">~20GB (₹1.5K)</td>
              <td className="border border-gray-400 px-3 py-2">~2M inv. (₹800)</td>
              <td className="border border-gray-400 px-3 py-2">₹1.5K</td>
              <td className="border border-gray-400 px-3 py-2 font-bold text-blue-700">₹8K–12K</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-2 font-medium">100K</td>
              <td className="border border-gray-400 px-3 py-2">Team (₹40K–80K)</td>
              <td className="border border-gray-400 px-3 py-2">Custom (₹15K)</td>
              <td className="border border-gray-400 px-3 py-2">~200GB (₹8K)</td>
              <td className="border border-gray-400 px-3 py-2">~50M inv. (₹10K)</td>
              <td className="border border-gray-400 px-3 py-2">₹15K</td>
              <td className="border border-gray-400 px-3 py-2 font-bold text-orange-600">₹80K–1.5L</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 font-medium">1M</td>
              <td className="border border-gray-400 px-3 py-2">Dedicated (₹3–5L)</td>
              <td className="border border-gray-400 px-3 py-2">Auth Cluster</td>
              <td className="border border-gray-400 px-3 py-2">~2TB (₹50K)</td>
              <td className="border border-gray-400 px-3 py-2">Dedicated (₹80K)</td>
              <td className="border border-gray-400 px-3 py-2">₹40K</td>
              <td className="border border-gray-400 px-3 py-2 font-bold text-red-600">₹5L–10L</td>
            </tr>
          </tbody>
        </table>

        {/* Chart */}
        <div className="print:hidden">
          <h3 className="font-semibold text-sm mb-3">Total Monthly Burn (₹ in Thousands)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={infraCostData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scale" label={{ value: "Concurrent Users", position: "insideBottom", offset: -5 }} />
              <YAxis label={{ value: "₹ (thousands)", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(value: number) => [`₹${value}K`, ""]} />
              <Bar dataKey="infra" stackId="a" fill="#2563eb" name="Infrastructure" />
              <Bar dataKey="marketing" stackId="a" fill="#dc2626" name="Marketing" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3. Where It Will Break */}
      <section className="mb-8 break-before-page">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">3. Scaling Breakpoints – Where It Will Break</h2>
        <table className="w-full border-collapse border border-gray-400 text-sm mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Scale</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Bottleneck</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Symptom</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Severity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-2 font-medium">5K</td>
              <td className="border border-gray-400 px-3 py-2">Database connections (60 direct limit)</td>
              <td className="border border-gray-400 px-3 py-2">Timeouts on feed, messages</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium">Medium</span></td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-2 font-medium">10K</td>
              <td className="border border-gray-400 px-3 py-2">Realtime subscriptions saturate</td>
              <td className="border border-gray-400 px-3 py-2">Delayed/dropped messages</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">High</span></td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 font-medium">10K</td>
              <td className="border border-gray-400 px-3 py-2">RPC query load (get_feed_posts, get_conversations)</td>
              <td className="border border-gray-400 px-3 py-2">Feed loads &gt;3s</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">High</span></td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-2 font-medium">50K</td>
              <td className="border border-gray-400 px-3 py-2">RLS overhead (~2–5ms per query compounds)</td>
              <td className="border border-gray-400 px-3 py-2">Compound latency across pages</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">High</span></td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 font-medium">100K</td>
              <td className="border border-gray-400 px-3 py-2">Storage bandwidth (avatars, vault files)</td>
              <td className="border border-gray-400 px-3 py-2">429 rate limits on file access</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium">Critical</span></td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-2 font-medium">100K+</td>
              <td className="border border-gray-400 px-3 py-2">Edge function cold starts</td>
              <td className="border border-gray-400 px-3 py-2">Timeout failures</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium">Critical</span></td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 font-medium">500K+</td>
              <td className="border border-gray-400 px-3 py-2">Single-region DB (Asia Pacific only)</td>
              <td className="border border-gray-400 px-3 py-2">High latency for non-Indian users</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium">Critical</span></td>
            </tr>
          </tbody>
        </table>

        {/* Capacity chart */}
        <div className="print:hidden">
          <h3 className="font-semibold text-sm mb-3">Current Architecture Headroom (% remaining before failure)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={breakpointData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="users" />
              <YAxis domain={[0, 100]} label={{ value: "Headroom %", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(value: number) => [`${value}%`, "Capacity"]} />
              <Area type="monotone" dataKey="capacity" stroke="#dc2626" fill="#fecaca" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. Upgrade Roadmap */}
      <section className="mb-8 break-before-page">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">4. Upgrade Roadmap – What & When</h2>
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Milestone</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Action Required</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Est. Cost Impact</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Effort</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-2 font-medium">3K users</td>
              <td className="border border-gray-400 px-3 py-2">Enable connection pooling (PgBouncer/Supavisor)</td>
              <td className="border border-gray-400 px-3 py-2 text-green-700">₹0 (config)</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">1 hour</span></td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-2 font-medium">5K users</td>
              <td className="border border-gray-400 px-3 py-2">Add Redis/Upstash cache for feed, trending, profiles</td>
              <td className="border border-gray-400 px-3 py-2">+₹1–2K/mo</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">1–2 days</span></td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 font-medium">10K users</td>
              <td className="border border-gray-400 px-3 py-2">Upgrade to Pro plan + read replica</td>
              <td className="border border-gray-400 px-3 py-2">+₹4K/mo</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Config</span></td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-2 font-medium">10K users</td>
              <td className="border border-gray-400 px-3 py-2">CDN for static assets (Cloudflare)</td>
              <td className="border border-gray-400 px-3 py-2">+₹1.5K/mo</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">2 hours</span></td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 font-medium">25K users</td>
              <td className="border border-gray-400 px-3 py-2">Separate realtime from transactional DB</td>
              <td className="border border-gray-400 px-3 py-2">+₹5K/mo</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs">1 week</span></td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-2 font-medium">50K users</td>
              <td className="border border-gray-400 px-3 py-2">Full-text search engine (Meilisearch/Typesense)</td>
              <td className="border border-gray-400 px-3 py-2">+₹3K/mo</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">3–5 days</span></td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 font-medium">100K users</td>
              <td className="border border-gray-400 px-3 py-2">Dedicated database + horizontal scaling</td>
              <td className="border border-gray-400 px-3 py-2">+₹40K+/mo</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">2–4 weeks</span></td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-2 font-medium">100K users</td>
              <td className="border border-gray-400 px-3 py-2">Dedicated identity provider</td>
              <td className="border border-gray-400 px-3 py-2">+₹15K/mo</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs">1 week</span></td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 font-medium">500K+ users</td>
              <td className="border border-gray-400 px-3 py-2">Multi-region deployment + edge caching</td>
              <td className="border border-gray-400 px-3 py-2">+₹1L+/mo</td>
              <td className="border border-gray-400 px-3 py-2"><span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">1–2 months</span></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 5. Marketing Budget */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">5. Marketing Budget Framework</h2>
        <table className="w-full border-collapse border border-gray-400 text-sm mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left">Phase</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Target</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Monthly Budget</th>
              <th className="border border-gray-400 px-3 py-2 text-left">Key Channels</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-2 font-medium">🌱 Seed</td>
              <td className="border border-gray-400 px-3 py-2">0 → 1K registered</td>
              <td className="border border-gray-400 px-3 py-2">₹25K–50K</td>
              <td className="border border-gray-400 px-3 py-2 text-xs">LinkedIn ads, WhatsApp groups, AMFI events</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-2 font-medium">🚀 Growth</td>
              <td className="border border-gray-400 px-3 py-2">1K → 10K registered</td>
              <td className="border border-gray-400 px-3 py-2">₹1–2L</td>
              <td className="border border-gray-400 px-3 py-2 text-xs">Google Ads, content marketing, referral program, webinars</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 font-medium">📈 Scale</td>
              <td className="border border-gray-400 px-3 py-2">10K → 50K registered</td>
              <td className="border border-gray-400 px-3 py-2">₹3–5L</td>
              <td className="border border-gray-400 px-3 py-2 text-xs">Performance marketing, fin-fluencers, AMC partnerships</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-3 py-2 font-medium">👑 Dominance</td>
              <td className="border border-gray-400 px-3 py-2">50K → 1L+ registered</td>
              <td className="border border-gray-400 px-3 py-2">₹8–15L</td>
              <td className="border border-gray-400 px-3 py-2 text-xs">Brand campaigns, sponsorships, PR, app installs</td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Unit Economics</h3>
            <ul className="space-y-1 text-xs">
              <li><strong>CAC:</strong> ₹150–400 per registered user</li>
              <li><strong>Target LTV:CAC ratio:</strong> 3:1 minimum</li>
              <li><strong>Payback period:</strong> 6–12 months</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Budget Rule of Thumb</h3>
            <ul className="space-y-1 text-xs">
              <li>Growth phase: <strong>40–60%</strong> of total spend = marketing</li>
              <li>B2B fintech CAC in India: <strong>₹200–500</strong></li>
              <li>Organic channels reduce CAC by <strong>30–50%</strong> over 6 months</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Burn Breakdown */}
      <section className="mb-8 break-before-page">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">6. Cost Composition at Scale (100K users)</h2>
        <div className="print:hidden flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={burnBreakdownData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {burnBreakdownData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(value: number) => [`${value}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Print fallback */}
        <div className="hidden print:block">
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left">Component</th>
                <th className="border border-gray-400 px-3 py-2 text-left">Share</th>
              </tr>
            </thead>
            <tbody>
              {burnBreakdownData.map((item, i) => (
                <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                  <td className="border border-gray-400 px-3 py-2">{item.name}</td>
                  <td className="border border-gray-400 px-3 py-2">{item.value}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. Total Monthly Burn Summary */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">7. Total Monthly Burn Summary</h2>
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-4 py-2 text-left">Scale</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Infrastructure</th>
              <th className="border border-gray-400 px-4 py-2 text-left">Marketing</th>
              <th className="border border-gray-400 px-4 py-2 text-left font-bold">Total Burn/mo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-4 py-2 font-medium">1K</td>
              <td className="border border-gray-400 px-4 py-2">₹2.5K</td>
              <td className="border border-gray-400 px-4 py-2">₹50K</td>
              <td className="border border-gray-400 px-4 py-2 font-bold text-green-700">~₹52K</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-4 py-2 font-medium">10K</td>
              <td className="border border-gray-400 px-4 py-2">₹12K</td>
              <td className="border border-gray-400 px-4 py-2">₹2L</td>
              <td className="border border-gray-400 px-4 py-2 font-bold text-blue-700">~₹2.1L</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-4 py-2 font-medium">100K</td>
              <td className="border border-gray-400 px-4 py-2">₹1.2L</td>
              <td className="border border-gray-400 px-4 py-2">₹5L</td>
              <td className="border border-gray-400 px-4 py-2 font-bold text-orange-600">~₹6.2L</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-400 px-4 py-2 font-medium">1M</td>
              <td className="border border-gray-400 px-4 py-2">₹8L</td>
              <td className="border border-gray-400 px-4 py-2">₹15L</td>
              <td className="border border-gray-400 px-4 py-2 font-bold text-red-600">~₹23L</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 8. Strategic Insight */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-gray-300 pb-1 mb-4">8. Strategic Insight</h2>
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 text-sm leading-relaxed space-y-3">
          <p><strong>Current architecture handles up to ~5K concurrent users with zero infrastructure changes.</strong></p>
          <p>The first engineering intervention (connection pooling) is a <strong>zero-cost configuration change</strong>. This gives the platform a long runway to validate product-market fit before significant infra spend is needed.</p>
          <p>At 10K users, the monthly burn (infra + marketing) of <strong>₹2.1L</strong> is extremely efficient for a B2B fintech platform — roughly the cost of a single mid-level developer.</p>
          <p className="font-semibold text-green-700">Bottom line: Marketing will be the dominant cost driver (70–85% of total burn), not infrastructure. The saved development capital (₹55L+) provides 6–12 months of marketing runway even at scale.</p>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t-2 border-gray-800 pt-4 mt-10 text-center text-xs text-gray-500">
        <p>Findoo – Confidential Scaling & Infrastructure Report | February 2026</p>
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

export default ScalingReport;
