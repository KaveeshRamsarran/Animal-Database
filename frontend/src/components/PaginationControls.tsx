interface Props {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

export default function PaginationControls({ page, pages, onChange }: Props) {
  if (pages <= 1) return null;
  const range: number[] = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) range.push(i);

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-30 text-forest-300 hover:bg-forest-700/50">← Prev</button>
      {range[0] > 1 && <span className="px-2 text-forest-500">…</span>}
      {range.map(p => (
        <button key={p} onClick={() => onChange(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${p === page ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'hover:bg-forest-700/50 text-forest-300'}`}>{p}</button>
      ))}
      {range[range.length - 1] < pages && <span className="px-2 text-forest-500">…</span>}
      <button onClick={() => onChange(page + 1)} disabled={page >= pages} className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-30 text-forest-300 hover:bg-forest-700/50">Next →</button>
    </div>
  );
}
