import api from './client';
import type { FavoriteOut } from '../types';

export const getFavorites = () =>
  api.get<FavoriteOut[]>('/favorites').then(r => r.data);

export const addFavorite = (animalId: number) =>
  api.post('/favorites', { animal_id: animalId });

export const removeFavorite = (animalId: number) =>
  api.delete(`/favorites/${animalId}`);
