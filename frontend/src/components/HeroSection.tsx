import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-forest-800 via-forest-700 to-forest-900 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 relative">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Discover the<br />World's Wildlife
          </h1>
          <p className="text-lg md:text-xl text-forest-100 mb-8 leading-relaxed">
            Explore an interactive database of animals from every continent. 
            View distribution maps, compare species, and learn fascinating facts.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/browse" className="bg-white text-forest-700 px-6 py-3 rounded-lg font-semibold hover:bg-forest-50 transition">
              Browse Animals
            </Link>
            <Link to="/map" className="border-2 border-white/50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              Open Map
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
