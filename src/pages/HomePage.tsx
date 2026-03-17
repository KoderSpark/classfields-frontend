import { useState } from 'react';
import { Search, Briefcase, Heart, Monitor } from 'lucide-react';
import { Category } from '../lib/api';
import { categoryIcons, defaultCategories } from '../lib/categories';

interface HomePageProps {
  onNavigate: (page: string, filters?: { category?: string }) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [categories] = useState<Category[]>(defaultCategories);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onNavigate('browse', {});
    }
  };

  return (
    <div>
      <section className="relative bg-gradient-to-br from-teal-50 via-white to-blue-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Find Local Service
              <span className="text-teal-600"> Providers</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
              Connect with trusted professionals in your area for all your service needs
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for services..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition-all text-base md:text-lg"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Search
              </button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => onNavigate('browse')}
                className="px-6 py-2 bg-white text-gray-700 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all font-medium"
              >
                Browse All Services
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-6 py-2 bg-teal-600 text-white rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all font-medium"
              >
                Register as Provider
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Service Categories
            </h2>
            <p className="text-lg text-gray-600">
              Explore our wide range of professional services
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const Icon = categoryIcons[category.name] || Briefcase;
              return (
                <div
                  key={category.id}
                  onClick={() => onNavigate('browse', { category: category.name })}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 text-center md:text-left"
                >
                  <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-600 transition-colors mx-auto md:mx-0">
                    <Icon className="w-7 h-7 text-teal-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {category.subcategories.length} subcategories
                  </p>
                  <div className="hidden sm:flex sm:flex-wrap sm:gap-2">
                    {category.subcategories.slice(0, 3).map((sub, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                      >
                        {sub}
                      </span>
                    ))}
                    {category.subcategories.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        +{category.subcategories.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Search</h3>
              <p className="text-gray-600">
                Find service providers by category, location, or keyword
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trusted Providers</h3>
              <p className="text-gray-600">
                Connect with verified local professionals in your area
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Direct Contact</h3>
              <p className="text-gray-600">
                Reach out to providers directly via phone, email, or WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Are You a Service Provider?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join our platform and connect with customers looking for your services
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-100 hover:shadow-xl transform hover:scale-105 transition-all text-lg"
          >
            Register Now
          </button>
        </div>
      </section>
    </div>
  );
}
