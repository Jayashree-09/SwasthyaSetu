import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext();

const DEMO_USERS = {
  patient: {
    id: 'usr-patient',
    fullName: 'Basavaraj Patil',
    email: 'patient@swasthyasetu.gov.in',
    phone: '9845012345',
    role: 'patient',
    gender: 'Male',
    age: 52,
    abhaId: '91-4567-8912-3456',
    district: 'Bengaluru Urban',
    taluk: 'Bengaluru South'
  },
  staff: {
    id: 'usr-staff',
    fullName: 'Sunitha K. (OPD Counter Staff)',
    email: 'staff@swasthyasetu.gov.in',
    phone: '9880011223',
    role: 'staff',
    hospitalId: 'hosp-01',
    hospitalName: 'Victoria Hospital (BMCRI)',
    counterNumber: 'Counter 3 - General OPD'
  },
  doctor: {
    id: 'usr-doctor',
    fullName: 'Dr. Ramesh Babu, MD',
    email: 'doctor@swasthyasetu.gov.in',
    phone: '9448099887',
    role: 'doctor',
    doctorId: 'doc-01',
    hospitalId: 'hosp-01',
    departmentId: 'dept-gm',
    departmentName: 'General Medicine'
  },
  admin: {
    id: 'usr-admin',
    fullName: 'Dr. S. Nagaraj (Medical Superintendent)',
    email: 'admin@swasthyasetu.gov.in',
    phone: '9900112233',
    role: 'admin',
    hospitalId: 'hosp-01'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('swasthya_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEMO_USERS.patient;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('swasthya_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('swasthya_user');
    }
  }, [user]);

  const login = async (email, role) => {
    setLoading(true);
    try {
      const res = await api.login({ email, role });
      setUser(res.user);
      localStorage.setItem('swasthya_auth_token', res.token);
      return res.user;
    } catch (err) {
      // fallback to demo role
      const fallbackUser = DEMO_USERS[role] || DEMO_USERS.patient;
      setUser(fallbackUser);
      return fallbackUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.register(userData);
      setUser(res.user);
      localStorage.setItem('swasthya_auth_token', res.token);
      return res.user;
    } catch (err) {
      const newUser = {
        id: 'usr-' + Date.now(),
        ...userData,
        role: 'patient'
      };
      setUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('swasthya_auth_token');
    localStorage.removeItem('swasthya_user');
  };

  // Quick switch for reviewers & demonstrations
  const switchRole = (role) => {
    if (DEMO_USERS[role]) {
      setUser(DEMO_USERS[role]);
      localStorage.setItem('swasthya_auth_token', 'jwt-mock-token-' + role);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
