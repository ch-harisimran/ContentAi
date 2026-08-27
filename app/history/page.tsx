import { requireUser } from "@/lib/auth";
import AuthedShell from "@/components/AuthedShell";
import HistoryTable from "@/components/HistoryTable";

export default async function HistoryPage() {
  const user = await requireUser();

  return (
    <AuthedShell email={user.email}>
      <h1 className="font-serif text-3xl font-medium">History</h1>
      <p className="mt-1.5 text-ink-dim">Your past generations, grouped by request.</p>
      <div className="mt-8">
        <HistoryTable />
      </div>
    </AuthedShell>
  );
}
