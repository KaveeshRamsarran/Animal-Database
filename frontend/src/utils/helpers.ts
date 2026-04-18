export function statusColor(code?: string): string {
  const map: Record<string, string> = {
    LC: 'bg-green-100 text-green-800',
    NT: 'bg-lime-100 text-lime-800',
    VU: 'bg-yellow-100 text-yellow-800',
    EN: 'bg-orange-100 text-orange-800',
    CR: 'bg-red-100 text-red-800',
    EW: 'bg-purple-100 text-purple-800',
    EX: 'bg-gray-100 text-gray-800',
    DD: 'bg-blue-100 text-blue-800',
    NE: 'bg-gray-50 text-gray-600',
  };
  return code ? (map[code] || 'bg-gray-100 text-gray-600') : 'bg-gray-100 text-gray-600';
}

export function placeholderImage(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=2d8a2d&color=fff&bold=true`;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export function proxyImage(url: string | undefined | null): string {
  if (!url) return '';
  if (url.includes('upload.wikimedia.org') || url.includes('commons.wikimedia.org')) {
    return `${API_BASE}/images/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}
