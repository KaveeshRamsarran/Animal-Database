import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import AnimalDetailPage from './pages/AnimalDetailPage';
import MapPage from './pages/MapPage';
import ComparePage from './pages/ComparePage';
import ExplorePage from './pages/ExplorePage';
import CountryPage from './pages/CountryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminPage from './pages/AdminPage';
import BiomesPage from './pages/BiomesPage';

export default function App() {
  const { loadUser, token } = useAuthStore();

  useEffect(() => {
    if (token) loadUser();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/biomes" element={<BiomesPage />} />
            <Route path="/animal/:slug" element={<AnimalDetailPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/country/:code" element={<CountryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
