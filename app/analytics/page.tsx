import { requireUser } from "@/lib/auth";
import AuthedShell from "@/components/AuthedShell";
import AnalyticsCharts from "@/components/AnalyticsCharts";

export default async function AnalyticsPage() {
  const user = await requireUser();

  return (
    <AuthedShell email={user.email}>
      <h1 className="font-serif text-3xl font-medium">Analytics</h1>
      <p className="mt-1.5 text-ink-dim">Your generation activity over the last 30 days.</p>
      <div className="mt-8">
        <AnalyticsCharts />
      </div>
    </AuthedShell>
  );
}
