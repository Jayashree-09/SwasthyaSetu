import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

import EmergencyBanner from './components/EmergencyBanner.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import HomePage from './pages/HomePage.jsx';
import HospitalsPage from './pages/HospitalsPage.jsx';
import HospitalDetailPage from './pages/HospitalDetailPage.jsx';
import DepartmentsPage from './pages/DepartmentsPage.jsx';
import BookTokenPage from './pages/BookTokenPage.jsx';
import LiveQueuePage from './pages/LiveQueuePage.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AIAssistantPage from './pages/AIAssistantPage.jsx';
import SymptomCheckerPage from './pages/SymptomCheckerPage.jsx';
import HospitalNavigatorPage from './pages/HospitalNavigatorPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            <EmergencyBanner />
            <Navbar />
            <main className="grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/hospitals" element={<HospitalsPage />} />
                <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/book-token" element={<BookTokenPage />} />
                <Route path="/live-queue" element={<LiveQueuePage />} />
                <Route path="/hospital-navigator" element={<HospitalNavigatorPage />} />
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/staff/dashboard" element={<StaffDashboard />} />
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/ai-assistant" element={<AIAssistantPage />} />
                <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
