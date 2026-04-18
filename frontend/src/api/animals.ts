import api from './client';
import type { AnimalCard, AnimalDetail, AnimalCompare, PaginatedResponse } from '../types';

export interface AnimalFilters {
  page?: number;
  size?: number;
  search?: string;
  class_name?: string;
  continent?: string;
  country?: string;
  diet?: string;
  conservation_status?: string;
  environment_type?: string;
  biome?: string;
  activity_pattern?: string;
  is_domesticated?: boolean;
  habitat?: string;
  sort?: string;
}

export const getAnimals = (params: AnimalFilters) =>
  api.get<PaginatedResponse<AnimalCard>>('/animals', { params }).then(r => r.data);

export const getAnimal = (slug: string) =>
  api.get<AnimalDetail>(`/animals/${slug}`).then(r => r.data);

export const searchAnimals = (q: string, limit = 10) =>
  api.get<AnimalCard[]>('/animals/search', { params: { q, limit } }).then(r => r.data);

export const getFeaturedAnimals = (limit = 8) =>
  api.get<AnimalCard[]>('/animals/featured', { params: { limit } }).then(r => r.data);

export const compareAnimals = (ids: number[]) =>
  api.get<AnimalCompare[]>('/animals/compare', { params: { ids: ids.join(',') } }).then(r => r.data);
