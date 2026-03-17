import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { loginProvider, createProvider, getMe } from '../lib/api';

interface AuthContextType {
  user: { email?: string } | null;
  token: string | null;
  loading: boolean;
  signUp: (email: string, password: string, extra?: any) => Promise<{ user: any | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ user: any | null; error: Error | null }>;
  signOut: () => Promise<void>;
  setUserProfile: (profile: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('provider_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // initialize from localStorage
    const t = localStorage.getItem('provider_token');
    const email = localStorage.getItem('provider_email');
    if (t) setToken(t);
    // if we have a token, try to fetch full profile
    (async () => {
      if (t) {
        try {
          const profile = await getMe();
          setUser(profile || (email ? { email } : null));
        } catch (err) {
          // token may be invalid; clear it
          localStorage.removeItem('provider_token');
          localStorage.removeItem('provider_email');
          setToken(null);
          setUser(email ? { email } : null);
        }
      } else {
        if (email) setUser({ email });
      }
      setLoading(false);
    })();
  }, []);

  const signUp = async (email: string, password: string, extra: any = {}) => {
    try {
      // create provider via backend
      await createProvider({ email, password, ...extra });
      // automatically sign in
      const { token } = await loginProvider(email, password);
      localStorage.setItem('provider_token', token);
      localStorage.setItem('provider_email', email);
      setToken(token);
      // set basic user immediately so UI can navigate quickly; fetch full profile in background
      setUser({ email });
      (async () => {
        try {
          const profile = await getMe();
          setUser(profile || { email });
        } catch (e) {
          // ignore
        }
      })();
      return { user: { email }, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { token } = await loginProvider(email, password);
      localStorage.setItem('provider_token', token);
      localStorage.setItem('provider_email', email);
      setToken(token);
      // set basic user immediately so navigation can happen fast
      setUser({ email });
      // fetch full profile in background (do not block navigation)
      (async () => {
        try {
          const profile = await getMe();
          setUser(profile || { email });
        } catch (e) {
          // ignore
        }
      })();
      return { user: { email }, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  };

  const setUserProfile = (profile: any) => {
    if (!profile) return;
    setUser(profile);
    if (profile.email) localStorage.setItem('provider_email', profile.email);
  };

  const signOut = async () => {
    localStorage.removeItem('provider_token');
    localStorage.removeItem('provider_email');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signUp, signIn, signOut, setUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
