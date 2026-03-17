import { useState, ChangeEvent, FormEvent } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { createProvider, uploadImage, Category } from '../lib/api';
import { defaultCategories } from '../lib/categories';

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

const SUBCITIES: Record<string, string[]> = {
  'Mumbai': ['Andheri', 'Bandra', 'Dadar', 'Colaba', 'Powai', 'Juhu'],
  'Delhi': ['Connaught Place', 'Karol Bagh', 'Saket', 'Dwarka', 'Rohini', 'Janakpuri'],
  'Bengaluru': ['Koramangala', 'Indiranagar', 'Jayanagar', 'Whitefield', 'Hebbal', 'MG Road'],
  'Chennai': ['T. Nagar', 'Adyar', 'Velachery', 'Anna Nagar', 'Guindy', 'Mylapore'],
  'Kolkata': ['Salt Lake', 'Park Street', 'Howrah', 'Ballygunge', 'Garia', 'North Kolkata'],
  'Hyderabad': ['Banjara Hills', 'Gachibowli', 'Hitech City', 'Secunderabad', 'Amberpet', 'Miyapur'],
  'Pune': ['Kothrud', 'Viman Nagar', 'Kalyani Nagar', 'Shivajinagar', 'Hadapsar', 'Pimpri'],
  'Ahmedabad': ['Satellite', 'Maninagar', 'Gandhinagar', 'Navrangpura', 'Paldi', 'Old City'],
  'Jaipur': ['C-Scheme', 'Vaishali Nagar', 'Malviya Nagar', 'Vidyadhar Nagar', 'Jagatpura', 'Mansarovar'],
  'Surat': ['Varachha', 'Udhna', 'Adajan', 'Piplod', 'Chowk Bazar', 'Athwa'],
  'Lucknow': ['Hazratganj', 'Aliganj', 'Gomti Nagar', 'Aminabad', 'Indira Nagar', 'Nadan Mahal'],
  'Nagpur': ['Sitabuldi', 'Dharampeth', 'Reshim Bagh', 'Civil Lines', 'Kamptee', 'Sonegaon'],
};

interface FormData {
  businessName: string;
  contactNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  category: string;
  subcategory: string;
  city: string;
  subcity: string;
  description: string;
}

export function RegisterPage() {
  // Using backend API for registration (MongoDB) instead of Supabase
  const [categories] = useState<Category[]>(defaultCategories);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    contactNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    category: '',
    subcategory: '',
    city: '',
    subcity: '',
    description: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [isManualCategory, setIsManualCategory] = useState(false);
  const [isManualSubcategory, setIsManualSubcategory] = useState(false);
  const [isManualCity, setIsManualCity] = useState(false);
  const [isManualSubcity, setIsManualSubcity] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Upload image to backend (Cloudinary) if provided
      let imageUrl = '';
      if (profileImage) {
        try {
          imageUrl = await uploadImage(profileImage as File);
        } catch (err) {
          console.error('Image upload failed', err);
        }
      }

      // Create provider in backend (MongoDB)
      try {
        await createProvider({
          business_name: formData.businessName,
          contact_number: formData.contactNumber,
          email: formData.email,
          password: formData.password,
          category: formData.category,
          subcategory: formData.subcategory,
          city: formData.city,
          subcity: formData.subcity,
          description: formData.description,
          profile_image_url: imageUrl || null,
        });
        setSuccess(true);
      } catch (err: any) {
        setError(err?.message || 'Registration failed');
      }
      setFormData({
        businessName: '',
        contactNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        category: '',
        subcategory: '',
        city: '',
        subcity: '',
        description: '',
      });
      setProfileImage(null);
      setImagePreview('');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.name === formData.category);
  const selectedCitySubcities = SUBCITIES[formData.city] || [];

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your provider profile has been created and is now live on the platform.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            View Your Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Register as Service Provider</h1>
        <p className="text-gray-600 mb-8">Join our platform and connect with customers</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business/Provider Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                required
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="Re-enter password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Category *
              </label>
              {!isManualCategory ? (
                <select
                  required
                  value={formData.category}
                  onChange={(e) => {
                    if (e.target.value === '__OTHER__') {
                      setIsManualCategory(true);
                      setFormData({ ...formData, category: '', subcategory: '' });
                      setIsManualSubcategory(true);
                    } else {
                      setFormData({ ...formData, category: e.target.value, subcategory: '' });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="__OTHER__">Other (Enter manually)</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter custom category"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualCategory(false);
                      setIsManualSubcategory(false);
                      setFormData({ ...formData, category: '', subcategory: '' });
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    Select
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory *
              </label>
              {!isManualSubcategory ? (
                <select
                  required
                  value={formData.subcategory}
                  onChange={(e) => {
                    if (e.target.value === '__OTHER__') {
                      setIsManualSubcategory(true);
                      setFormData({ ...formData, subcategory: '' });
                    } else {
                      setFormData({ ...formData, subcategory: e.target.value });
                    }
                  }}
                  disabled={!formData.category}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100"
                >
                  <option value="">Select subcategory</option>
                  {selectedCategory?.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  <option value="__OTHER__">Other (Enter manually)</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter custom subcategory"
                  />
                  {(!isManualCategory) && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualSubcategory(false);
                        setFormData({ ...formData, subcategory: '' });
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Select
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              {!isManualCity ? (
                <select
                  required
                  value={formData.city}
                  onChange={(e) => {
                    if (e.target.value === '__OTHER__') {
                      setIsManualCity(true);
                      setFormData({ ...formData, city: '', subcity: '' });
                      setIsManualSubcity(true);
                    } else {
                      setFormData({ ...formData, city: e.target.value, subcity: '' });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select city</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                  <option value="__OTHER__">Other (Enter manually)</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value, subcity: '' })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter custom city"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualCity(false);
                      setIsManualSubcity(false);
                      setFormData({ ...formData, city: '', subcity: '' });
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    Select
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub-City/Area *
              </label>
              {!isManualSubcity ? (
                <select
                  required
                  value={formData.subcity}
                  onChange={(e) => {
                    if (e.target.value === '__OTHER__') {
                      setIsManualSubcity(true);
                      setFormData({ ...formData, subcity: '' });
                    } else {
                      setFormData({ ...formData, subcity: e.target.value });
                    }
                  }}
                  disabled={!formData.city}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100"
                >
                  <option value="">Select sub-city</option>
                  {selectedCitySubcities.map((subcity) => (
                    <option key={subcity} value={subcity}>
                      {subcity}
                    </option>
                  ))}
                  <option value="__OTHER__">Other (Enter manually)</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.subcity}
                    onChange={(e) => setFormData({ ...formData, subcity: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter custom area"
                  />
                  {(!isManualCity) && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualSubcity(false);
                        setFormData({ ...formData, subcity: '' });
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Select
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              placeholder="Describe your services, experience, and what makes you unique..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image (Optional)
            </label>
            <div className="flex items-start space-x-4">
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload image</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Profile...</span>
              </>
            ) : (
              <span>Create Provider Profile</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
