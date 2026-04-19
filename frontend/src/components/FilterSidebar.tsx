interface Props {
  filters: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const CLASS_OPTIONS = ['Mammalia', 'Aves', 'Reptilia', 'Amphibia', 'Actinopterygii', 'Chondrichthyes'];
const DIET_OPTIONS = ['Carnivore', 'Herbivore', 'Omnivore', 'Insectivore', 'Piscivore'];
const ENV_OPTIONS = ['Terrestrial', 'Aquatic', 'Semi-Aquatic', 'Aerial'];
const STATUS_OPTIONS = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX', 'DD'];
const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'newest', label: 'Newest' },
  { value: 'observations', label: 'Most Observed' },
];

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[] | { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-forest-400 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-forest-900/50 border border-forest-700/40 text-forest-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
        <option value="">All</option>
        {options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function FilterSidebar({ filters, onChange }: Props) {
  return (
    <aside className="space-y-4 bg-forest-800/40 border border-forest-700/40 p-4 rounded-xl">
      <h3 className="font-semibold text-white">Filters</h3>
      <FilterSelect label="Class" value={filters.class_name || ''} options={CLASS_OPTIONS} onChange={v => onChange('class_name', v)} />
      <FilterSelect label="Diet" value={filters.diet || ''} options={DIET_OPTIONS} onChange={v => onChange('diet', v)} />
      <FilterSelect label="Environment" value={filters.environment_type || ''} options={ENV_OPTIONS} onChange={v => onChange('environment_type', v)} />
      <FilterSelect label="Conservation Status" value={filters.conservation_status || ''} options={STATUS_OPTIONS} onChange={v => onChange('conservation_status', v)} />
      <FilterSelect label="Sort By" value={filters.sort || ''} options={SORT_OPTIONS} onChange={v => onChange('sort', v)} />
      <button onClick={() => { for (const k of Object.keys(filters)) onChange(k, ''); }} className="text-sm text-red-500 hover:underline">Clear All</button>
    </aside>
  );
}
