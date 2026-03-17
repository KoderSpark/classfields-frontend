import { useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { BrowsePage } from './pages/BrowsePage';
import { ProviderDetailPage } from './pages/ProviderDetailPage';
import { LoginPage } from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

type Page = 'home' | 'register' | 'browse' | 'detail' | 'login' | 'profile' | 'admin' | 'notfound';

function AppRoutesWrapper() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = (page: Page, data?: string | { category?: string }) => {
    // Map internal page names to URL paths
    if (page === 'home') navigate('/');
    else if (page === 'register') navigate('/register');
    else if (page === 'profile') navigate('/profile');
    else if (page === 'browse') {
      if (data && typeof data === 'object' && 'category' in data && data.category)
        navigate(`/browse?category=${encodeURIComponent(data.category || '')}`);
      else navigate('/browse');
    } else if (page === 'detail' && typeof data === 'string') navigate(`/providers/${data}`);
    else if (page === 'login') navigate('/login');
    else if (page === 'admin') navigate('/admin');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine current page from pathname for Layout highlighting
  const currentPage: Page = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/providers/')) return 'detail';
    if (path === '/browse') return 'browse';
    if (path === '/profile') return 'profile';
    if (path === '/register') return 'register';
    if (path === '/login') return 'login';
    if (path === '/admin') return 'admin';
    return 'notfound';
  }, [location.pathname]);

  // Wrapper for Browse route to pass query params as initialFilters
  function BrowseRoute() {
    const search = new URLSearchParams(location.search);
    const category = search.get('category') || undefined;
    return <BrowsePage initialFilters={category ? { category } : undefined} onNavigate={navigateTo} />;
  }

  // Wrapper for Provider detail route to pass the id param
  function ProviderDetailRoute() {
    const { id } = useParams();
    return <ProviderDetailPage providerId={id || ''} onNavigate={navigateTo} />;
  }

  return (
    <AuthProvider>
      <Layout currentPage={currentPage} onNavigate={navigateTo} hideFooter={currentPage === 'admin'}>
        <Routes>
          <Route path="/" element={<HomePage onNavigate={navigateTo} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/browse" element={<BrowseRoute />} />
          <Route path="/providers/:id" element={<ProviderDetailRoute />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage onNavigate={navigateTo} />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/not-found" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default function App() {
  return <AppRoutesWrapper />;
}
