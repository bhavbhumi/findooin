import { AdminComingSoon } from "@/components/admin/AdminComingSoon";

export default function AdminRegistryPage() {
  return (
    <AdminComingSoon
      title="Registry & Verification"
      description="Scraped regulatory data from AMFI, SEBI and other sources for prospecting and live verification."
      features={[
        "AMFI distributor database (ARN lookup)",
        "SEBI registered entities (RIA, Broker, PMS, AIF)",
        "Auto-sync and schedule scraping jobs",
        "Match registry records to platform users",
        "Live verification tool for admin lookups",
        "Export filtered registry data",
      ]}
    />
  );
}
