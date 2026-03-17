import { useState, useEffect } from 'react';
import { Search, MapPin, PhoneCall, Mail } from 'lucide-react';
import { getProviders, getCategories, Provider, Category } from '../lib/api';

const CITIES = [
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Nagpur',
];

interface BrowsePageProps {
  initialFilters?: { category?: string };
  onNavigate: (page: string, providerId?: string) => void;
}

export function BrowsePage({ initialFilters, onNavigate }: BrowsePageProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    category: initialFilters?.category || '',
    subcategory: '',
    city: '',
    search: '',
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    // Fetch categories on mount
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [filters, page]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const data = await getProviders({ ...filters, page });
      // Support both the legacy flat array response and the new paginated object response
      if (Array.isArray(data)) {
        setProviders(data);
        setTotalCount(data.length);
        setTotalPages(1);
      } else {
        setProviders(data?.providers || []);
        setTotalCount(data?.totalCount || 0);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch providers', err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.name === filters.category);

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      city: '',
      search: '',
    });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Service Providers</h1>
          <p className="text-lg text-gray-600">
            {totalCount} {totalCount === 1 ? 'provider' : 'providers'} found
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value, subcategory: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
              <select
                value={filters.subcategory}
                onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
                disabled={!filters.category}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none disabled:bg-gray-100"
              >
                <option value="">All Subcategories</option>
                {selectedCategory?.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              >
                <option value="">All Cities</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search providers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {(filters.category || filters.subcategory || filters.city || filters.search) && (
            <button
              onClick={resetFilters}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-teal-600"></div>
            <p className="mt-4 text-gray-600">Loading providers...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No providers found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="group flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-white h-full transform hover:-translate-y-1 border border-gray-100"
              >
                {/* Image Section */}
                <div className="relative w-full h-32 sm:h-56 md:h-60 lg:h-64 overflow-hidden bg-gray-100">
                  <img
                    src={provider.profile_image_url || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'}
                    alt={provider.business_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Modern Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90"></div>

                  {/* Badges - Top Right */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1 items-end">
                    <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-teal-500/90 backdrop-blur-md text-white border border-teal-400/30 shadow-sm">
                      {provider.category}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-black/40 backdrop-blur-md text-white border border-white/10">
                      {provider.subcategory}
                    </span>
                  </div>

                  {/* Content Over Image */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 text-white">
                    {/* Business Name */}
                    <h3 className="text-sm sm:text-xl font-bold mb-1 line-clamp-2 leading-tight text-white drop-shadow-md">
                      {provider.business_name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1 mb-1 sm:mb-2 text-gray-200">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium truncate">
                        {provider.city}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed opacity-90 hidden sm:block">
                      {provider.description}
                    </p>
                  </div>
                </div>

                {/* Action Section */}
                <div className="flex-1 flex flex-col p-3 sm:p-5 bg-white">
                  <div className="mt-auto space-y-3 sm:space-y-4">
                    {/* Contact Actions */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <a
                        href={`tel:${provider.contact_number}`}
                        className="flex items-center justify-center py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-blue-200"
                        title="Call"
                      >
                        <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" />
                      </a>
                      <button
                        onClick={() => handleWhatsApp(provider.contact_number)}
                        className="flex items-center justify-center py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-green-50 text-green-600 hover:bg-[#25D366] hover:text-white transition-all duration-300 shadow-sm hover:shadow-green-200"
                        title="WhatsApp"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.231-.298.347-.497.116-.198.058-.372-.029-.545-.087-.173-.78-1.88-.998-2.384-.233-.55-.486-.479-.654-.484h-.57c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.304-5.291c0-5.435 4.418-9.85 9.85-9.85 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.435-4.413 9.85-9.849 9.85" />
                        </svg>
                      </button>
                      <a
                        href={`mailto:${provider.email}`}
                        className="flex items-center justify-center py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-red-200"
                        title="Email"
                      >
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                      </a>
                    </div>

                    {/* View Profile Button */}
                    <button
                      onClick={() => onNavigate('detail', provider.id)}
                      className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-900 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-1 sm:gap-2 group/btn text-xs sm:text-base"
                    >
                      View Profile
                      <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 space-x-1 sm:space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-md font-medium text-xs sm:text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
            >
              Previous
            </button>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap justify-center">
              {(() => {
                // Determine which page numbers to show
                const pages = [];
                const maxPagesToShow = window.innerWidth < 640 ? 5 : 7; // Show fewer on mobile
                const half = Math.floor(maxPagesToShow / 2);

                let start = Math.max(1, page - half);
                let end = Math.min(totalPages, start + maxPagesToShow - 1);

                if (end - start + 1 < maxPagesToShow) {
                  start = Math.max(1, end - maxPagesToShow + 1);
                }

                if (start > 1) {
                  pages.push(1);
                  if (start > 2) pages.push('...');
                }

                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }

                if (end < totalPages) {
                  if (end < totalPages - 1) pages.push('...');
                  pages.push(totalPages);
                }

                return pages.map((p, index) => {
                  if (p === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        page === p
                          ? 'bg-teal-600 text-white border border-teal-600 shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                });
              })()}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-md font-medium text-xs sm:text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
