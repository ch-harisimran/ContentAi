import GeneratorForm from "@/components/GeneratorForm";
import PrefetchAppData from "@/components/PrefetchAppData";

export default function DashboardPage() {
  return (
    <div>
      <PrefetchAppData />
      <div className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint">
        8 FORMATS · 5 TONES · 3 VARIATIONS PER GENERATION
      </div>
      <h1 className="font-serif text-3xl font-medium">Generate content</h1>
      <p className="mt-1.5 text-ink-dim">
        Pick a content type and tone, describe your topic, and get three AI variations to choose from.
      </p>
      <div className="mt-8">
        <GeneratorForm />
      </div>
    </div>
  );
}
