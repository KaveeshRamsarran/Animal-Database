import type { AnimalCompare } from '../types';
import { statusColor, placeholderImage } from '../utils/helpers';

interface Props {
  animals: AnimalCompare[];
}

const fields: { key: keyof AnimalCompare; label: string }[] = [
  { key: 'class_name', label: 'Class' },
  { key: 'order_name', label: 'Order' },
  { key: 'family_name', label: 'Family' },
  { key: 'diet', label: 'Diet' },
  { key: 'lifespan', label: 'Lifespan' },
  { key: 'average_weight', label: 'Weight' },
  { key: 'average_length', label: 'Length' },
  { key: 'habitat_summary', label: 'Habitat' },
  { key: 'behavior_summary', label: 'Behavior' },
  { key: 'environment_type', label: 'Environment' },
];

export default function CompareTable({ animals }: Props) {
  if (animals.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-xl shadow-sm">
        <thead>
          <tr>
            <th className="p-4 bg-gray-50 text-left text-sm font-medium text-gray-500 w-36">Attribute</th>
            {animals.map(a => (
              <th key={a.id} className="p-4 bg-gray-50 text-center">
                <img src={a.hero_image_url || placeholderImage(a.common_name)} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-2" />
                <div className="font-display font-semibold">{a.common_name}</div>
                <div className="text-xs text-gray-500 italic">{a.scientific_name}</div>
                {a.conservation_status && <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(a.conservation_status.code)}`}>{a.conservation_status.code}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map(f => (
            <tr key={f.key} className="border-t">
              <td className="p-3 text-sm font-medium text-gray-600">{f.label}</td>
              {animals.map(a => (
                <td key={a.id} className="p-3 text-sm text-gray-700 text-center">{(a[f.key] as string) || '—'}</td>
              ))}
            </tr>
          ))}
          <tr className="border-t">
            <td className="p-3 text-sm font-medium text-gray-600">Countries</td>
            {animals.map(a => (
              <td key={a.id} className="p-3 text-sm text-gray-700 text-center">{a.countries.map(c => c.name).join(', ') || '—'}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
