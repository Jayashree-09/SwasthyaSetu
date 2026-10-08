import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  User,
  Stethoscope,
  Phone,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Loader2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  QrCode,
  Compass,
  Coins,
  ShieldCheck,
  CreditCard,
  Lock,
  Receipt
} from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { downloadTokenPDF } from '../services/pdfGenerator.js';
import GovtPaymentGatewayModal from './GovtPaymentGatewayModal.jsx';

export default function OPDBooking({ initialDepartmentId = 'dept-gm', onBookingComplete }) {
  const { language } = useLanguage();
  const { user } = useAuth();

  // Form Fields
  const [patientName, setPatientName] = useState(user?.fullName || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [selectedDepartment, setSelectedDepartment] = useState(initialDepartmentId);
  const [appointmentDate, setAppointmentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedHospital, setSelectedHospital] = useState('hosp-01');
  const [chiefComplaint, setChiefComplaint] = useState('');

  // Status & Data
  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Government OPD Payment Gateway State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [feeCategory, setFeeCategory] = useState(10); // 10 (General) | 20 (Specialty) | 0 (ABHA Exempt)

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [deptRes, hospRes] = await Promise.all([
        api.getDepartments(),
        api.getHospitals()
      ]);
      setDepartments(deptRes.data || []);
      setHospitals(hospRes.data || []);
      if (deptRes.data?.length > 0 && !selectedDepartment) {
        setSelectedDepartment(deptRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch departments/hospitals:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!patientName.trim()) {
      setErrorMessage(
        language === 'kn' ? 'ದಯವಿಟ್ಟು ರೋಗಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.' : 'Please enter the patient name.'
      );
      return;
    }

    if (!selectedDepartment) {
      setErrorMessage(
        language === 'kn' ? 'ದಯವಿಟ್ಟು ವಿಭಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ.' : 'Please select an OPD department.'
      );
      return;
    }

    if (!appointmentDate) {
      setErrorMessage(
        language === 'kn' ? 'ದಯವಿಟ್ಟು ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ.' : 'Please select an appointment date.'
      );
      return;
    }

    // Open Government OPD Payment Gateway modal
    setIsPaymentModalOpen(true);
  };

  // Called when payment is successfully authorized in the Payment Gateway Modal
  const handlePaymentSuccess = async (paymentDetails) => {
    setIsPaymentModalOpen(false);
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const currentDeptObj = departments.find((d) => d.id === selectedDepartment);
      const currentHospObj = hospitals.find((h) => h.id === selectedHospital) || hospitals[0];

      // Submit token to backend API with official fee & payment receipt
      const res = await api.createToken({
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim() || '9845012345',
        patientAge: 40,
        patientGender: 'Not Specified',
        hospitalId: selectedHospital,
        departmentId: selectedDepartment,
        slot: 'Morning OPD (09:00 AM - 01:00 PM)',
        date: appointmentDate,
        symptoms: chiefComplaint.trim() || 'General OPD Consultation',
        fee: paymentDetails.fee,
        paymentStatus: paymentDetails.paymentStatus,
        paymentMethod: paymentDetails.paymentMethod,
        transactionId: paymentDetails.transactionId,
        paidAt: paymentDetails.paidAt
      });

      const bookedResult = {
        tokenNumber: res.data?.tokenNumber || `${currentDeptObj?.code || 'GM'}-0${Math.floor(10 + Math.random() * 80)}`,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim() || '9845012345',
        patientAge: user?.age || '42',
        patientGender: user?.gender || 'Not Specified',
        abhaId: user?.abhaId || '',
        departmentId: selectedDepartment,
        departmentName: currentDeptObj?.name || 'General Medicine',
        departmentCode: currentDeptObj?.code || 'GM',
        hospitalName: currentHospObj?.name || 'Victoria Hospital (BMCRI)',
        appointmentDate: appointmentDate,
        date: appointmentDate,
        slot: 'Morning OPD (09:00 AM - 01:00 PM)',
        symptoms: chiefComplaint.trim() || 'General OPD Consultation',
        status: 'ACTIVE - WAITING',
        sequenceNumber: res.data?.sequenceNumber || Math.floor(1 + Math.random() * 8),
        bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        // Payment Receipt Fields
        fee: paymentDetails.fee,
        paymentStatus: paymentDetails.paymentStatus,
        paymentMethod: paymentDetails.paymentMethod,
        transactionId: paymentDetails.transactionId,
        paidAt: paymentDetails.paidAt
      };

      setSuccessData(bookedResult);
      if (onBookingComplete) {
        onBookingComplete(bookedResult);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit OPD appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!successData) return;
    try {
      setIsDownloadingPdf(true);
      await downloadTokenPDF(successData, language);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to download token PDF:', err);
      alert('Failed to generate token PDF: ' + err.message);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setChiefComplaint('');
    setErrorMessage('');
    setDownloadSuccess(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Component Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 sm:p-8">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Calendar className="w-4 h-4" />
          <span>{language === 'kn' ? 'ಆನ್‌ಲೈನ್ ನೋಂದಣಿ' : 'Direct Outpatient Booking'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {language === 'kn' ? 'ಒಪಿಡಿ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕಿಂಗ್' : 'OPD Appointment Booking'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xl">
          {language === 'kn'
            ? 'ನಿಮ್ಮ ಹೆಸರು ನಮೂದಿಸಿ, ಸೂಕ್ತ ವಿಭಾಗ ಮತ್ತು ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಡಿಜಿಟಲ್ ಟೋಕನ್ ಪಡೆಯಿರಿ.'
            : 'Enter patient details, choose an outpatient specialty and appointment date to generate an official digital token pass.'}
        </p>
      </div>

      <div className="p-6 sm:p-8">
        {/* SUCCESS MESSAGE DISPLAY UPON SUBMISSION */}
        {successData ? (
          <div className="space-y-6">
            {/* Top Success Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-emerald-950">
                    {language === 'kn'
                      ? 'ಒಪಿಡಿ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ!'
                      : 'OPD Appointment Booked Successfully!'}
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    {language === 'kn'
                      ? 'ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಟೋಕನ್ ಕ್ಯೂ ಪಾಸ್ ರಚನೆಯಾಗಿದೆ. ಆಸ್ಪತ್ರೆಗೆ ತೆರಳಿದಾಗ ಕೌಂಟರ್‌ನಲ್ಲಿ ಈ ಸಂಖ್ಯೆಯನ್ನು ತಿಳಿಸಿ.'
                      : 'Your appointment is registered in the hospital live queue roster. Present your token pass at the express desk.'}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-200/80 text-emerald-900 border border-emerald-300">
                Verified Active
              </span>
            </div>

            {/* Generated Token Pass Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    Government of Karnataka · Official OPD Pass
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white mt-1">
                    {successData.tokenNumber}
                  </div>
                </div>

                <div className="p-2.5 bg-white text-slate-900 rounded-xl inline-flex items-center gap-3 self-start sm:self-auto">
                  <QrCode className="w-10 h-10 text-slate-900" />
                  <div className="text-[11px] leading-tight text-left">
                    <strong className="block font-bold">Express QR Scan</strong>
                    <span className="text-slate-500">Fast-track Counter</span>
                  </div>
                </div>
              </div>

              {/* Patient and Appointment Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-6 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                    {language === 'kn' ? 'ರೋಗಿಯ ಹೆಸರು' : 'Patient Name'}
                  </span>
                  <span className="text-base font-extrabold text-white mt-0.5 block">
                    {successData.patientName}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                    {language === 'kn' ? 'ಒಪಿಡಿ ವಿಭಾಗ' : 'Specialty Department'}
                  </span>
                  <span className="text-base font-extrabold text-emerald-400 mt-0.5 block">
                    {successData.departmentName} ({successData.departmentCode})
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                    {language === 'kn' ? 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದಿನಾಂಕ' : 'Appointment Date'}
                  </span>
                  <span className="text-base font-extrabold text-white mt-0.5 block">
                    {successData.appointmentDate}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                    {language === 'kn' ? 'ಆಸ್ಪತ್ರೆ' : 'Hospital'}
                  </span>
                  <span className="text-sm font-semibold text-slate-200 mt-0.5 block">
                    {successData.hospitalName}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                    {language === 'kn' ? 'ಸಮಯದ ಸ್ಲಾಟ್' : 'OPD Timing'}
                  </span>
                  <span className="text-sm font-semibold text-slate-200 mt-0.5 block">
                    {successData.slot}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                    {language === 'kn' ? 'ಒಪಿಡಿ ನೋಂದಣಿ ಶುಲ್ಕ' : 'Registration Fee'}
                  </span>
                  <span className="text-sm font-bold text-emerald-300 mt-0.5 block">
                    {successData.fee === 0 || successData.paymentStatus === 'EXEMPT'
                      ? '₹0.00 (ABHA Waived)'
                      : `₹${successData.fee || 10}.00 (${successData.paymentStatus === 'PAY_AT_COUNTER' ? 'Pay at Counter' : 'PAID ONLINE'})`}
                  </span>
                </div>
              </div>

              {/* Official Treasury Payment Receipt Strip */}
              <div className="mt-5 p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-emerald-300 text-xs uppercase tracking-wide">
                      {language === 'kn' ? 'ಸರ್ಕಾರಿ ಖಜಾನೆ ಪಾವತಿ ರಶೀದಿ (e-Hospital)' : 'Official Treasury Payment Receipt (e-Hospital)'}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    successData.paymentStatus === 'PAY_AT_COUNTER'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500 text-slate-900 shadow-2xs font-extrabold'
                  }`}>
                    {successData.paymentStatus === 'PAY_AT_COUNTER' ? 'PAY AT COUNTER' : 'PAID · VERIFIED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Amount</span>
                    <span className="font-bold text-white">₹{successData.fee !== undefined ? successData.fee : 10}.00</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Payment Mode</span>
                    <span className="font-semibold text-slate-200">{successData.paymentMethod || 'UPI / BHIM'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Transaction ID</span>
                    <span className="font-mono text-emerald-400 truncate">{successData.transactionId || 'CASH AT DESK'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Auth Authority</span>
                    <span className="font-medium text-slate-300">GOK Health Dept</span>
                  </div>
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {language === 'kn'
                    ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸ್ಲಾಟ್‌ಗಿಂತ 15 ನಿಮಿಷ ಮುಂಚಿತವಾಗಿ ಡಿಜಿಟಲ್ ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಕೌಂಟರ್‌ನಲ್ಲಿ ಹಾಜರಿರಿ. ಲೈವ್ ಕ್ಯೂ ಪುಟದಲ್ಲಿ ನಿಮ್ಮ ಸರದಿ ಸಂಖ್ಯೆಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಬಹುದು.'
                    : 'Please arrive at the Digital Express Registration desk 15 minutes before your estimated slot. You can track this token live under the Live Queue tab.'}
                </p>
              </div>
            </div>

            {/* Download Success Confirmation */}
            {downloadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  {language === 'kn'
                    ? 'ಪಿಡಿಎಫ್ ಟೋಕನ್ ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ! ಕೌಂಟರ್‌ನಲ್ಲಿ ಇದನ್ನು ತೋರಿಸಿ.'
                    : 'Digital token PDF downloaded successfully! Show this file at the Express Registration Counter.'}
                </span>
              </div>
            )}

            {/* Actions: Download PDF, Print and Book Another */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPdf}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                  title="Download formatted digital OPD token PDF to show at registration counter"
                >
                  {isDownloadingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'kn' ? 'ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Generating PDF...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{language === 'kn' ? 'ಪಿಡಿಎಫ್ ಟೋಕನ್ ಡೌನ್‌ಲೋಡ್' : 'Download PDF Token'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>{language === 'kn' ? 'ಟೋಕನ್ ಮುದ್ರಿಸಿ' : 'Print Token'}</span>
                </button>

                <Link
                  to={`/hospital-navigator?dept=${successData?.departmentId || departmentId}&token=${encodeURIComponent(successData?.tokenNumber || '')}`}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'kn' ? 'ನಕ್ಷೆಯಲ್ಲಿ ಕೊಠಡಿ ನೋಡಿ' : 'Locate on Floor Plan'}</span>
                </Link>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2"
              >
                <span>{language === 'kn' ? 'ಇನ್ನೊಂದು ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ' : 'Book Another Appointment'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* OPD BOOKING FORM */
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              {/* Field 1: Patient Name */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1.5">
                  {language === 'kn' ? 'ರೋಗಿಯ ಪೂರ್ಣ ಹೆಸರು *' : 'Patient Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder={language === 'kn' ? 'ರೋಗಿಯ ಹೆಸರು ನಮೂದಿಸಿ' : 'e.g., Basavaraj Patil'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Field 2: Select Department Dropdown */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  {language === 'kn' ? 'ಒಪಿಡಿ ವಿಭಾಗ ಆಯ್ಕೆಮಾಡಿ *' : 'Select OPD Department *'}
                </label>
                <div className="relative">
                  <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <select
                    required
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-xs sm:text-sm font-medium appearance-none cursor-pointer"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {language === 'kn' && dept.nameKn ? dept.nameKn : dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 3: Choose Appointment Date */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  {language === 'kn' ? 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ *' : 'Appointment Date *'}
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                  />
                </div>
              </div>

              {/* Field 4: Select Hospital */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  {language === 'kn' ? 'ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆ' : 'Government Hospital'}
                </label>
                <select
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-xs sm:text-sm"
                >
                  {hospitals.map((hosp) => (
                    <option key={hosp.id} value={hosp.id}>
                      {hosp.name} ({hosp.district})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 5: Patient Mobile Number */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  {language === 'kn' ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (ಎಸ್ಎಂಎಸ್ ಅಪ್ಡೇಟ್ಸ್)' : 'Mobile Number (SMS Updates)'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Field 6: Chief Complaint */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1.5">
                  {language === 'kn' ? 'ರೋಗಲಕ್ಷಣಗಳು / ಆರೋಗ್ಯ ಸಮಸ್ಯೆ (ಐಚ್ಛಿಕ)' : 'Chief Symptoms / Health Concern (Optional)'}
                </label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder={
                    language === 'kn'
                      ? 'ಉದಾ: ಕಳೆದ 3 ದಿನಗಳಿಂದ ಜ್ವರ, ಕೀಲು ನೋವು...'
                      : 'e.g., Fever since 3 days, joint stiffness, antenatal checkup...'
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-xs sm:text-sm"
                />
              </div>

              {/* Government OPD Fee Information Notice */}
              <div className="sm:col-span-2 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
                <Coins className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-emerald-950">
                      {language === 'kn'
                        ? 'ಸರ್ಕಾರಿ ಒಪಿಡಿ ನೋಂದಣಿ ಶುಲ್ಕ: ₹10 (ಸಾಮಾನ್ಯ) / ₹20 (ವಿಶೇಷ)'
                        : 'Government OPD Registration Fee: ₹10 (General) / ₹20 (Specialty)'}
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                      UPI / Bharat BillPay / NHA
                    </span>
                  </div>
                  <p className="text-emerald-800 mt-1 leading-relaxed">
                    {language === 'kn'
                      ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳ ನಿಯಮಾವಳಿಗಳಂತೆ, ಒಪಿಡಿ ಟೋಕನ್‌ಗೆ ₹10 ಅಥವಾ ₹20 ನಾಮಮಾತ್ರ ಶುಲ್ಕವಿರುತ್ತದೆ. ಯುಪಿಐ (PhonePe, GPay, Paytm) ಅಥವಾ ರುಪೇ ಕಾರ್ಡ್ ಮೂಲಕ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಪಾವತಿಸಿ ಕ್ಯೂ ತಪ್ಪಿಸಿ. ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಕಾರ್ಡ್‌ದಾರರಿಗೆ 100% ಉಚಿತ.'
                      : 'As per Health Department guidelines, OPD registration requires a nominal ₹10 or ₹20 fee. Pay securely via UPI (PhonePe, GPay, Paytm, BHIM) or RuPay Card to bypass the hospital counter queue, or claim 100% fee waiver with ABHA / PM-JAY.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submission Footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 text-center sm:text-left">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {language === 'kn'
                    ? 'ಸುರಕ್ಷಿತ ಪಾವತಿ ಗೇಟ್‌ವೇ · ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಇ-ಆಸ್ಪತ್ರೆ ರಶೀದಿ'
                    : 'Secure Govt Payment Gateway · Official e-Hospital Token Pass'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Processing Appointment...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {language === 'kn'
                        ? 'ಶುಲ್ಕ ಪಾವತಿಸಿ ಟೋಕನ್ ಪಡೆಯಿರಿ (₹10/₹20)'
                        : 'Proceed to Pay & Book Token (₹10/₹20)'}
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
            hospitalId: selectedHospital,
            hospitalName: hospitals.find((h) => h.id === selectedHospital)?.name || 'Victoria Hospital (BMCRI)',
            departmentId: selectedDepartment,
            departmentName: departments.find((d) => d.id === selectedDepartment)?.name || 'General Medicine',
            departmentCode: departments.find((d) => d.id === selectedDepartment)?.code || 'GM',
            appointmentDate,
            abhaId: user?.abhaId
          }}
          onPaymentComplete={handlePaymentSuccess}
        />
      </div>
    </div>
  );
}
