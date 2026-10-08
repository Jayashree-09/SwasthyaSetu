import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer,
  Download,
  Loader2,
  QrCode,
  Calendar,
  Clock,
  User,
  Hospital,
  Stethoscope,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Compass,
  Coins,
  CreditCard,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { downloadTokenPDF } from '../services/pdfGenerator.js';
import { api } from '../services/api.js';
import GovtPaymentGatewayModal from './GovtPaymentGatewayModal.jsx';

export default function TokenCard({ token, onCancel, showActions = true }) {
  const { t, language } = useLanguage();
  const [currentToken, setCurrentToken] = useState(token);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Sync token if prop updates
  React.useEffect(() => {
    setCurrentToken(token);
  }, [token]);

  if (!currentToken) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONSULTING':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'CALLED':
        return 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse';
      case 'WAITING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'NO_SHOW':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      await downloadTokenPDF(currentToken, language);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4500);
    } catch (err) {
      console.error('Failed to generate PDF token:', err);
      alert('Unable to generate token PDF: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePayOnlineSuccess = async (paymentDetails) => {
    setIsPayModalOpen(false);
    try {
      const res = await api.payToken(currentToken.id, {
        method: paymentDetails.paymentMethod,
        fee: paymentDetails.fee,
        transactionId: paymentDetails.transactionId
      });
      if (res.data) {
        setCurrentToken(res.data);
      } else {
        setCurrentToken({
          ...currentToken,
          paymentStatus: 'PAID',
          paymentMethod: paymentDetails.paymentMethod,
          fee: paymentDetails.fee,
          transactionId: paymentDetails.transactionId,
          paidAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Failed to update token payment on server:', err);
      setCurrentToken({
        ...currentToken,
        paymentStatus: 'PAID',
        paymentMethod: paymentDetails.paymentMethod,
        fee: paymentDetails.fee,
        transactionId: paymentDetails.transactionId,
        paidAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Top Banner with Token Number and Status */}
      <div className="bg-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
            Government of Karnataka · Digital OPD Pass
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {token.tokenNumber}
            </span>
            <span className="text-xs text-slate-400">
              Sequence #{token.sequenceNumber || '1'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-md text-xs font-semibold border ${getStatusColor(
              token.status
            )}`}
          >
            {token.status}
          </span>
          {token.priority === 'EMERGENCY' && (
            <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-bold">
              EMERGENCY PRIORITY
            </span>
          )}
        </div>
      </div>

      {/* Main Token Details */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 block text-[11px]">Patient Name</span>
              <span className="font-semibold text-slate-900 text-sm">
                {token.patientName}
              </span>
              <span className="text-slate-500 block text-[11px]">
                {token.patientAge} Yrs · {token.patientGender} · {token.patientPhone}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Hospital className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 block text-[11px]">Hospital</span>
              <span className="font-semibold text-slate-900 text-sm">
                {token.hospitalName}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Stethoscope className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 block text-[11px]">OPD Department</span>
              <span className="font-semibold text-slate-900">
                {token.departmentName}
              </span>
              {token.doctorName && (
                <span className="text-slate-600 block text-[11px]">
                  {token.doctorName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 block text-[11px]">Date & Slot</span>
              <span className="font-semibold text-slate-900">{token.date}</span>
              <span className="text-slate-600 block text-[11px]">{token.slot}</span>
            </div>
          </div>
        </div>

        {/* Symptoms / Chief Complaint */}
        {token.symptoms && (
          <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-100">
            <span className="font-medium text-slate-600 block text-[11px]">Chief Complaint / Symptoms:</span>
            <p className="text-slate-800 mt-0.5">{token.symptoms}</p>
          </div>
        )}

        {/* Barcode / QR Simulation & Verification Note */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded border border-slate-300 shadow-2xs">
              <QrCode className="w-8 h-8 text-slate-800" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-700 block">
                Verification QR Code
              </span>
              <span className="text-[10px] text-slate-500 block">
                Scan at Hospital Digital Express Counter
              </span>
            </div>
          </div>

          <div className="text-right text-[11px]">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              OPD Registration Fee
            </span>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className={`font-bold ${
                currentToken.paymentStatus === 'PAY_AT_COUNTER'
                  ? 'text-amber-700'
                  : 'text-emerald-700'
              }`}>
                ₹{currentToken.fee !== undefined ? currentToken.fee : 10}.00
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                currentToken.paymentStatus === 'PAY_AT_COUNTER'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {currentToken.paymentStatus === 'EXEMPT' || currentToken.fee === 0
                  ? 'ABHA EXEMPT'
                  : (currentToken.paymentStatus === 'PAY_AT_COUNTER' ? 'PAY AT COUNTER' : 'PAID ONLINE')}
              </span>
            </div>
            {currentToken.transactionId && (
              <span className="block font-mono text-[9px] text-slate-400 mt-0.5">
                Ref: {currentToken.transactionId}
              </span>
            )}
          </div>
        </div>

        {/* Download Success Banner */}
        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              {t('downloadPdfSuccess')}
            </span>
          </div>
        )}

        {/* Actions: Download PDF, Print, Floor Plan, Pay Online & Cancel */}
        {showActions && (
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 rounded-lg shadow-2xs transition-colors"
                title="Download formatted digital OPD token PDF to show at registration counter"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('downloadingPdf')}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('downloadPdf')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('printSlip')}</span>
              </button>

              <Link
                to={`/hospital-navigator?dept=${currentToken.departmentId || 'dept-gm'}&token=${encodeURIComponent(currentToken.tokenNumber)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                title="Locate department and consultation room on floor plan"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'kn' ? 'ನಕ್ಷೆಯಲ್ಲಿ ಕೊಠಡಿ ನೋಡಿ' : 'Floor Plan'}</span>
              </Link>

              {currentToken.paymentStatus === 'PAY_AT_COUNTER' && (
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition-colors"
                  title="Pay OPD registration fee online now to skip counter line"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay ₹{currentToken.fee || 10} Online Now</span>
                </button>
              )}
            </div>

            {currentToken.status === 'WAITING' && onCancel && (
              <button
                type="button"
                onClick={() => onCancel(currentToken.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{t('cancelToken')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Payment Gateway Modal for Paying Online */}
      <GovtPaymentGatewayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        bookingDetails={{
          patientName: currentToken.patientName,
          patientPhone: currentToken.patientPhone,
          hospitalId: currentToken.hospitalId,
          hospitalName: currentToken.hospitalName,
          departmentId: currentToken.departmentId,
          departmentName: currentToken.departmentName,
          departmentCode: currentToken.departmentCode,
          abhaId: currentToken.abhaId
        }}
        onPaymentComplete={handlePayOnlineSuccess}
      />
    </div>
  );
}
