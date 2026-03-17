import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, MessageCircle, ArrowLeft, User, Calendar } from 'lucide-react';
import { getProvider, Provider } from '../lib/api';

interface ProviderDetailPageProps {
  providerId: string;
  onNavigate: (page: string) => void;
}

export function ProviderDetailPage({ providerId, onNavigate }: ProviderDetailPageProps) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProvider();
  }, [providerId]);

  const fetchProvider = async () => {
    setLoading(true);
    try {
      const data = await getProvider(providerId);
      setProvider(data || null);
    } catch (err) {
      console.error('Failed to fetch provider', err);
      setProvider(null);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading provider details...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider Not Found</h2>
          <p className="text-gray-600 mb-6">The provider you're looking for doesn't exist.</p>
          <button
            onClick={() => onNavigate('browse')}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('browse')}
          className="flex items-center space-x-2 text-gray-600 hover:text-teal-600 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Browse</span>
        </button>

        {/* Main Content - Two Column Layout */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Left Side - Image Section */}
            <div className="relative w-full h-80 sm:h-96 lg:h-auto bg-gradient-to-br from-teal-100 to-blue-100 overflow-hidden border-r-2 border-gray-200">
              <img
                src={provider.profile_image_url || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'}
                alt={provider.business_name}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay Gradient at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent"></div>

              {/* Category Badges - Bottom Left */}
              <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-4 py-2 bg-teal-600/90 backdrop-blur-md text-white rounded-full font-semibold text-sm border border-teal-400/30 shadow-lg">
                  {provider.category}
                </span>
                <span className="inline-flex items-center px-4 py-2 bg-blue-600/90 backdrop-blur-md text-white rounded-full font-semibold text-sm border border-blue-400/30 shadow-lg">
                  {provider.subcategory}
                </span>
              </div>
            </div>

            {/* Right Side - Details Section */}
            <div className="flex flex-col p-6 sm:p-8 lg:p-10 space-y-4 lg:space-y-5">
              
              {/* Header - Business Name */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {provider.business_name}
                </h1>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-base font-medium">{provider.city}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-teal-200 to-transparent"></div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h2 className="text-base font-bold text-gray-900">Contact Information</h2>

                <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                    <Phone className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 font-medium">Phone</p>
                    <a
                      href={`tel:${provider.contact_number}`}
                      className="text-gray-900 font-semibold hover:text-teal-600 transition-colors break-all text-xs"
                    >
                      {provider.contact_number}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group">
                  <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 transition-colors">
                    <Mail className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 font-medium">Email</p>
                    <a
                      href={`mailto:${provider.email}`}
                      className="text-gray-900 font-semibold hover:text-teal-600 transition-colors break-all text-xs"
                    >
                      {provider.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group">
                  <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200 transition-colors">
                    <MapPin className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 font-medium">Location</p>
                    <p className="text-gray-900 font-semibold text-xs">{provider.city}{provider.subcity ? `, ${provider.subcity}` : ''}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group">
                  <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                    <Calendar className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 font-medium">Member Since</p>
                    <p className="text-gray-900 font-semibold text-xs">{provider.created_at ? formatDate(provider.created_at) : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-teal-200 to-transparent"></div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <h2 className="text-base font-bold text-gray-900">Get in Touch</h2>

                <div className="flex gap-2 justify-start">
                  <a
                    href={`tel:${provider.contact_number}`}
                    title="Call Now"
                    className="h-10 w-10 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 border-2 border-gray-300 hover:border-blue-400/50 group/call relative overflow-hidden flex-shrink-0"
                  >
                    <Phone className="w-5 h-5 stroke-2 relative z-10" />
                  </a>

                  <button
                    onClick={() => handleWhatsApp(provider.contact_number)}
                    title="WhatsApp"
                    className="h-10 w-10 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gradient-to-br hover:from-[#31A24C] hover:to-[#25D366] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 border-2 border-gray-300 hover:border-green-400/50 group/whats relative overflow-hidden flex-shrink-0"
                  >
                    <MessageCircle className="w-5 h-5 stroke-2 relative z-10" />
                  </button>

                  <a
                    href={`mailto:${provider.email}`}
                    title="Send Email"
                    className="h-10 w-10 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 border-2 border-gray-300 hover:border-red-400/50 group/mail relative overflow-hidden flex-shrink-0"
                  >
                    <Mail className="w-5 h-5 stroke-2 relative z-10" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section - Full Width Below */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-gray-200">
          <h2 className="text-2xl sm:text-2xl font-bold text-gray-900 mb-3">About</h2>
          <p className="text-gray-700 text-base leading-relaxed line-clamp-4">
            {provider.description}
          </p>
        </div>

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-6 sm:p-8 border-2 border-teal-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Want to explore more?</h3>
          <p className="text-gray-700 mb-4 text-base">
            Browse other service providers or discover different services.
          </p>
          <button
            onClick={() => onNavigate('browse')}
            className="px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-all hover:shadow-lg transform hover:scale-105 text-sm"
          >
            Browse All Providers →
          </button>
        </div>
      </div>
    </div>
  );
}
