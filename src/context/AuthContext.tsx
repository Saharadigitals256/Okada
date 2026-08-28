import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserType, CurrencyCode } from '../types/okada.types';
import { dbGetProfile, dbSaveProfile } from '../services/supabase';

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: UserType) => Promise<Profile>;
  signup: (fullName: string, email: string, phone: string, role: UserType, currency?: CurrencyCode) => Promise<Profile>;
  logout: () => void;
  switchRole: (role: UserType) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'okada_auth_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const savedId = localStorage.getItem(AUTH_USER_KEY) || 'user_rider_musa';
        const profile = await dbGetProfile(savedId);
        if (profile) {
          setUser(profile);
        } else {
          // Default to demo rider Musa
          const defaultRider: Profile = {
            id: 'user_rider_musa',
            email: 'musa.rider@okadapay.africa',
            full_name: 'Musa Ibrahim',
            phone_number: '+234 803 123 4567',
            wallet_address: 'GAK3MUSA54OKADARIDERTESTNETWALLETADDRESS99',
            user_type: 'rider',
            currency_preference: 'NGN',
            created_at: new Date().toISOString(),
          };
          await dbSaveProfile(defaultRider);
          setUser(defaultRider);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, role: UserType = 'rider'): Promise<Profile> => {
    setIsLoading(true);
    try {
      // Look for existing profile or create quick demo profile
      const id = email.includes('passenger') ? 'user_passenger_amaka' : 'user_rider_musa';
      let profile = await dbGetProfile(id);
      if (!profile) {
        profile = {
          id: `user_${Date.now()}`,
          email,
          full_name: email.split('@')[0],
          user_type: role,
          currency_preference: 'NGN',
          created_at: new Date().toISOString(),
        };
        await dbSaveProfile(profile);
      }
      localStorage.setItem(AUTH_USER_KEY, profile.id);
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    fullName: string,
    email: string,
    phone: string,
    role: UserType,
    currency: CurrencyCode = 'NGN'
  ): Promise<Profile> => {
    setIsLoading(true);
    try {
      const newProfile: Profile = {
        id: `user_${Date.now()}`,
        email,
        full_name: fullName,
        phone_number: phone,
        user_type: role,
        currency_preference: currency,
        created_at: new Date().toISOString(),
      };
      await dbSaveProfile(newProfile);
      localStorage.setItem(AUTH_USER_KEY, newProfile.id);
      setUser(newProfile);
      return newProfile;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  };

  const switchRole = async (newRole: UserType) => {
    if (!user) return;
    const updated = { ...user, user_type: newRole };
    await dbSaveProfile(updated);
    setUser(updated);
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<Profile> => {
    if (!user) throw new Error('No authenticated user');
    const updated = { ...user, ...updates };
    await dbSaveProfile(updated);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
