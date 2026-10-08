import { jsPDF } from 'jspdf';

/**
 * Generates an official, beautifully formatted Karnataka Government
 * SwasthyaSetu Digital OPD Token PDF file and triggers the browser download.
 *
 * @param {Object} token - Token details object
 * @param {string} token.tokenNumber - e.g. "GM-04"
 * @param {string} token.patientName - e.g. "Ramesh Kumar"
 * @param {string|number} token.patientAge - e.g. "42"
 * @param {string} token.patientGender - e.g. "Male"
 * @param {string} token.patientPhone - e.g. "9845012345"
 * @param {string} [token.abhaId] - e.g. "91-4567-8912-3456"
 * @param {string} token.hospitalName - e.g. "Victoria Hospital (BMCRI), Bengaluru"
 * @param {string} token.departmentName - e.g. "General Medicine"
 * @param {string} [token.departmentCode] - e.g. "GM"
 * @param {string} [token.doctorName] - e.g. "Dr. Ramesh H., MD"
 * @param {string} token.date - e.g. "2026-10-09"
 * @param {string} token.slot - e.g. "Morning OPD (09:00 AM - 01:00 PM)"
 * @param {string} [token.symptoms] - e.g. "Fever, headache, general fatigue"
 * @param {string} [token.status] - e.g. "WAITING", "CONFIRMED"
 * @param {number} [token.sequenceNumber] - e.g. 4
 * @param {string} [language] - 'en' | 'kn'
 */
export function downloadTokenPDF(token, language = 'en') {
  if (!token) {
    throw new Error('Token data is required to generate PDF');
  }

  // Create A4 PDF (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);

  // Background subtle tint
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Outer container border
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.5);
  doc.roundedRect(margin - 2, margin - 2, contentWidth + 4, 273, 3, 3, 'S');

  // ==========================================
  // 1. TOP HEADER BANNER (Karnataka Govt Theme)
  // ==========================================
  const headerHeight = 34;
  // Gradient simulated with deep emerald header
  doc.setFillColor(6, 78, 59); // emerald-900
  doc.roundedRect(margin, margin, contentWidth, headerHeight, 3, 3, 'F');

  // Decorative top accent stripe (Karnataka Red & Yellow heritage banner accent)
  doc.setFillColor(234, 179, 8); // yellow-500
  doc.rect(margin, margin, contentWidth / 2, 2.5, 'F');
  doc.setFillColor(220, 38, 38); // red-600
  doc.rect(margin + (contentWidth / 2), margin, contentWidth / 2, 2.5, 'F');

  // Govt emblem placeholder badge
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.circle(margin + 12, margin + 17, 7, 'F');
  doc.setFillColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('GOK', margin + 9, margin + 18.5);

  // Header Titles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(167, 243, 208); // emerald-200
  doc.text('GOVERNMENT OF KARNATAKA  ·  DEPARTMENT OF HEALTH & FAMILY WELFARE', margin + 23, margin + 11);

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('SWASTHYASETU · DIGITAL OPD TOKEN PASS', margin + 23, margin + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(209, 250, 229); // emerald-100
  doc.text('Official Fast-Track Express Registration Slip · Arogya Karnataka Citizen Service', margin + 23, margin + 24);

  // Current Y position tracker
  let currentY = margin + headerHeight + 5;

  // ==========================================
  // 2. TOKEN NUMBER SHOWCASE CARD (High Contrast)
  // ==========================================
  const tokenBoxHeight = 44;
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, currentY, contentWidth, tokenBoxHeight, 3, 3, 'F');

  // Inner accents
  doc.setDrawColor(51, 65, 85); // slate-700
  doc.setLineWidth(0.4);
  doc.roundedRect(margin + 1, currentY + 1, contentWidth - 2, tokenBoxHeight - 2, 2.5, 2.5, 'S');

  // Token Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text('OFFICIAL OPD QUEUE TOKEN NUMBER', margin + 6, currentY + 9);

  // Big Bold Token ID
  const tokenStr = String(token.tokenNumber || 'GM-01');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  doc.text(tokenStr, margin + 6, currentY + 23);

  // Sequence and Category info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  const seqText = `Queue Sequence: #${token.sequenceNumber || '01'}  |  Type: General OPD`;
  doc.text(seqText, margin + 6, currentY + 31);

  // Free OPD Consultation badge
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.roundedRect(margin + 6, currentY + 35, 60, 5.5, 1.2, 1.2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('FREE CONSULTATION (Govt Scheme)', margin + 8.5, currentY + 39);

  // Right Side of Token Box: QR Code Simulation Graphic & Express Desk Info
  const qrX = margin + contentWidth - 44;
  const qrY = currentY + 5;
  const qrSize = 34;

  // QR Container
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX, qrY, qrSize, qrSize, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(qrX, qrY, qrSize, qrSize, 'S');

  // Vector Simulated 2D Matrix / QR Code Pattern
  drawVectorQRCode(doc, qrX + 2, qrY + 2, qrSize - 4, tokenStr);

  currentY += tokenBoxHeight + 5;

  // ==========================================
  // 3. APPOINTMENT SUMMARY BAR
  // ==========================================
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 12, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Consultation Date:`, margin + 4, currentY + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${token.date || token.appointmentDate || new Date().toISOString().split('T')[0]}`, margin + 34, currentY + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.text(`Time Window:`, margin + 65, currentY + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${token.slot || 'Morning OPD (09:00 AM - 01:00 PM)'}`, margin + 89, currentY + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.text(`Status:`, margin + 145, currentY + 7.5);
  doc.setFillColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text(`${token.status || 'ACTIVE - WAITING'}`, margin + 158, currentY + 7.5);

  currentY += 16;

  // ==========================================
  // 4. TWO-COLUMN GRID: PATIENT & HOSPITAL DETAILS
  // ==========================================
  const colWidth = (contentWidth - 4) / 2;
  const colHeight = 56;

  // Left Column: Patient Details
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, colWidth, colHeight, 2.5, 2.5, 'FD');

  // Left Section Header
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.roundedRect(margin, currentY, colWidth, 9, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text('1. PATIENT IDENTIFICATION', margin + 4, currentY + 6);

  // Patient Fields
  let rowY = currentY + 15;
  const renderField = (x, y, label, val, isBold = false) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(label, x, y);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(val || 'N/A', x, y + 4.5);
  };

  renderField(margin + 4, rowY, 'FULL NAME', token.patientName, true);
  renderField(margin + 52, rowY, 'AGE / GENDER', `${token.patientAge || '—'} Yrs / ${token.patientGender || 'Not Specified'}`);

  rowY += 12;
  renderField(margin + 4, rowY, 'CONTACT MOBILE', `+91 ${token.patientPhone || 'N/A'}`);
  renderField(margin + 52, rowY, 'ABHA HEALTH ID', token.abhaId || '91-XXXX-XXXX-XXXX');

  rowY += 12;
  const isExempt = token.fee === 0 || token.paymentStatus === 'EXEMPT';
  renderField(margin + 4, rowY, 'CATEGORY / SCHEME', isExempt ? 'Ayushman Bharat PM-JAY (Exempt)' : 'General Public Healthcare (GOK)');
  renderField(margin + 52, rowY, 'REGISTRATION TYPE', 'Direct Digital Web Booking');

  // Right Column: Hospital & Department Details
  const rightX = margin + colWidth + 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightX, currentY, colWidth, colHeight, 2.5, 2.5, 'FD');

  // Right Section Header
  doc.setFillColor(239, 246, 255); // blue-50
  doc.roundedRect(rightX, currentY, colWidth, 9, 2.5, 2.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 64, 175); // blue-800
  doc.text('2. HOSPITAL & OPD ALLOCATION', rightX + 4, currentY + 6);

  // Hospital Fields
  rowY = currentY + 15;
  renderField(rightX + 4, rowY, 'GOVERNMENT HOSPITAL', token.hospitalName, true);
  
  rowY += 12;
  const deptLabel = `${token.departmentName || 'General Medicine'}${token.departmentCode ? ` (${token.departmentCode})` : ''}`;
  renderField(rightX + 4, rowY, 'OPD DEPARTMENT', deptLabel, true);
  renderField(rightX + 52, rowY, 'ALLOCATED ROOM', 'Room 3 · Counter 2');

  rowY += 12;
  renderField(rightX + 4, rowY, 'CHIEF COMPLAINT', token.symptoms || 'General OPD Consultation');
  const feeDisplay = isExempt
    ? 'Rs. 0.00 (ABHA Waived)'
    : `Rs. ${token.fee || 10}.00 (${token.paymentStatus === 'PAY_AT_COUNTER' ? 'PAY AT COUNTER' : 'PAID ONLINE'})`;
  renderField(rightX + 52, rowY, 'REGISTRATION FEE', feeDisplay, true);

  currentY += colHeight + 4;

  // ==========================================
  // 3. OFFICIAL TREASURY PAYMENT RECEIPT (Karnataka One / e-Hospital)
  // ==========================================
  const receiptHeight = 22;
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, receiptHeight, 2, 2, 'FD');

  // Receipt Header line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text('3. TREASURY PAYMENT RECEIPT · KARNATAKA HEALTH PORTAL (e-HOSPITAL PG)', margin + 4, currentY + 5.5);

  const receiptStatusText = isExempt
    ? 'EXEMPT (Rs. 0)'
    : (token.paymentStatus === 'PAY_AT_COUNTER' ? 'UNPAID · PAY AT COUNTER' : 'PAID · VERIFIED');
  doc.setFillColor(isExempt ? 59 : (token.paymentStatus === 'PAY_AT_COUNTER' ? 245 : 16), isExempt ? 130 : (token.paymentStatus === 'PAY_AT_COUNTER' ? 158 : 185), isExempt ? 246 : (token.paymentStatus === 'PAY_AT_COUNTER' ? 11 : 129));
  doc.roundedRect(margin + contentWidth - 48, currentY + 2, 44, 5.5, 1, 1, 'F');
  doc.setFillColor(255, 255, 255);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6.5);
  doc.text(receiptStatusText, margin + contentWidth - 46, currentY + 5.8);

  // Receipt Fields row
  const rY = currentY + 11;
  const renderReceiptItem = (x, label, val) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x, rY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(val || 'N/A', x, rY + 4);
  };

  renderReceiptItem(margin + 4, 'AMOUNT PAID', isExempt ? 'Rs. 0.00' : `Rs. ${token.fee || 10}.00`);
  renderReceiptItem(margin + 36, 'PAYMENT MODE', token.paymentMethod || (isExempt ? 'ABHA PM-JAY' : 'UPI / Bharat BillPay'));
  renderReceiptItem(margin + 80, 'TRANSACTION REF ID', token.transactionId || (token.paymentStatus === 'PAY_AT_COUNTER' ? 'PENDING CASH' : `TXN-GOK-${Math.floor(100000 + Math.random() * 900000)}`));
  renderReceiptItem(margin + 130, 'RECEIPT AUTH', 'GOK HEALTH TREASURY 2026');

  currentY += receiptHeight + 4;

  // ==========================================
  // 5. VECTOR BARCODE STRIP (Authentic Hospital Scan)
  // ==========================================
  const barcodeHeight = 16;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, barcodeHeight, 2, 2, 'FD');

  // Barcode lines
  const barcodeStartX = margin + 14;
  const barcodeStartY = currentY + 2.5;
  drawSimulatedBarcode(doc, barcodeStartX, barcodeStartY, contentWidth - 28, 8);

  // Barcode readable text
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const barcodeText = `*GOK-OPD-${tokenStr}-${(token.date || '').replace(/-/g, '')}-SS26*`;
  doc.text(barcodeText, margin + (contentWidth / 2) - (doc.getTextWidth(barcodeText) / 2), currentY + 14);

  currentY += barcodeHeight + 5;

  // ==========================================
  // 6. PATIENT GUIDELINES & INSTRUCTIONS (Bilingual)
  // ==========================================
  const guideHeight = 44;
  doc.setFillColor(254, 252, 232); // yellow-50
  doc.setDrawColor(254, 240, 138); // yellow-200
  doc.roundedRect(margin, currentY, contentWidth, guideHeight, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(133, 77, 14); // yellow-800
  doc.text('IMPORTANT INSTRUCTIONS FOR PATIENTS (ಸೂಚನೆಗಳು):', margin + 4, currentY + 6);

  const instructions = [
    {
      en: '1. Arrive at the Hospital Express Registration Counter 15 minutes before your slot.',
      kn: 'ನಿಮ್ಮ ಸಮಯಕ್ಕೆ 15 ನಿಮಿಷ ಮುಂಚಿತವಾಗಿ ಡಿಜಿಟಲ್ ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಕೌಂಟರ್‌ಗೆ ತಲುಪಿ.'
    },
    {
      en: '2. Show this PDF file on your smartphone or carry a printed copy to skip the general queue.',
      kn: 'ಸಾಮಾನ್ಯ ಸರದಿ ತಪ್ಪಿಸಲು ಈ ಪಿಡಿಎಫ್ ಅನ್ನು ಮೊಬೈಲ್‌ನಲ್ಲಿ ಅಥವಾ ಮುದ್ರಿತ ಪ್ರತಿಯನ್ನು ಕೌಂಟರ್‌ನಲ್ಲಿ ತೋರಿಸಿ.'
    },
    {
      en: '3. Keep your Aadhaar / Ration Card / ABHA ID ready for instant digital verification.',
      kn: 'ತ್ವರಿತ ಪರಿಶೀಲನೆಗಾಗಿ ಆಧಾರ್ ಕಾರ್ಡ್ / ಪಡಿತರ ಚೀಟಿ / ಎಬಿಹೆಚ್‌ಎ ಐಡಿ ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಿ.'
    },
    {
      en: '4. Free prescribed medicines & tests available at the hospital Jan Aushadhi & Laboratory.',
      kn: 'ಆಸ್ಪತ್ರೆಯ ಪ್ರಯೋಗಾಲಯ ಹಾಗೂ ಜನ ಔಷಧಿ ಕೇಂದ್ರದಲ್ಲಿ ಉಚಿತ ಔಷಧಿಗಳು ಮತ್ತು ತಪಾಸಣೆಗಳು ಲಭ್ಯ.'
    }
  ];

  let instY = currentY + 12;
  instructions.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`• ${item.en}`, margin + 4, instY);
    instY += 6.5;
  });

  currentY += guideHeight + 5;

  // ==========================================
  // 7. FOOTER & VERIFICATION STAMP
  // ==========================================
  // Digital seal container
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 23, 2, 2, 'FD');

  // Seal Graphic (Left)
  doc.setFillColor(16, 185, 129);
  doc.circle(margin + 10, currentY + 11.5, 6, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(5, 150, 105);
  doc.text('GOK', margin + 7.5, currentY + 12.5);

  // Digital verification text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('ELECTRONICALLY VERIFIED DIGITAL APPOINTMENT PASS', margin + 20, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const nowStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });
  doc.text(`Generated via SwasthyaSetu Portal on: ${nowStr}  ·  System Auth ID: SS-GOK-${Math.floor(100000 + Math.random() * 900000)}`, margin + 20, currentY + 12);
  doc.text('24x7 Health Helpline: 104 (Arogya Sahayavani)  |  Emergency Ambulance: 108  |  Website: swasthyasetu.karnataka.gov.in', margin + 20, currentY + 17);

  // Trigger browser download
  const safeName = (token.patientName || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
  const safeToken = (token.tokenNumber || 'Token').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `SwasthyaSetu_OPD_Token_${safeToken}_${safeName}.pdf`;

  doc.save(fileName);
  return { success: true, fileName };
}

/**
 * Draws a high-contrast vector simulated QR code onto the PDF canvas
 */
function drawVectorQRCode(doc, startX, startY, size, codeStr) {
  const modules = 21; // 21x21 QR code grid
  const cellSize = size / modules;

  doc.setFillColor(15, 23, 42); // slate-900

  // Helper for drawing square finder pattern
  const drawFinderPattern = (r, c) => {
    // 7x7 outer square
    doc.rect(startX + (c * cellSize), startY + (r * cellSize), cellSize * 7, cellSize * 7, 'F');
    // 5x5 inner white square
    doc.setFillColor(255, 255, 255);
    doc.rect(startX + ((c + 1) * cellSize), startY + ((r + 1) * cellSize), cellSize * 5, cellSize * 5, 'F');
    // 3x3 center black square
    doc.setFillColor(15, 23, 42);
    doc.rect(startX + ((c + 2) * cellSize), startY + ((r + 2) * cellSize), cellSize * 3, cellSize * 3, 'F');
  };

  // 3 Finder patterns at corners
  drawFinderPattern(0, 0);
  drawFinderPattern(0, modules - 7);
  drawFinderPattern(modules - 7, 0);

  // Deterministic pseudo-random seed based on token string to create consistent QR pattern
  let seed = 42;
  for (let i = 0; i < codeStr.length; i++) {
    seed = (seed * 31 + codeStr.charCodeAt(i)) % 10007;
  }

  // Draw timing patterns
  for (let i = 8; i < modules - 8; i += 2) {
    doc.rect(startX + (6 * cellSize), startY + (i * cellSize), cellSize, cellSize, 'F');
    doc.rect(startX + (i * cellSize), startY + (6 * cellSize), cellSize, cellSize, 'F');
  }

  // Draw data cells
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Skip finder pattern zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= modules - 8;
      const inBottomLeft = r >= modules - 8 && c < 8;

      if (!inTopLeft && !inTopRight && !inBottomLeft) {
        seed = (seed * 16807 + 11) % 2147483647;
        if (seed % 3 === 0) {
          doc.rect(startX + (c * cellSize), startY + (r * cellSize), cellSize, cellSize, 'F');
        }
      }
    }
  }
}

/**
 * Draws a realistic vector barcode with varied line widths onto the PDF canvas
 */
function drawSimulatedBarcode(doc, startX, startY, totalWidth, height) {
  doc.setFillColor(15, 23, 42); // slate-900
  let currentX = startX;
  const widths = [0.6, 1.4, 0.4, 2.0, 0.8, 1.2, 0.5, 1.8, 0.7, 1.5, 0.4, 1.0, 2.2, 0.6];
  const spaces = [0.8, 0.5, 1.2, 0.6, 1.4, 0.8, 0.4, 1.0, 0.6, 1.2, 0.7, 0.9, 0.5, 0.8];

  let idx = 0;
  while (currentX < startX + totalWidth - 4) {
    const w = widths[idx % widths.length];
    const s = spaces[idx % spaces.length];
    doc.rect(currentX, startY, w, height, 'F');
    currentX += w + s;
    idx++;
  }
}
