import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <span className="font-display font-bold text-xl text-forest-700">WildAtlas</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <SearchBar />
            <Link to="/browse" className="text-gray-600 hover:text-forest-600 font-medium text-sm">Browse</Link>
            <Link to="/map" className="text-gray-600 hover:text-forest-600 font-medium text-sm">Map</Link>
            <Link to="/explore" className="text-gray-600 hover:text-forest-600 font-medium text-sm">Explore</Link>
            <Link to="/compare" className="text-gray-600 hover:text-forest-600 font-medium text-sm">Compare</Link>
            {user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1 text-sm font-medium text-gray-700">
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
              <Link to="/login" className="bg-forest-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-forest-700">Sign In</Link>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <SearchBar />
            <Link to="/browse" className="block py-2 text-gray-600">Browse</Link>
            <Link to="/map" className="block py-2 text-gray-600">Map</Link>
            <Link to="/explore" className="block py-2 text-gray-600">Explore</Link>
            <Link to="/compare" className="block py-2 text-gray-600">Compare</Link>
            {user ? (
              <>
                <Link to="/favorites" className="block py-2 text-gray-600">Favorites</Link>
                <button onClick={() => { logout(); navigate('/'); }} className="block py-2 text-red-600">Logout</button>
              </>
            ) : (
              <Link to="/login" className="block py-2 text-forest-600 font-medium">Sign In</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
