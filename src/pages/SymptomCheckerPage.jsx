import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Stethoscope,
  ShieldCheck,
  AlertTriangle,
  Clock,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import SymptomChecker from '../components/SymptomChecker.jsx';

export default function SymptomCheckerPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </span>
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            Government Outpatient Clinical Triage
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          {language === 'kn'
            ? 'ಎಐ ರೋಗಲಕ್ಷಣ ತಪಾಸಣೆ ಮತ್ತು ಒಪಿಡಿ ಮಾರ್ಗದರ್ಶನ'
            : 'AI Symptom Checker & Department Guide'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
          {language === 'kn'
            ? 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳನ್ನು ಚಾಟ್‌ನಲ್ಲಿ ವಿವರಿಸಿ. ನಮ್ಮ ಎಐ ಸಹಾಯಕ ಸೂಕ್ತವಾದ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಯ ಒಪಿಡಿ ವಿಭಾಗವನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತದೆ.'
            : 'Describe your symptoms in natural language. Our clinical guidance AI recommends the exact hospital outpatient department to book an appointment for.'}
        </p>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Columns: Symptom Checker Chat Interface */}
        <div className="lg:col-span-8">
          <SymptomChecker />
        </div>

        {/* Right 4 Columns: Guidelines & Hospital Rules Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Emergency Notice */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-950 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Life-Threatening Emergency?</span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed font-medium">
              If experiencing acute chest pressure, sudden breathing difficulty, snakebite, unconsciousness or heavy trauma, DO NOT wait for an online OPD token.
            </p>
            <a
              href="tel:108"
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 108 Ambulance Now</span>
            </a>
          </div>

          {/* How Triage Works */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900">
              How AI OPD Triage Works
            </h3>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Describe in your own words:</strong> Tell the assistant your symptoms, duration, and patient age.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Clinical Department Mapping:</strong> The system maps complaints to General Medicine, Pediatrics, Orthopedics, OBG, ENT, etc.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Direct Token Booking:</strong> Click the recommendation button to reserve your token without retyping details.
                </span>
              </li>
            </ul>
          </div>

          {/* OPD Operating Hours */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>OPD Consultation Hours</span>
            </div>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>General OPD:</span>
                <span className="font-semibold text-slate-800">8:30 AM - 1:30 PM (Mon-Sat)</span>
              </div>
              <div className="flex justify-between">
                <span>Emergency Casualty:</span>
                <span className="font-semibold text-rose-700">24x7 Open</span>
              </div>
              <div className="flex justify-between">
                <span>Registration Fee:</span>
                <span className="font-semibold text-emerald-700">100% Free (AB-ArK)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
