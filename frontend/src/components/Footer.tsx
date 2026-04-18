import { Link } from 'react-router-dom';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-forest-200 mt-16">
      {/* A-Z Quick Links */}
      <div className="border-b border-forest-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-xs text-forest-400 uppercase tracking-wider mb-2">Browse Animals A-Z</p>
          <div className="flex flex-wrap gap-1">
            {LETTERS.map(l => (
              <Link key={l} to={`/browse#letter-${l}`} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-forest-400 hover:text-white hover:bg-forest-700 rounded transition">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/favicon.svg" alt="" className="w-6 h-6" />
            <h3 className="font-display font-bold text-xl text-white">WildAtlas</h3>
          </div>
          <p className="text-sm text-forest-300">Exploring wildlife biodiversity around the world. Powered by GBIF, iNaturalist, and Wikipedia.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Explore</h4>
          <div className="space-y-2 text-sm">
            <Link to="/browse" className="block hover:text-white transition">Browse Animals</Link>
            <Link to="/map" className="block hover:text-white transition">Wildlife Map</Link>
            <Link to="/explore" className="block hover:text-white transition">By Region</Link>
            <Link to="/compare" className="block hover:text-white transition">Compare Species</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Categories</h4>
          <div className="space-y-2 text-sm">
            <Link to="/browse?class_name=Mammalia" className="block hover:text-white transition">Mammals</Link>
            <Link to="/browse?class_name=Aves" className="block hover:text-white transition">Birds</Link>
            <Link to="/browse?class_name=Reptilia" className="block hover:text-white transition">Reptiles</Link>
            <Link to="/browse?class_name=Amphibia" className="block hover:text-white transition">Amphibians</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Data Sources</h4>
          <div className="space-y-2 text-sm">
            <a href="https://www.gbif.org" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition">GBIF</a>
            <a href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition">iNaturalist</a>
            <a href="https://www.wikipedia.org" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition">Wikipedia</a>
          </div>
        </div>
      </div>
      <div className="border-t border-forest-800 text-center py-4 text-sm text-forest-400">
        &copy; {new Date().getFullYear()} WildAtlas. Built for wildlife education.
      </div>
    </footer>
  );
}
