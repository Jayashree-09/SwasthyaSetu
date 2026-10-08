import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Compass, Building2, MapPin, ArrowLeft, ShieldCheck, Ticket } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import HospitalNavigator from '../components/HospitalNavigator.jsx';

export default function HospitalNavigatorPage() {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const deptId = searchParams.get('dept');
  const tokenNum = searchParams.get('token');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link to="/" className="hover:text-slate-900">
            {language === 'kn' ? 'ಮುಖಪುಟ' : 'Home'}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">
            {language === 'kn' ? 'ಆಸ್ಪತ್ರೆ ನಕ್ಷೆ (ಫ್ಲೋರ್ ಪ್ಲಾನ್)' : 'Hospital Navigator'}
          </span>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'kn' ? 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ' : 'Back to Home'}</span>
        </Link>
      </div>

      {/* Main Floor Plan Component */}
      <HospitalNavigator
        initialDepartmentId={deptId}
        initialTokenNumber={tokenNum}
        standalone={true}
      />
    </div>
  );
}
