import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-forest-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display font-bold text-xl text-white mb-3">🌍 WildAtlas</h3>
          <p className="text-sm text-forest-300">Exploring wildlife biodiversity around the world. Powered by GBIF, iNaturalist, and Wikipedia.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Explore</h4>
          <div className="space-y-2 text-sm">
            <Link to="/browse" className="block hover:text-white">Browse Animals</Link>
            <Link to="/map" className="block hover:text-white">Wildlife Map</Link>
            <Link to="/explore" className="block hover:text-white">By Region</Link>
            <Link to="/compare" className="block hover:text-white">Compare Species</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Data Sources</h4>
          <div className="space-y-2 text-sm">
            <a href="https://www.gbif.org" target="_blank" rel="noopener noreferrer" className="block hover:text-white">GBIF</a>
            <a href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" className="block hover:text-white">iNaturalist</a>
            <a href="https://www.wikipedia.org" target="_blank" rel="noopener noreferrer" className="block hover:text-white">Wikipedia</a>
          </div>
        </div>
      </div>
      <div className="border-t border-forest-800 text-center py-4 text-sm text-forest-400">
        &copy; {new Date().getFullYear()} WildAtlas. Built for wildlife education.
      </div>
    </footer>
  );
}
