import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimal } from '../api/animals';
import { getDistribution } from '../api/map';
import MapView from '../components/MapView';
import FavoriteButton from '../components/FavoriteButton';
import { statusColor, placeholderImage, proxyImage } from '../utils/helpers';
import type { AnimalDetail, HotspotOut } from '../types';

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-forest-700/30 last:border-0">
      <span className="text-sm text-forest-400 font-medium">{label}</span>
      <span className="text-sm text-forest-200 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function TaxonomyRow({ rank, value }: { rank: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-forest-500 uppercase tracking-wider w-20 flex-shrink-0">{rank}</span>
      <span className="text-sm text-forest-200 font-medium">{value}</span>
    </div>
  );
}

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

  if (loading) return (
    <div className="bg-forest-950 min-h-screen"><div className="max-w-7xl mx-auto px-4 py-16">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-forest-800 rounded w-48" />
        <div className="h-96 bg-forest-800 rounded-xl" />
        <div className="h-6 bg-forest-800 rounded w-full" />
        <div className="h-6 bg-forest-800 rounded w-3/4" />
      </div>
    </div></div>
  );

  if (!animal) return (
    <div className="bg-forest-950 min-h-screen"><div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-forest-300">Animal not found</h2>
      <Link to="/browse" className="text-emerald-400 hover:underline mt-4 inline-block">Browse animals</Link>
    </div></div>
  );

  const heroFallback = proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name);
  const images = animal.images.length > 0
    ? animal.images.map(img => ({ ...img, url: proxyImage(img.url) }))
    : [{ id: 0, url: heroFallback, is_hero: true }];

  const funFactsList = animal.fun_facts ? animal.fun_facts.split(/[.!?]+/).filter(f => f.trim().length > 5).map(f => f.trim()) : [];
  const dbFacts = animal.facts.map(f => f.content);
  const allFacts = [...dbFacts, ...funFactsList.filter(f => !dbFacts.some(d => d.includes(f.slice(0, 20))))];

  return (
    <div className="bg-forest-950 min-h-screen"><div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-forest-400 flex items-center gap-1">
        <Link to="/" className="hover:text-emerald-400">Home</Link>
        <span>/</span>
        <Link to="/browse" className="hover:text-emerald-400">Animals</Link>
        <span>/</span>
        <span className="text-forest-200 font-medium">{animal.common_name}</span>
      </div>

      {/* Hero Section */}
      <div className="bg-forest-800/40 border border-forest-700/40 rounded-2xl overflow-hidden mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative aspect-[4/3] lg:aspect-auto bg-forest-800 flex items-center justify-center">
            <img
              src={images[imgIdx].url}
              alt={animal.common_name}
              className="w-full h-full object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (img.src !== heroFallback && heroFallback !== img.src) {
                  img.src = heroFallback;
                } else {
                  img.src = placeholderImage(animal.common_name);
                }
              }}
            />
            <div className="absolute top-4 right-4"><FavoriteButton animalId={animal.id} /></div>
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`w-3 h-3 rounded-full transition ${i === imgIdx ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/75'}`} />
                ))}
              </div>
            )}
          </div>

          {/* Species Profile */}
          <div className="p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="font-display text-4xl font-bold text-white mb-1">{animal.common_name}</h1>
                <p className="text-xl text-forest-400 italic">{animal.scientific_name}</p>
                {animal.alternate_names && <p className="text-sm text-forest-500 mt-2">Also known as: {animal.alternate_names}</p>}
              </div>
            </div>

            {animal.conservation_status && (
              <div className="mb-6">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${statusColor(animal.conservation_status.code)}`}>
                  <span className="w-3 h-3 rounded-full bg-current opacity-50" />
                  {animal.conservation_status.name}
                </span>
              </div>
            )}

            {animal.description && (
              <p className="text-forest-300 leading-relaxed mb-6">{animal.description}</p>
            )}

            {/* At a Glance */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🍽️', label: 'Diet', value: animal.diet_detail || animal.diet },
                { icon: '⏱️', label: 'Lifespan', value: animal.lifespan },
                { icon: '⚖️', label: 'Weight', value: animal.average_weight },
                { icon: '📏', label: 'Length', value: animal.average_length },
                { icon: '🌙', label: 'Activity', value: animal.activity_period },
                { icon: '👥', label: 'Social', value: animal.social_structure },
              ].filter(f => f.value).map(f => (
                <div key={f.label} className="bg-forest-700/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{f.icon}</span>
                    <span className="text-xs text-forest-400">{f.label}</span>
                  </div>
                  <div className="text-sm font-semibold text-forest-200 mt-0.5">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          {animal.wiki_summary && (
            <section className="info-card">
              <h2 className="section-heading">Overview</h2>
              <p className="text-forest-300 leading-relaxed">{animal.wiki_summary}</p>
            </section>
          )}

          {/* Habitat & Ecology */}
          {(animal.habitat_summary || animal.biome || animal.ecological_role) && (
            <section className="info-card">
              <h2 className="section-heading">Habitat & Ecology</h2>
              {animal.habitat_summary && (
                <div className="mb-4">
                  <h3 className="font-semibold text-forest-200 mb-2">Habitat</h3>
                  <p className="text-forest-300 leading-relaxed">{animal.habitat_summary}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {animal.biome && (
                  <div className="bg-emerald-500/10 rounded-lg p-3">
                    <span className="text-xs text-emerald-400 uppercase font-medium">Biome</span>
                    <p className="text-sm font-semibold text-emerald-300 mt-1">{animal.biome}</p>
                  </div>
                )}
                {animal.environment_type && (
                  <div className="bg-ocean-500/10 rounded-lg p-3">
                    <span className="text-xs text-ocean-400 uppercase font-medium">Environment</span>
                    <p className="text-sm font-semibold text-ocean-300 mt-1 capitalize">{animal.environment_type}</p>
                  </div>
                )}
              </div>
              {animal.ecological_role && (
                <div className="mt-4">
                  <h3 className="font-semibold text-forest-200 mb-2">Ecological Role</h3>
                  <p className="text-forest-300 leading-relaxed">{animal.ecological_role}</p>
                </div>
              )}
            </section>
          )}

          {/* Behavior & Ecology */}
          {(animal.behavior_summary || animal.behaviors.length > 0 || animal.communication || animal.migration_behavior) && (
            <section className="info-card">
              <h2 className="section-heading">Behavior & Ecology</h2>
              {animal.behavior_summary && (
                <p className="text-forest-300 leading-relaxed mb-4">{animal.behavior_summary}</p>
              )}
              {animal.communication && (
                <div className="mb-4">
                  <h3 className="font-semibold text-forest-200 mb-2">Communication</h3>
                  <p className="text-forest-300 leading-relaxed">{animal.communication}</p>
                </div>
              )}
              {animal.migration_behavior && (
                <div className="mb-4">
                  <h3 className="font-semibold text-forest-200 mb-2">Migration</h3>
                  <p className="text-forest-300 leading-relaxed">{animal.migration_behavior}</p>
                </div>
              )}
              {animal.behaviors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {animal.behaviors.map((b, i) => (
                    <span key={i} className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium">{b.label}</span>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Diet & Predation */}
          {(animal.diet || animal.prey || animal.predators) && (
            <section className="info-card">
              <h2 className="section-heading">Diet & Predation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(animal.diet || animal.prey) && (
                  <div>
                    <h3 className="font-semibold text-forest-200 mb-2 flex items-center gap-2">
                      <span className="text-lg">🍖</span> Diet
                    </h3>
                    {animal.diet_detail && <p className="text-forest-300 text-sm mb-2">{animal.diet_detail}</p>}
                    {animal.prey && (
                      <div>
                        <span className="text-xs text-forest-500 uppercase">Prey / Food</span>
                        <p className="text-sm text-forest-200 mt-1">{animal.prey}</p>
                      </div>
                    )}
                  </div>
                )}
                {animal.predators && (
                  <div>
                    <h3 className="font-semibold text-forest-200 mb-2 flex items-center gap-2">
                      <span className="text-lg">⚠️</span> Predators
                    </h3>
                    <p className="text-sm text-forest-200">{animal.predators}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Reproduction */}
          {animal.reproduction && (
            <section className="info-card">
              <h2 className="section-heading">Reproduction & Life Cycle</h2>
              <p className="text-forest-300 leading-relaxed">{animal.reproduction}</p>
            </section>
          )}

          {/* Fun Facts / Did You Know */}
          {allFacts.length > 0 && (
            <section className="info-card bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-700/40">
              <h2 className="font-display text-2xl font-bold text-amber-300 mb-4 pb-2 border-b border-amber-700/40">
                💡 Did You Know?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allFacts.map((fact, i) => (
                  <div key={i} className="flex gap-3 bg-amber-900/20 rounded-lg p-3">
                    <span className="text-amber-400 font-bold text-lg flex-shrink-0">#{i + 1}</span>
                    <p className="text-sm text-forest-200">{fact}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Distribution Map */}
          {mapPoints.length > 0 && (
            <section className="info-card">
              <h2 className="section-heading">Distribution Map</h2>
              <p className="text-sm text-forest-400 mb-4">Showing observed locations of {animal.common_name} across the globe</p>
              <MapView hotspots={mapPoints} className="h-96" />
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Taxonomy */}
          <div className="info-card">
            <h3 className="font-display font-bold text-lg text-white mb-4 pb-2 border-b border-forest-700/40">
              Scientific Classification
            </h3>
            <div className="space-y-0.5">
              <TaxonomyRow rank="Kingdom" value={animal.kingdom} />
              <TaxonomyRow rank="Phylum" value={animal.phylum} />
              <TaxonomyRow rank="Class" value={animal.class_name} />
              <TaxonomyRow rank="Order" value={animal.order_name} />
              <TaxonomyRow rank="Family" value={animal.family_name} />
              <TaxonomyRow rank="Genus" value={animal.genus} />
              <TaxonomyRow rank="Species" value={animal.species || animal.scientific_name} />
            </div>
          </div>

          {/* Quick Info */}
          <div className="info-card">
            <h3 className="font-display font-bold text-lg text-white mb-3 pb-2 border-b border-forest-700/40">Quick Info</h3>
            <InfoRow label="Diet" value={animal.diet} />
            <InfoRow label="Lifespan" value={animal.lifespan} />
            <InfoRow label="Weight" value={animal.average_weight} />
            <InfoRow label="Length" value={animal.average_length} />
            <InfoRow label="Activity" value={animal.activity_period} />
            <InfoRow label="Social Structure" value={animal.social_structure} />
            <InfoRow label="Environment" value={animal.environment_type} />
            <InfoRow label="Domesticated" value={animal.is_domesticated ? 'Yes' : 'No'} />
          </div>

          {/* Countries */}
          {animal.countries.length > 0 && (
            <div className="info-card">
              <h3 className="font-display font-bold text-lg text-white mb-3 pb-2 border-b border-forest-700/40">
                Found In ({animal.countries.length} countries)
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {animal.countries.map(c => (
                  <Link key={c.id} to={`/country/${c.code}`} className="bg-forest-700/50 hover:bg-emerald-500/20 hover:text-emerald-400 text-sm text-forest-300 px-2.5 py-1 rounded-md transition">{c.name}</Link>
                ))}
              </div>
            </div>
          )}

          {/* Continent */}
          {animal.continent && (
            <div className="info-card bg-gradient-to-br from-ocean-900/30 to-ocean-800/30 border-ocean-700/40">
              <h3 className="font-semibold text-ocean-300 mb-1">Continent</h3>
              <p className="text-ocean-200 font-medium">{animal.continent.name}</p>
              {animal.continent.description && (
                <p className="text-xs text-ocean-400 mt-1">{animal.continent.description}</p>
              )}
            </div>
          )}

          {/* Conservation */}
          {animal.conservation_status && (
            <div className="info-card">
              <h3 className="font-display font-bold text-lg text-white mb-3 pb-2 border-b border-forest-700/40">
                Conservation Status
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <span className={`status-badge text-sm ${statusColor(animal.conservation_status.code)}`}>
                  {animal.conservation_status.code}
                </span>
                <span className="font-semibold text-forest-200">{animal.conservation_status.name}</span>
              </div>
              {animal.conservation_status.description && (
                <p className="text-sm text-forest-400">{animal.conservation_status.description}</p>
              )}
              {/* IUCN Scale */}
              <div className="mt-4">
                <div className="flex gap-0.5">
                  {['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX'].map(code => (
                    <div
                      key={code}
                      className={`flex-1 h-2 rounded-sm ${
                        code === animal.conservation_status!.code
                          ? 'ring-2 ring-offset-1 ring-forest-400 ring-offset-forest-800'
                          : ''
                      } ${
                        code === 'LC' ? 'bg-green-400' :
                        code === 'NT' ? 'bg-lime-400' :
                        code === 'VU' ? 'bg-yellow-400' :
                        code === 'EN' ? 'bg-orange-400' :
                        code === 'CR' ? 'bg-red-500' :
                        code === 'EW' ? 'bg-purple-500' :
                        'bg-gray-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-forest-500">Least Concern</span>
                  <span className="text-[10px] text-forest-500">Extinct</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div></div>
  );
}
