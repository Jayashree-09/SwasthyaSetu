import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  QrCode,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Smartphone,
  X,
  FileText,
  BadgeCheck,
  RefreshCw,
  Wallet,
  Coins
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { api } from '../services/api.js';

/**
 * Government Health OPD Payment Gateway Modal
 * Handles ₹10 / ₹20 OPD Registration Fee collection via UPI, RuPay Card,
 * Net Banking, Ayushman Bharat Exemption (₹0), or Pay at Hospital Counter.
 */
export default function GovtPaymentGatewayModal({
  isOpen,
  onClose,
  bookingDetails,
  onPaymentComplete
}) {
  const { language } = useLanguage();

  // Selected fee tier: 10 (General OPD), 20 (Specialty OPD), or 0 (ABHA / BPL Exempt)
  const defaultFee = bookingDetails?.departmentName?.toLowerCase().includes('cardio') ||
    bookingDetails?.departmentName?.toLowerCase().includes('ortho') ||
    bookingDetails?.departmentName?.toLowerCase().includes('neuro') ||
    bookingDetails?.departmentName?.toLowerCase().includes('derm') ||
    bookingDetails?.departmentName?.toLowerCase().includes('eye') ||
    bookingDetails?.departmentName?.toLowerCase().includes('ent')
    ? 20
    : 10;

  const [feeAmount, setFeeAmount] = useState(defaultFee);
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'abha' | 'counter'

  // UPI State
  const [upiId, setUpiId] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins countdown

  // Card State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpTimer, setOtpTimer] = useState(45);

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('SBI');

  // ABHA / Exemption State
  const [abhaNumber, setAbhaNumber] = useState(bookingDetails?.abhaId || '');
  const [abhaVerified, setAbhaVerified] = useState(false);

  // Processing & Feedback State
  const [processingState, setProcessingState] = useState(null); // null | 'authorizing' | 'confirming' | 'success'
  const [errorMsg, setErrorMsg] = useState('');

  // Reset or adjust fee when modal opens or department changes
  useEffect(() => {
    if (isOpen) {
      setFeeAmount(defaultFee);
      setActiveTab('upi');
      setProcessingState(null);
      setErrorMsg('');
      setShowOtpScreen(false);
      setTimerSeconds(300);
      if (bookingDetails?.abhaId) {
        setAbhaNumber(bookingDetails.abhaId);
      }
    }
  }, [isOpen, defaultFee, bookingDetails]);

  // Countdown timer for QR Code
  useEffect(() => {
    if (!isOpen || activeTab !== 'upi' || processingState) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab, processingState]);

  // OTP Timer
  useEffect(() => {
    if (!showOtpScreen || otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showOtpScreen, otpTimer]);

  if (!isOpen) return null;

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const timerFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  // Handle finalize successful payment
  const executePaymentSuccess = async (method, txnIdOverride, finalFee) => {
    setProcessingState('authorizing');
    setErrorMsg('');

    try {
      // Small realistic progression for citizen confidence
      await new Promise((r) => setTimeout(r, 650));
      setProcessingState('confirming');

      const amountToCharge = finalFee !== undefined ? finalFee : feeAmount;
      const res = await api.verifyPayment({
        amount: amountToCharge,
        method,
        patientName: bookingDetails?.patientName || 'Citizen',
        patientPhone: bookingDetails?.patientPhone || '9845012345',
        hospitalId: bookingDetails?.hospitalId || 'hosp-01'
      });

      const txnId = txnIdOverride || res.data?.transactionId || `TXN-GOK-${Math.floor(100000 + Math.random() * 900000)}`;

      await new Promise((r) => setTimeout(r, 550));
      setProcessingState('success');

      setTimeout(() => {
        onPaymentComplete({
          fee: amountToCharge,
          paymentStatus: amountToCharge === 0 ? 'EXEMPT' : 'PAID',
          paymentMethod: method,
          transactionId: txnId,
          paidAt: new Date().toISOString()
        });
      }, 700);
    } catch (err) {
      console.error('Payment error:', err);
      // Fallback client simulation if server response is slow
      const fallbackTxn = txnIdOverride || `TXN-GOK-${Math.floor(100000 + Math.random() * 900000)}`;
      setProcessingState('success');
      setTimeout(() => {
        onPaymentComplete({
          fee: finalFee !== undefined ? finalFee : feeAmount,
          paymentStatus: (finalFee !== undefined ? finalFee : feeAmount) === 0 ? 'EXEMPT' : 'PAID',
          paymentMethod: method,
          transactionId: fallbackTxn,
          paidAt: new Date().toISOString()
        });
      }, 600);
    }
  };

  // Handle UPI Submit
  const handleUpiPay = (e) => {
    if (e) e.preventDefault();
    if (!upiId.trim() && activeTab === 'upi') {
      // If no custom UPI entered, simulate payment from scanned QR
      executePaymentSuccess('UPI_QR');
      return;
    }
    if (upiId && !upiId.includes('@')) {
      setErrorMsg('Please enter a valid UPI ID (e.g. name@okhdfc, 9845012345@paytm)');
      return;
    }
    executePaymentSuccess('UPI_VPA');
  };

  // Handle Card Submit -> Show OTP
  const handleCardSubmit = (e) => {
    e.preventDefault();
    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 15) {
      setErrorMsg('Please enter a valid 16-digit debit / RuPay card number.');
      return;
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      setErrorMsg('Please enter a valid card expiry date (MM/YY).');
      return;
    }
    if (!cardCvv || cardCvv.length < 3) {
      setErrorMsg('Please enter 3-digit CVV.');
      return;
    }
    setErrorMsg('');
    setShowOtpScreen(true);
    setOtpTimer(45);
  };

  // Handle Card OTP Verification
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otpValue || otpValue.length < 4) {
      setErrorMsg('Please enter the 6-digit OTP received on your mobile.');
      return;
    }
    executePaymentSuccess('CARD_RUPAY');
  };

  // Handle Net Banking Submit
  const handleNetBankingPay = () => {
    executePaymentSuccess(`NETBANKING_${selectedBank}`);
  };

  // Handle ABHA / BPL Exemption
  const handleAbhaVerify = () => {
    if (!abhaNumber.trim() || abhaNumber.length < 10) {
      setErrorMsg('Please enter a valid 14-digit ABHA Health ID or BPL Ration Card Number.');
      return;
    }
    setErrorMsg('');
    setAbhaVerified(true);
    setFeeAmount(0);
    setTimeout(() => {
      executePaymentSuccess('ABHA_EXEMPT', `TXN-GOK-ABHA-${Math.floor(1000 + Math.random() * 9000)}`, 0);
    }, 600);
  };

  // Handle Pay at Counter (Offline Cash)
  const handlePayAtCounter = () => {
    setProcessingState('authorizing');
    setTimeout(() => {
      onPaymentComplete({
        fee: feeAmount,
        paymentStatus: 'PAY_AT_COUNTER',
        paymentMethod: 'CASH_AT_COUNTER',
        transactionId: null,
        paidAt: null
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Government Portal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-5 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-amber-300 font-bold text-xs shrink-0 shadow-inner">
                GOK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-emerald-200 block">
                    Government of Karnataka · Health Dept
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-700/60 text-emerald-100 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    <Lock className="w-2.5 h-2.5" /> 256-Bit SSL
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold leading-tight text-white flex items-center gap-2">
                  e-Hospital OPD Payment Gateway
                  <span className="text-xs font-normal text-emerald-200">
                    ({language === 'kn' ? 'ಕರ್ನಾಟಕ ಒನ್ / ಎನ್‌ಹೆಚ್‌ಎ' : 'Karnataka One / NHA'})
                  </span>
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={processingState !== null}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800/80 transition-colors disabled:opacity-40"
              title="Close payment modal"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Patient & Appointment Quick Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-slate-500">Patient: </span>
              <span className="font-semibold text-slate-800">{bookingDetails?.patientName || 'Citizen'}</span>
            </div>
            <div>
              <span className="text-slate-500">Dept: </span>
              <span className="font-semibold text-slate-800">{bookingDetails?.departmentName || 'General OPD'}</span>
            </div>
            <div>
              <span className="text-slate-500">Hospital: </span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px] inline-block align-bottom">
                {bookingDetails?.hospitalName || 'Victoria Hospital'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
            <span>Ref: OPD-{bookingDetails?.departmentCode || 'GM'}-{Date.now().toString().slice(-4)}</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Fee Selection Banner */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-700" />
                Select Official Registration Fee Category
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">
                Subsidized Public Healthcare
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: General OPD (₹10) */}
              <label
                className={`relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  feeAmount === 10
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-600/20 shadow-xs'
                    : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="opdFeeCategory"
                    checked={feeAmount === 10}
                    onChange={() => {
                      setFeeAmount(10);
                      setAbhaVerified(false);
                    }}
                    className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">General OPD</span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                      Valid 15 days for visit
                    </span>
                  </div>
                </div>
                <span className="font-bold text-sm text-emerald-800">₹10</span>
              </label>

              {/* Option 2: Speciality OPD (₹20) */}
              <label
                className={`relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  feeAmount === 20
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-600/20 shadow-xs'
                    : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="opdFeeCategory"
                    checked={feeAmount === 20}
                    onChange={() => {
                      setFeeAmount(20);
                      setAbhaVerified(false);
                    }}
                    className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Speciality OPD</span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                      Specialist Consultant
                    </span>
                  </div>
                </div>
                <span className="font-bold text-sm text-emerald-800">₹20</span>
              </label>

              {/* Option 3: Ayushman Bharat / BPL (₹0) */}
              <label
                className={`relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  feeAmount === 0
                    ? 'border-emerald-600 bg-white ring-2 ring-emerald-600/20 shadow-xs'
                    : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="opdFeeCategory"
                    checked={feeAmount === 0}
                    onChange={() => {
                      setFeeAmount(0);
                      setActiveTab('abha');
                    }}
                    className="mt-0.5 text-emerald-700 focus:ring-emerald-600"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">ABHA / BPL Card</span>
                    <span className="text-[10px] text-emerald-700 font-medium leading-tight block mt-0.5">
                      100% Free Waived
                    </span>
                  </div>
                </div>
                <span className="font-bold text-sm text-emerald-700">₹0</span>
              </label>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div>
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('upi');
                  setShowOtpScreen(false);
                  setErrorMsg('');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold shrink-0 transition-colors ${
                  activeTab === 'upi'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                UPI / QR Code
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('card');
                  setShowOtpScreen(false);
                  setErrorMsg('');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold shrink-0 transition-colors ${
                  activeTab === 'card'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                RuPay / Debit Card
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('netbanking');
                  setShowOtpScreen(false);
                  setErrorMsg('');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold shrink-0 transition-colors ${
                  activeTab === 'netbanking'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                Net Banking
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('abha');
                  setShowOtpScreen(false);
                  setErrorMsg('');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold shrink-0 transition-colors ${
                  activeTab === 'abha'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                ABHA / PM-JAY (₹0)
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('counter');
                  setShowOtpScreen(false);
                  setErrorMsg('');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold shrink-0 transition-colors ${
                  activeTab === 'counter'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                Pay at Counter
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: UPI / QR CODE */}
          {activeTab === 'upi' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              {/* Dynamic QR Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Scan to Pay ₹{feeAmount} via any UPI App
                </span>

                {/* SVG Visual QR Code with Government Medical Cross center */}
                <div className="relative p-3 bg-white rounded-xl border border-slate-300 shadow-sm">
                  <svg className="w-40 h-40" viewBox="0 0 160 160" fill="none">
                    {/* Background */}
                    <rect width="160" height="160" fill="white" />
                    {/* Outer Corner Finder Patterns */}
                    {/* Top-Left Finder */}
                    <rect x="10" y="10" width="36" height="36" rx="4" fill="#0f172a" />
                    <rect x="16" y="16" width="24" height="24" rx="2" fill="white" />
                    <rect x="22" y="22" width="12" height="12" rx="1" fill="#047857" />
                    {/* Top-Right Finder */}
                    <rect x="114" y="10" width="36" height="36" rx="4" fill="#0f172a" />
                    <rect x="120" y="16" width="24" height="24" rx="2" fill="white" />
                    <rect x="126" y="22" width="12" height="12" rx="1" fill="#047857" />
                    {/* Bottom-Left Finder */}
                    <rect x="10" y="114" width="36" height="36" rx="4" fill="#0f172a" />
                    <rect x="16" y="120" width="24" height="24" rx="2" fill="white" />
                    <rect x="22" y="126" width="12" height="12" rx="1" fill="#047857" />
                    {/* Simulated Data Dots */}
                    <g fill="#0f172a">
                      <rect x="52" y="12" width="6" height="6" />
                      <rect x="64" y="12" width="6" height="6" />
                      <rect x="76" y="12" width="6" height="6" />
                      <rect x="88" y="12" width="6" height="6" />
                      <rect x="100" y="12" width="6" height="6" />
                      <rect x="52" y="24" width="6" height="6" />
                      <rect x="70" y="24" width="6" height="6" />
                      <rect x="94" y="24" width="6" height="6" />
                      <rect x="58" y="36" width="6" height="6" />
                      <rect x="82" y="36" width="6" height="6" />
                      <rect x="100" y="36" width="6" height="6" />
                      <rect x="12" y="52" width="6" height="6" />
                      <rect x="24" y="52" width="6" height="6" />
                      <rect x="36" y="52" width="6" height="6" />
                      <rect x="52" y="52" width="6" height="6" />
                      <rect x="64" y="52" width="6" height="6" />
                      <rect x="88" y="52" width="6" height="6" />
                      <rect x="106" y="52" width="6" height="6" />
                      <rect x="124" y="52" width="6" height="6" />
                      <rect x="142" y="52" width="6" height="6" />
                      <rect x="18" y="64" width="6" height="6" />
                      <rect x="36" y="64" width="6" height="6" />
                      <rect x="58" y="64" width="6" height="6" />
                      <rect x="94" y="64" width="6" height="6" />
                      <rect x="118" y="64" width="6" height="6" />
                      <rect x="136" y="64" width="6" height="6" />
                      <rect x="12" y="76" width="6" height="6" />
                      <rect x="28" y="76" width="6" height="6" />
                      <rect x="112" y="76" width="6" height="6" />
                      <rect x="130" y="76" width="6" height="6" />
                      <rect x="142" y="76" width="6" height="6" />
                      <rect x="24" y="88" width="6" height="6" />
                      <rect x="42" y="88" width="6" height="6" />
                      <rect x="60" y="88" width="6" height="6" />
                      <rect x="92" y="88" width="6" height="6" />
                      <rect x="120" y="88" width="6" height="6" />
                      <rect x="138" y="88" width="6" height="6" />
                      <rect x="12" y="100" width="6" height="6" />
                      <rect x="30" y="100" width="6" height="6" />
                      <rect x="52" y="100" width="6" height="6" />
                      <rect x="76" y="100" width="6" height="6" />
                      <rect x="104" y="100" width="6" height="6" />
                      <rect x="128" y="100" width="6" height="6" />
                      <rect x="52" y="114" width="6" height="6" />
                      <rect x="70" y="114" width="6" height="6" />
                      <rect x="88" y="114" width="6" height="6" />
                      <rect x="112" y="114" width="6" height="6" />
                      <rect x="130" y="114" width="6" height="6" />
                      <rect x="64" y="126" width="6" height="6" />
                      <rect x="82" y="126" width="6" height="6" />
                      <rect x="100" y="126" width="6" height="6" />
                      <rect x="124" y="126" width="6" height="6" />
                      <rect x="142" y="126" width="6" height="6" />
                      <rect x="52" y="138" width="6" height="6" />
                      <rect x="76" y="138" width="6" height="6" />
                      <rect x="94" y="138" width="6" height="6" />
                      <rect x="118" y="138" width="6" height="6" />
                      <rect x="136" y="138" width="6" height="6" />
                    </g>
                    {/* Center Brand Badge (National Health) */}
                    <rect x="62" y="62" width="36" height="36" rx="6" fill="#065f46" stroke="white" strokeWidth="2" />
                    <rect x="76" y="68" width="8" height="24" rx="2" fill="white" />
                    <rect x="68" y="76" width="24" height="8" rx="2" fill="white" />
                  </svg>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>QR code expires in:</span>
                  <span className="font-mono font-bold text-amber-700">{timerFormatted}</span>
                </div>

                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                  VPA: victoriahospital.opd@sbi
                </span>
              </div>

              {/* UPI Form & Popular Apps */}
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-2">
                    Supported UPI Apps
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2 border border-slate-200 rounded-lg text-center hover:border-emerald-500 transition-colors bg-white shadow-2xs">
                      <span className="text-[11px] font-bold text-blue-600 block">GPay</span>
                      <span className="text-[9px] text-slate-500">Google Pay</span>
                    </div>
                    <div className="p-2 border border-slate-200 rounded-lg text-center hover:border-emerald-500 transition-colors bg-white shadow-2xs">
                      <span className="text-[11px] font-bold text-purple-600 block">PhonePe</span>
                      <span className="text-[9px] text-slate-500">Instant</span>
                    </div>
                    <div className="p-2 border border-slate-200 rounded-lg text-center hover:border-emerald-500 transition-colors bg-white shadow-2xs">
                      <span className="text-[11px] font-bold text-sky-600 block">Paytm</span>
                      <span className="text-[9px] text-slate-500">Fast UPI</span>
                    </div>
                    <div className="p-2 border border-slate-200 rounded-lg text-center hover:border-emerald-500 transition-colors bg-white shadow-2xs">
                      <span className="text-[11px] font-bold text-emerald-700 block">BHIM</span>
                      <span className="text-[9px] text-slate-500">Govt BHIM</span>
                    </div>
                  </div>
                </div>

                {/* Enter UPI ID manually */}
                <form onSubmit={handleUpiPay} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Or Enter Mobile Number / UPI ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. 9845012345@upi or user@oksbi"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                      />
                      <Smartphone className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processingState !== null}
                    className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>
                      {upiId ? `Verify & Pay ₹${feeAmount}` : `Simulate QR Scan & Pay ₹${feeAmount}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="text-[11px] text-slate-500 flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Zero transaction fee. Subsidized by Govt of Karnataka Arogya Nidhi.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RUPAY / DEBIT CARD */}
          {activeTab === 'card' && (
            <div>
              {!showOtpScreen ? (
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">
                      Card Details (RuPay, Visa, MasterCard)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      RuPay 0% MDR
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Debit / ATM Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="XXXX XXXX XXXX XXXX"
                        maxLength={19}
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="•••"
                        maxLength={3}
                        className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name as printed on card"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>Proceed to 3D Secure OTP · ₹{feeAmount}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Card OTP Screen */
                <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-md mx-auto text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Bank 3D Secure OTP Authentication
                  </h3>
                  <p className="text-xs text-slate-600">
                    Enter the 6-digit One Time Password (OTP) sent to your registered mobile number for ₹{feeAmount}.
                  </p>

                  <div className="max-w-[200px] mx-auto">
                    <input
                      type="text"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="482910"
                      maxLength={6}
                      className="w-full px-4 py-2.5 text-center text-lg font-mono font-bold tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <span>Expires in {otpTimer}s</span>
                    <button
                      type="button"
                      onClick={() => setOtpValue('482910')}
                      className="text-emerald-700 font-semibold underline hover:text-emerald-900"
                    >
                      (Auto-fill Demo OTP)
                    </button>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowOtpScreen(false)}
                      className="w-1/2 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={processingState !== null}
                      className="w-1/2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50"
                    >
                      Submit OTP & Pay
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: NET BANKING */}
          {activeTab === 'netbanking' && (
            <div className="space-y-4">
              <span className="text-xs font-semibold text-slate-700 block">
                Select your Public / Nationalized Bank
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'SBI', name: 'State Bank of India', short: 'SBI' },
                  { id: 'CANARA', name: 'Canara Bank (Karnataka)', short: 'Canara' },
                  { id: 'UNION', name: 'Union Bank of India', short: 'Union' },
                  { id: 'PNB', name: 'Punjab National Bank', short: 'PNB' },
                  { id: 'HDFC', name: 'HDFC Bank', short: 'HDFC' },
                  { id: 'ICICI', name: 'ICICI Bank', short: 'ICICI' }
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBank(b.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedBank === b.id
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">{b.short}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{b.name}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleNetBankingPay}
                disabled={processingState !== null}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Authorize ₹{feeAmount} via {selectedBank} Net Banking</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 4: AYUSHMAN BHARAT / ABHA EXEMPTION (₹0) */}
          {activeTab === 'abha' && (
            <div className="space-y-4 bg-emerald-50/50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <BadgeCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-xs text-emerald-950 uppercase tracking-wide">
                    Arogya Karnataka & Ayushman Bharat PM-JAY Exemption
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    100% Free OPD Registration for ABHA account holders, BPL Ration Card holders, and eligible government scheme beneficiaries.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  14-Digit ABHA ID / Health Card or BPL Ration Card Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={abhaNumber}
                    onChange={(e) => setAbhaNumber(e.target.value)}
                    placeholder="91-4567-8912-3456 or RC-KA-992144"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAbhaVerify}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
                  >
                    Verify & Claim ₹0 Token
                  </button>
                </div>
              </div>

              {abhaVerified && (
                <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-lg flex items-center gap-2 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    ABHA Benefit Validated: 100% OPD Registration Fee Waived under National Health Mission.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PAY AT COUNTER (CASH) */}
          {activeTab === 'counter' && (
            <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-xs text-slate-900 uppercase">
                    Pay ₹{feeAmount} in Cash at Hospital Registration Counter
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    If you don't have digital payments, you can generate your token now and pay ₹{feeAmount} in exact cash at Registration Counter No. 1 or 2 upon arriving at the hospital.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <span className="font-semibold block mb-0.5">Note for Counter Payment:</span>
                Your token will be marked as <strong className="font-bold">UNPAID (PAY AT COUNTER)</strong> until verified by hospital staff. Carry exact ₹{feeAmount} currency change to prevent delays.
              </div>

              <button
                type="button"
                onClick={handlePayAtCounter}
                disabled={processingState !== null}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Confirm Token · Pay ₹{feeAmount} at Counter on Arrival</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Fee Summary & Guarantee */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
                Official Treasury Fee
              </span>
              <span className="font-extrabold text-base text-slate-900">
                Total Payable: <span className="text-emerald-700">₹{feeAmount}.00</span>
              </span>
            </div>
          </div>

          <div className="text-right text-[10px] text-slate-500">
            <span>e-Hospital PG Service ID: GOK-HEALTH-2026</span>
            <span className="block text-emerald-700 font-medium">Official Government Receipt Issued</span>
          </div>
        </div>

        {/* PROCESSING & VERIFICATION OVERLAY */}
        {processingState && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-50 animate-in fade-in duration-200">
            {processingState === 'authorizing' && (
              <div className="space-y-3">
                <RefreshCw className="w-10 h-10 text-emerald-700 animate-spin mx-auto" />
                <h3 className="font-bold text-base text-slate-900">
                  Connecting to Karnataka Health Treasury Gateway...
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Processing payment of ₹{feeAmount}. Please do not refresh or close this window.
                </p>
              </div>
            )}

            {processingState === 'confirming' && (
              <div className="space-y-3">
                <RefreshCw className="w-10 h-10 text-teal-700 animate-spin mx-auto" />
                <h3 className="font-bold text-base text-slate-900">
                  Verifying Transaction & Issuing Treasury Receipt...
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Linking payment reference to your digital OPD pass.
                </p>
              </div>
            )}

            {processingState === 'success' && (
              <div className="space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-lg text-emerald-950">
                  {feeAmount === 0 ? 'Exemption Verified!' : `₹${feeAmount} Payment Successful!`}
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  OPD Registration fee processed. Generating your official Digital Token Slip...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
