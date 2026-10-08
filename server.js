import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (err) {
    console.warn('Gemini AI client initialization skipped or failed:', err.message);
  }
}

// -------------------------------------------------------------
// In-Memory Database with Mongoose-like structure & Seed Data
// (Includes Karnataka Districts, Taluks, Government Hospitals)
// -------------------------------------------------------------

const db = {
  hospitals: [
    {
      id: 'hosp-01',
      name: 'Victoria Hospital (BMCRI)',
      nameKn: 'ವಿಕ್ಟೋರಿಯಾ ಆಸ್ಪತ್ರೆ (ಬಿ.ಎಂ.ಸಿ.ಆರ್.ಐ)',
      type: 'Government Medical College Hospital',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      taluk: 'Bengaluru South',
      address: 'Fort Road, Near City Market, Kalasipalya, Bengaluru',
      pincode: '560002',
      contactNumber: '080-26701150',
      emergencyNumber: '108 / 080-26702200',
      email: 'ms.victoria@karnataka.gov.in',
      coordinates: { lat: 12.9629, lng: 77.5753 },
      opdHours: '8:30 AM - 1:30 PM (Mon-Sat)',
      emergencyServices: '24x7 Trauma & Casualty Center',
      facilities: ['24x7 Emergency', 'ICU', 'Dialysis', 'Blood Bank', 'Free Pharmacy', 'CT/MRI Scan', 'Ayushman Bharat Desk'],
      departments: ['dept-gm', 'dept-ped', 'dept-obg', 'dept-orth', 'dept-ent', 'dept-oph', 'dept-derm', 'dept-cardio', 'dept-surg', 'dept-emerg'],
      dailyCapacity: 2500,
      activeTokensToday: 142
    },
    {
      id: 'hosp-02',
      name: 'K.C. General Hospital',
      nameKn: 'ಕೆ.ಸಿ. ಜನರಲ್ ಆಸ್ಪತ್ರೆ',
      type: 'Government General Hospital',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      taluk: 'Bengaluru North',
      address: '5th Cross Road, Malleshwaram, Bengaluru',
      pincode: '560003',
      contactNumber: '080-23341771',
      emergencyNumber: '108 / 080-23342000',
      email: 'ms.kcgh@karnataka.gov.in',
      coordinates: { lat: 13.0031, lng: 77.5684 },
      opdHours: '9:00 AM - 1:00 PM, 2:00 PM - 4:00 PM',
      emergencyServices: '24x7 Emergency & Maternity Services',
      facilities: ['Maternity Care', 'NICU', 'Digital X-Ray', 'Ultrasound', 'Jan Aushadhi Kendra', 'Arogya Karnataka Desk'],
      departments: ['dept-gm', 'dept-ped', 'dept-obg', 'dept-orth', 'dept-ent', 'dept-dent', 'dept-emerg'],
      dailyCapacity: 1200,
      activeTokensToday: 89
    },
    {
      id: 'hosp-03',
      name: 'K.R. Hospital (Mysore Medical College)',
      nameKn: 'ಕೆ.ಆರ್. ಆಸ್ಪತ್ರೆ (ಮೈಸೂರು ಮೆಡಿಕಲ್ ಕಾಲೇಜು)',
      type: 'Government Medical College Hospital',
      state: 'Karnataka',
      district: 'Mysuru',
      taluk: 'Mysuru City',
      address: 'Sayyaji Rao Road, Near Mysore Palace, Mysuru',
      pincode: '570001',
      contactNumber: '0821-2520512',
      emergencyNumber: '108 / 0821-2520000',
      email: 'krhospital.mysuru@karnataka.gov.in',
      coordinates: { lat: 12.3118, lng: 76.6529 },
      opdHours: '8:30 AM - 1:00 PM (Mon-Sat)',
      emergencyServices: '24x7 Casualty & Emergency Surgery',
      facilities: ['Burn Ward', 'Super Specialty OPD', 'Trauma Center', 'Blood Bank', 'Free Lab Testing'],
      departments: ['dept-gm', 'dept-ped', 'dept-obg', 'dept-orth', 'dept-ent', 'dept-derm', 'dept-psych', 'dept-emerg'],
      dailyCapacity: 1800,
      activeTokensToday: 110
    },
    {
      id: 'hosp-04',
      name: 'Virajpet Taluk Hospital',
      nameKn: 'ವಿರಾಜಪೇಟೆ ತಾಲೂಕು ಸಾರ್ವಜನಿಕ ಆಸ್ಪತ್ರೆ',
      type: 'Taluk General Hospital',
      state: 'Karnataka',
      district: 'Kodagu',
      taluk: 'Virajpet',
      address: 'Hospital Road, Virajpet, Kodagu',
      pincode: '571218',
      contactNumber: '08274-257224',
      emergencyNumber: '108 / 08274-257299',
      email: 'th.virajpet@karnataka.gov.in',
      coordinates: { lat: 12.2039, lng: 75.8037 },
      opdHours: '9:00 AM - 1:30 PM, 2:30 PM - 4:30 PM',
      emergencyServices: '24x7 Primary Emergency & Snakebite Care',
      facilities: ['Emergency Ward', 'Labor Room', 'Basic Diagnostic Lab', 'X-Ray', 'Ambulance 108'],
      departments: ['dept-gm', 'dept-ped', 'dept-obg', 'dept-orth', 'dept-emerg'],
      dailyCapacity: 600,
      activeTokensToday: 42
    },
    {
      id: 'hosp-05',
      name: 'District Hospital Madikeri',
      nameKn: 'ಜಿಲ್ಲಾ ಆಸ್ಪತ್ರೆ ಮಡಿಕೇರಿ',
      type: 'District Hospital',
      state: 'Karnataka',
      district: 'Kodagu',
      taluk: 'Madikeri',
      address: 'Near Old Bus Stand, Madikeri, Kodagu',
      pincode: '571201',
      contactNumber: '08272-228383',
      emergencyNumber: '108 / 08272-225000',
      email: 'dh.madikeri@karnataka.gov.in',
      coordinates: { lat: 12.4244, lng: 75.7382 },
      opdHours: '9:00 AM - 1:00 PM, 2:00 PM - 4:00 PM',
      emergencyServices: '24x7 Casualty & Trauma Unit',
      facilities: ['Trauma Center', 'Blood Storage', 'Pediatric Care', 'Free Medicines', 'Tele-Consultation'],
      departments: ['dept-gm', 'dept-ped', 'dept-obg', 'dept-orth', 'dept-ent', 'dept-oph', 'dept-emerg'],
      dailyCapacity: 900,
      activeTokensToday: 65
    },
    {
      id: 'hosp-06',
      name: 'District Wenlock Hospital',
      nameKn: 'ಜಿಲ್ಲಾ ವೆನ್‌ಲಾಕ್ ಆಸ್ಪತ್ರೆ',
      type: 'Government District Hospital',
      state: 'Karnataka',
      district: 'Dakshina Kannada',
      taluk: 'Mangaluru',
      address: 'Hampankatta, Mangaluru',
      pincode: '575001',
      contactNumber: '0824-2423377',
      emergencyNumber: '108 / 0824-2422200',
      email: 'wenlock.mangaluru@karnataka.gov.in',
      coordinates: { lat: 12.8687, lng: 74.8430 },
      opdHours: '8:30 AM - 1:00 PM (Mon-Sat)',
      emergencyServices: '24x7 Emergency & Intensive Care',
      facilities: ['Regional Trauma Center', 'Dialysis Unit', 'Pediatric ICU', 'Cath Lab', 'Free Medicines'],
      departments: ['dept-gm', 'dept-ped', 'dept-obg', 'dept-orth', 'dept-ent', 'dept-oph', 'dept-derm', 'dept-cardio', 'dept-emerg'],
      dailyCapacity: 2000,
      activeTokensToday: 128
    }
  ],

  departments: [
    {
      id: 'dept-gm',
      code: 'GM',
      name: 'General Medicine',
      nameKn: 'ಸಾಮಾನ್ಯ ವೈದ್ಯಕೀಯ (ಜನರಲ್ ಮೆಡಿಸಿನ್)',
      description: 'Diagnosis and non-surgical treatment of adult diseases, fever, diabetes, blood pressure, infections, respiratory and general complaints.',
      symptoms: ['Fever', 'Cough', 'Cold', 'Weakness', 'Fatigue', 'Headache', 'Body Pain', 'Loss of Appetite', 'Uncontrolled Diabetes', 'Hypertension'],
      icon: 'Stethoscope',
      avgConsultationMinutes: 8
    },
    {
      id: 'dept-ped',
      code: 'PED',
      name: 'Pediatrics',
      nameKn: 'ಮಕ್ಕಳ ಚಿಕಿತ್ಸಾ ವಿಭಾಗ (ಪೀಡಿಯಾಟ್ರಿಕ್ಸ್)',
      description: 'Healthcare, medical care and vaccination for infants, children, and adolescents up to age 18.',
      symptoms: ['Child Fever', 'Child Vomiting', 'Child Diarrhea', 'Persistent Cough in Children', 'Vaccination', 'Poor Feeding', 'Growth Concerns'],
      icon: 'Baby',
      avgConsultationMinutes: 10
    },
    {
      id: 'dept-obg',
      code: 'OBG',
      name: 'Obstetrics & Gynecology',
      nameKn: 'ಪ್ರಸೂತಿ ಮತ್ತು ಸ್ತ್ರೀರೋಗ ವಿಭಾಗ',
      description: 'Comprehensive pregnancy checkups, delivery services, women reproductive health, and gynecological disorders.',
      symptoms: ['Pregnancy Antenatal Checkup', 'Menstrual Irregularities', 'Severe Pelvic Pain', 'Abnormal Bleeding', 'Maternity Care', 'Postnatal Checkup'],
      icon: 'HeartPulse',
      avgConsultationMinutes: 12
    },
    {
      id: 'dept-orth',
      code: 'ORTH',
      name: 'Orthopedics',
      nameKn: 'ಮೂಳೆ ಮತ್ತು ಕೀಲು ರೋಗ ವಿಭಾಗ (ಆರ್ಥೋಪೆಡಿಕ್ಸ್)',
      description: 'Treatment of bones, joints, ligaments, tendons, fractures, spinal pain, arthritis, and musculoskeletal injuries.',
      symptoms: ['Joint Pain', 'Knee Pain', 'Bone Fracture', 'Back Pain', 'Difficulty Walking', 'Sprains', 'Arthritis', 'Shoulder Stiffness'],
      icon: 'Activity',
      avgConsultationMinutes: 10
    },
    {
      id: 'dept-ent',
      code: 'ENT',
      name: 'Ear, Nose & Throat (ENT)',
      nameKn: 'ಕಿವಿ, ಮೂಗು ಮತ್ತು ಗಂಟಲು ವಿಭಾಗ (ಇ.ಎನ್.ಟಿ)',
      description: 'Disorders and infections of the ear, nose, throat, sinuses, hearing issues, and voice disorders.',
      symptoms: ['Earache', 'Hearing Loss', 'Discharge from Ear', 'Severe Sore Throat', 'Nosebleeds', 'Sinus Pain', 'Tonsillitis', 'Hoarseness'],
      icon: 'Ear',
      avgConsultationMinutes: 8
    },
    {
      id: 'dept-oph',
      code: 'OPH',
      name: 'Ophthalmology (Eye)',
      nameKn: 'ನೇತ್ರ ಚಿಕಿತ್ಸಾ ವಿಭಾಗ (ಕಣ್ಣಿನ ವಿಭಾಗ)',
      description: 'Eye examinations, vision testing, cataract evaluation, eye infections, red eye, and glaucoma screening.',
      symptoms: ['Blurred Vision', 'Red Eyes', 'Eye Pain', 'Watery Eyes', 'Cataract', 'Foreign Body in Eye', 'Vision Loss'],
      icon: 'Eye',
      avgConsultationMinutes: 10
    },
    {
      id: 'dept-derm',
      code: 'DERM',
      name: 'Dermatology (Skin)',
      nameKn: 'ಚರ್ಮರೋಗ ವಿಭಾಗ (ಡರ್ಮಟಾಲಜಿ)',
      description: 'Skin infections, allergic reactions, rashes, eczema, psoriasis, fungal infections, acne, and hair/nail disorders.',
      symptoms: ['Skin Rash', 'Severe Itching', 'Fungal Infection', 'Ringworm', 'Eczema', 'Skin Ulcer', 'Acne', 'Hair Loss'],
      icon: 'Smile',
      avgConsultationMinutes: 7
    },
    {
      id: 'dept-dent',
      code: 'DENT',
      name: 'Dentistry / Dental',
      nameKn: 'ದಂತ ಚಿಕಿತ್ಸಾ ವಿಭಾಗ',
      description: 'Dental checkups, toothache, extractions, gum diseases, dental caries, and oral health maintenance.',
      symptoms: ['Toothache', 'Swollen Gums', 'Bleeding Gums', 'Cavities', 'Jaw Pain', 'Mouth Ulcer'],
      icon: 'Sparkles',
      avgConsultationMinutes: 12
    },
    {
      id: 'dept-psych',
      code: 'PSYCH',
      name: 'Psychiatry & Mental Health',
      nameKn: 'ಮನೋವೈದ್ಯಕೀಯ ಮತ್ತು ಮಾನಸಿಕ ಆರೋಗ್ಯ ವಿಭಾಗ',
      description: 'Counseling, mood disorders, depression, anxiety, insomnia, stress, and psychiatric rehabilitation.',
      symptoms: ['Severe Anxiety', 'Sleep Insomnia', 'Depression', 'Panic Attacks', 'Extreme Stress', 'Substance De-addiction'],
      icon: 'Brain',
      avgConsultationMinutes: 15
    },
    {
      id: 'dept-cardio',
      code: 'CARD',
      name: 'Cardiology',
      nameKn: 'ಹೃದ್ರೋಗ ವಿಭಾಗ (ಕಾರ್ಡಿಯಾಲಜಿ)',
      description: 'Heart conditions, post-cardiac event follow-up, hypertension management, and ECG/Echocardiogram.',
      symptoms: ['Chest Tightness', 'Palpitations', 'Shortness of Breath on Exertion', 'Swollen Ankles', 'High BP Management'],
      icon: 'Heart',
      avgConsultationMinutes: 12
    },
    {
      id: 'dept-emerg',
      code: 'EMRG',
      name: 'Emergency / Casualty',
      nameKn: 'ತುರ್ತು ಚಿಕಿತ್ಸಾ ವಿಭಾಗ (ಕ್ಯಾಶುಯಲ್ಟಿ)',
      description: '24x7 immediate medical attention for life-threatening conditions, trauma, accidents, acute poisoning, and acute breathlessness.',
      symptoms: ['Severe Chest Pain', 'Unconsciousness', 'Heavy Bleeding', 'Snake Bite', 'Accident Trauma', 'Severe Poisoning', 'Sudden Paralysis'],
      icon: 'AlertTriangle',
      avgConsultationMinutes: 5
    }
  ],

  doctors: [
    {
      id: 'doc-01',
      name: 'Dr. Ramesh Babu, MD',
      nameKn: 'ಡಾ. ರಮೇಶ್ ಬಾಬು, ಎಂಡಿ',
      qualification: 'MBBS, MD (General Medicine)',
      departmentId: 'dept-gm',
      hospitalId: 'hosp-01',
      opdDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opdHours: '9:00 AM - 1:30 PM',
      roomNumber: 'Room 12, OPD Block A',
      status: 'AVAILABLE',
      rating: 4.8
    },
    {
      id: 'doc-02',
      name: 'Dr. Ananya Rao, DCH',
      nameKn: 'ಡಾ. ಅನನ್ಯ ರಾವ್, ಡಿಸಿಎಚ್',
      qualification: 'MBBS, MD (Pediatrics)',
      departmentId: 'dept-ped',
      hospitalId: 'hosp-01',
      opdDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opdHours: '9:00 AM - 1:00 PM',
      roomNumber: 'Room 04, Pediatric Wing',
      status: 'AVAILABLE',
      rating: 4.9
    },
    {
      id: 'doc-03',
      name: 'Dr. Suresh Kumar, MS (Ortho)',
      nameKn: 'ಡಾ. ಸುರೇಶ್ ಕುಮಾರ್, ಎಂ.ಎಸ್ (ಆರ್ಥೋ)',
      qualification: 'MBBS, MS (Orthopedics)',
      departmentId: 'dept-orth',
      hospitalId: 'hosp-01',
      opdDays: ['Monday', 'Wednesday', 'Friday'],
      opdHours: '9:00 AM - 1:00 PM',
      roomNumber: 'Room 21, Fracture Clinic',
      status: 'AVAILABLE',
      rating: 4.7
    },
    {
      id: 'doc-04',
      name: 'Dr. Preethi Hegde, DGO',
      nameKn: 'ಡಾ. ಪ್ರೀತಿ ಹೆಗಡೆ, ಡಿಜಿಒ',
      qualification: 'MBBS, MS (OBG)',
      departmentId: 'dept-obg',
      hospitalId: 'hosp-02',
      opdDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opdHours: '9:30 AM - 1:00 PM',
      roomNumber: 'Room 02, Maternity Block',
      status: 'AVAILABLE',
      rating: 4.9
    },
    {
      id: 'doc-05',
      name: 'Dr. Manjunath Swamy, MD',
      nameKn: 'ಡಾ. ಮಂಜುನಾಥ ಸ್ವಾಮಿ, ಎಂಡಿ',
      qualification: 'MBBS, MD (Internal Medicine)',
      departmentId: 'dept-gm',
      hospitalId: 'hosp-04',
      opdDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opdHours: '9:00 AM - 1:30 PM',
      roomNumber: 'Room 01, Main Block',
      status: 'AVAILABLE',
      rating: 4.6
    }
  ],

  // Live tokens store
  tokens: [
    {
      id: 'tok-001',
      tokenNumber: 'GM-042',
      sequenceNumber: 42,
      patientName: 'Basavaraj Patil',
      patientPhone: '9845012345',
      patientAge: 52,
      patientGender: 'Male',
      hospitalId: 'hosp-01',
      hospitalName: 'Victoria Hospital (BMCRI)',
      departmentId: 'dept-gm',
      departmentName: 'General Medicine',
      departmentCode: 'GM',
      doctorName: 'Dr. Ramesh Babu, MD',
      date: new Date().toISOString().split('T')[0],
      slot: 'Morning (09:00 AM - 10:00 AM)',
      status: 'CONSULTING',
      bookedAt: new Date(Date.now() - 3600000).toISOString(),
      priority: 'NORMAL',
      symptoms: 'High fever and body ache since 3 days',
      fee: 10,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      transactionId: 'TXN-GOK-841920',
      paidAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'tok-002',
      tokenNumber: 'GM-043',
      sequenceNumber: 43,
      patientName: 'Kavitha Murthy',
      patientPhone: '9880198765',
      patientAge: 38,
      patientGender: 'Female',
      hospitalId: 'hosp-01',
      hospitalName: 'Victoria Hospital (BMCRI)',
      departmentId: 'dept-gm',
      departmentName: 'General Medicine',
      departmentCode: 'GM',
      doctorName: 'Dr. Ramesh Babu, MD',
      date: new Date().toISOString().split('T')[0],
      slot: 'Morning (10:00 AM - 11:00 AM)',
      status: 'CALLED',
      bookedAt: new Date(Date.now() - 3000000).toISOString(),
      priority: 'NORMAL',
      symptoms: 'Persistent dry cough and sore throat',
      fee: 10,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      transactionId: 'TXN-GOK-841921',
      paidAt: new Date(Date.now() - 3000000).toISOString()
    },
    {
      id: 'tok-003',
      tokenNumber: 'GM-044',
      sequenceNumber: 44,
      patientName: 'Somanna Gowda',
      patientPhone: '9448123456',
      patientAge: 64,
      patientGender: 'Male',
      hospitalId: 'hosp-01',
      hospitalName: 'Victoria Hospital (BMCRI)',
      departmentId: 'dept-gm',
      departmentName: 'General Medicine',
      departmentCode: 'GM',
      doctorName: 'Dr. Ramesh Babu, MD',
      date: new Date().toISOString().split('T')[0],
      slot: 'Morning (10:00 AM - 11:00 AM)',
      status: 'WAITING',
      bookedAt: new Date(Date.now() - 2400000).toISOString(),
      priority: 'NORMAL',
      symptoms: 'Diabetes routine checkup and weakness',
      fee: 10,
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
      transactionId: 'TXN-GOK-841922',
      paidAt: new Date(Date.now() - 2400000).toISOString()
    },
    {
      id: 'tok-004',
      tokenNumber: 'GM-045',
      sequenceNumber: 45,
      patientName: 'Girija Shivaraj',
      patientPhone: '9900234567',
      patientAge: 46,
      patientGender: 'Female',
      hospitalId: 'hosp-01',
      hospitalName: 'Victoria Hospital (BMCRI)',
      departmentId: 'dept-gm',
      departmentName: 'General Medicine',
      departmentCode: 'GM',
      doctorName: 'Dr. Ramesh Babu, MD',
      date: new Date().toISOString().split('T')[0],
      slot: 'Morning (11:00 AM - 12:00 PM)',
      status: 'WAITING',
      bookedAt: new Date(Date.now() - 1800000).toISOString(),
      priority: 'NORMAL',
      symptoms: 'Severe headache and fatigue',
      fee: 10,
      paymentStatus: 'PAY_AT_COUNTER',
      paymentMethod: 'CASH',
      transactionId: null,
      paidAt: null
    },
    {
      id: 'tok-005',
      tokenNumber: 'PED-018',
      sequenceNumber: 18,
      patientName: 'Master Tanmay (Parent: Manjula)',
      patientPhone: '9741567890',
      patientAge: 4,
      patientGender: 'Male',
      hospitalId: 'hosp-01',
      hospitalName: 'Victoria Hospital (BMCRI)',
      departmentId: 'dept-ped',
      departmentName: 'Pediatrics',
      departmentCode: 'PED',
      doctorName: 'Dr. Ananya Rao, DCH',
      date: new Date().toISOString().split('T')[0],
      slot: 'Morning (10:30 AM - 11:30 AM)',
      status: 'WAITING',
      bookedAt: new Date(Date.now() - 1200000).toISOString(),
      priority: 'NORMAL',
      symptoms: 'Fever and poor appetite in 4-year-old',
      fee: 0,
      paymentStatus: 'EXEMPT',
      paymentMethod: 'ABHA_EXEMPT',
      transactionId: 'TXN-GOK-ABHA-8419',
      paidAt: new Date(Date.now() - 1200000).toISOString()
    }
  ],

  // Users for Authentication
  users: [
    {
      id: 'usr-patient',
      fullName: 'Basavaraj Patil',
      email: 'patient@swasthyasetu.gov.in',
      phone: '9845012345',
      role: 'patient',
      gender: 'Male',
      age: 52,
      abhaId: '91-4567-8912-3456',
      district: 'Bengaluru Urban',
      taluk: 'Bengaluru South',
      preferredLanguage: 'kn'
    },
    {
      id: 'usr-staff',
      fullName: 'Sunitha K. (OPD Counter Staff)',
      email: 'staff@swasthyasetu.gov.in',
      phone: '9880011223',
      role: 'staff',
      hospitalId: 'hosp-01',
      hospitalName: 'Victoria Hospital (BMCRI)',
      counterNumber: 'Counter 3 - General OPD'
    },
    {
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
    {
      id: 'usr-admin',
      fullName: 'Dr. S. Nagaraj (Medical Superintendent)',
      email: 'admin@swasthyasetu.gov.in',
      phone: '9900112233',
      role: 'admin',
      hospitalId: 'hosp-01'
    }
  ],

  // RAG Knowledge Base Documents (Karnataka Government Hospital Rules, Schemes & OPD Timings)
  knowledgeBase: [
    {
      id: 'kb-01',
      title: 'OPD Registration & Token Rules in Karnataka Government Hospitals',
      titleKn: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಒಪಿಡಿ ನೋಂದಣಿ ಮತ್ತು ಟೋಕನ್ ನಿಯಮಗಳು',
      category: 'opd_rules',
      hospitalId: 'all',
      content: `In Karnataka government hospitals, morning OPD registration counters open at 8:00 AM and close at 1:00 PM from Monday to Saturday. Sunday morning has emergency casualty coverage only. Patients who generate a digital token online through SwasthyaSetu must present their token number at the designated Digital Express Counter at least 15 minutes before their estimated slot time. Registration charges are completely free under Arogya Karnataka / Ayushman Bharat scheme.`
    },
    {
      id: 'kb-02',
      title: 'Emergency and Casualty Protocol (108 Ambulance)',
      titleKn: 'ತುರ್ತು ಚಿಕಿತ್ಸೆ ಮತ್ತು 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಮಾರ್ಗಸೂಚಿ',
      category: 'emergency',
      hospitalId: 'all',
      content: `For life-threatening emergencies, snake bites, severe head trauma, acute chest pain, or sudden breathing difficulty, patients MUST NOT book an online OPD token. They should proceed directly to the 24x7 Emergency / Casualty entrance or dial 108 for immediate government ambulance assistance. Emergency triage does not require prior registration or waiting in the general OPD queue.`
    },
    {
      id: 'kb-03',
      title: 'Ayushman Bharat - Arogya Karnataka (AB-ArK) Free Healthcare Benefits',
      titleKn: 'ಆಯುಷ್ಮಾನ್ ಭಾರತ್ - ಆರೋಗ್ಯ ಕರ್ನಾಟಕ ಯೋಜನೆಯ ಉಚಿತ ಸೌಲಭ್ಯಗಳು',
      category: 'schemes',
      hospitalId: 'all',
      content: `Eligible ration card holders (BPL and APL) in Karnataka are entitled to free OPD consultations, essential medicines from government hospital pharmacies (Jan Aushadhi), basic blood tests, ultrasound, and digital X-rays at all Taluk, District, and Government Medical College Hospitals. Carry your Aadhaar card and Ration card or ABHA Health ID.`
    },
    {
      id: 'kb-04',
      title: 'Victoria Hospital (BMCRI) Special Clinic Schedule',
      titleKn: 'ವಿಕ್ಟೋರಿಯಾ ಆಸ್ಪತ್ರೆ ವಿಶೇಷ ಕ್ಲಿನಿಕ್ ವೇಳಾಪಟ್ಟಿ',
      category: 'hospital_schedule',
      hospitalId: 'hosp-01',
      content: `Victoria Hospital runs specialty clinics alongside General Medicine: Diabetic Clinic on Tuesdays & Thursdays (Room 14), Hypertension & Cardiac screening on Wednesdays, Geriatric (Senior Citizens) priority counter at Counter 1. Free dialysis operates in 3 shifts 24x7.`
    },
    {
      id: 'kb-05',
      title: 'Taluk Hospital Virajpet Services in Kodagu District',
      titleKn: 'ವಿರಾಜಪೇಟೆ ತಾಲೂಕು ಆಸ್ಪತ್ರೆಯ ಸೇವೆಗಳು (ಕೊಡಗು)',
      category: 'hospital_schedule',
      hospitalId: 'hosp-04',
      content: `Virajpet Taluk Hospital provides general medicine, maternal delivery services, pediatric care, anti-rabies vaccination, and 24-hour snakebite anti-venom treatment. Patients needing tertiary cardiology or neurology care are referred to K.R. Hospital Mysore via government 108 ambulance.`
    }
  ],

  // Audit Logs
  auditLogs: [
    {
      id: 'log-01',
      action: 'SYSTEM_STARTUP',
      details: 'SwasthyaSetu Server and In-Memory Data Store initialized successfully.',
      timestamp: new Date().toISOString(),
      performedBy: 'System'
    }
  ]
};

// -------------------------------------------------------------
// Helper: Medical Symptom to Department Routing Logic (Rule-Engine + AI)
// -------------------------------------------------------------

function ruleBasedDepartmentRecommendation(symptomsText) {
  const text = (symptomsText || '').toLowerCase();

  // Emergency triggers
  const emergencyKeywords = ['chest pain', 'heart attack', 'unconscious', 'snake bite', 'heavy bleeding', 'severe trauma', 'cannot breathe', 'poison', 'ತುರ್ತು', 'ಹಾವು ಕಡಿತ', 'ಎದೆ ನೋವು'];
  for (const kw of emergencyKeywords) {
    if (text.includes(kw)) {
      return {
        recommendedDepartment: 'Emergency / Casualty',
        departmentCode: 'EMRG',
        confidence: 'high',
        isEmergency: true,
        reason: 'The described condition indicates potential life-threatening emergency or trauma requiring immediate medical attention.',
        disclaimer: 'CRITICAL WARNING: If this is an emergency, seek immediate emergency medical care or call 108 ambulance immediately. Do not wait for an OPD token.',
        urgency: 'IMMEDIATE'
      };
    }
  }

  // Children / Pediatric keywords
  if (text.includes('child') || text.includes('baby') || text.includes('infant') || text.includes('toddler') || text.includes('kid') || text.includes('ಮಗು') || text.includes('ಮಕ್ಕಳು') || text.includes('vaccination')) {
    return {
      recommendedDepartment: 'Pediatrics',
      departmentCode: 'PED',
      confidence: 'high',
      isEmergency: false,
      reason: 'The issue pertains to an infant, child, or adolescent care/vaccination.',
      disclaimer: 'This is an administrative department recommendation, not a medical diagnosis. Please consult a qualified pediatrician.'
    };
  }

  // Women / Pregnancy / Gynae keywords
  if (text.includes('pregnant') || text.includes('pregnancy') || text.includes('period') || text.includes('menstrual') || text.includes('pelvic pain') || text.includes('ಗರ್ಭಿಣಿ') || text.includes('ಋತುಚಕ್ರ') || text.includes('maternity')) {
    return {
      recommendedDepartment: 'Obstetrics & Gynecology',
      departmentCode: 'OBG',
      confidence: 'high',
      isEmergency: false,
      reason: 'The described symptoms relate to women reproductive health, pregnancy care, or menstrual health.',
      disclaimer: 'This is an administrative department recommendation, not a medical diagnosis. Please consult a qualified gynecologist.'
    };
  }

  // Bones / Joints / Ortho
  if (text.includes('bone') || text.includes('joint') || text.includes('fracture') || text.includes('knee') || text.includes('walking difficulty') || text.includes('back pain') || text.includes('ಮೂಳೆ') || text.includes('ಕೀಲು ನೋವು') || text.includes('sprain')) {
    return {
      recommendedDepartment: 'Orthopedics',
      departmentCode: 'ORTH',
      confidence: 'high',
      isEmergency: false,
      reason: 'Symptoms indicate musculoskeletal, bone, or joint-related conditions.',
      disclaimer: 'This is an administrative department recommendation, not a medical diagnosis. Please consult an orthopedic specialist.'
    };
  }

  // Ear, Nose, Throat
  if (text.includes('ear') || text.includes('hearing') || text.includes('nose') || text.includes('throat') || text.includes('tonsil') || text.includes('ಕಿವಿ') || text.includes('ಮೂಗು') || text.includes('ಗಂಟಲು')) {
    return {
      recommendedDepartment: 'Ear, Nose & Throat (ENT)',
      departmentCode: 'ENT',
      confidence: 'high',
      isEmergency: false,
      reason: 'Symptoms are concentrated around the ear, nasal passages, or throat area.',
      disclaimer: 'This is an administrative department recommendation, not a medical diagnosis. Please consult an ENT doctor.'
    };
  }

  // Eye
  if (text.includes('eye') || text.includes('vision') || text.includes('blind') || text.includes('cataract') || text.includes('red eye') || text.includes('ಕಣ್ಣು') || text.includes('ದೃಷ್ಟಿ')) {
    return {
      recommendedDepartment: 'Ophthalmology (Eye)',
      departmentCode: 'OPH',
      confidence: 'high',
      isEmergency: false,
      reason: 'Symptoms involve vision changes, eye irritation, or eye conditions.',
      disclaimer: 'This is an administrative department recommendation, not a medical diagnosis. Please consult an ophthalmologist.'
    };
  }

  // Skin
  if (text.includes('skin') || text.includes('itching') || text.includes('rash') || text.includes('fungal') || text.includes('allergy') || text.includes('ಚರ್ಮ') || text.includes('ತುರಿಕೆ')) {
    return {
      recommendedDepartment: 'Dermatology (Skin)',
      departmentCode: 'DERM',
      confidence: 'high',
      isEmergency: false,
      reason: 'Symptoms involve skin eruptions, itching, rashes, or dermatological issues.',
      disclaimer: 'This is an administrative department recommendation, not a medical diagnosis. Please consult a dermatologist.'
    };
  }

  // Dental
  if (text.includes('tooth') || text.includes('teeth') || text.includes('gum') || text.includes('dental') || text.includes('ಹಲ್ಲು') || text.includes('ದಂತ')) {
    return {
      recommendedDepartment: 'Dentistry / Dental',
      departmentCode: 'DENT',
      confidence: 'high',
      isEmergency: false,
      reason: 'Symptoms involve teeth, gums, or oral cavity.',
      disclaimer: 'This is an administrative department recommendation, not a medical diagnosis. Please consult a dentist.'
    };
  }

  // Mental Health
  if (text.includes('anxiety') || text.includes('depress') || text.includes('stress') || text.includes('sleep') || text.includes('insomnia') || text.includes('ಮಾನಸಿಕ') || text.includes('ನಿದ್ರೆ ಬಾರದ')) {
    return {
      recommendedDepartment: 'Psychiatry & Mental Health',
      departmentCode: 'PSYCH',
      confidence: 'high',
      isEmergency: false,
      reason: 'Symptoms relate to mood, anxiety, sleep patterns, or mental well-being.',
      disclaimer: 'This is an administrative department recommendation, not a medical diagnosis. Please consult a mental health professional.'
    };
  }

  // Default: General Medicine
  return {
    recommendedDepartment: 'General Medicine',
    departmentCode: 'GM',
    confidence: 'medium',
    isEmergency: false,
    reason: 'Adult general health concerns such as fever, cough, body pain, weakness, or routine consultations are evaluated by the General Medicine OPD first.',
    disclaimer: 'This is an administrative department recommendation, not a medical diagnosis. The physician in General Medicine will examine you and refer you if specialist investigation is warranted.'
  };
}

// -------------------------------------------------------------
// Express Server Setup
// -------------------------------------------------------------

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // -------------------------------------------------------------
  // REST API Endpoints
  // -------------------------------------------------------------

  // 1. Auth Endpoints
  app.post('/api/auth/login', (req, res) => {
    const { email, role } = req.body;
    let user = null;

    if (email) {
      user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
    if (!user && role) {
      user = db.users.find(u => u.role === role);
    }
    if (!user) {
      user = db.users[0]; // fallback to default patient
    }

    res.json({
      success: true,
      token: 'jwt-mock-token-' + user.id + '-' + Date.now(),
      user
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const { fullName, phone, email, district, taluk, age, gender, abhaId, preferredLanguage } = req.body;
    if (!fullName || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone number are required.' });
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      fullName,
      email: email || `${phone}@patient.swasthyasetu.gov.in`,
      phone,
      role: 'patient',
      gender: gender || 'Not Specified',
      age: parseInt(age, 10) || 30,
      abhaId: abhaId || '',
      district: district || 'Bengaluru Urban',
      taluk: taluk || 'Bengaluru South',
      preferredLanguage: preferredLanguage || 'en'
    };

    db.users.push(newUser);
    res.json({
      success: true,
      token: 'jwt-mock-token-' + newUser.id + '-' + Date.now(),
      user: newUser
    });
  });

  app.get('/api/auth/me', (req, res) => {
    // Return sample patient as logged in user if not specified
    res.json({ success: true, user: db.users[0] });
  });

  // 2. Hospitals Endpoints
  app.get('/api/hospitals', (req, res) => {
    const { district, taluk, department, search } = req.query;
    let results = [...db.hospitals];

    if (district && district !== 'all') {
      results = results.filter(h => h.district.toLowerCase() === district.toLowerCase());
    }
    if (taluk && taluk !== 'all') {
      results = results.filter(h => h.taluk.toLowerCase() === taluk.toLowerCase());
    }
    if (department && department !== 'all') {
      results = results.filter(h => h.departments.includes(department));
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.nameKn.includes(q) ||
        h.district.toLowerCase().includes(q) ||
        h.taluk.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: results.length, data: results });
  });

  app.get('/api/hospitals/:id', (req, res) => {
    const hospital = db.hospitals.find(h => h.id === req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    // Expand department objects
    const expandedDepts = hospital.departments.map(deptId => db.departments.find(d => d.id === deptId)).filter(Boolean);
    const hospitalDoctors = db.doctors.filter(d => d.hospitalId === hospital.id);

    res.json({
      success: true,
      data: {
        ...hospital,
        departmentDetails: expandedDepts,
        doctors: hospitalDoctors
      }
    });
  });

  // 3. Departments Endpoints
  app.get('/api/departments', (req, res) => {
    res.json({ success: true, count: db.departments.length, data: db.departments });
  });

  app.get('/api/departments/:id', (req, res) => {
    const dept = db.departments.find(d => d.id === req.params.id);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, data: dept });
  });

  // 4. Doctors Endpoints
  app.get('/api/doctors', (req, res) => {
    const { hospitalId, departmentId } = req.query;
    let list = [...db.doctors];
    if (hospitalId) list = list.filter(d => d.hospitalId === hospitalId);
    if (departmentId) list = list.filter(d => d.departmentId === departmentId);
    res.json({ success: true, count: list.length, data: list });
  });

  // 5. Digital Token Endpoints (Concurrency-Safe Generation & Management)
  app.get('/api/tokens', (req, res) => {
    const { patientPhone, hospitalId, departmentId, date, status } = req.query;
    let list = [...db.tokens];

    if (patientPhone) list = list.filter(t => t.patientPhone === patientPhone);
    if (hospitalId) list = list.filter(t => t.hospitalId === hospitalId);
    if (departmentId) list = list.filter(t => t.departmentId === departmentId);
    if (date) list = list.filter(t => t.date === date);
    if (status) list = list.filter(t => t.status === status);

    // Sort by sequence number
    list.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    res.json({ success: true, count: list.length, data: list });
  });

  app.post('/api/tokens', (req, res) => {
    const {
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      hospitalId,
      departmentId,
      doctorId,
      slot,
      symptoms,
      priority,
      fee,
      paymentStatus,
      paymentMethod,
      transactionId,
      paidAt
    } = req.body;

    if (!patientName || !patientPhone || !hospitalId || !departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Patient Name, Phone, Hospital, and Department are required.'
      });
    }

    const todayDate = new Date().toISOString().split('T')[0];

    // Check duplicate active token for same patient on same date & dept
    const existing = db.tokens.find(t =>
      t.patientPhone === patientPhone &&
      t.hospitalId === hospitalId &&
      t.departmentId === departmentId &&
      t.date === todayDate &&
      ['BOOKED', 'WAITING', 'CALLED', 'CONSULTING'].includes(t.status)
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Patient already has an active token (${existing.tokenNumber}) for this department today.`,
        existingToken: existing
      });
    }

    const hospital = db.hospitals.find(h => h.id === hospitalId) || db.hospitals[0];
    const department = db.departments.find(d => d.id === departmentId) || db.departments[0];
    const doctor = db.doctors.find(d => d.id === doctorId) || db.doctors.find(d => d.departmentId === departmentId) || null;

    // Calculate next sequence number for this department today
    const deptTokensToday = db.tokens.filter(t => t.hospitalId === hospitalId && t.departmentId === departmentId && t.date === todayDate);
    const nextSeq = deptTokensToday.length + 1;
    const tokenNumber = `${department.code}-${String(nextSeq).padStart(3, '0')}`;

    // Payment calculation
    const resolvedFee = typeof fee === 'number' ? fee : (fee !== undefined && fee !== null ? Number(fee) : 10);
    const resolvedStatus = paymentStatus || (resolvedFee === 0 ? 'EXEMPT' : 'PAID');
    const resolvedMethod = paymentMethod || (resolvedStatus === 'EXEMPT' ? 'ABHA_EXEMPT' : (resolvedStatus === 'PAY_AT_COUNTER' ? 'CASH' : 'UPI'));
    const resolvedTxn = transactionId || (resolvedStatus === 'PAY_AT_COUNTER' ? null : `TXN-GOK-${Math.floor(100000 + Math.random() * 900000)}`);
    const resolvedPaidAt = paidAt || (resolvedStatus === 'PAY_AT_COUNTER' ? null : new Date().toISOString());

    const newToken = {
      id: 'tok-' + Date.now(),
      tokenNumber,
      sequenceNumber: nextSeq,
      patientName,
      patientPhone,
      patientAge: parseInt(patientAge, 10) || 35,
      patientGender: patientGender || 'Unspecified',
      hospitalId,
      hospitalName: hospital.name,
      departmentId,
      departmentName: department.name,
      departmentCode: department.code,
      doctorName: doctor ? doctor.name : 'OPD Duty Medical Officer',
      date: todayDate,
      slot: slot || 'Morning OPD (09:00 AM - 01:00 PM)',
      status: 'WAITING',
      bookedAt: new Date().toISOString(),
      priority: priority || 'NORMAL',
      symptoms: symptoms || 'General OPD consultation',
      // OPD Registration Fee & Payment Status
      fee: resolvedFee,
      paymentStatus: resolvedStatus,
      paymentMethod: resolvedMethod,
      transactionId: resolvedTxn,
      paidAt: resolvedPaidAt
    };

    db.tokens.push(newToken);
    hospital.activeTokensToday = (hospital.activeTokensToday || 0) + 1;

    db.auditLogs.unshift({
      id: 'log-' + Date.now(),
      action: 'TOKEN_GENERATED',
      details: `Token ${tokenNumber} issued to ${patientName} at ${hospital.name} (${department.name}) · Fee ₹${resolvedFee} (${resolvedStatus})`,
      timestamp: new Date().toISOString(),
      performedBy: patientName
    });

    res.status(201).json({
      success: true,
      message: `Token ${tokenNumber} generated successfully!`,
      data: newToken
    });
  });

  // Payment Verification API (Simulated Gateway Hook)
  app.post('/api/payments/verify', (req, res) => {
    const { amount, method, patientName, patientPhone, hospitalId } = req.body;
    const txnId = `TXN-GOK-${Math.floor(100000 + Math.random() * 900000)}`;
    res.json({
      success: true,
      transactionId: txnId,
      amount: typeof amount === 'number' ? amount : (Number(amount) || 10),
      paymentStatus: 'PAID',
      paymentMethod: method || 'UPI',
      paidAt: new Date().toISOString(),
      gateway: 'Karnataka One / NHA e-Hospital PG',
      message: `Government OPD registration fee of ₹${amount || 10} verified successfully.`
    });
  });

  // Pay for an existing unpaid token
  app.post('/api/tokens/:id/pay', (req, res) => {
    const token = db.tokens.find(t => t.id === req.params.id || t.tokenNumber === req.params.id);
    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }
    const { method, fee, transactionId } = req.body;
    token.paymentStatus = 'PAID';
    token.paymentMethod = method || 'UPI';
    token.fee = typeof fee === 'number' ? fee : (token.fee || 10);
    token.transactionId = transactionId || `TXN-GOK-${Math.floor(100000 + Math.random() * 900000)}`;
    token.paidAt = new Date().toISOString();

    db.auditLogs.unshift({
      id: 'log-' + Date.now(),
      action: 'PAYMENT_RECEIVED',
      details: `OPD fee ₹${token.fee} paid for token ${token.tokenNumber} via ${token.paymentMethod} (${token.transactionId})`,
      timestamp: new Date().toISOString(),
      performedBy: token.patientName
    });

    res.json({ success: true, message: 'Payment confirmed successfully', data: token });
  });

  app.get('/api/tokens/:id', (req, res) => {
    const token = db.tokens.find(t => t.id === req.params.id || t.tokenNumber === req.params.id);
    if (!token) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }
    res.json({ success: true, data: token });
  });

  app.delete('/api/tokens/:id', (req, res) => {
    const idx = db.tokens.findIndex(t => t.id === req.params.id || t.tokenNumber === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Token not found' });
    }
    const cancelled = db.tokens[idx];
    cancelled.status = 'CANCELLED';

    db.auditLogs.unshift({
      id: 'log-' + Date.now(),
      action: 'TOKEN_CANCELLED',
      details: `Token ${cancelled.tokenNumber} cancelled by patient.`,
      timestamp: new Date().toISOString(),
      performedBy: cancelled.patientName
    });

    res.json({ success: true, message: `Token ${cancelled.tokenNumber} cancelled.`, data: cancelled });
  });

  // 6. Live Queue System (Real-Time Status & Staff Operations)
  app.get('/api/queue/:hospitalId/:departmentId', (req, res) => {
    const { hospitalId, departmentId } = req.params;
    const todayDate = new Date().toISOString().split('T')[0];

    const tokens = db.tokens
      .filter(t => t.hospitalId === hospitalId && t.departmentId === departmentId && t.date === todayDate)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    const consultingToken = tokens.find(t => t.status === 'CONSULTING');
    const calledToken = tokens.find(t => t.status === 'CALLED');
    const waitingTokens = tokens.filter(t => t.status === 'WAITING');
    const completedTokens = tokens.filter(t => t.status === 'COMPLETED');

    const currentToken = consultingToken || calledToken || null;
    const waitingCount = waitingTokens.length;
    const dept = db.departments.find(d => d.id === departmentId);
    const avgMinutes = dept ? dept.avgConsultationMinutes : 8;
    const estimatedTotalWaitMinutes = waitingCount * avgMinutes;

    res.json({
      success: true,
      hospitalId,
      departmentId,
      departmentName: dept ? dept.name : '',
      currentToken,
      waitingCount,
      completedCount: completedTokens.length,
      estimatedTotalWaitMinutes,
      tokens
    });
  });

  // Staff Queue Action: Call Next, Consult, Complete, Skip, No-Show, Priority
  app.post('/api/queue/action', (req, res) => {
    const { hospitalId, departmentId, action, tokenId, staffName } = req.body;
    const todayDate = new Date().toISOString().split('T')[0];

    const deptTokens = db.tokens.filter(t =>
      t.hospitalId === hospitalId &&
      t.departmentId === departmentId &&
      t.date === todayDate
    );

    let targetToken = null;

    if (action === 'CALL_NEXT') {
      // Complete currently consulting if any
      const currentConsulting = deptTokens.find(t => t.status === 'CONSULTING');
      if (currentConsulting) {
        currentConsulting.status = 'COMPLETED';
      }
      // Call first WAITING or CALLED token
      const nextToken = deptTokens.find(t => t.status === 'WAITING' || t.status === 'CALLED');
      if (!nextToken) {
        return res.status(400).json({ success: false, message: 'No more waiting patients in this OPD queue.' });
      }
      nextToken.status = 'CALLED';
      targetToken = nextToken;
    } else if (action === 'START_CONSULT') {
      targetToken = deptTokens.find(t => t.id === tokenId);
      if (targetToken) targetToken.status = 'CONSULTING';
    } else if (action === 'COMPLETE') {
      targetToken = deptTokens.find(t => t.id === tokenId);
      if (targetToken) targetToken.status = 'COMPLETED';
    } else if (action === 'NO_SHOW') {
      targetToken = deptTokens.find(t => t.id === tokenId);
      if (targetToken) targetToken.status = 'NO_SHOW';
    } else if (action === 'EMERGENCY_PRIORITY') {
      targetToken = deptTokens.find(t => t.id === tokenId);
      if (targetToken) {
        targetToken.priority = 'EMERGENCY';
        targetToken.status = 'CALLED';
      }
    }

    db.auditLogs.unshift({
      id: 'log-' + Date.now(),
      action: `QUEUE_${action}`,
      details: `Action ${action} executed by ${staffName || 'Staff'} on token ${targetToken?.tokenNumber || 'queue'}`,
      timestamp: new Date().toISOString(),
      performedBy: staffName || 'Staff'
    });

    res.json({
      success: true,
      message: `Queue updated: ${action}`,
      token: targetToken
    });
  });

  // 7. Core AI: Symptom & Department Recommendation Endpoint
  app.post('/api/ai/department-recommendation', async (req, res) => {
    const { symptoms, language } = req.body;

    if (!symptoms || symptoms.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please describe the health complaint or symptoms.' });
    }

    // Baseline clinical deterministic recommendation
    const ruleResult = ruleBasedDepartmentRecommendation(symptoms);

    // If Gemini client is active, enhance with prompt engineering & strict non-diagnostic instructions
    if (aiClient) {
      try {
        const prompt = `You are SwasthyaSetu AI, an administrative healthcare navigation assistant for Karnataka Government Hospitals.
CRITICAL SAFETY DIRECTIVE:
1. You must NEVER diagnose a disease, claim certainty, prescribe drugs, or replace a doctor.
2. If this resembles an emergency (chest pain, acute breathing failure, snake bite, severe trauma), output isEmergency: true.
3. Recommend ONLY from the authorized hospital departments: General Medicine, Pediatrics, Obstetrics & Gynecology, Orthopedics, ENT, Ophthalmology, Dermatology, Dentistry, Psychiatry & Mental Health, Cardiology, Emergency / Casualty.
4. Language preference: ${language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : 'English'}.

User described complaint: "${symptoms}"

Respond with ONLY valid JSON matching this schema:
{
  "recommendedDepartment": "Exact Department Name",
  "reason": "Clear explanation of why this department is suitable for evaluation",
  "confidence": "high" | "medium",
  "isEmergency": boolean,
  "disclaimer": "This is an administrative recommendation to guide you to the right hospital OPD, not a medical diagnosis. Please consult a qualified doctor.",
  "adviceKn": "ಕನ್ನಡದಲ್ಲಿ ಸಂಕ್ಷಿಪ್ತ ಮಾಹಿತಿ (Short Kannada advice)",
  "urgency": "NORMAL" | "HIGH" | "IMMEDIATE"
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, source: 'gemini-ai', data: parsed });
        }
      } catch (err) {
        console.warn('Gemini recommendation call failed, using rule engine:', err.message);
      }
    }

    // Reliable Fallback
    res.json({
      success: true,
      source: 'clinical-rules-engine',
      data: ruleResult
    });
  });

  // 8. Core AI: Multilingual Chatbot (English & Kannada)
  app.post('/api/ai/chat', async (req, res) => {
    const { message, conversationHistory = [], language = 'en', hospitalId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    // Context from relevant knowledge base documents
    const relevantDocs = db.knowledgeBase.map(d => `${d.title}: ${d.content}`).join('\n\n');

    if (aiClient) {
      try {
        const systemPrompt = `You are SwasthyaSetu AI (ಸ್ವಾಸ್ಥ್ಯಸೇತು), an official, polite, and helpful assistant for Karnataka Government Hospitals.
Role & Strict Guidelines:
- Assist patients in finding government hospitals, understanding OPD timings, booking tokens, checking queue positions, and navigating departments.
- NEVER diagnose diseases, NEVER prescribe medicines or dosages.
- Always include a calm disclaimer that you are an administrative guide, not a physician.
- If user writes or asks in Kannada, answer in fluent, respectful Kannada (ಕನ್ನಡ).
- If user reports an emergency (chest pain, snake bite, heavy blood loss, head trauma), immediately instruct them to call 108 or go to the nearest 24x7 Casualty.

Available Karnataka Hospital Knowledge:
${relevantDocs}`;

        const prompt = `${systemPrompt}

User Language: ${language}
User message: ${message}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });

        return res.json({
          success: true,
          reply: response.text,
          source: 'gemini-ai'
        });
      } catch (err) {
        console.warn('Gemini chat failed, fallback to knowledge retrieval:', err.message);
      }
    }

    // Fallback response generator with bilingual support
    let reply = '';
    const q = message.toLowerCase();

    if (q.includes('timing') || q.includes('time') || q.includes('ವೇಳೆ') || q.includes('ಸಮಯ')) {
      reply = language === 'kn'
        ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ಸಾಮಾನ್ಯ ಒಪಿಡಿ ನೋಂದಣಿ ಸೋಮವಾರದಿಂದ ಶನಿವಾರದವರೆಗೆ ಬೆಳಗ್ಗೆ 8:30 ರಿಂದ ಮಧ್ಯಾಹ್ನ 1:30 ರವರೆಗೆ ಇರುತ್ತದೆ. ತುರ್ತು ಚಿಕಿತ್ಸೆ (ಕ್ಯಾಶುಯಲ್ಟಿ) 24x7 ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.'
        : 'General OPD registration in Karnataka Government Hospitals is open from 8:30 AM to 1:30 PM (Monday to Saturday). Emergency / Casualty operates 24x7.';
    } else if (q.includes('token') || q.includes('queue') || q.includes('ಟೋಕನ್') || q.includes('ಸರದಿ')) {
      reply = language === 'kn'
        ? 'ಸ್ವಾಸ್ಥ್ಯಸೇತು ಮೂಲಕ ನೀವು ಮನೆಯಿಂದಲೇ ಡಿಜಿಟಲ್ ಒಪಿಡಿ ಟೋಕನ್ ಪಡೆಯಬಹುದು. ಆಸ್ಪತ್ರೆಯ ಡಿಸ್‌ಪ್ಲೇ ಪರದೆಯಲ್ಲಿ ನಿಮ್ಮ ಟೋಕನ್ ಸಂಖ್ಯೆ ಪ್ರದರ್ಶಿತವಾಗುತ್ತದೆ.'
        : 'You can generate a digital OPD token directly through SwasthyaSetu. You will receive an exact token number (e.g., GM-042) and estimated waiting time.';
    } else if (q.includes('emergency') || q.includes('ತುರ್ತು') || q.includes('108') || q.includes('snake')) {
      reply = language === 'kn'
        ? 'ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ದಯವಿಟ್ಟು ಆನ್‌ಲೈನ್ ಟೋಕನ್‌ಗಾಗಿ ಕಾಯಬೇಡಿ. ತಕ್ಷಣ 108 ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ನೇರವಾಗಿ 24x7 ತುರ್ತು ವಿಭಾಗಕ್ಕೆ (Casualty) ಭೇಟಿ ನೀಡಿ.'
        : 'If this is a medical emergency, DO NOT wait for an online OPD token. Please dial 108 immediately or proceed directly to the hospital 24x7 Emergency Casualty entrance.';
    } else {
      reply = language === 'kn'
        ? `ನಮಸ್ಕಾರ! ನಾನು ಸ್ವಾಸ್ಥ್ಯಸೇತು ಸಹಾಯಕ. ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳ ಹುಡುಕಾಟ, ಒಪಿಡಿ ಸಮಯ, ಟೋಕನ್ ಬುಕಿಂಗ್ ಮತ್ತು ಸರಿಯಾದ ವಿಭಾಗ ಆಯ್ಕೆ ಮಾಡಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ನೀವು ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಹಂಚಿಕೊಳ್ಳಬಹುದು.`
        : `Hello! I am your SwasthyaSetu assistant. I can help you locate Karnataka government hospitals, check OPD schedules, generate tokens, and recommend the right department. How can I help you today?`;
    }

    res.json({
      success: true,
      reply,
      source: 'knowledge-retrieval'
    });
  });

  // 9. AI Smart Search: Natural Language to Filter Converter
  app.post('/api/ai/search', async (req, res) => {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query string is required.' });
    }

    const q = query.toLowerCase();
    let detectedDistrict = 'all';
    let detectedDept = 'all';

    if (q.includes('bengaluru') || q.includes('bangalore') || q.includes('ಬೆಂಗಳೂರು')) detectedDistrict = 'Bengaluru Urban';
    else if (q.includes('mysuru') || q.includes('mysore') || q.includes('ಮೈಸೂರು')) detectedDistrict = 'Mysuru';
    else if (q.includes('kodagu') || q.includes('coorg') || q.includes('virajpet') || q.includes('madikeri') || q.includes('ಕೊಡಗು')) detectedDistrict = 'Kodagu';
    else if (q.includes('mangaluru') || q.includes('mangalore') || q.includes('ದಕ್ಷಿಣ ಕನ್ನಡ')) detectedDistrict = 'Dakshina Kannada';

    if (q.includes('child') || q.includes('pediatric') || q.includes('ಮಗು')) detectedDept = 'dept-ped';
    else if (q.includes('bone') || q.includes('ortho') || q.includes('joint') || q.includes('ಮೂಳೆ')) detectedDept = 'dept-orth';
    else if (q.includes('pregnant') || q.includes('pregnancy') || q.includes('women') || q.includes('ಗರ್ಭಿಣಿ')) detectedDept = 'dept-obg';
    else if (q.includes('eye') || q.includes('ophthalmology') || q.includes('ಕಣ್ಣು')) detectedDept = 'dept-oph';
    else if (q.includes('skin') || q.includes('derma') || q.includes('ಚರ್ಮ')) detectedDept = 'dept-derm';
    else if (q.includes('ear') || q.includes('ent') || q.includes('throat')) detectedDept = 'dept-ent';

    let filtered = [...db.hospitals];
    if (detectedDistrict !== 'all') {
      filtered = filtered.filter(h => h.district.toLowerCase() === detectedDistrict.toLowerCase());
    }
    if (detectedDept !== 'all') {
      filtered = filtered.filter(h => h.departments.includes(detectedDept));
    }

    res.json({
      success: true,
      query,
      filters: {
        district: detectedDistrict,
        departmentId: detectedDept
      },
      results: filtered
    });
  });

  // 10. RAG Hospital Information Assistant
  app.get('/api/ai/rag/documents', (req, res) => {
    res.json({ success: true, count: db.knowledgeBase.length, data: db.knowledgeBase });
  });

  // 11. AI Agent Workflow with Explicit Confirmation
  app.post('/api/ai/agent', (req, res) => {
    const { action, intent, params } = req.body;

    if (action === 'PLAN_BOOKING') {
      // Find hospital and department based on user query
      const hospital = db.hospitals[0];
      const dept = db.departments[0];
      const todayDate = new Date().toISOString().split('T')[0];
      const estToken = `${dept.code}-0${db.tokens.length + 1}`;

      return res.json({
        success: true,
        step: 'CONFIRMATION_REQUIRED',
        plan: {
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          departmentId: dept.id,
          departmentName: dept.name,
          date: todayDate,
          estimatedTokenNumber: estToken,
          message: `I have found an available slot for ${dept.name} at ${hospital.name} today. Would you like me to book Token ${estToken}? Please confirm to proceed.`
        }
      });
    }

    res.json({ success: true, message: 'Agent action processed.' });
  });

  // 12. Admin Analytics
  app.get('/api/admin/analytics', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const totalTokensToday = db.tokens.filter(t => t.date === today).length;
    const completedToday = db.tokens.filter(t => t.date === today && t.status === 'COMPLETED').length;
    const noShowToday = db.tokens.filter(t => t.date === today && t.status === 'NO_SHOW').length;
    const waitingNow = db.tokens.filter(t => t.date === today && t.status === 'WAITING').length;

    res.json({
      success: true,
      stats: {
        totalHospitals: db.hospitals.length,
        totalDepartments: db.departments.length,
        totalDoctors: db.doctors.length,
        totalPatientsRegistered: db.users.filter(u => u.role === 'patient').length + 154,
        totalTokensToday: totalTokensToday + 482,
        completedToday: completedToday + 360,
        waitingNow: waitingNow + 94,
        noShowToday: noShowToday + 28,
        avgWaitingTimeMinutes: 24,
        cancellationRate: '4.2%',
        opdUtilization: '88.5%',
        dailyTrend: [
          { day: 'Mon', tokens: 680, completed: 640 },
          { day: 'Tue', tokens: 720, completed: 690 },
          { day: 'Wed', tokens: 650, completed: 620 },
          { day: 'Thu', tokens: 710, completed: 670 },
          { day: 'Fri', tokens: 740, completed: 700 },
          { day: 'Sat', tokens: 590, completed: 570 }
        ]
      },
      auditLogs: db.auditLogs.slice(0, 10)
    });
  });

  // -------------------------------------------------------------
  // Frontend Serving (Vite dev middlewares or Static dist)
  // -------------------------------------------------------------

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SwasthyaSetu Server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
