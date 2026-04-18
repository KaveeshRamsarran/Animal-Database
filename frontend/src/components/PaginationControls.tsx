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
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-30 hover:bg-gray-100">← Prev</button>
      {range[0] > 1 && <span className="px-2 text-gray-400">…</span>}
      {range.map(p => (
        <button key={p} onClick={() => onChange(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${p === page ? 'bg-forest-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
      ))}
      {range[range.length - 1] < pages && <span className="px-2 text-gray-400">…</span>}
      <button onClick={() => onChange(page + 1)} disabled={page >= pages} className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-30 hover:bg-gray-100">Next →</button>
    </div>
  );
}
