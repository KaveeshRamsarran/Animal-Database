import api from './client';
import type { HotspotOut, DistributionPoint } from '../types';

export const getHotspots = (params?: Record<string, string | number | undefined>) =>
  api.get<HotspotOut[]>('/map/hotspots', { params }).then(r => r.data);

export const getDistribution = (animalId: number) =>
  api.get<DistributionPoint[]>(`/map/distribution/${animalId}`).then(r => r.data);
