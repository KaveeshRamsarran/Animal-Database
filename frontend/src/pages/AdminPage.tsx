import { useEffect, useState } from 'react';
import { triggerSync, getSyncJobs, getStats } from '../api/admin';
import type { SyncJobOut, StatsOut } from '../types';

export default function AdminPage() {
  const [stats, setStats] = useState<StatsOut | null>(null);
  const [jobs, setJobs] = useState<SyncJobOut[]>([]);
  const [syncing, setSyncing] = useState('');

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
    getSyncJobs().then(setJobs).catch(() => {});
  }, []);

  const handleSync = async (type: string) => {
    setSyncing(type);
    try {
      await triggerSync(type);
      const updated = await getSyncJobs();
      setJobs(updated);
    } catch { /* ignore */ }
    setSyncing('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Animals', value: stats.total_animals },
            { label: 'Countries', value: stats.total_countries },
            { label: 'Observations', value: stats.total_occurrences },
            { label: 'Images', value: stats.total_images },
            { label: 'Users', value: stats.total_users },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border p-4 text-center">
              <div className="text-2xl font-bold text-forest-700">{s.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-display text-xl font-semibold text-gray-700 mb-4">Data Sync</h2>
      <div className="flex flex-wrap gap-3 mb-8">
        {['animals', 'occurrences', 'images'].map(type => (
          <button key={type} onClick={() => handleSync(type)} disabled={syncing === type} className="bg-forest-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-forest-700 disabled:opacity-50 capitalize">
            {syncing === type ? `Syncing ${type}...` : `Sync ${type}`}
          </button>
        ))}
      </div>

      <h2 className="font-display text-xl font-semibold text-gray-700 mb-4">Recent Sync Jobs</h2>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 font-medium text-gray-500">Type</th>
              <th className="text-left p-3 font-medium text-gray-500">Status</th>
              <th className="text-left p-3 font-medium text-gray-500">Items</th>
              <th className="text-left p-3 font-medium text-gray-500">Started</th>
              <th className="text-left p-3 font-medium text-gray-500">Message</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id} className="border-t">
                <td className="p-3 capitalize">{j.job_type}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${j.status === 'completed' ? 'bg-green-100 text-green-700' : j.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{j.status}</span></td>
                <td className="p-3">{j.items_processed}</td>
                <td className="p-3 text-gray-500">{j.started_at ? new Date(j.started_at).toLocaleString() : '—'}</td>
                <td className="p-3 text-gray-500 truncate max-w-xs">{j.result_message || '—'}</td>
              </tr>
            ))}
            {jobs.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-400">No sync jobs yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
