export default function ShowcaseCard({
  title,
  category,
  code,
}: {
  title: string;
  category: string;
  description: string;
  code: string;
}) {
  return (
    <div className="group flex h-[420px] w-[380px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-card-border bg-card transition-colors hover:border-white/15">
      {/* Code preview */}
      <div className="flex-1 overflow-hidden p-5">
        <pre className="h-full overflow-hidden font-mono text-xs leading-relaxed text-white/60">
          <code>{code}</code>
        </pre>
      </div>

      {/* Footer */}
      <div className="border-t border-card-border p-5">
        <p className="text-xs font-medium tracking-wide text-text-muted">
          {category}
        </p>
        <p className="mt-1 text-base font-semibold">{title}</p>
      </div>
    </div>
  );
}
