import OutputPanel from "./OutputPanel";

export default function VariationsPanel({ variations }: { variations: string[] }) {
  if (variations.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint">
        {variations.length} VARIATIONS — PICK YOUR FAVORITE
      </h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {variations.map((text, i) => (
          <OutputPanel key={i} index={i} text={text} />
        ))}
      </div>
    </div>
  );
}
