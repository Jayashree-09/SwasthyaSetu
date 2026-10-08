import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Building2,
  Stethoscope,
  User,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Compass,
  Coins,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import TokenCard from '../components/TokenCard.jsx';
import GovtPaymentGatewayModal from '../components/GovtPaymentGatewayModal.jsx';

export default function BookTokenPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State
  const [selectedHospitalId, setSelectedHospitalId] = useState(searchParams.get('hospitalId') || 'hosp-01');
  const [selectedDeptId, setSelectedDeptId] = useState(searchParams.get('deptId') || 'dept-gm');
  const [patientName, setPatientName] = useState(user?.fullName || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [patientAge, setPatientAge] = useState(user?.age ? String(user.age) : '42');
  const [patientGender, setPatientGender] = useState(user?.gender || 'Male');
  const [abhaId, setAbhaId] = useState(user?.abhaId || '');
  const [symptoms, setSymptoms] = useState('');
  const [slot, setSlot] = useState('Morning (09:00 AM - 01:00 PM)');

  // Submission & Payment State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedToken, setGeneratedToken] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [hospRes, deptRes] = await Promise.all([
        api.getHospitals(),
        api.getDepartments()
      ]);
      setHospitals(hospRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (err) {
      console.error('Failed to load hospitals and departments:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!patientName.trim() || !patientPhone.trim()) {
      setErrorMsg('Please enter patient name and contact mobile number.');
      return;
    }

    if (!selectedHospitalId || !selectedDeptId) {
      setErrorMsg('Please select a hospital and OPD department.');
      return;
    }

    // Open Government Health OPD Payment Gateway
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    setIsPaymentModalOpen(false);
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.createToken({
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientAge: parseInt(patientAge, 10) || 30,
        patientGender,
        hospitalId: selectedHospitalId,
        departmentId: selectedDeptId,
        slot,
        symptoms: symptoms.trim() || 'General OPD consultation',
        fee: paymentDetails.fee,
        paymentStatus: paymentDetails.paymentStatus,
        paymentMethod: paymentDetails.paymentMethod,
        transactionId: paymentDetails.transactionId,
        paidAt: paymentDetails.paidAt
      });

      setGeneratedToken(res.data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to generate token. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Loading hospital booking options...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
          Online Outpatient Registration
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          {language === 'kn' ? 'ಡಿಜಿಟಲ್ ಒಪಿಡಿ ಟೋಕನ್ ಕಾಯ್ದಿರಿಸಿ' : 'Generate Digital OPD Token'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {language === 'kn'
            ? 'ಕರ್ನಾಟಕದ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳಿಗೆ ಉಚಿತ ಆನ್‌ಲೈನ್ ಒಪಿಡಿ ಕ್ಯೂ ಪಾಸ್ ಪಡೆಯಿರಿ.'
            : 'Skip the morning registration queue. Book an official token pass before visiting.'}
        </p>
      </div>

      {generatedToken ? (
        /* Success Screen */
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-emerald-900">
                {language === 'kn' ? 'ಟೋಕನ್ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!' : 'Token Generated Successfully!'}
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your queue position has been registered. Please present this digital pass at the Digital Express Counter.
              </p>
            </div>
          </div>

          <TokenCard token={generatedToken} />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 flex-wrap">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <Link
                to={`/live-queue?hospitalId=${generatedToken.hospitalId}&deptId=${generatedToken.departmentId}`}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg shadow-sm text-center transition-colors"
              >
                Track Live Queue →
              </Link>

              <Link
                to={`/hospital-navigator?dept=${generatedToken.departmentId}&token=${encodeURIComponent(generatedToken.tokenNumber)}`}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs rounded-lg text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-700" />
                <span>{language === 'kn' ? 'ನಕ್ಷೆಯಲ್ಲಿ ಕೊಠಡಿ ನೋಡಿ' : 'Floor Plan & Room'}</span>
              </Link>
            </div>

            <button
              onClick={() => {
                setGeneratedToken(null);
                setSymptoms('');
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg text-center transition-colors"
            >
              Book Another Token
            </button>
          </div>
        </div>
      ) : (
        /* Booking Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Hospital and Department */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              01. Hospital & Department Selection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Government Hospital *
                </label>
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                  required
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    OPD Department *
                  </label>
                  <Link
                    to="/ai-assistant"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Unsure? Ask AI</span>
                  </Link>
                </div>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                  required
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Patient Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              02. Patient Identity & Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient full name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number (SMS Updates) *
                </label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="115"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ABHA Health ID / Ration Card (Optional)
                </label>
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="e.g. 91-4567-8912-3456"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Symptoms & Time Slot */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              03. Chief Complaint & Consultation Slot
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Brief Description of Symptoms / Reason for Visit
              </label>
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. Low grade fever and dry cough since 4 days; severe joint pain when walking"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                OPD Slot Timing
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-3 rounded-lg border border-emerald-600 bg-emerald-50/50 cursor-pointer">
                  <input
                    type="radio"
                    name="slotRadio"
                    checked={slot.includes('Morning')}
                    onChange={() => setSlot('Morning (09:00 AM - 01:00 PM)')}
                    className="text-emerald-700 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">Morning OPD</span>
                    <span className="text-[11px] text-slate-500">09:00 AM - 01:00 PM (Active)</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="slotRadio"
                    checked={slot.includes('Afternoon')}
                    onChange={() => setSlot('Afternoon (02:00 PM - 04:00 PM)')}
                    className="text-emerald-700 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">Afternoon Follow-up</span>
                    <span className="text-[11px] text-slate-500">02:00 PM - 04:00 PM</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Government OPD Fee Information Notice */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
              <Coins className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-emerald-950">
                    {language === 'kn'
                      ? 'ಸರ್ಕಾರಿ ಒಪಿಡಿ ನೋಂದಣಿ ಶುಲ್ಕ: ₹10 (ಸಾಮಾನ್ಯ) / ₹20 (ವಿಶೇಷ)'
                      : 'Government OPD Registration Fee: ₹10 (General) / ₹20 (Specialty)'}
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                    UPI / RuPay / NHA
                  </span>
                </div>
                <p className="text-emerald-800 mt-1 leading-relaxed">
                  {language === 'kn'
                    ? 'ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಒಪಿಡಿ ಟೋಕನ್‌ಗೆ ₹10 ಅಥವಾ ₹20 ನಾಮಮಾತ್ರ ಶುಲ್ಕವಿರುತ್ತದೆ. ಯುಪಿಐ ಅಥವಾ ರುಪೇ ಕಾರ್ಡ್ ಮೂಲಕ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಪಾವತಿಸಿ ಆಸ್ಪತ್ರೆಯ ನಗದು ಕೌಂಟರ್ ಕ್ಯೂ ತಪ್ಪಿಸಿ. ಆಯುಷ್ಮಾನ್ ಭಾರತ್ / ಬಿಪಿಎಲ್ ಕಾರ್ಡ್‌ದಾರರಿಗೆ 100% ಉಚಿತ.'
                    : 'A nominal ₹10 (General) or ₹20 (Specialty) registration fee applies per Health Department norms. Pay online via UPI or RuPay Card to bypass registration queues upon arrival, or claim 100% free exemption with ABHA / PM-JAY.'}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official Karnataka Health Treasury Payment Gateway · 256-Bit SSL</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Processing Digital Token...</span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {language === 'kn'
                      ? 'ಶುಲ್ಕ ಪಾವತಿಸಿ ಟೋಕನ್ ಪಡೆಯಿರಿ (₹10/₹20)'
                      : 'Proceed to Pay & Generate Token (₹10/₹20)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Government Health OPD Payment Gateway Modal */}
      <GovtPaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingDetails={{
          patientName: patientName.trim(),
          patientPhone: patientPhone.trim(),
          hospitalId: selectedHospitalId,
          hospitalName: hospitals.find((h) => h.id === selectedHospitalId)?.name || 'Victoria Hospital (BMCRI)',
          departmentId: selectedDeptId,
          departmentName: departments.find((d) => d.id === selectedDeptId)?.name || 'General Medicine',
          departmentCode: departments.find((d) => d.id === selectedDeptId)?.code || 'GM',
          appointmentDate: new Date().toISOString().split('T')[0],
          abhaId: abhaId
        }}
        onPaymentComplete={handlePaymentSuccess}
      />
    </div>
  );
}
