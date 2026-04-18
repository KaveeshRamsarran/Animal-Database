import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCountry, getCountryAnimals } from '../api/regions';
import AnimalGrid from '../components/AnimalGrid';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PaginationControls from '../components/PaginationControls';
import type { CountryOut, AnimalCard, PaginatedResponse } from '../types';

export default function CountryPage() {
  const { code } = useParams<{ code: string }>();
  const [country, setCountry] = useState<CountryOut | null>(null);
  const [data, setData] = useState<PaginatedResponse<AnimalCard> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    getCountry(code).then(setCountry).catch(() => {});
  }, [code]);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    getCountryAnimals(code, page).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [code, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-4 text-sm text-gray-500">
        <Link to="/explore" className="hover:text-forest-600">Explore</Link> <span className="mx-1">/</span> <span className="text-gray-800">{country?.name || code}</span>
      </div>

      {country && (
        <div className="bg-white rounded-xl border p-6 mb-8 flex items-start gap-6">
          {country.flag_url && <img src={country.flag_url} alt="" className="w-16 h-12 object-cover rounded shadow" />}
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">{country.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              {country.capital && <span>Capital: {country.capital}</span>}
              {country.population && <span>Pop: {country.population.toLocaleString()}</span>}
              {country.region && <span>{country.region}</span>}
              {country.continent_name && <span>{country.continent_name}</span>}
            </div>
            {country.wildlife_overview && <p className="mt-3 text-gray-600 text-sm">{country.wildlife_overview}</p>}
          </div>
        </div>
      )}

      <h2 className="font-display text-xl font-semibold text-gray-700 mb-4">Wildlife in {country?.name || 'this country'}</h2>
      {loading ? <LoadingSkeleton /> : data && (
        <>
          <AnimalGrid animals={data.items} />
          <PaginationControls page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
