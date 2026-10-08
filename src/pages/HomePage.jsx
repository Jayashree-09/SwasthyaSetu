import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Building2,
  Sparkles,
  ArrowRight,
  Search,
  MapPin,
  Mic,
  ShieldCheck,
  Stethoscope,
  QrCode,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import VoiceMicModal from '../components/VoiceMicModal.jsx';
import Features from '../components/Features.jsx';
import OPDBooking from '../components/OPDBooking.jsx';
import HospitalNavigator from '../components/HospitalNavigator.jsx';

export default function HomePage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [symptomInput, setSymptomInput] = useState('');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [selectedHospitalTab, setSelectedHospitalTab] = useState('hosp-01');

  const handleSymptomSearch = (e) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;
    navigate(`/ai-assistant?symptoms=${encodeURIComponent(symptomInput.trim())}`);
  };

  const handleVoiceTranscription = (spokenText) => {
    setSymptomInput(spokenText);
    navigate(`/ai-assistant?symptoms=${encodeURIComponent(spokenText)}`);
  };

  const liveHospitalFeeds = [
    {
      id: 'hosp-01',
      name: 'Victoria Hospital (BMCRI)',
      district: 'Bengaluru Urban',
      currentToken: 'GM-042',
      department: 'General Medicine',
      waitingCount: 4,
      avgWait: '20 mins'
    },
    {
      id: 'hosp-02',
      name: 'K.C. General Hospital',
      district: 'Malleshwaram, Bengaluru',
      currentToken: 'PED-018',
      department: 'Pediatrics',
      waitingCount: 3,
      avgWait: '15 mins'
    },
    {
      id: 'hosp-04',
      name: 'Virajpet Taluk Hospital',
      district: 'Kodagu',
      currentToken: 'GM-014',
      department: 'General OPD',
      waitingCount: 2,
      avgWait: '10 mins'
    }
  ];

  const popularSymptomChips = [
    { en: 'Child with High Fever', kn: 'ಮಕ್ಕಳಿಗೆ ಜ್ವರ', dept: 'Pediatrics' },
    { en: 'Knee & Joint Pain', kn: 'ಕೀಲು ಮತ್ತು ಮೂಳೆ ನೋವು', dept: 'Orthopedics' },
    { en: 'Pregnancy Care Checkup', kn: 'ಗರ್ಭಿಣಿ ತಪಾಸಣೆ', dept: 'Obstetrics & Gynecology' },
    { en: 'Ear Discharge & Pain', kn: 'ಕಿವಿ ನೋವು', dept: 'ENT' },
    { en: 'Eye Irritation & Redness', kn: 'ಕಣ್ಣಿನ ನೋವು', dept: 'Ophthalmology' },
    { en: 'Skin Rash & Itching', kn: 'ಚರ್ಮದ ತುರಿಕೆ', dept: 'Dermatology' }
  ];

  const currentHospitalFeed =
    liveHospitalFeeds.find((h) => h.id === selectedHospitalTab) || liveHospitalFeeds[0];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 7 Columns: Hero Copy & Prominent Get OPD Token CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Karnataka State Official Attribution Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {language === 'kn'
                    ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ · ಆರೋಗ್ಯ ಮತ್ತು ಕುಟುಂಬ ಕಲ್ಯಾಣ ಇಲಾಖೆ'
                    : 'Government of Karnataka · Health & Family Welfare Department'}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
                {language === 'kn' ? (
                  <span>
                    ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆ <span className="text-emerald-400">ಒಪಿಡಿ ಟೋಕನ್</span> ಮತ್ತು ಲೈವ್ ಸರದಿ ಸಾಲು
                  </span>
                ) : (
                  <span>
                    Skip Hospital Queues. <br />
                    Get Your <span className="text-emerald-400">Digital OPD Token</span> Online.
                  </span>
                )}
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
                {language === 'kn'
                  ? 'ಬೆಳಗಿನ ಜಾವ ಆಸ್ಪತ್ರೆಯ ಕೌಂಟರ್‌ನಲ್ಲಿ ಸರದಿಯಲ್ಲಿ ನಿಲ್ಲುವ ದಿನಗಳು ಮುಗಿದಿವೆ. ಕರ್ನಾಟಕದ ತಾಲೂಕು, ಜಿಲ್ಲಾ ಮತ್ತು ವೈದ್ಯಕೀಯ ಕಾಲೇಜು ಆಸ್ಪತ್ರೆಗಳಿಗೆ ಮನೆಯಿಂದಲೇ ಅಧಿಕೃತ ಡಿಜಿಟಲ್ ಟೋಕನ್ ಕಾಯ್ದಿರಿಸಿ ಮತ್ತು ಲೈವ್ ಕ್ಯೂ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.'
                  : 'Digitizing outpatient registration across Karnataka government hospitals. Book digital tokens from home, check real-time queue positions on your mobile, and receive AI-guided department recommendations.'}
              </p>

              {/* HIGH-IMPACT PRIMARY CALL TO ACTION BUTTONS */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/book-token"
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2.5 group"
                >
                  <Calendar className="w-5 h-5 text-slate-950 group-hover:scale-110 transition-transform" />
                  <span>{language === 'kn' ? 'ಒಪಿಡಿ ಟೋಕನ್ ಪಡೆಯಿರಿ' : 'Get OPD Token Now'}</span>
                  <ArrowRight className="w-5 h-5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/live-queue"
                  className="w-full sm:w-auto px-6 py-4 bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm sm:text-base rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>{language === 'kn' ? 'ಲೈವ್ ಸರದಿ ಪರಿಶೀಲಿಸಿ' : 'Track Live Queue'}</span>
                </Link>
              </div>

              {/* Quick AI Search Bar in Hero */}
              <div className="pt-4 max-w-xl mx-auto lg:mx-0">
                <form
                  onSubmit={handleSymptomSearch}
                  className="bg-white rounded-2xl p-2 shadow-xl flex items-center gap-2 border border-slate-200"
                >
                  <div className="pl-3 text-slate-400">
                    <Search className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    placeholder={
                      language === 'kn'
                        ? 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಬರೆಯಿರಿ (ಉದಾ: ಕೀಲು ನೋವು, ಮಗುವಿಗೆ ಜ್ವರ)...'
                        : 'Describe symptoms (e.g. child fever, severe knee pain, earache)...'
                    }
                    className="w-full py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setIsVoiceOpen(true)}
                    className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0"
                    title={language === 'kn' ? 'ಧ್ವನಿ ಮೂಲಕ ಹೇಳಿ' : 'Speak into mic'}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-colors shrink-0 flex items-center gap-1"
                  >
                    <span>{language === 'kn' ? 'ವಿಭಾಗ ತಿಳಿಯಿರಿ' : 'Find OPD'}</span>
                  </button>
                </form>

                {/* Popular symptoms quick pills */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
                  <span className="text-slate-400">
                    {language === 'kn' ? 'ರೋಗಲಕ್ಷಣಗಳು:' : 'Quick route:'}
                  </span>
                  {popularSymptomChips.slice(0, 4).map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const term = language === 'kn' ? chip.kn : chip.en;
                        setSymptomInput(term);
                        navigate(`/ai-assistant?symptoms=${encodeURIComponent(term)}`);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                    >
                      {language === 'kn' ? chip.kn : chip.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Live Hospital Broadcast Snapshot */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/90 rounded-2xl border border-slate-700 p-5 shadow-2xl backdrop-blur relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Live Hospital OPD Broadcast
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Karnataka State</span>
                </div>

                {/* Hospital selector tabs */}
                <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 text-xs">
                  {liveHospitalFeeds.map((feed) => (
                    <button
                      key={feed.id}
                      onClick={() => setSelectedHospitalTab(feed.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors shrink-0 ${
                        selectedHospitalTab === feed.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {feed.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {/* Big Token Display */}
                <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Now Calling in OPD Room · {currentHospitalFeed.department}
                  </span>
                  <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight my-2">
                    {currentHospitalFeed.currentToken}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-300">
                    <span>
                      Ahead:{' '}
                      <strong className="text-white font-bold">
                        {currentHospitalFeed.waitingCount} patients
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      Est. Wait:{' '}
                      <strong className="text-white font-bold">
                        ~{currentHospitalFeed.avgWait}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Simulated Digital Token Pass Preview */}
                <div className="mt-4 p-3 bg-white text-slate-900 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-100 rounded border border-slate-200">
                      <QrCode className="w-9 h-9 text-slate-800" />
                    </div>
                    <div className="text-left text-xs">
                      <span className="font-extrabold text-slate-900 block text-sm">
                        Token #GM-043
                      </span>
                      <span className="text-slate-500 text-[11px] block">
                        Victoria Hospital · General Medicine
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/book-token"
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors shrink-0"
                  >
                    Get Pass
                  </Link>
                </div>
              </div>

              {/* Key Trust Metric Callouts */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="font-bold text-white text-sm sm:text-base">100% Free</div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Govt Healthcare</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="font-bold text-emerald-400 text-sm sm:text-base">&lt; 25 mins</div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Avg Wait Time</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="font-bold text-white text-sm sm:text-base">24x7</div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Casualty & 108</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOUR PRIMARY ACTION CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/book-token"
            className="group bg-white rounded-2xl p-6 border border-emerald-500/30 shadow-md hover:shadow-xl hover:border-emerald-600 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  STEP 01
                </span>
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-800 transition-colors">
                {t('actionBookToken')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('actionBookTokenDesc')}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
              <span>Book Pass Online</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/live-queue"
            className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-500 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  STEP 02
                </span>
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-amber-700 transition-colors">
                {t('actionCheckQueue')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('actionCheckQueueDesc')}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
              <span>View Live Waiting Roster</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/hospitals"
            className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  STEP 03
                </span>
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                {t('actionFindHospital')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('actionFindHospitalDesc')}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
              <span>Explore Hospitals</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/ai-assistant"
            className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-500 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  STEP 04
                </span>
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-purple-700 transition-colors">
                {t('actionAIAssist')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('actionAIAssistDesc')}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
              <span>Start AI Consultation</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. INSTANT OPD BOOKING COMPONENT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OPDBooking />
      </section>

      {/* 4. PLATFORM FEATURES COMPONENT (ICON CARDS FOR VISUAL ENGAGEMENT) */}
      <Features />

      {/* 5. HOSPITAL NAVIGATOR & FLOOR PLAN (SVG BLUEPRINT & WAYFINDING) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HospitalNavigator />
      </section>

      {/* 6. HOW IT WORKS FOR RURAL & ELDERLY CITIZENS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Elderly & Rural Friendly Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              {language === 'kn' ? 'ಸರಳ 4-ಹಂತಗಳ ಡಿಜಿಟಲ್ ಪ್ರಕ್ರಿಯೆ' : 'How SwasthyaSetu Works for Patients'}
            </h2>
            <p className="text-sm text-slate-300">
              No technical expertise required. Accessible in Kannada and English via mobile web.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-sm text-white pt-1">
                {language === 'kn' ? 'ಆಸ್ಪತ್ರೆ ಮತ್ತು ವಿಭಾಗ ಆಯ್ಕೆ' : '1. Choose Hospital & OPD'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'kn'
                  ? 'ನಿಮ್ಮ ತಾಲೂಕು ಅಥವಾ ಜಿಲ್ಲೆಯ ಆಸ್ಪತ್ರೆ ಆರಿಸಿ. ರೋಗಲಕ್ಷಣ ತಿಳಿಯದಿದ್ದಲ್ಲಿ ಎಐ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.'
                  : 'Select your local Taluk or District hospital. Use the AI guide if unsure which department handles your symptoms.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-sm text-white pt-1">
                {language === 'kn' ? 'ಡಿಜಿಟಲ್ ಟೋಕನ್ ಪಡೆಯಿರಿ' : '2. Instant Token Generation'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'kn'
                  ? 'ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ ಅಧಿಕೃತ ಟೋಕನ್ ಪಾಸ್ ಮತ್ತು ಕ್ಯೂಆರ್ ಕೋಡ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.'
                  : 'Enter basic patient details to receive an exact token (e.g. GM-043) with an official QR pass.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-sm text-white pt-1">
                {language === 'kn' ? 'ಲೈವ್ ಸರದಿ ಪರಿಶೀಲಿಸಿ' : '3. Track from Home'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'kn'
                  ? 'ಆಸ್ಪತ್ರೆಯ ಹೊರರೋಗಿ ಕೌಂಟರ್‌ನಲ್ಲಿ ಕಾಯುವ ಬದಲು ಮನೆಯಲ್ಲೇ ನಿಮ್ಮ ಸರದಿ ಎಷ್ಟು ದೂರವಿದೆ ಎಂದು ನೋಡಿ.'
                  : 'Monitor queue progression live. Travel to the hospital only when your estimated slot approaches.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center">
                4
              </span>
              <h4 className="font-bold text-sm text-white pt-1">
                {language === 'kn' ? 'ನೇರ ವೈದ್ಯರ ಭೇಟಿ' : '4. Express Lane Consultation'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'kn'
                  ? 'ಆಸ್ಪತ್ರೆಯ ಡಿಜಿಟಲ್ ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಕೌಂಟರ್‌ನಲ್ಲಿ ಟೋಕನ್ ಕ್ಯೂಆರ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿಸಿ ನೇರವಾಗಿ ವೈದ್ಯರ ಕೋಣೆಗೆ ತೆರಳಿ.'
                  : 'Scan your digital pass at the express desk and walk straight into the consultation chamber.'}
              </p>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-800 text-center">
            <Link
              to="/book-token"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base rounded-xl shadow-lg transition-colors"
            >
              <span>{language === 'kn' ? 'ಈಗಲೇ ಒಪಿಡಿ ಟೋಕನ್ ಪಡೆಯಿರಿ' : 'Get Your OPD Token Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. KARNATAKA GOVERNMENT HOSPITALS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Statewide Public Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {language === 'kn' ? 'ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳು' : 'Karnataka Government Hospitals'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Taluk Hospitals, District Hospitals, and Medical College Teaching Centers.
            </p>
          </div>

          <Link
            to="/hospitals"
            className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
          >
            <span>{language === 'kn' ? 'ಎಲ್ಲಾ ಆಸ್ಪತ್ರೆಗಳ ಪಟ್ಟಿ' : 'View all Karnataka hospitals'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Medical College Hospital
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Victoria Hospital (BMCRI)
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  OPD Open
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Fort Road, Near City Market, Bengaluru Urban
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>OPD Timings:</span>
                  <span className="font-semibold text-slate-800">8:30 AM - 1:30 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency:</span>
                  <span className="font-semibold text-rose-700">24x7 Casualty & Trauma</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link to="/hospitals/hosp-01" className="text-xs font-semibold text-slate-700 hover:text-slate-900">
                View Roster →
              </Link>
              <Link
                to="/book-token?hospitalId=hosp-01"
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors"
              >
                Book Token
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    General Hospital
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    K.C. General Hospital
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  OPD Open
                </span>
              </div>
              <p className="text-xs text-slate-500">
                5th Cross Road, Malleshwaram, Bengaluru
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>OPD Timings:</span>
                  <span className="font-semibold text-slate-800">9:00 AM - 1:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Maternity & NICU:</span>
                  <span className="font-semibold text-emerald-800">24x7 Active</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link to="/hospitals/hosp-02" className="text-xs font-semibold text-slate-700 hover:text-slate-900">
                View Roster →
              </Link>
              <Link
                to="/book-token?hospitalId=hosp-02"
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors"
              >
                Book Token
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Taluk General Hospital
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Virajpet Taluk Hospital
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  OPD Open
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Hospital Road, Virajpet, Kodagu District
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>OPD Timings:</span>
                  <span className="font-semibold text-slate-800">9:00 AM - 1:30 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency:</span>
                  <span className="font-semibold text-rose-700">24x7 Snakebite & Trauma</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link to="/hospitals/hosp-04" className="text-xs font-semibold text-slate-700 hover:text-slate-900">
                View Roster →
              </Link>
              <Link
                to="/book-token?hospitalId=hosp-04"
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors"
              >
                Book Token
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALLOUT: BOTTOM CTA TO GET OPD TOKEN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              Karnataka Health Mission
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {language === 'kn'
                ? 'ಆಸ್ಪತ್ರೆಗೆ ತೆರಳುವ ಮುನ್ನ ನಿಮ್ಮ ಟೋಕನ್ ಕಾಯ್ದಿರಿಸಿ'
                : 'Visiting a Karnataka Government Hospital Today?'}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Get an official queue token on your phone. Skip the registration lines and arrive directly when your consultation slot approaches.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/book-token"
              className="px-8 py-4 bg-white text-emerald-950 font-black text-sm sm:text-base rounded-xl shadow-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-5 h-5 text-emerald-800" />
              <span>{language === 'kn' ? 'ಒಪಿಡಿ ಟೋಕನ್ ಪಡೆಯಿರಿ' : 'Get OPD Token Now'}</span>
            </Link>
            <Link
              to="/live-queue"
              className="px-6 py-4 bg-emerald-900/80 hover:bg-emerald-900 text-white font-semibold text-sm rounded-xl border border-emerald-700 transition-colors"
            >
              {language === 'kn' ? 'ಲೈವ್ ಸರದಿ ಪರಿಶೀಲಿಸಿ' : 'Track Live Queue'}
            </Link>
          </div>
        </div>
      </section>

      {/* Voice Recognition Modal */}
      <VoiceMicModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onTranscriptionComplete={handleVoiceTranscription}
      />
    </div>
  );
}
