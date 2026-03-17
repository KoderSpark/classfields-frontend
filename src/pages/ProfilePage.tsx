import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMe, updateMe, uploadImage } from '../lib/api';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, Building2, FileText, Briefcase } from 'lucide-react';

export function ProfilePage() {
  const { user, token, setUserProfile } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await getMe();
        if (mounted) {
          setProfile(data);
          setForm({
            business_name: data.business_name || data.name || '',
            contact_number: data.contact_number || data.contact || '',
            email: data.email || '',
            category: data.category || '',
            subcategory: data.subcategory || '',
            city: data.city || '',
            subcity: data.subcity || '',
            description: data.description || '',
            profile_image_url: data.profile_image_url || data.image_url || '',
          });
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not signed in</h2>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleFile = (f: File | null) => {
    setImageFile(f);
    if (!f) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm((s: any) => ({ ...s, profile_image_preview: reader.result }));
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updates: any = { ...form };
      // if image file, upload first
      if (imageFile) {
        const url = await uploadImage(imageFile);
        updates.profile_image_url = url;
      }
      // send only allowed keys
      const allowed = ['business_name', 'contact_number', 'email', 'category', 'subcategory', 'city', 'subcity', 'description', 'profile_image_url', 'password'];
      const payload: any = {};
      for (const k of allowed) if (updates[k] !== undefined) payload[k] = updates[k];

      const updated = await updateMe(payload);
      setProfile(updated);
      setForm((s: any) => ({ ...s, profile_image_url: updated.profile_image_url }));
      setEditing(false);
      // update context
      setUserProfile(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-teal-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  const p = profile || user;

  if (error && !p) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-xl border border-red-100">
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">


        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-10 border border-gray-100">

          {!editing ? (
            <div className="space-y-8 animate-fadeIn">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-8 border-b border-gray-100 pb-8">
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-4 border-gray-50 shadow-lg overflow-hidden bg-gray-50 relative group">
                    <img
                      src={form.profile_image_preview || p?.profile_image_url || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'}
                      alt={p?.business_name || p?.email || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left pt-2 w-full">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{p?.business_name || p?.name || p?.email}</h1>
                      <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start text-gray-600 mb-4">
                        {p?.category && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-50 text-teal-700 border border-teal-100">
                            {p.category}
                          </span>
                        )}
                        {p?.subcategory && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            {p.subcategory}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        Member since {p?.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                      </span>
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg font-medium text-sm transform hover:-translate-y-0.5"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Left Column - Contact Info */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-full">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      Contact Information
                    </h3>
                    <div className="space-y-6">
                      {/* Email */}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-teal-600 shrink-0 border border-gray-100">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                          <p className="text-gray-900 font-medium break-all">{p?.email}</p>
                        </div>
                      </div>
                      {/* Phone */}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600 shrink-0 border border-gray-100">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                          <p className="text-gray-900 font-medium">{p?.contact_number || p?.contact || 'Not provided'}</p>
                        </div>
                      </div>
                      {/* Location */}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-purple-600 shrink-0 border border-gray-100">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</p>
                          <p className="text-gray-900 font-medium">
                            {p?.city ? `${p.city}${p.subcity ? `, ${p.subcity}` : ''}` : 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Description */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 h-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">About Business</h3>
                    <div className="prose prose-lg prose-teal max-w-none">
                      {p?.description ? (
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {p.description}
                        </p>
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                          <p className="text-gray-500 italic">No description provided yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 border-b border-gray-100 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                  <p className="text-sm text-gray-500 mt-1">Update your business information</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => { setEditing(false); handleFile(null); }}
                    className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm font-medium text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-md hover:shadow-lg font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Profile Image Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl border-2 border-gray-200 overflow-hidden bg-gray-50">
                    <img
                      src={form.profile_image_preview || p?.profile_image_url || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2 bg-teal-600 text-white rounded-full cursor-pointer hover:bg-teal-700 transition-colors shadow-lg">
                    <Camera className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-base font-semibold text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-500 mt-1">Upload a square logo or photo.</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-600" />
                  </div>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                      </div>
                      <input
                        value={form.business_name}
                        onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                        className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all shadow-sm hover:border-gray-300"
                        placeholder="Enter business name"
                      />
                    </div>
                  </div>
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                      </div>
                      <input
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all shadow-sm hover:border-gray-300"
                        placeholder="e.g. Plumber, Electrician"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                      </div>
                      <input
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all shadow-sm hover:border-gray-300"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                      </div>
                      <input
                        value={form.contact_number}
                        onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                        className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all shadow-sm hover:border-gray-300"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* City */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                      </div>
                      <input
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all shadow-sm hover:border-gray-300"
                        placeholder="City"
                      />
                    </div>
                  </div>
                  {/* Subcity */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Subcity / Area</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                      </div>
                      <input
                        value={form.subcity}
                        onChange={(e) => setForm({ ...form, subcity: e.target.value })}
                        className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all shadow-sm hover:border-gray-300"
                        placeholder="Area or locality"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-orange-600" />
                  </div>
                  About Business
                </h3>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all shadow-sm hover:border-gray-300 resize-y min-h-[120px]"
                    rows={4}
                    placeholder="Tell us about your business..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
