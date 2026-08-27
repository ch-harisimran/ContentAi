import { requireUser } from "@/lib/auth";
import AuthedShell from "@/components/AuthedShell";
import TemplatesList from "@/components/TemplatesList";

export default async function TemplatesPage() {
  const user = await requireUser();

  return (
    <AuthedShell email={user.email}>
      <h1 className="font-serif text-3xl font-medium">Templates</h1>
      <p className="mt-1.5 text-ink-dim">Saved topic + type + tone presets for recurring content.</p>
      <div className="mt-8">
        <TemplatesList />
      </div>
    </AuthedShell>
  );
}
