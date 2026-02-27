import { useVerificationQueue, useAdminReports, useAdminUsers } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck, Flag, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

export function AdminOverview() {
  const { data: requests } = useVerificationQueue();
  const { data: reports } = useAdminReports();
  const { data: users } = useAdminUsers();

  const pendingVerifications = requests?.filter(r => r.status === "pending").length || 0;
  const pendingReports = reports?.filter(r => r.status === "pending").length || 0;
  const totalUsers = users?.length || 0;
  const verifiedUsers = users?.filter((u: any) => u.verification_status === "verified").length || 0;

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-primary" },
    { label: "Verified Users", value: verifiedUsers, icon: CheckCircle2, color: "text-accent" },
    { label: "Pending Verifications", value: pendingVerifications, icon: Clock, color: "text-warning" },
    { label: "Pending Reports", value: pendingReports, icon: Flag, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
