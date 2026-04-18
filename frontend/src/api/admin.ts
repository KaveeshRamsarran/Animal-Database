import api from './client';
import type { SyncJobOut, StatsOut } from '../types';

export const triggerSync = (jobType: string) =>
  api.post<SyncJobOut>('/admin/sync', { job_type: jobType }).then(r => r.data);

export const getSyncJobs = () =>
  api.get<SyncJobOut[]>('/admin/sync-jobs').then(r => r.data);

export const getStats = () =>
  api.get<StatsOut>('/stats').then(r => r.data);
