import { ReactNode } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  hideFooter?: boolean;
}

export function Layout({ children, currentPage, onNavigate, hideFooter }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navItems = [
    { label: 'Home', page: 'home' },
    { label: 'Browse Services', page: 'browse' },
    { label: 'Register as Provider', page: 'register' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="text-2xl font-bold text-teal-600 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              Present Classifieds
            </div>

            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === item.page
                      ? 'text-teal-600 bg-teal-50'
                      : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onNavigate('profile')}
                    className="flex items-center space-x-2 text-sm text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>{user.email}</span>
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      onNavigate('home');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    onNavigate(item.page);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${currentPage === item.page
                      ? 'text-teal-600 bg-teal-50'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {item.label}
                </button>
              ))}
              {user ? (
                <>
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      onNavigate('home');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>

      {!hideFooter && (
      <footer className="bg-gray-900 text-white mt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">LocalServices</h3>
              <p className="text-gray-400 text-sm">
                Connecting local service providers with customers who need them.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('browse')} className="hover:text-white transition-colors">
                    Browse Services
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('register')} className="hover:text-white transition-colors">
                    Register as Provider
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">
                Email: info@localservices.com<br />
                Phone: +1 (555) 123-4567
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 LocalServices. All rights reserved.
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}
