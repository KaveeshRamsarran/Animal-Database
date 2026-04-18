import api from './client';
import type { ContinentOut, CountryOut, AnimalCard, PaginatedResponse } from '../types';

export const getContinents = () =>
  api.get<ContinentOut[]>('/continents').then(r => r.data);

export const getCountries = (continent?: string) =>
  api.get<CountryOut[]>('/countries', { params: continent ? { continent } : {} }).then(r => r.data);

export const getCountry = (code: string) =>
  api.get<CountryOut>(`/countries/${code}`).then(r => r.data);

export const getCountryAnimals = (code: string, page = 1, size = 20) =>
  api.get<PaginatedResponse<AnimalCard>>(`/countries/${code}/animals`, { params: { page, size } }).then(r => r.data);
