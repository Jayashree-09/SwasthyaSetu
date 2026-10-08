import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Layers,
  Building2,
  Navigation,
  Stethoscope,
  Baby,
  HeartPulse,
  Activity,
  Ear,
  Eye,
  Smile,
  Sparkles,
  Heart,
  Brain,
  AlertTriangle,
  Pill,
  FlaskConical,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Printer,
  ArrowRight,
  Accessibility,
  Info,
  Clock,
  User,
  Search,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ArrowUp,
  Ticket,
  Maximize2,
  QrCode
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { api } from '../services/api.js';

/**
 * Floor plan layout data models
 * Structured by floor level with precise room coordinates, dimensions, doors, and SVG metadata.
 */
export const HOSPITAL_FLOORS = [
  {
    id: 'GF',
    level: 0,
    name: 'Ground Floor',
    nameKn: 'ನೆಲ ಮಹಡಿ (ಗ್ರೌಂಡ್ ಫ್ಲೋರ್)',
    tagline: 'Emergency, Registration, Pharmacy & Main Atrium',
    taglineKn: 'ತುರ್ತು ಚಿಕಿತ್ಸೆ, ನೋಂದಣಿ ಕೌಂಟರ್, ಜನ ಔಷಧಿ ಮತ್ತು ಸ್ವಾಗತ ವಿಭಾಗ',
    rooms: [
      {
        id: 'dept-emerg',
        code: 'EMRG',
        roomNumber: 'Room G-01',
        name: '24x7 Emergency & Casualty',
        nameKn: 'ತುರ್ತು ಚಿಕಿತ್ಸಾ ವಿಭಾಗ (ಕ್ಯಾಶುಯಲ್ಟಿ)',
        type: 'emergency',
        wing: 'West Wing (Red Zone)',
        x: 40,
        y: 40,
        width: 250,
        height: 170,
        icon: AlertTriangle,
        color: 'rose',
        doctor: 'Dr. Girish V., Emergency Medical Officer',
        timings: '24 Hours Open (Always Active)',
        waitEstimate: '0-5 mins (Immediate Triage)',
        accessible: true,
        landmark: 'Immediate left from Hospital Main Ambulance Gate'
      },
      {
        id: 'dept-reg',
        code: 'REG',
        roomNumber: 'Counters 1-8',
        name: 'Express OPD Registration & Smart Token Kiosks',
        nameKn: 'ಡಿಜಿಟಲ್ ನೋಂದಣಿ ಮತ್ತು ಟೋಕನ್ ಕಿಯೋಸ್ಕ್',
        type: 'service',
        wing: 'Central Atrium',
        x: 320,
        y: 40,
        width: 280,
        height: 170,
        icon: QrCode,
        color: 'emerald',
        doctor: 'Sunitha K. & Digital Helpdesk Team',
        timings: '8:00 AM - 1:30 PM',
        waitEstimate: '2-4 mins for QR Express Scan',
        accessible: true,
        landmark: 'Center of Main Entry Foyer under Digital Display'
      },
      {
        id: 'dept-pharm',
        code: 'PHARM',
        roomNumber: 'Room G-02',
        name: 'Jan Aushadhi Kendra (Free Generic Pharmacy)',
        nameKn: 'ಜನ ಔಷಧಿ ಕೇಂದ್ರ (ಉಚಿತ ಔಷಧಿ ವಿಭಾಗ)',
        type: 'pharmacy',
        wing: 'East Wing',
        x: 630,
        y: 40,
        width: 250,
        height: 170,
        icon: Pill,
        color: 'teal',
        doctor: 'Chief Pharmacist Jagadish N.',
        timings: '8:30 AM - 4:00 PM',
        waitEstimate: '5-8 mins queue',
        accessible: true,
        landmark: 'Near East Exit & Ayushman Arogya Desk'
      },
      {
        id: 'dept-blood',
        code: 'BLOOD',
        roomNumber: 'Room G-03',
        name: 'Regional Blood Bank & Transfusion Center',
        nameKn: 'ರಕ್ತನಿಧಿ ಕೇಂದ್ರ (ಬ್ಲಡ್ ಬ್ಯಾಂಕ್)',
        type: 'facility',
        wing: 'West Wing',
        x: 40,
        y: 310,
        width: 250,
        height: 180,
        icon: HeartPulse,
        color: 'red',
        doctor: 'Dr. Sudha Rani, Transfusion Specialist',
        timings: '24x7 Emergency Services',
        waitEstimate: '10 mins for screening',
        accessible: true,
        landmark: 'Next to Emergency ramp, Ground floor'
      },
      {
        id: 'amenity-help',
        code: 'HELP',
        roomNumber: 'Desk A',
        name: 'May I Help You & Wheelchair Assistance Desk',
        nameKn: 'ಸಹಾಯವಾಣಿ ಮತ್ತು ಗಾಲಿಕುರ್ಚಿ ನೆರವು ಕೇಂದ್ರ',
        type: 'helpdesk',
        wing: 'Main Entrance Foyer',
        x: 320,
        y: 310,
        width: 280,
        height: 180,
        icon: Accessibility,
        color: 'sky',
        doctor: 'Arogya Mitra Patient Navigators',
        timings: '8:00 AM - 6:00 PM',
        waitEstimate: 'Instant Assistance',
        accessible: true,
        landmark: 'Directly at the Main Gate Reception desk'
      },
      {
        id: 'amenity-lounge',
        code: 'LOUNGE',
        roomNumber: 'Atrium Hall',
        name: 'Central Patient Waiting Lounge & Live Queue Boards',
        nameKn: 'ಕೇಂದ್ರ ಕಾಯುವ ಸಭಾಂಗಣ ಮತ್ತು ಲೈವ್ ಡಿಸ್ಪ್ಲೇ',
        type: 'lounge',
        wing: 'East Wing',
        x: 630,
        y: 310,
        width: 250,
        height: 180,
        icon: Info,
        color: 'slate',
        doctor: 'Hospital Administrative Staff',
        timings: 'Open during all OPD hours',
        waitEstimate: 'Seating capacity: 250 patients',
        accessible: true,
        landmark: 'Directly opposite Jan Aushadhi Pharmacy'
      }
    ]
  },
  {
    id: '1F',
    level: 1,
    name: 'First Floor',
    nameKn: 'ಮೊದಲನೇ ಮಹಡಿ (ಫಸ್ಟ್ ಫ್ಲೋರ್)',
    tagline: 'General Medicine, Pediatrics & Maternity (OBG)',
    taglineKn: 'ಸಾಮಾನ್ಯ ವೈದ್ಯಕೀಯ, ಮಕ್ಕಳ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಪ್ರಸೂತಿ ವಿಭಾಗ',
    rooms: [
      {
        id: 'dept-gm',
        code: 'GM',
        roomNumber: 'Rooms 101 - 104',
        name: 'General Medicine OPD',
        nameKn: 'ಸಾಮಾನ್ಯ ವೈದ್ಯಕೀಯ (ಜನರಲ್ ಮೆಡಿಸಿನ್)',
        type: 'opd',
        wing: 'West Wing (Chambers 101-104)',
        x: 40,
        y: 40,
        width: 250,
        height: 170,
        icon: Stethoscope,
        color: 'emerald',
        doctor: 'Dr. Ramesh Babu, MD (Medicine) & Team',
        timings: '8:30 AM - 1:30 PM (Mon-Sat)',
        waitEstimate: '15-25 mins',
        accessible: true,
        landmark: 'Take Lift A to 1st Floor, turn sharp left down Corridor A'
      },
      {
        id: 'dept-ped',
        code: 'PED',
        roomNumber: 'Rooms 105 - 108',
        name: 'Pediatrics & Child Immunization OPD',
        nameKn: 'ಮಕ್ಕಳ ಚಿಕಿತ್ಸಾ ವಿಭಾಗ (ಪೀಡಿಯಾಟ್ರಿಕ್ಸ್)',
        type: 'opd',
        wing: 'North Central Corridor',
        x: 320,
        y: 40,
        width: 280,
        height: 170,
        icon: Baby,
        color: 'amber',
        doctor: 'Dr. Anitha Rao, MD (Pediatrics)',
        timings: '9:00 AM - 1:30 PM (Mon-Sat)',
        waitEstimate: '10-20 mins',
        accessible: true,
        landmark: 'First Floor Central Corridor, opposite Lift Bank A'
      },
      {
        id: 'dept-obg',
        code: 'OBG',
        roomNumber: 'Rooms 109 - 112',
        name: 'Obstetrics & Gynecology (Maternity Care)',
        nameKn: 'ಪ್ರಸೂತಿ ಮತ್ತು ಸ್ತ್ರೀರೋಗ ವಿಭಾಗ',
        type: 'opd',
        wing: 'East Wing (Women & Child Block)',
        x: 630,
        y: 40,
        width: 250,
        height: 170,
        icon: HeartPulse,
        color: 'pink',
        doctor: 'Dr. Preethi Hegde, DGO & Dr. Sunitha M.',
        timings: '9:00 AM - 1:00 PM, 2:00 PM - 4:00 PM',
        waitEstimate: '15-30 mins',
        accessible: true,
        landmark: 'East Wing Maternity corridor with dedicated antenatal lounge'
      },
      {
        id: 'amenity-minor-ot',
        code: 'MOT',
        roomNumber: 'Room 113',
        name: 'Minor Procedure & Dressing Room',
        nameKn: 'ಸಣ್ಣ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಮತ್ತು ಬ್ಯಾಂಡೇಜ್ ಕೊಠಡಿ',
        type: 'facility',
        wing: 'West Wing',
        x: 40,
        y: 310,
        width: 250,
        height: 180,
        icon: Activity,
        color: 'teal',
        doctor: 'Staff Nurse & Duty Assistant',
        timings: '9:00 AM - 3:30 PM',
        waitEstimate: '5-10 mins',
        accessible: true,
        landmark: 'Adjacent to General Medicine Room 104'
      },
      {
        id: 'amenity-nurse',
        code: 'NURSE',
        roomNumber: 'Station 1A',
        name: 'Central 1st Floor Nursing Station & Vitals Check',
        nameKn: 'ಶುಶ್ರೂಷಕರ ಕೇಂದ್ರ ಮತ್ತು ರಕ್ತದೊತ್ತಡ/ಜ್ವರ ತಪಾಸಣೆ',
        type: 'service',
        wing: 'Central Core',
        x: 320,
        y: 310,
        width: 280,
        height: 180,
        icon: CheckCircle2,
        color: 'indigo',
        doctor: 'Senior Nursing Supervisor Gangamma',
        timings: 'Continuous OPD Hours',
        waitEstimate: '3 mins (BP, Temperature & Weight)',
        accessible: true,
        landmark: 'Directly in front of Staircase 1 and Water Station'
      },
      {
        id: 'amenity-vaccine',
        code: 'VAX',
        roomNumber: 'Room 115',
        name: 'Universal Immunization & Polio Booth',
        nameKn: 'ಲಸಿಕಾ ವಿಭಾಗ (ಉಚಿತ ಪೋಲಿಯೋ ಮತ್ತು ಲಸಿಕೆಗಳು)',
        type: 'facility',
        wing: 'East Wing',
        x: 630,
        y: 310,
        width: 250,
        height: 180,
        icon: Sparkles,
        color: 'violet',
        doctor: 'Immunization Officer & ANM Workers',
        timings: '9:30 AM - 2:00 PM (Daily)',
        waitEstimate: '5 mins',
        accessible: true,
        landmark: 'Inside Pediatrics & OBG East Wing junction'
      }
    ]
  },
  {
    id: '2F',
    level: 2,
    name: 'Second Floor',
    nameKn: 'ಎರಡನೇ ಮಹಡಿ (ಸೆಕೆಂಡ್ ಫ್ಲೋರ್)',
    tagline: 'Orthopedics, ENT, Eye, Dental, Skin & Pathology',
    taglineKn: 'ಮೂಳೆ, ಇ.ಎನ್.ಟಿ, ಕಣ್ಣು, ದಂತ, ಚರ್ಮ ಮತ್ತು ಪ್ರಯೋಗಾಲಯ ವಿಭಾಗ',
    rooms: [
      {
        id: 'dept-orth',
        code: 'ORTH',
        roomNumber: 'Rooms 201 - 204',
        name: 'Orthopedics & Fracture Clinic',
        nameKn: 'ಮೂಳೆ ಮತ್ತು ಕೀಲು ರೋಗ ವಿಭಾಗ (ಆರ್ಥೋಪೆಡಿಕ್ಸ್)',
        type: 'opd',
        wing: 'West Wing (Rooms 201-204)',
        x: 40,
        y: 40,
        width: 250,
        height: 170,
        icon: Activity,
        color: 'blue',
        doctor: 'Dr. Suresh Kumar, MS (Ortho) & Specialists',
        timings: '9:00 AM - 1:00 PM (Mon-Sat)',
        waitEstimate: '20-30 mins',
        accessible: true,
        landmark: 'Exit Lift A on 2nd Floor, straight into West Corridor'
      },
      {
        id: 'dept-ent',
        code: 'ENT',
        roomNumber: 'Rooms 205 - 207',
        name: 'Ear, Nose & Throat (ENT) & Audiology',
        nameKn: 'ಕಿವಿ, ಮೂಗು ಮತ್ತು ಗಂಟಲು ವಿಭಾಗ (ಇ.ಎನ್.ಟಿ)',
        type: 'opd',
        wing: 'Central Corridor North',
        x: 320,
        y: 40,
        width: 280,
        height: 170,
        icon: Ear,
        color: 'cyan',
        doctor: 'Dr. Vinayaka Shastri, MS (ENT)',
        timings: '9:00 AM - 1:30 PM (Mon-Sat)',
        waitEstimate: '10-15 mins',
        accessible: true,
        landmark: 'Facing Central Skylight Atrium, 2nd Floor'
      },
      {
        id: 'dept-oph',
        code: 'OPH',
        roomNumber: 'Rooms 208 - 210',
        name: 'Ophthalmology (Eye Clinic & Vision Test)',
        nameKn: 'ನೇತ್ರ ಚಿಕಿತ್ಸಾ ವಿಭಾಗ (ಕಣ್ಣಿನ ವಿಭಾಗ)',
        type: 'opd',
        wing: 'East Wing (Dark Room & Cataract Screening)',
        x: 630,
        y: 40,
        width: 250,
        height: 170,
        icon: Eye,
        color: 'emerald',
        doctor: 'Dr. Rekha N., MS (Ophthalmology)',
        timings: '9:00 AM - 1:00 PM',
        waitEstimate: '15-20 mins (Vision testing included)',
        accessible: true,
        landmark: 'East Wing corridor past Audiometry Room'
      },
      {
        id: 'dept-dent',
        code: 'DENT',
        roomNumber: 'Rooms 211 - 213',
        name: 'Dentistry & Oral Surgery OPD',
        nameKn: 'ದಂತ ಚಿಕಿತ್ಸಾ ವಿಭಾಗ (ಡೆಂಟಲ್)',
        type: 'opd',
        wing: 'West Wing South',
        x: 40,
        y: 310,
        width: 250,
        height: 180,
        icon: Sparkles,
        color: 'sky',
        doctor: 'Dr. Chandrashekar, MDS (Dental Surgeon)',
        timings: '9:00 AM - 1:30 PM',
        waitEstimate: '15-25 mins',
        accessible: true,
        landmark: 'Next to Orthopedic Plaster Room 204'
      },
      {
        id: 'dept-derm',
        code: 'DERM',
        roomNumber: 'Rooms 214 - 216',
        name: 'Dermatology & Skin Care OPD',
        nameKn: 'ಚರ್ಮರೋಗ ವಿಭಾಗ (ಡರ್ಮಟಾಲಜಿ)',
        type: 'opd',
        wing: 'Central Core South',
        x: 320,
        y: 310,
        width: 280,
        height: 180,
        icon: Smile,
        color: 'amber',
        doctor: 'Dr. Manjula Devi, MD (Dermatology)',
        timings: '9:00 AM - 1:00 PM',
        waitEstimate: '10-15 mins',
        accessible: true,
        landmark: 'Opposite Central Staircase 2 on Second Floor'
      },
      {
        id: 'dept-lab',
        code: 'LAB',
        roomNumber: 'Room 217',
        name: 'Diagnostic Clinical Laboratory & Blood Testing',
        nameKn: 'ಪ್ರಯೋಗಾಲಯ ಮತ್ತು ರಕ್ತ ಪರೀಕ್ಷಾ ಕೇಂದ್ರ',
        type: 'facility',
        wing: 'East Wing South',
        x: 630,
        y: 310,
        width: 250,
        height: 180,
        icon: FlaskConical,
        color: 'purple',
        doctor: 'Chief Pathologist Dr. Nanjundappa',
        timings: '8:00 AM - 2:00 PM for Sample Collection',
        waitEstimate: '5-10 mins (Results digitally linked to token)',
        accessible: true,
        landmark: 'End of East Wing, adjacent to Vision Refraction Lab'
      }
    ]
  },
  {
    id: '3F',
    level: 3,
    name: 'Third Floor',
    nameKn: 'ಮೂರನೇ ಮಹಡಿ (ಥರ್ಡ್ ಫ್ಲೋರ್)',
    tagline: 'Cardiology, Mental Health, Imaging & Dialysis Unit',
    taglineKn: 'ಹೃದ್ರೋಗ, ಮಾನಸಿಕ ಆರೋಗ್ಯ, ಡಿಜಿಟಲ್ ಎಕ್ಸ್‌ರೇ ಮತ್ತು ಡಯಾಲಿಸಿಸ್',
    rooms: [
      {
        id: 'dept-cardio',
        code: 'CARD',
        roomNumber: 'Rooms 301 - 303',
        name: 'Cardiology OPD & ECG / Echo Lab',
        nameKn: 'ಹೃದ್ರೋಗ ವಿಭಾಗ (ಕಾರ್ಡಿಯಾಲಜಿ)',
        type: 'opd',
        wing: 'West Wing (Cardiac Care Wing)',
        x: 40,
        y: 40,
        width: 250,
        height: 170,
        icon: Heart,
        color: 'rose',
        doctor: 'Dr. Santhosh Kumar, DM (Cardiology)',
        timings: '9:30 AM - 1:30 PM (Mon, Wed, Fri)',
        waitEstimate: '15-20 mins',
        accessible: true,
        landmark: 'Take Lift A to 3rd Floor, proceed West past ECG Room'
      },
      {
        id: 'dept-psych',
        code: 'PSYCH',
        roomNumber: 'Rooms 304 - 306',
        name: 'Psychiatry & Mental Health Counseling',
        nameKn: 'ಮನೋವೈದ್ಯಕೀಯ ಮತ್ತು ಮಾನಸಿಕ ಆರೋಗ್ಯ ವಿಭಾಗ',
        type: 'opd',
        wing: 'North Central Corridor (Quiet Zone)',
        x: 320,
        y: 40,
        width: 280,
        height: 170,
        icon: Brain,
        color: 'violet',
        doctor: 'Dr. Shalini Gowda, MD (Psychiatry)',
        timings: '9:30 AM - 1:30 PM (Daily)',
        waitEstimate: '15-25 mins (Private consultation chambers)',
        accessible: true,
        landmark: 'Quiet wing facing North Garden, 3rd Floor'
      },
      {
        id: 'dept-xray',
        code: 'XRAY',
        roomNumber: 'Room 307',
        name: 'Digital X-Ray & Ultrasound Imaging Unit',
        nameKn: 'ಡಿಜಿಟಲ್ ಎಕ್ಸ್‌ರೇ ಮತ್ತು ಅಲ್ಟ್ರಾಸೌಂಡ್ ವಿಭಾಗ',
        type: 'facility',
        wing: 'East Wing (Radiology)',
        x: 630,
        y: 40,
        width: 250,
        height: 170,
        icon: Activity,
        color: 'blue',
        doctor: 'Senior Radiologist Dr. Siddaraju',
        timings: '8:30 AM - 3:30 PM',
        waitEstimate: '10-15 mins for digital token holders',
        accessible: true,
        landmark: 'Follow yellow floor markings from Lift A to East Wing'
      },
      {
        id: 'dept-dialysis',
        code: 'DIAL',
        roomNumber: 'Rooms 308 - 310',
        name: 'Government Hemodialysis Unit (Free Suvarna Care)',
        nameKn: 'ಉಚಿತ ಡಯಾಲಿಸಿಸ್ ಚಿಕಿತ್ಸಾ ಘಟಕ',
        type: 'facility',
        wing: 'West Wing South',
        x: 40,
        y: 310,
        width: 250,
        height: 180,
        icon: HeartPulse,
        color: 'emerald',
        doctor: 'Duty Nephrologist & Dialysis Technicians',
        timings: '24x7 In Shifts (Free treatment scheme)',
        waitEstimate: 'Scheduled slots for registered patients',
        accessible: true,
        landmark: 'Directly opposite Cardiology Chamber 303'
      },
      {
        id: 'amenity-admin',
        code: 'ADMIN',
        roomNumber: 'Block 3C',
        name: 'Medical Superintendent & Arogya Mitra Desk',
        nameKn: 'ವೈದ್ಯಾಧಿಕಾರಿಗಳ ಕಚೇರಿ ಮತ್ತು ಆರೋಗ್ಯ ಮಿತ್ರ',
        type: 'service',
        wing: 'Central Core South',
        x: 320,
        y: 310,
        width: 280,
        height: 180,
        icon: ShieldCheck,
        color: 'amber',
        doctor: 'Dr. B. K. Shivakumar, Medical Superintendent',
        timings: '10:00 AM - 5:00 PM',
        waitEstimate: 'Prior token or staff appointment required',
        accessible: true,
        landmark: 'Next to Hospital Library & Telemedicine Room'
      },
      {
        id: 'amenity-tele',
        code: 'TELE',
        roomNumber: 'Room 312',
        name: 'Tele-ICU & E-Sanjeevani Teleconsultation Hub',
        nameKn: 'ಇ-ಸಂಜೀವಿನಿ ಟೆಲಿ-ಕನ್ಸಲ್ಟೇಶನ್ ಕೇಂದ್ರ',
        type: 'service',
        wing: 'East Wing South',
        x: 630,
        y: 310,
        width: 250,
        height: 180,
        icon: Compass,
        color: 'indigo',
        doctor: 'Nodal Medical Officer for Rural PHCs',
        timings: '9:00 AM - 4:00 PM',
        waitEstimate: 'Connects with NIMHANS & Jayadeva specialists',
        accessible: true,
        landmark: 'East Wing end, right next to Digital X-Ray'
      }
    ]
  }
];

export default function HospitalNavigator({
  initialDepartmentId = null,
  initialTokenNumber = null,
  hospitalName = 'Victoria Hospital (BMCRI)',
  standalone = false
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { language, t } = useLanguage();

  // Selected floor & department
  const [selectedFloorId, setSelectedFloorId] = useState('1F');
  const [selectedDeptId, setSelectedDeptId] = useState(initialDepartmentId || 'dept-gm');
  const [selectedTokenNumber, setSelectedTokenNumber] = useState(initialTokenNumber || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedDirections, setCopiedDirections] = useState(false);
  const [wheelchairMode, setWheelchairMode] = useState(false);
  const [patientTokens, setPatientTokens] = useState([]);

  // Check URL parameters on mount
  useEffect(() => {
    const urlDept = searchParams.get('dept');
    const urlToken = searchParams.get('token');
    const urlFloor = searchParams.get('floor');

    if (urlDept) {
      setSelectedDeptId(urlDept);
      // Auto-switch to floor containing that department
      for (const fl of HOSPITAL_FLOORS) {
        if (fl.rooms.some((r) => r.id === urlDept)) {
          setSelectedFloorId(fl.id);
          break;
        }
      }
    } else if (initialDepartmentId) {
      setSelectedDeptId(initialDepartmentId);
      for (const fl of HOSPITAL_FLOORS) {
        if (fl.rooms.some((r) => r.id === initialDepartmentId)) {
          setSelectedFloorId(fl.id);
          break;
        }
      }
    }

    if (urlToken) {
      setSelectedTokenNumber(urlToken);
    } else if (initialTokenNumber) {
      setSelectedTokenNumber(initialTokenNumber);
    }

    if (urlFloor && ['GF', '1F', '2F', '3F'].includes(urlFloor)) {
      setSelectedFloorId(urlFloor);
    }
  }, [searchParams, initialDepartmentId, initialTokenNumber]);

  // Load patient tokens from API and localStorage to identify active booked appointment
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const res = await api.getTokens();
        if (res.data && Array.isArray(res.data)) {
          setPatientTokens(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch tokens for navigator:', err);
      }
    };
    loadTokens();
  }, []);

  // Find active booked token (prioritize token matching selectedTokenNumber or first active token)
  const activeBookedToken = useMemo(() => {
    if (selectedTokenNumber) {
      const match = patientTokens.find((t) => t.tokenNumber === selectedTokenNumber);
      if (match) return match;
    }
    return patientTokens.find(
      (t) => t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'CONSULTING'
    ) || null;
  }, [patientTokens, selectedTokenNumber]);

  // Current floor object
  const currentFloor = useMemo(() => {
    return HOSPITAL_FLOORS.find((f) => f.id === selectedFloorId) || HOSPITAL_FLOORS[1];
  }, [selectedFloorId]);

  // Locate department across all floors
  const activeRoomData = useMemo(() => {
    for (const fl of HOSPITAL_FLOORS) {
      const found = fl.rooms.find((r) => r.id === selectedDeptId);
      if (found) {
        return {
          room: found,
          floor: fl
        };
      }
    }
    // Default to General Medicine on 1F
    return {
      room: HOSPITAL_FLOORS[1].rooms[0],
      floor: HOSPITAL_FLOORS[1]
    };
  }, [selectedDeptId]);

  // When a department is selected, make sure floor switches to it
  const handleSelectDepartment = (deptId, tokenNum = null) => {
    setSelectedDeptId(deptId);
    if (tokenNum) {
      setSelectedTokenNumber(tokenNum);
    }
    for (const fl of HOSPITAL_FLOORS) {
      if (fl.rooms.some((r) => r.id === deptId)) {
        setSelectedFloorId(fl.id);
        break;
      }
    }
  };

  // Generate turn-by-turn guidance based on target floor & wing
  const directionsSteps = useMemo(() => {
    const { room, floor } = activeRoomData;
    const isGround = floor.level === 0;

    const steps = [];

    // Step 1: Entry
    steps.push({
      step: 1,
      titleEn: 'Enter Hospital Main Gate & Atrium',
      titleKn: 'ಮುಖ್ಯ ದ್ವಾರ ಮತ್ತು ಸ್ವಾಗತ ಸಭಾಂಗಣ ಪ್ರವೇಶಿಸಿ',
      descEn:
        'Walk through the Main Entrance. Have your digital token ready on your mobile screen or carry your printed slip.',
      descKn:
        'ಮುಖ್ಯ ಪ್ರವೇಶ ದ್ವಾರದ ಮೂಲಕ ಒಳಬನ್ನಿ. ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಡಿಜಿಟಲ್ ಟೋಕನ್ ಅಥವಾ ಮುದ್ರಿತ ಚೀಟಿಯನ್ನು ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಿ.',
      icon: Building2
    });

    // Step 2: Verification at Kiosk
    steps.push({
      step: 2,
      titleEn: 'Fast-Track Verification at Express Desk (GF)',
      titleKn: 'ನೆಲ ಮಹಡಿಯಲ್ಲಿ ಡಿಜಿಟಲ್ ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಪರಿಶೀಲನೆ',
      descEn:
        'Show your token QR at Counters 1-8 (Central Foyer) for fast-track barcode stamp. Skip the general manual queue.',
      descKn:
        'ಸಾಮಾನ್ಯ ಸರದಿಯನ್ನು ತಪ್ಪಿಸಿ ಕೌಂಟರ್ 1-8ರಲ್ಲಿ ನಿಮ್ಮ ಕ್ಯೂಆರ್ ಕೋಡ್ ತೋರಿಸಿ ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಮುದ್ರೆ ಪಡೆದುಕೊಳ್ಳಿ.',
      icon: QrCode
    });

    // Step 3: Vertical transport
    if (!isGround) {
      steps.push({
        step: 3,
        titleEn: `Take Lift Bank A to ${floor.name} (Level ${floor.level})`,
        titleKn: `ಲಿಫ್ಟ್ ಎ ಅಥವಾ ಮೆಟ್ಟಿಲುಗಳ ಮೂಲಕ ${floor.nameKn}ಕ್ಕೆ ತೆರಳಿ`,
        descEn: wheelchairMode
          ? `Use Elevator Bank A (Wide door, Wheelchair accessible with audio announcer) directly to ${floor.name}.`
          : `Take Elevator Bank A or the central wide stairway directly up to ${floor.name}.`,
        descKn: wheelchairMode
          ? `ಗಾಲಿಕುರ್ಚಿ ಸ್ನೇಹಿ ವಿಶಾಲವಾದ ಲಿಫ್ಟ್ ಎ ಮೂಲಕ ನೇರವಾಗಿ ${floor.nameKn}ಕ್ಕೆ ತೆರಳಿ.`
          : `ಲಿಫ್ಟ್ ಎ ಅಥವಾ ಕೇಂದ್ರ ಮೆಟ್ಟಿಲುಗಳ ಮೂಲಕ ${floor.nameKn}ಕ್ಕೆ ತಲುಪಿ.`,
        icon: Layers
      });
    }

    // Step 4: Corridor Wayfinding
    steps.push({
      step: isGround ? 3 : 4,
      titleEn: `Head along ${room.wing}`,
      titleKn: `${room.wing} ಕಡೆಗೆ ಹೆಜ್ಜೆ ಹಾಕಿ`,
      descEn: `Follow the overhead bilingual color signage toward ${room.landmark}.`,
      descKn: `ಮೇಲ್ಭಾಗದಲ್ಲಿರುವ ದ್ವಿಭಾಷಾ ಬಣ್ಣದ ಸೂಚನಾ ಫಲಕಗಳನ್ನು ಗಮನಿಸಿ ${room.landmark} ಕಡೆಗೆ ಸಾಗಿ.`,
      icon: Navigation
    });

    // Step 5: Arrive at chamber
    steps.push({
      step: isGround ? 4 : 5,
      titleEn: `Arrive at ${room.roomNumber} - ${room.name}`,
      titleKn: `${room.roomNumber} - ${room.nameKn} ತಲುಪಿದ್ದೀರಿ`,
      descEn: `Report to the duty nurse with your token: ${room.doctor}. Estimated wait: ${room.waitEstimate}.`,
      descKn: `ನಿಮ್ಮ ಟೋಕನ್ ಸಮೇತ ಕರ್ತವ್ಯದಲ್ಲಿರುವ ಶುಶ್ರೂಷಕರಿಗೆ ವರದಿ ಮಾಡಿ: ${room.doctor}. ಅಂದಾಜು ಕಾಯುವ ಸಮಯ: ${room.waitEstimate}.`,
      icon: CheckCircle2
    });

    return steps;
  }, [activeRoomData, wheelchairMode]);

  // Audio speech synthesis guidance for rural/elderly patients
  const speakDirections = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const { room, floor } = activeRoomData;
    const textToSpeak =
      language === 'kn'
        ? `ಆಸ್ಪತ್ರೆ ಮಾರ್ಗದರ್ಶನ: ನಿಮ್ಮ ವಿಭಾಗ ${room.nameKn}, ಕೊಠಡಿ ${room.roomNumber}, ${floor.nameKn}ದಲ್ಲಿದೆ. ${room.landmark}. ಕರ್ತವ್ಯದಲ್ಲಿರುವ ವೈದ್ಯರು: ${room.doctor}.`
        : `Hospital Navigation Guidance: Your department is ${room.name}, located in ${room.roomNumber} on the ${floor.name}, in the ${room.wing}. Landmark: ${room.landmark}. Doctor on duty: ${room.doctor}.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Copy direction text
  const handleCopyDirections = () => {
    const { room, floor } = activeRoomData;
    const text = `🏥 ${hospitalName} - Floor Plan Directions
Department: ${room.name} (${room.roomNumber})
Floor: ${floor.name} (${room.wing})
Landmark: ${room.landmark}
Doctor: ${room.doctor}
Timings: ${room.timings}

Turn-by-turn route:
${directionsSteps.map((s) => `${s.step}. ${s.titleEn} - ${s.descEn}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedDirections(true);
    setTimeout(() => setCopiedDirections(false), 2500);
  };

  // Filtered department search
  const allDepartmentsList = useMemo(() => {
    const list = [];
    HOSPITAL_FLOORS.forEach((fl) => {
      fl.rooms.forEach((r) => {
        list.push({
          ...r,
          floorId: fl.id,
          floorName: fl.name,
          floorNameKn: fl.nameKn,
          level: fl.level
        });
      });
    });
    return list;
  }, []);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase();
    return allDepartmentsList.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.nameKn.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.roomNumber.toLowerCase().includes(q)
    );
  }, [allDepartmentsList, searchTerm]);

  // SVG walking path coordinates from Entrance (320, 260) to target room door
  const pathD = useMemo(() => {
    const targetRoom = currentFloor.rooms.find((r) => r.id === selectedDeptId);
    if (!targetRoom) return null;

    // Center of room door
    const doorX = targetRoom.x + targetRoom.width / 2;
    const doorY = targetRoom.y > 200 ? targetRoom.y : targetRoom.y + targetRoom.height;

    // Start point: Elevator / Central Corridor (x: 460, y: 260)
    const startX = 460;
    const startY = 260;

    // Build orthogonal path
    return `M ${startX} ${startY} L ${doorX} ${startY} L ${doorX} ${doorY}`;
  }, [currentFloor, selectedDeptId]);

  return (
    <div
      id="hospital-navigator"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden"
    >
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b98115_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {language === 'kn'
                  ? 'ಡಿಜಿಟಲ್ ಆಸ್ಪತ್ರೆ ನಕ್ಷೆ ಮತ್ತು ಫ್ಲೋರ್ ಪ್ಲಾನ್'
                  : 'Interactive Hospital Navigator & Floor Plan'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {language === 'kn' ? 'ಆಸ್ಪತ್ರೆಯ ಒಪಿಡಿ ವಿಭಾಗಗಳ ನಕ್ಷೆ' : 'Hospital OPD Floor Plan & Wayfinder'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {language === 'kn'
                ? 'ನೀವು ಕಾಯ್ದಿರಿಸಿದ ಟೋಕನ್ ಅಥವಾ ಹೊರರೋಗಿ ವಿಭಾಗವನ್ನು ಸುಲಭವಾಗಿ ಹುಡುಕಿ. ನೆಲ ಮತ್ತು ಕೊಠಡಿ ಮಾರ್ಗದರ್ಶನವನ್ನು ಲೈವ್ ಆಗಿ ವೀಕ್ಷಿಸಿ.'
                : 'Locate your booked OPD department room, counter, and consultation chambers across all hospital floors with turn-by-turn guidance.'}
            </p>
          </div>

          {/* Quick Active Booked Token Highlight Badge */}
          {activeBookedToken && (
            <div className="bg-emerald-900/60 border border-emerald-600/80 rounded-2xl p-4 text-xs text-white space-y-2 shrink-0 max-w-sm backdrop-blur-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Ticket className="w-3.5 h-3.5" />
                  {language === 'kn' ? 'ನಿಮ್ಮ ಸಕ್ರಿಯ ಟೋಕನ್' : 'Your Booked Appointment'}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-xs font-mono">
                  {activeBookedToken.tokenNumber}
                </span>
              </div>
              <p className="text-slate-200 font-semibold text-sm">
                {activeBookedToken.patientName} · {activeBookedToken.departmentName}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-300 text-[11px]">
                  {activeBookedToken.hospitalName?.split(' ')[0] || hospitalName}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleSelectDepartment(
                      activeBookedToken.departmentId || 'dept-gm',
                      activeBookedToken.tokenNumber
                    )
                  }
                  className="px-2.5 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <MapPin className="w-3 h-3 text-slate-950" />
                  <span>{language === 'kn' ? 'ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ' : 'Locate on Map'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Controls Bar: Floor Switcher, Search, Accessibility Mode */}
      <div className="border-b border-slate-200 bg-slate-50/80 p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Floor Switcher Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline mr-1">
            {language === 'kn' ? 'ಮಹಡಿ:' : 'Floor:'}
          </span>
          {HOSPITAL_FLOORS.map((floor) => {
            const isSelected = selectedFloorId === floor.id;
            const containsTarget = floor.rooms.some((r) => r.id === selectedDeptId);

            return (
              <button
                key={floor.id}
                type="button"
                onClick={() => setSelectedFloorId(floor.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{floor.name}</span>
                {containsTarget && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-amber-300 animate-ping' : 'bg-emerald-500'
                    }`}
                    title="Your selected department is located on this floor"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Accessibility Mode Toggle */}
        <div className="flex items-center gap-3">
          {/* Quick Department Search */}
          <div className="relative grow sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                language === 'kn' ? 'ವಿಭಾಗ ಅಥವಾ ಕೊಠಡಿ ಹುಡುಕಿ...' : 'Find room or department...'
              }
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            />

            {/* Search Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto z-50 text-xs py-1">
                {searchResults.map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => {
                      handleSelectDepartment(res.id);
                      setSearchTerm('');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{res.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {res.roomNumber} · {res.floorName}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      {res.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wheelchair Accessible Ramp Route Toggle */}
          <button
            type="button"
            onClick={() => setWheelchairMode(!wheelchairMode)}
            className={`p-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 shrink-0 ${
              wheelchairMode
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle Wheelchair & Accessible Ramp Routes"
          >
            <Accessibility className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="hidden sm:inline">
              {wheelchairMode ? 'Wheelchair Mode: ON' : 'Accessible Ramp'}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Main Floor Plan Layout & Directional Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Left 8 Cols: Architectural SVG Floor Plan Canvas */}
        <div className="lg:col-span-8 p-4 sm:p-6 bg-slate-50/60 flex flex-col justify-between">
          {/* Floor Subtitle & Active Floor Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-xs font-mono">
                  {currentFloor.id}
                </span>
                <h3 className="font-extrabold text-base text-slate-900">
                  {language === 'kn' ? currentFloor.nameKn : currentFloor.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'kn' ? currentFloor.taglineKn : currentFloor.tagline}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Target OPD Room</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs text-[11px]">
                <Layers className="w-3 h-3 text-indigo-600" />
                <span>Elevator A</span>
              </span>
            </div>
          </div>

          {/* Interactive SVG Floor Plan Diagram */}
          <div className="relative bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-inner overflow-hidden">
            {/* SVG Canvas */}
            <svg
              viewBox="0 0 920 520"
              className="w-full h-auto max-h-[500px] select-none"
              style={{ minHeight: '320px' }}
            >
              {/* Defs for gradients and markers */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                </pattern>
                {/* Linear Gradients */}
                <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ecfdf5" />
                  <stop offset="100%" stopColor="#d1fae5" />
                </linearGradient>
                <linearGradient id="targetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#047857" />
                  <stop offset="100%" stopColor="#065f46" />
                </linearGradient>
                {/* Arrowhead marker */}
                <marker
                  id="routeArrow"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#047857" />
                </marker>
              </defs>

              {/* Blueprint background grid */}
              <rect width="920" height="520" fill="url(#grid)" />

              {/* Main Corridor Outline (Walking Highway) */}
              {/* Horizontal Corridor */}
              <rect
                x="30"
                y="225"
                width="860"
                height="70"
                rx="8"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x="460" y="265" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="700">
                CENTRAL MAIN CORRIDOR (NORTH - SOUTH CONCOURSE)
              </text>

              {/* Central Elevator / Lift Bank A Core */}
              <g transform="translate(420, 230)">
                <rect
                  x="0"
                  y="0"
                  width="80"
                  height="60"
                  rx="6"
                  fill="#e0e7ff"
                  stroke="#6366f1"
                  strokeWidth="2"
                />
                <text x="40" y="24" textAnchor="middle" fill="#3730a3" fontSize="10" fontWeight="800">
                  LIFT BANK A
                </text>
                <text x="40" y="42" textAnchor="middle" fill="#4338ca" fontSize="9" fontWeight="600">
                  Floors GF - 3
                </text>
              </g>

              {/* Staircase North Indicator */}
              <g transform="translate(150, 235)">
                <rect
                  x="0"
                  y="0"
                  width="70"
                  height="50"
                  rx="4"
                  fill="#f1f5f9"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
                <text x="35" y="24" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="700">
                  STAIRWELL
                </text>
                <text x="35" y="40" textAnchor="middle" fill="#64748b" fontSize="8">
                  West Wing
                </text>
              </g>

              {/* Staircase East Indicator */}
              <g transform="translate(700, 235)">
                <rect
                  x="0"
                  y="0"
                  width="70"
                  height="50"
                  rx="4"
                  fill="#f1f5f9"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
                <text x="35" y="24" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="700">
                  STAIRWELL
                </text>
                <text x="35" y="40" textAnchor="middle" fill="#64748b" fontSize="8">
                  East Wing
                </text>
              </g>

              {/* Drinking water & Restroom amenities on floor */}
              <g transform="translate(240, 240)">
                <circle cx="12" cy="12" r="10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
                <text x="12" y="16" textAnchor="middle" fill="#0284c7" fontSize="10" fontWeight="bold">
                  💧
                </text>
              </g>

              <g transform="translate(650, 240)">
                <circle cx="12" cy="12" r="10" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
                <text x="12" y="16" textAnchor="middle" fill="#d97706" fontSize="10" fontWeight="bold">
                  🚻
                </text>
              </g>

              {/* Render Animated Walking Route from Elevator/Stairs to Active Room */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="8 6"
                  className="animate-pulse"
                  markerEnd="url(#routeArrow)"
                />
              )}

              {/* Render Rooms for Selected Floor */}
              {currentFloor.rooms.map((room) => {
                const isSelected = room.id === selectedDeptId;
                const IconComponent = room.icon;

                return (
                  <g
                    key={room.id}
                    onClick={() => handleSelectDepartment(room.id)}
                    className="cursor-pointer transition-transform hover:opacity-95"
                  >
                    {/* Pulsing Beacon / Radar Ring if this room is the targeted/booked OPD */}
                    {isSelected && (
                      <g>
                        <rect
                          x={room.x - 6}
                          y={room.y - 6}
                          width={room.width + 12}
                          height={room.height + 12}
                          rx="14"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          opacity="0.8"
                          className="animate-pulse"
                        />
                        <rect
                          x={room.x - 12}
                          y={room.y - 12}
                          width={room.width + 24}
                          height={room.height + 24}
                          rx="18"
                          fill="none"
                          stroke="#34d399"
                          strokeWidth="1.5"
                          opacity="0.4"
                        />
                      </g>
                    )}

                    {/* Room Box Rectangle */}
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.width}
                      height={room.height}
                      rx="10"
                      fill={
                        isSelected
                          ? '#064e3b'
                          : room.type === 'emergency'
                          ? '#fff1f2'
                          : room.type === 'opd'
                          ? '#f8fafc'
                          : '#f0fdf4'
                      }
                      stroke={
                        isSelected
                          ? '#059669'
                          : room.type === 'emergency'
                          ? '#fda4af'
                          : '#cbd5e1'
                      }
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      className="transition-colors duration-200"
                    />

                    {/* Room Door Indication Arc */}
                    <path
                      d={
                        room.y < 200
                          ? `M ${room.x + room.width / 2 - 20} ${room.y + room.height} L ${
                              room.x + room.width / 2 + 20
                            } ${room.y + room.height}`
                          : `M ${room.x + room.width / 2 - 20} ${room.y} L ${
                              room.x + room.width / 2 + 20
                            } ${room.y}`
                      }
                      stroke={isSelected ? '#34d399' : '#059669'}
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                    {/* Room Header: Code Badge and Room # */}
                    <g transform={`translate(${room.x + 14}, ${room.y + 24})`}>
                      <rect
                        x="0"
                        y="-12"
                        width="48"
                        height="20"
                        rx="4"
                        fill={isSelected ? '#10b981' : '#e2e8f0'}
                      />
                      <text
                        x="24"
                        y="2"
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : '#1e293b'}
                        fontSize="10"
                        fontWeight="800"
                        fontFamily="monospace"
                      >
                        {room.code}
                      </text>

                      <text
                        x="56"
                        y="2"
                        fill={isSelected ? '#a7f3d0' : '#64748b'}
                        fontSize="10"
                        fontWeight="700"
                      >
                        {room.roomNumber}
                      </text>
                    </g>

                    {/* Department Name Text (Bilingual) */}
                    <text
                      x={room.x + 14}
                      y={room.y + 60}
                      fill={isSelected ? '#ffffff' : '#0f172a'}
                      fontSize="13"
                      fontWeight="800"
                    >
                      {room.name.length > 28 ? room.name.substring(0, 27) + '...' : room.name}
                    </text>

                    <text
                      x={room.x + 14}
                      y={room.y + 82}
                      fill={isSelected ? '#d1fae5' : '#475569'}
                      fontSize="11"
                      fontWeight="500"
                    >
                      {room.nameKn.length > 30 ? room.nameKn.substring(0, 29) + '...' : room.nameKn}
                    </text>

                    {/* Doctor on duty line */}
                    <text
                      x={room.x + 14}
                      y={room.y + 112}
                      fill={isSelected ? '#ecfdf5' : '#64748b'}
                      fontSize="10.5"
                      fontWeight="500"
                    >
                      👨‍⚕️ {room.doctor.length > 32 ? room.doctor.substring(0, 30) + '...' : room.doctor}
                    </text>

                    {/* Wing and wait info */}
                    <text
                      x={room.x + 14}
                      y={room.y + 134}
                      fill={isSelected ? '#a7f3d0' : '#047857'}
                      fontSize="10"
                      fontWeight="700"
                    >
                      ⏱️ {room.waitEstimate}
                    </text>

                    {/* Target Selected Pin Marker */}
                    {isSelected && (
                      <g transform={`translate(${room.x + room.width - 45}, ${room.y + 16})`}>
                        <circle cx="16" cy="16" r="14" fill="#fbbf24" />
                        <text
                          x="16"
                          y="21"
                          textAnchor="middle"
                          fill="#78350f"
                          fontSize="13"
                          fontWeight="bold"
                        >
                          📍
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend bar */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-700"></span>
                <span>Active Target Department</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300"></span>
                <span>Casualty / Emergency</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-100 border border-indigo-300"></span>
                <span>Elevator Core (Lift A)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Accessibility className="w-3.5 h-3.5 text-blue-600" />
                <span>Ramp / Wheelchair Lane</span>
              </span>
            </div>

            <span className="text-slate-400 font-medium">
              💡 {language === 'kn' ? 'ಕೊಠಡಿ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ವಿವರ ನೋಡಿ' : 'Click any room to inspect directions'}
            </span>
          </div>
        </div>

        {/* Right 4 Cols: Active Room Inspector & Turn-by-Turn Wayfinding */}
        <div className="lg:col-span-4 p-5 sm:p-6 bg-white flex flex-col justify-between space-y-6">
          {/* Target Department Hero Details */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  {activeRoomData.floor.name} · {activeRoomData.room.wing}
                </span>
                <h4 className="text-lg font-black text-slate-900 leading-snug">
                  {language === 'kn' ? activeRoomData.room.nameKn : activeRoomData.room.name}
                </h4>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
                    {activeRoomData.room.roomNumber}
                  </span>
                  <span className="text-xs text-slate-500">
                    Code: <strong>{activeRoomData.room.code}</strong>
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                <activeRoomData.room.icon className="w-6 h-6" />
              </div>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  {language === 'kn' ? 'ಕರ್ತವ್ಯ ವೈದ್ಯರು' : 'Doctor on Duty'}
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block leading-tight">
                  {activeRoomData.room.doctor}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  {language === 'kn' ? 'ಸಮಯ / ಅವಧಿ' : 'OPD Timings'}
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block leading-tight">
                  {activeRoomData.room.timings}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 col-span-2">
                <span className="text-[10px] text-emerald-800 uppercase font-semibold block">
                  {language === 'kn' ? 'ಪ್ರಮುಖ ಗುರುತು (ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್)' : 'Hallway Landmark'}
                </span>
                <span className="font-medium text-emerald-950 mt-0.5 block leading-relaxed text-xs">
                  {activeRoomData.room.landmark}
                </span>
              </div>
            </div>

            {/* Turn-by-Turn Wayfinding Steps */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                  {language === 'kn' ? 'ಪ್ರವೇಶ ದ್ವಾರದಿಂದ ಮಾರ್ಗ' : 'Turn-by-Turn Walking Route'}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  ~1.5 mins walk (65m)
                </span>
              </div>

              <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {directionsSteps.map((step) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={step.step} className="relative flex items-start gap-3 text-xs pl-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 z-10 text-[11px] shadow-2xs">
                        {step.step}
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">
                          {language === 'kn' ? step.titleKn : step.titleEn}
                        </span>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {language === 'kn' ? step.descKn : step.descEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons: Audio Voice Guidance & Copy / Book */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            {/* Audio Voice Guidance Button */}
            <button
              type="button"
              onClick={speakDirections}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isSpeaking
                  ? 'bg-amber-500 text-slate-950 shadow-sm animate-pulse'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>
                    {language === 'kn' ? 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ (Stop Audio)' : 'Stop Voice Navigation'}
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>
                    {language === 'kn'
                      ? 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಆಲಿಸಿ (Read Aloud)'
                      : 'Listen to Spoken Directions'}
                  </span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyDirections}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedDirections ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Route</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Guide</span>
              </button>
            </div>

            {/* Quick Link to Book Token for This Department */}
            <Link
              to={`/book-token?departmentId=${activeRoomData.room.id}`}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-1"
            >
              <span>Book OPD Token for {activeRoomData.room.name.split(' ')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
