import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimal } from '../api/animals';
import { getDistribution } from '../api/map';
import TaxonomyPanel from '../components/TaxonomyPanel';
import MapView from '../components/MapView';
import FavoriteButton from '../components/FavoriteButton';
import { statusColor, placeholderImage } from '../utils/helpers';
import type { AnimalDetail, HotspotOut } from '../types';

export default function AnimalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [animal, setAnimal] = useState<AnimalDetail | null>(null);
  const [mapPoints, setMapPoints] = useState<HotspotOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getAnimal(slug).then(a => {
      setAnimal(a);
      getDistribution(a.id).then(pts =>
        setMapPoints(pts.map((p, i) => ({ id: i, animal_id: a.id, animal_name: a.common_name, animal_slug: a.slug, latitude: p.latitude, longitude: p.longitude, observation_count: p.observation_count })))
      ).catch(() => {});
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>;
  if (!animal) return <div className="max-w-7xl mx-auto px-4 py-16 text-center"><h2 className="text-2xl font-bold text-gray-600">Animal not found</h2><Link to="/browse" className="text-forest-600 hover:underline mt-4 inline-block">Browse animals</Link></div>;

  const images = animal.images.length > 0 ? animal.images : [{ id: 0, url: placeholderImage(animal.common_name), is_hero: true }];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-4 text-sm text-gray-500">
        <Link to="/browse" className="hover:text-forest-600">Animals</Link> <span className="mx-1">/</span> <span className="text-gray-800">{animal.common_name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Images + main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[16/9]">
            <img src={images[imgIdx].url} alt={animal.common_name} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4"><FavoriteButton animalId={animal.id} /></div>
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`w-3 h-3 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold text-gray-800">{animal.common_name}</h1>
                <p className="text-lg text-gray-500 italic">{animal.scientific_name}</p>
                {animal.alternate_names && <p className="text-sm text-gray-400 mt-1">Also known as: {animal.alternate_names}</p>}
              </div>
              {animal.conservation_status && (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor(animal.conservation_status.code)}`}>
                  {animal.conservation_status.name}
                </span>
              )}
            </div>
          </div>

          {animal.description && (
            <div className="prose max-w-none">
              <h2 className="font-display text-xl font-semibold text-gray-800">About</h2>
              <p className="text-gray-600 leading-relaxed">{animal.description}</p>
            </div>
          )}

          {animal.wiki_summary && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📖 Wikipedia</h3>
              <p className="text-sm text-blue-900 leading-relaxed">{animal.wiki_summary}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Diet', value: animal.diet_detail || animal.diet },
              { label: 'Lifespan', value: animal.lifespan },
              { label: 'Weight', value: animal.average_weight },
              { label: 'Length', value: animal.average_length },
              { label: 'Activity', value: animal.activity_period },
              { label: 'Social Structure', value: animal.social_structure },
            ].filter(f => f.value).map(f => (
              <div key={f.label} className="bg-white rounded-lg border p-3">
                <div className="text-xs text-gray-500 font-medium">{f.label}</div>
                <div className="text-sm font-semibold text-gray-800 mt-1">{f.value}</div>
              </div>
            ))}
          </div>

          {animal.behaviors.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">Behaviors</h2>
              <div className="flex flex-wrap gap-2">
                {animal.behaviors.map((b, i) => (
                  <span key={i} className="bg-forest-50 text-forest-700 px-3 py-1 rounded-full text-sm">{b.label}</span>
                ))}
              </div>
            </div>
          )}

          {animal.facts.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">Fun Facts</h2>
              <ul className="space-y-2">
                {animal.facts.map(f => (
                  <li key={f.id} className="flex gap-2 text-sm"><span>💡</span><span className="text-gray-700">{f.content}</span></li>
                ))}
              </ul>
            </div>
          )}

          {mapPoints.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-gray-800 mb-3">Distribution Map</h2>
              <MapView hotspots={mapPoints} className="h-96" />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TaxonomyPanel data={animal} />

          {animal.countries.length > 0 && (
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Found In</h3>
              <div className="flex flex-wrap gap-2">
                {animal.countries.map(c => (
                  <Link key={c.id} to={`/country/${c.code}`} className="bg-gray-100 hover:bg-gray-200 text-sm px-2 py-1 rounded">{c.name}</Link>
                ))}
              </div>
            </div>
          )}

          {animal.continent && (
            <div className="bg-sand-50 rounded-xl p-4">
              <h3 className="font-semibold text-sand-800 mb-1">Continent</h3>
              <p className="text-sand-700">{animal.continent.name}</p>
            </div>
          )}

          <div className="bg-white rounded-xl border p-4 space-y-2 text-sm">
            {animal.habitat_summary && <div><span className="font-medium text-gray-600">Habitat:</span> <span className="text-gray-700">{animal.habitat_summary}</span></div>}
            {animal.biome && <div><span className="font-medium text-gray-600">Biome:</span> <span className="text-gray-700">{animal.biome}</span></div>}
            {animal.ecological_role && <div><span className="font-medium text-gray-600">Ecological Role:</span> <span className="text-gray-700">{animal.ecological_role}</span></div>}
            {animal.predators && <div><span className="font-medium text-gray-600">Predators:</span> <span className="text-gray-700">{animal.predators}</span></div>}
            {animal.prey && <div><span className="font-medium text-gray-600">Prey:</span> <span className="text-gray-700">{animal.prey}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
