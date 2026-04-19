import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import SearchBar from './SearchBar';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [animalsDrop, setAnimalsDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const isBrowse = location.pathname === '/browse';

  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setAnimalsDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Main nav bar - dark theme */}
      <nav className="bg-forest-900 text-white">
        <div className="w-full px-6 lg:px-12 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/favicon.svg" alt="WildAtlas" className="w-7 h-7" />
              <span className="font-display font-bold text-lg">WildAtlas</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {/* Animals mega-dropdown */}
              <div ref={dropRef} className="relative">
                <button
                  onClick={() => setAnimalsDrop(!animalsDrop)}
                  className="px-3 py-1.5 rounded text-sm font-medium hover:bg-white/10 transition flex items-center gap-1"
                >
                  Animals
                  <svg className={`w-3.5 h-3.5 transition-transform ${animalsDrop ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {animalsDrop && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-forest-800 border border-forest-700 rounded-xl shadow-xl py-2 z-50">
                    <Link to="/browse" onClick={() => setAnimalsDrop(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-forest-200 hover:text-white hover:bg-forest-700/50 transition">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                      Browse A-Z
                    </Link>
                    <Link to="/location" onClick={() => setAnimalsDrop(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-forest-200 hover:text-white hover:bg-forest-700/50 transition">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="9" /><path d="M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" /><path d="M3 12h18" /></svg>
                      By Location
                    </Link>
                    <Link to="/classification" onClick={() => setAnimalsDrop(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-forest-200 hover:text-white hover:bg-forest-700/50 transition">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 3v18" /><path d="M3 9h18" /></svg>
                      By Class
                    </Link>
                    <Link to="/conservation" onClick={() => setAnimalsDrop(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-forest-200 hover:text-white hover:bg-forest-700/50 transition">
                      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" /></svg>
                      Conservation
                    </Link>
                    <Link to="/extinct" onClick={() => setAnimalsDrop(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-forest-200 hover:text-white hover:bg-forest-700/50 transition">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                      Extinct Animals
                    </Link>
                    <Link to="/deep-sea" onClick={() => setAnimalsDrop(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-forest-200 hover:text-white hover:bg-forest-700/50 transition">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><circle cx="12" cy="12" r="3" /></svg>
                      Deep Sea
                    </Link>
                    <div className="my-1 border-t border-forest-700/50" />
                    <Link to="/biomes" onClick={() => setAnimalsDrop(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-forest-200 hover:text-white hover:bg-forest-700/50 transition">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M7 8c2-2 6-2 8 0" /><path d="M5 14c3-3 9-3 12 0" /></svg>
                      Biomes
                    </Link>
                    <Link to="/explore" onClick={() => setAnimalsDrop(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-forest-200 hover:text-white hover:bg-forest-700/50 transition">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      Explore
                    </Link>
                  </div>
                )}
              </div>
              <Link to="/map" className="px-3 py-1.5 rounded text-sm font-medium hover:bg-white/10 transition">Map</Link>
              <Link to="/compare" className="px-3 py-1.5 rounded text-sm font-medium hover:bg-white/10 transition">Compare</Link>
              <Link to="/quiz" className="px-3 py-1.5 rounded text-sm font-medium hover:bg-white/10 transition">Quiz</Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <SearchBar />
              {user ? (
                <div className="relative">
                  <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1 text-sm font-medium text-forest-200 hover:text-white">
                    {user.username}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-forest-800 rounded-lg shadow-lg py-1 border border-forest-700/40">
                      <Link to="/favorites" className="block px-4 py-2 text-sm text-forest-200 hover:bg-forest-700/50" onClick={() => setMenuOpen(false)}>Favorites</Link>
                      {user.is_admin && <Link to="/admin" className="block px-4 py-2 text-sm text-forest-200 hover:bg-forest-700/50" onClick={() => setMenuOpen(false)}>Admin</Link>}
                      <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-forest-700/50">Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-sm font-medium transition">Sign In</Link>
              )}
            </div>

            <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <SearchBar />
              <Link to="/browse" className="block py-2 text-forest-200 hover:text-white">Browse A-Z</Link>
              <Link to="/location" className="block py-2 text-forest-200 hover:text-white">By Location</Link>
              <Link to="/classification" className="block py-2 text-forest-200 hover:text-white">By Class</Link>
              <Link to="/conservation" className="block py-2 text-forest-200 hover:text-white">Conservation</Link>
              <Link to="/extinct" className="block py-2 text-forest-200 hover:text-white">Extinct Animals</Link>
              <Link to="/deep-sea" className="block py-2 text-forest-200 hover:text-white">Deep Sea</Link>
              <Link to="/biomes" className="block py-2 text-forest-200 hover:text-white">Biomes</Link>
              <Link to="/map" className="block py-2 text-forest-200 hover:text-white">Map</Link>
              <Link to="/explore" className="block py-2 text-forest-200 hover:text-white">Explore</Link>
              <Link to="/compare" className="block py-2 text-forest-200 hover:text-white">Compare</Link>
              <Link to="/quiz" className="block py-2 text-forest-200 hover:text-white">Quiz</Link>
              {user ? (
                <>
                  <Link to="/favorites" className="block py-2 text-forest-200 hover:text-white">Favorites</Link>
                  <button onClick={() => { logout(); navigate('/'); }} className="block py-2 text-red-400">Logout</button>
                </>
              ) : (
                <Link to="/login" className="block py-2 text-forest-200 font-medium">Sign In</Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* A-Z Letter Bar */}
      {isBrowse && (
        <div className="bg-forest-800 border-t border-forest-700">
          <div className="w-full px-6 lg:px-12">
            <div className="flex items-center justify-center gap-0.5 py-1.5 overflow-x-auto scrollbar-hide">
              {LETTERS.map(letter => (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="w-8 h-8 flex items-center justify-center text-xs font-bold text-forest-200 hover:bg-forest-600 hover:text-white rounded transition"
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
