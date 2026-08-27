import { requireUser } from "@/lib/auth";
import AuthedShell from "@/components/AuthedShell";
import UsageBar from "@/components/UsageBar";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <AuthedShell email={user.email}>
      <h1 className="font-serif text-3xl font-medium">Settings</h1>
      <p className="mt-1.5 text-ink-dim">Your usage and account.</p>
      <div className="mt-8 flex flex-col gap-6">
        <UsageBar />
        <ChangePasswordForm />
      </div>
    </AuthedShell>
  );
}
