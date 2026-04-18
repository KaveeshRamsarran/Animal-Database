interface Props {
  data: {
    kingdom?: string;
    phylum?: string;
    class_name?: string;
    order_name?: string;
    family_name?: string;
    genus?: string;
    species?: string;
  };
}

const ranks = [
  { key: 'kingdom', label: 'Kingdom' },
  { key: 'phylum', label: 'Phylum' },
  { key: 'class_name', label: 'Class' },
  { key: 'order_name', label: 'Order' },
  { key: 'family_name', label: 'Family' },
  { key: 'genus', label: 'Genus' },
  { key: 'species', label: 'Species' },
] as const;

export default function TaxonomyPanel({ data }: Props) {
  return (
    <div className="bg-forest-50 rounded-xl p-4">
      <h3 className="font-display font-semibold text-forest-800 mb-3">Taxonomy</h3>
      <div className="space-y-1">
        {ranks.map(r => {
          const val = data[r.key];
          if (!val) return null;
          return (
            <div key={r.key} className="flex justify-between text-sm">
              <span className="text-forest-600 font-medium">{r.label}</span>
              <span className="text-gray-700 italic">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
