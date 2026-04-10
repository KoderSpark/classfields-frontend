import { useState, useRef, FormEvent, useEffect } from 'react';
import { Upload, X, Check, AlertCircle, FileSpreadsheet, Lock, Users, Search, Pencil, Trash2, BarChart3, Database } from 'lucide-react';
import api, { Provider } from '../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AdminPage() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'import'>('dashboard');

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [details, setDetails] = useState<string[]>([]);
  const [stats, setStats] = useState<{ total: number, approved: number, pending: number, rejected: number } | null>(null);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [analytics, setAnalytics] = useState<{label: string, value: number}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    if (!token) return;
    // Each API call is independent so one failure doesn't block the others
    api.getAdminStats(token).then(setStats).catch(console.error);
    api.getAdminAnalytics(token).then(data => setAnalytics(data.categories || [])).catch(console.error);
    api.getAdminProviders(token, { page, limit: 10, search: searchQuery })
      .then(provData => {
        setProviders(provData.providers || []);
        setTotalPages(provData.totalPages || 1);
      })
      .catch(err => console.error('Failed to fetch admin providers', err));
  };

  useEffect(() => {
    fetchData();
  }, [token, page, searchQuery]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
      setMessage({ type: 'success', text: 'Admin logged in successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setMessage(null);
    setDetails([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage(null);
      setDetails([]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setMessage(null);
    setDetails([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/admin/providers/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw { message: data.error || 'Upload failed', details: data.details || [] };
      }

      setMessage({ type: 'success', text: data.message || 'Upload successful' });
      if (data.errors && data.errors.length > 0) {
        setDetails(data.errors);
      }
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Refresh data after successful upload
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred' });
      if (err.details) setDetails(err.details);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this provider? This action cannot be undone.')) return;
    setIsDeleting(id);
    try {
      await api.deleteAdminProvider(token, id);
      setMessage({ type: 'success', text: 'Provider deleted successfully' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete provider' });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdateProvider = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !editingProvider) return;
    setLoading(true);
    try {
      await api.updateAdminProvider(token, editingProvider.id || (editingProvider as any)._id, editingProvider);
      setMessage({ type: 'success', text: 'Provider updated successfully' });
      setEditingProvider(null);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update provider' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="p-4 bg-slate-200 rounded-md shadow-sm">
              <Lock className="w-10 h-10 text-slate-800" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-slate-900">
            Administrator Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Secure portal for established administrators.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fadeIn">
          <div className="bg-white py-8 px-4 shadow-md sm:rounded-md sm:px-10 border border-slate-200 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 inset-x-0 h-1 bg-slate-800"></div>

            {message && (
              <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                {message.type === 'success' ? <Check className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all font-medium text-slate-900 shadow-sm"
                  placeholder="admin@corporate.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all font-medium text-slate-900 shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 active:scale-[0.98] transition-all font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : 'Secure Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Formal Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
          <Lock className="w-6 h-6 text-slate-100 mr-3" />
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Admin Portal</h1>
        </div>
        
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-3 py-3 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'hover:bg-slate-800/50 hover:text-slate-100'}`}
          >
            <BarChart3 className="w-5 h-5 mr-3 shrink-0" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('directory')}
            className={`w-full flex items-center px-3 py-3 rounded-md transition-colors ${activeTab === 'directory' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'hover:bg-slate-800/50 hover:text-slate-100'}`}
          >
            <Database className="w-5 h-5 mr-3 shrink-0" />
            Provider Directory
          </button>
          <button 
            onClick={() => setActiveTab('import')}
            className={`w-full flex items-center px-3 py-3 rounded-md transition-colors ${activeTab === 'import' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'hover:bg-slate-800/50 hover:text-slate-100'}`}
          >
            <FileSpreadsheet className="w-5 h-5 mr-3 shrink-0" />
            Batch Import
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-200">
              AD
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-slate-200 truncate">Administrator</p>
              <p className="text-xs text-slate-500 truncate">System Access</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-md transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="h-20 bg-white border-b border-slate-200 flex items-center px-8 shrink-0 shadow-sm z-10 sticky top-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab === 'dashboard' && 'System Overview'}
              {activeTab === 'directory' && 'Provider Directory'}
              {activeTab === 'import' && 'Batch Import Facility'}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 animate-fadeIn">
          <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 flex items-center gap-4">
                  <div className="p-4 bg-slate-100 text-slate-700 rounded-md">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Registered Providers</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {analytics.length > 0 && (
              <div className="bg-white rounded-md shadow-sm border border-slate-200 p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-md">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Category Analytics</h2>
            </div>
            <div className="space-y-4">
              {analytics.map((item, idx) => {
                const maxVal = Math.max(...analytics.map(a => a.value));
                const percentage = Math.round((item.value / maxVal) * 100);
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-48 text-sm font-medium text-slate-700 truncate">{item.label}</div>
                    <div className="flex-1 h-4 bg-slate-100 rounded-sm overflow-hidden">
                      <div 
                        className="h-full bg-slate-600 rounded-sm transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm font-bold text-slate-800 text-right">{item.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
            )}
          </div>
        )}

        {/* Directory Tab */}
        {activeTab === 'directory' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="p-8 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-200 text-slate-800 rounded-md shadow-sm">
                <Database className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Provider Directory</h2>
                <p className="text-sm text-slate-600 mt-1">List of registered platform members</p>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search providers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <th className="p-4 font-semibold text-sm">Business Name</th>
                  <th className="p-4 font-semibold text-sm">Contact Email</th>
                  <th className="p-4 font-semibold text-sm">Category</th>
                  <th className="p-4 font-semibold text-sm">Status</th>
                  <th className="p-4 font-semibold text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {providers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No providers found.</td>
                  </tr>
                ) : (
                  providers.map((provider) => (
                    <tr key={provider.id || (provider as any)._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-900">{provider.business_name}</p>
                        <p className="text-xs text-gray-500">{provider.city || 'No Location'}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{provider.email}</td>
                      <td className="p-4 text-sm text-gray-600">
                        <span className="inline-block px-2 py-1 bg-gray-100 rounded-md whitespace-nowrap">
                          {provider.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(provider as any).status === 'approved' ? 'bg-green-100 text-green-800' : (provider as any).status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                          {((provider as any).status || 'Unknown').charAt(0).toUpperCase() + ((provider as any).status || 'Unknown').slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => setEditingProvider(provider)}
                             className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                             title="Edit Provider"
                           >
                             <Pencil className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => handleDelete(provider.id || (provider as any)._id)}
                             disabled={isDeleting === (provider.id || (provider as any)._id)}
                             className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                             title="Delete Provider"
                           >
                             {isDeleting === (provider.id || (provider as any)._id) ? (
                               <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                             ) : (
                               <Trash2 className="w-4 h-4" />
                             )}
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-center bg-slate-50 gap-1 flex-wrap">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {(() => {
              const buttons: JSX.Element[] = [];
              const WINDOW = 5;
              let start = Math.max(1, page - Math.floor(WINDOW / 2));
              let end = Math.min(totalPages, start + WINDOW - 1);
              if (end - start < WINDOW - 1) start = Math.max(1, end - WINDOW + 1);
              if (start > 1) {
                buttons.push(<button key={1} onClick={() => setPage(1)} className="w-9 h-9 border border-slate-300 rounded-md text-sm font-medium text-slate-600 hover:bg-white transition-colors">1</button>);
                if (start > 2) buttons.push(<span key="el1" className="px-1 text-slate-400 self-center">…</span>);
              }
              for (let i = start; i <= end; i++) {
                const active = i === page;
                buttons.push(<button key={i} onClick={() => setPage(i)} className={`w-9 h-9 border rounded-md text-sm font-semibold transition-colors ${active ? 'bg-teal-600 border-teal-600 text-white shadow-sm' : 'border-slate-300 text-slate-600 hover:bg-white'}`}>{i}</button>);
              }
              if (end < totalPages) {
                if (end < totalPages - 1) buttons.push(<span key="el2" className="px-1 text-slate-400 self-center">…</span>);
                buttons.push(<button key={totalPages} onClick={() => setPage(totalPages)} className="w-9 h-9 border border-slate-300 rounded-md text-sm font-medium text-slate-600 hover:bg-white transition-colors">{totalPages}</button>);
              }
              return buttons;
            })()}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
        </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="p-8 border-b border-slate-200 flex items-center gap-4 bg-slate-50">
            <div className="p-3 bg-slate-200 text-slate-800 rounded-md shadow-sm">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Batch Import Providers</h2>
              <p className="text-sm text-slate-600 mt-1">Upload an Excel or CSV file to concurrently register multiple providers.</p>
            </div>
          </div>

          <div className="p-8">
              <div className="mb-8 p-5 bg-slate-100 rounded-md border border-slate-300 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">Upload Instructions</h3>
                <p className="text-sm text-slate-800 mb-3 leading-relaxed">
                  Upload an Excel (.xlsx, .xls) or CSV file containing provider information. Column order does not matter. Extra columns will be safely ignored.
                </p>
                <div className="bg-white p-4 rounded-md space-y-2 border border-slate-200">
                  <p className="text-sm text-slate-900"><strong className="text-slate-950 font-bold uppercase text-xs tracking-wider">Mandatory Columns:</strong> Name, Address, Category, City</p>
                  <p className="text-sm text-slate-900"><strong className="text-slate-950 font-bold uppercase text-xs tracking-wider">Optional Columns:</strong> Email, Mobile Number, Sub Category, Sub Address, Company Name</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Drag and Drop Zone */}
              <div 
                className={`border-2 border-dashed rounded-md p-10 text-center transition-all relative group
                  ${file 
                    ? 'border-indigo-400 bg-indigo-50' 
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
                  }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className={`p-4 rounded-md transition-colors ${file ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300 group-hover:text-slate-600'}`}>
                    <Upload className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">
                      {file ? file.name : "Click or drag file to upload"}
                    </p>
                    <p className="text-sm font-medium text-slate-500 mt-2">
                      {file ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-800">
                          {(file.size / 1024).toFixed(2)} KB • Ready to import
                        </span>
                      ) : "Supports .xlsx, .xls, .csv up to 10MB"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {message && (
                <div className={`p-5 rounded-2xl flex items-start gap-4 shadow-sm border animate-fadeIn ${
                    message.type === 'success' ? 'bg-green-50 text-green-900 border-green-200' : 'bg-red-50 text-red-900 border-red-200'
                  }`}
                >
                  <div className={`p-2 rounded-full shrink-0 ${message.type === 'success' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 mt-1">
                    <p className="font-bold text-lg">{message.text}</p>
                    {details.length > 0 && (
                      <div className="mt-4 bg-white/60 rounded-xl p-4 border border-black/5">
                        <p className="font-bold text-sm mb-2 uppercase tracking-wide opacity-80">Detailed Report:</p>
                        <ul className="list-disc list-inside space-y-1.5 text-sm font-medium">
                          {details.map((detail, idx) => (
                            <li key={idx} className="opacity-90 leading-snug">{detail}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => { setMessage(null); setDetails([]); }}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 opacity-60 hover:opacity-100" />
                  </button>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className={`w-full py-4 rounded-md font-bold text-lg transition-all flex justify-center items-center gap-3 ${
                  !file || loading
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-slate-800 text-white hover:bg-slate-900 shadow-sm active:scale-[0.98]'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Upload...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Securely Upload Data
                  </>
                )}
              </button>
            </div>
          </div>
          </div>
          </div>
        )}

      </div>
      </div>
      </div>

      {/* Edit Provider Modal */}
      {editingProvider && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex py-12 px-4 justify-center overflow-y-auto">
          <div className="bg-white rounded-md shadow-md border border-slate-200 p-8 max-w-lg w-full h-fit animate-fadeIn relative">
            <button 
              onClick={() => setEditingProvider(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Modify Provider Record</h2>
            <form onSubmit={handleUpdateProvider} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Business Name</label>
                <input 
                  type="text" 
                  value={editingProvider.business_name || ''} 
                  onChange={e => setEditingProvider(prev => prev ? {...prev, business_name: e.target.value} : null)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={editingProvider.email || ''} 
                    onChange={e => setEditingProvider(prev => prev ? {...prev, email: e.target.value} : null)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select 
                    value={(editingProvider as any).status || 'pending'} 
                    onChange={e => setEditingProvider(prev => prev ? {...prev, status: e.target.value} : null)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                  <input 
                    type="text" 
                    value={editingProvider.category || ''} 
                    onChange={e => setEditingProvider(prev => prev ? {...prev, category: e.target.value} : null)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Location / City</label>
                  <input 
                    type="text" 
                    value={editingProvider.city || ''} 
                    onChange={e => setEditingProvider(prev => prev ? {...prev, city: e.target.value} : null)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-md hover:bg-slate-900 transition-colors shadow-sm flex justify-center"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Modifications'}
                </button>
                <button 
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-md hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
