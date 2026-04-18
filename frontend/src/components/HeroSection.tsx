import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative bg-forest-900 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 relative">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <img src="/favicon.svg" alt="" className="w-5 h-5" />
            <span>WildAtlas Encyclopedia</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Explore the<br />Animal Kingdom
          </h1>
          <p className="text-lg md:text-xl text-forest-200 mb-10 leading-relaxed max-w-2xl mx-auto">
            Discover detailed profiles of wildlife from every continent. 
            Browse species A-Z, explore interactive maps, and compare animals side by side.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/browse" className="bg-white text-forest-800 px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-forest-50 transition shadow-lg hover:shadow-xl">
              Browse Animals A-Z
            </Link>
            <Link to="/map" className="border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-white/10 transition">
              Explore Map
            </Link>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60V20C240 50 480 0 720 20C960 40 1200 10 1440 30V60H0Z" fill="#f9fafb"/>
        </svg>
      </div>
    </section>
  );
}
