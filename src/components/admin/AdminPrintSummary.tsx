/**
 * AdminPrintSummary — A print-optimized dashboard summary that opens in a new
 * window and triggers the browser's Print / Save-as-PDF dialog.
 */
import { useVerificationQueue, useAdminReports, useAdminUsers } from "@/hooks/useAdmin";
import { useMemo } from "react";

interface MetricRow {
  label: string;
  value: string | number;
}

function PrintTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  if (rows.length === 0) return null;
  return (
    <div style={{ marginBottom: 28, breakInside: "avoid" }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#111" }}>{title}</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: "2px solid #222", fontWeight: 600, color: "#333" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fafafa" : "#fff" }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "5px 8px", borderBottom: "1px solid #eee", color: "#444" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function generatePrintSummary(
  users: any[],
  requests: any[],
  reports: any[],
) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const totalUsers = users.length;
  const verifiedUsers = users.filter((u) => u.verification_status === "verified").length;
  const pendingVerifications = requests.filter((r) => r.status === "pending").length;
  const approvedVerifications = requests.filter((r) => r.status === "approved").length;
  const rejectedVerifications = requests.filter((r) => r.status === "rejected").length;
  const pendingReports = reports.filter((r) => r.status === "pending").length;
  const resolvedReports = reports.filter((r) => r.status !== "pending").length;

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const newUsersThisWeek = users.filter((u) => u.created_at > weekAgo).length;

  // User type breakdown
  const individualUsers = users.filter((u) => u.user_type === "individual").length;
  const entityUsers = users.filter((u) => u.user_type === "entity").length;

  const metricsHtml = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;">
      ${[
        { label: "Total Users", value: totalUsers },
        { label: "Verified", value: verifiedUsers },
        { label: "New This Week", value: newUsersThisWeek },
        { label: "Pending Reports", value: pendingReports },
      ]
        .map(
          (m) => `
        <div style="border:1px solid #ddd;border-radius:8px;padding:14px 16px;">
          <div style="font-size:11px;color:#666;margin-bottom:4px;">${m.label}</div>
          <div style="font-size:28px;font-weight:700;color:#111;">${m.value}</div>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  const verificationTableRows = requests
    .slice(0, 20)
    .map(
      (r: any) =>
        `<tr style="background:${requests.indexOf(r) % 2 === 0 ? "#fafafa" : "#fff"}">
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${r.profile?.full_name || "Unknown"}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${r.document_name}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${r.status}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${new Date(r.created_at).toLocaleDateString()}</td>
        </tr>`
    )
    .join("");

  const reportsTableRows = reports
    .slice(0, 20)
    .map(
      (r: any, i: number) =>
        `<tr style="background:${i % 2 === 0 ? "#fafafa" : "#fff"}">
          <td style="padding:5px 8px;border-bottom:1px solid #eee;text-transform:capitalize;">${r.reason}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${r.reporter?.full_name || "Anonymous"}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${r.status}</td>
          <td style="padding:5px 8px;border-bottom:1px solid #eee;">${new Date(r.created_at).toLocaleDateString()}</td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>FindOO Admin Report — ${dateStr}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      @page { margin: 18mm 14mm; size: A4; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #222; padding: 32px; max-width: 900px; margin: 0 auto; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { text-align: left; padding: 6px 8px; border-bottom: 2px solid #222; font-weight: 600; color: #333; }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
    <div>
      <h1 style="font-size:22px;font-weight:800;color:#111;">FindOO — Admin Dashboard Report</h1>
      <p style="font-size:12px;color:#666;margin-top:4px;">${dateStr} at ${timeStr}</p>
    </div>
    <button class="no-print" onclick="window.print()" style="padding:8px 20px;background:#111;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">
      Print / Save PDF
    </button>
  </div>

  <hr style="border:none;border-top:1px solid #ddd;margin-bottom:24px;" />

  <h2 style="font-size:15px;font-weight:700;margin-bottom:12px;">Key Metrics</h2>
  ${metricsHtml}

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;">
    <div style="border:1px solid #ddd;border-radius:8px;padding:16px;">
      <h3 style="font-size:13px;font-weight:700;margin-bottom:10px;">User Breakdown</h3>
      <div style="font-size:12px;color:#444;line-height:2;">
        <div>Individual: <strong>${individualUsers}</strong></div>
        <div>Entity: <strong>${entityUsers}</strong></div>
        <div>Verification Rate: <strong>${totalUsers ? Math.round((verifiedUsers / totalUsers) * 100) : 0}%</strong></div>
      </div>
    </div>
    <div style="border:1px solid #ddd;border-radius:8px;padding:16px;">
      <h3 style="font-size:13px;font-weight:700;margin-bottom:10px;">Moderation Summary</h3>
      <div style="font-size:12px;color:#444;line-height:2;">
        <div>Verifications — Approved: <strong>${approvedVerifications}</strong>, Rejected: <strong>${rejectedVerifications}</strong>, Pending: <strong>${pendingVerifications}</strong></div>
        <div>Reports — Pending: <strong>${pendingReports}</strong>, Resolved: <strong>${resolvedReports}</strong></div>
      </div>
    </div>
  </div>

  ${
    requests.length > 0
      ? `<div style="margin-bottom:28px;break-inside:avoid;">
          <h3 style="font-size:14px;font-weight:700;margin-bottom:8px;">Recent Verification Requests (${Math.min(requests.length, 20)} of ${requests.length})</h3>
          <table>
            <thead><tr><th>User</th><th>Document</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>${verificationTableRows}</tbody>
          </table>
        </div>`
      : ""
  }

  ${
    reports.length > 0
      ? `<div style="margin-bottom:28px;break-inside:avoid;">
          <h3 style="font-size:14px;font-weight:700;margin-bottom:8px;">Recent Reports (${Math.min(reports.length, 20)} of ${reports.length})</h3>
          <table>
            <thead><tr><th>Reason</th><th>Reporter</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>${reportsTableRows}</tbody>
          </table>
        </div>`
      : ""
  }

  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #ddd;font-size:10px;color:#999;text-align:center;">
    Generated by FindOO Admin Panel — Confidential
  </div>
</body>
</html>`;

  return html;
}
