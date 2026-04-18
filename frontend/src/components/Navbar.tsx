import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import SearchBar from './SearchBar';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isBrowse = location.pathname === '/browse';

  return (
    <header className="sticky top-0 z-50">
      {/* Main nav bar - dark theme */}
      <nav className="bg-forest-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/favicon.svg" alt="WildAtlas" className="w-7 h-7" />
              <span className="font-display font-bold text-lg">WildAtlas</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link to="/browse" className="px-3 py-1.5 rounded text-sm font-medium hover:bg-white/10 transition">Animals</Link>
              <Link to="/map" className="px-3 py-1.5 rounded text-sm font-medium hover:bg-white/10 transition">Map</Link>
              <Link to="/explore" className="px-3 py-1.5 rounded text-sm font-medium hover:bg-white/10 transition">Explore</Link>
              <Link to="/compare" className="px-3 py-1.5 rounded text-sm font-medium hover:bg-white/10 transition">Compare</Link>
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
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border">
                      <Link to="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Favorites</Link>
                      {user.is_admin && <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Admin</Link>}
                      <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</button>
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
              <Link to="/browse" className="block py-2 text-forest-200 hover:text-white">Animals</Link>
              <Link to="/map" className="block py-2 text-forest-200 hover:text-white">Map</Link>
              <Link to="/explore" className="block py-2 text-forest-200 hover:text-white">Explore</Link>
              <Link to="/compare" className="block py-2 text-forest-200 hover:text-white">Compare</Link>
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
          <div className="max-w-7xl mx-auto px-4">
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
