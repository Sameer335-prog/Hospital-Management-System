import { useEffect, useState, useMemo } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { INVOICES, PATIENTS } from '../../legacy/legacyEngine.js';
import { billingService } from '../../services/billingService.js';
import { useToast } from '../../hooks/useToast.js';
import ThermalReceiptModal from '../../components/common/ThermalReceiptModal.jsx';
import { useClinicProfile } from '../../utils/clinicConfig.js';
import { getSpecialtyConfig } from '../../utils/specialtyConfig.js';

function toNumber(rs) {
  return Number(String(rs).replace(/[^0-9.]/g, '')) || 0;
}
function toRs(n) {
  return `Rs ${Number(n || 0).toLocaleString('en-US')}`;
}

const INITIAL_SHIFT_ARCHIVE = [
  {
    shiftId: 'SHIFT-20260916-01',
    date: 'Sep 16, 2026',
    shiftHours: '09:00 AM – 08:30 PM',
    cashier: 'Sadia Qureshi · Shift Evening',
    supervisor: 'Dr. Sarah Khan',
    totalCollected: 48500,
    cashTotal: 34500,
    digitalTotal: 14000,
    countedCash: 34500,
    variance: 0,
    invoicesCount: 16,
    denominations: { 5000: 4, 1000: 12, 500: 4, 100: 5, 50: 0 },
    doctorBreakdown: [
      { doctor: 'Dr. Sarah Khan', amount: 26000, count: 9 },
      { doctor: 'Dr. Bilal Ahmed', amount: 22500, count: 7 },
    ],
    status: 'Verified & Balanced',
  },
  {
    shiftId: 'SHIFT-20260915-01',
    date: 'Sep 15, 2026',
    shiftHours: '09:00 AM – 08:30 PM',
    cashier: 'Farhan Ali · Shift Morning',
    supervisor: 'Dr. Sarah Khan',
    totalCollected: 52000,
    cashTotal: 38000,
    digitalTotal: 14000,
    countedCash: 38000,
    variance: 0,
    invoicesCount: 19,
    denominations: { 5000: 5, 1000: 11, 500: 4, 100: 0, 50: 0 },
    doctorBreakdown: [
      { doctor: 'Dr. Sarah Khan', amount: 30000, count: 11 },
      { doctor: 'Dr. Hina Farooq', amount: 22000, count: 8 },
    ],
    status: 'Verified & Balanced',
  },
];

const INITIAL_INVOICE_ITEMS = {
  'INV-5510': [
    { code: 'CON-01', label: 'Consultant Physician Visit (Dr. Sarah Khan)', dept: 'Cardiology', qty: 1, rate: 2500, amount: 2500 },
    { code: 'LAB-12', label: 'Lipid Profile & Serum Electrolytes', dept: 'Pathology', qty: 1, rate: 3000, amount: 3000 },
    { code: 'MED-04', label: 'Losartan 50mg & Metformin 500mg (30-day supply)', dept: 'Pharmacy', qty: 2, rate: 6500, amount: 13000 },
  ],
  'INV-5511': [
    { code: 'CON-02', label: 'Obstetrics & Gynecology Consultation (Dr. Hina Farooq)', dept: 'Gynecology', qty: 1, rate: 2000, amount: 2000 },
    { code: 'MED-09', label: 'Prenatal Multivitamins & Iron Supplements', dept: 'Pharmacy', qty: 1, rate: 1200, amount: 1200 },
  ],
  'INV-5512': [
    { code: 'CON-03', label: 'Pediatric Specialist Consultation (Dr. Ayesha Raza)', dept: 'Pediatrics', qty: 1, rate: 2000, amount: 2000 },
    { code: 'LAB-02', label: 'Complete Blood Count (CBC) with ESR', dept: 'Pathology', qty: 1, rate: 2800, amount: 2800 },
  ],
  'INV-5513': [
    { code: 'BED-01', label: 'Orthopedic Ward Bed Charges (5 Days @ Rs 5,000/day)', dept: 'Inpatient Ward', qty: 5, rate: 5000, amount: 25000 },
    { code: 'SURG-04', label: 'Arthroscopic Knee Meniscus Debridement', dept: 'Operating Theater', qty: 1, rate: 20000, amount: 20000 },
    { code: 'CON-04', label: 'Attending Orthopedic Surgeon Rounds (Dr. Bilal Ahmed)', dept: 'Orthopedics', qty: 1, rate: 2000, amount: 2000 },
    { code: 'MED-11', label: 'Post-op Antibiotics & Analgesic IV Infusions', dept: 'Pharmacy', qty: 1, rate: 15000, amount: 15000 },
  ],
  'INV-5514': [
    { code: 'CON-01', label: 'Cardiology Specialist Consultation (Dr. Sarah Khan)', dept: 'Cardiology', qty: 1, rate: 2000, amount: 2000 },
    { code: 'LAB-05', label: 'Electrocardiogram (ECG - 12 Lead)', dept: 'Diagnostics', qty: 1, rate: 1500, amount: 1500 },
    { code: 'MED-02', label: 'Antianginal & Beta-Blocker Formulary', dept: 'Pharmacy', qty: 1, rate: 5500, amount: 5500 },
  ],
};

const INITIAL_RECEIPTS = {
  'INV-5510': [{ receiptNo: 'RCPT-9812', date: 'Sep 05, 2026', amount: 10000, method: 'Credit / Debit Card', cashier: 'Cashier 1 · Farhan Ali' }],
  'INV-5511': [{ receiptNo: 'RCPT-9813', date: 'Sep 05, 2026', amount: 3200, method: 'Cash', cashier: 'Cashier 2 · Sadia Qureshi' }],
  'INV-5513': [{ receiptNo: 'RCPT-9814', date: 'Sep 04, 2026', amount: 40000, method: 'Online Bank Transfer', cashier: 'Cashier 1 · Farhan Ali' }],
  'INV-5514': [{ receiptNo: 'RCPT-9815', date: 'Aug 28, 2026', amount: 9000, method: 'Cash', cashier: 'Cashier 2 · Sadia Qureshi' }],
};

const SERVICE_PRESETS = [
  { code: 'CON-GEN', label: 'Specialist Physician Consultation', dept: 'Outpatient Clinic', rate: 2500 },
  { code: 'BED-GEN', label: 'General Ward Bed / Nursing Care (1 Day)', dept: 'Inpatient Ward', rate: 4500 },
  { code: 'BED-PRV', label: 'Executive Private Room (1 Day)', dept: 'Inpatient Ward', rate: 9000 },
  { code: 'BED-ICU', label: 'Intensive Care Unit (ICU) Critical Bed (1 Day)', dept: 'Critical Care', rate: 22000 },
  { code: 'LAB-CBC', label: 'Complete Blood Count (CBC) with Platelets', dept: 'Pathology Lab', rate: 1500 },
  { code: 'LAB-LFT', label: 'Liver Function Tests (LFT Complete)', dept: 'Pathology Lab', rate: 2800 },
  { code: 'LAB-KFT', label: 'Renal / Kidney Function Profile (RFT)', dept: 'Pathology Lab', rate: 2400 },
  { code: 'LAB-LIP', label: 'Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)', dept: 'Pathology Lab', rate: 3000 },
  { code: 'RAD-XRY', label: 'Digital X-Ray (Chest PA/AP View)', dept: 'Radiology', rate: 2200 },
  { code: 'RAD-ULT', label: 'Abdominal Ultrasound (USG)', dept: 'Radiology', rate: 3500 },
  { code: 'SUR-MIN', label: 'Minor Surgical Procedure & Dressing Pack', dept: 'Operation Theater', rate: 15000 },
  { code: 'SUR-MAJ', label: 'Major General Surgery & Anesthesia Charge', dept: 'Operation Theater', rate: 45000 },
  { code: 'MED-DIS', label: 'Pharmacy Inpatient Dispensation Bundle', dept: 'Pharmacy', rate: 4200 },
];

const INITIAL_CLAIMS = [
  { id: 'CLM-701', invId: 'INV-5513', patient: 'Bilal Chaudhry', pid: 'PT-00129', provider: 'State Life Insurance', policyNo: 'POL-992144', claimedAmount: 40000, approvedAmount: 38000, status: 'Approved', submittedDate: 'Sep 04, 2026' },
  { id: 'CLM-702', invId: 'INV-5510', patient: 'Muhammad Ahmed', pid: 'PT-00125', provider: 'EFU General Insurance', policyNo: 'EFU-881203', claimedAmount: 8500, approvedAmount: 0, status: 'Under Review', submittedDate: 'Sep 05, 2026' },
  { id: 'CLM-703', invId: 'INV-5514', patient: 'Rukhsana Kausar', pid: 'PT-00128', provider: 'Jubilee Life Healthcare', policyNo: 'JUB-334190', claimedAmount: 9000, approvedAmount: 9000, status: 'Settled', submittedDate: 'Aug 28, 2026' },
  { id: 'CLM-704', invId: 'INV-5515', patient: 'Zainab Bibi', pid: 'PT-00130', provider: 'Sehat Sahulat Card (National)', policyNo: 'SSC-442198', claimedAmount: 14500, approvedAmount: 14500, status: 'Approved', submittedDate: 'Sep 06, 2026' },
];

export default function BillingPage() {
  const { toast, showToast } = useToast();

  // Tab State: 'invoices' | 'generator' | 'aging' | 'claims'
  const [activeTab, setActiveTab] = useState('invoices');

  const [invoices, setInvoices] = useState(() =>
    INVOICES.map((i, idx) => ({
      ...i,
      totalN: toNumber(i.total),
      paidN: toNumber(i.paid),
      dueN: toNumber(i.due),
      category: idx % 2 === 0 ? 'Inpatient / Ward' : 'Outpatient (OPD)',
      doctor: idx % 2 === 0 ? 'Dr. Bilal Ahmed' : 'Dr. Sarah Khan',
      insuranceSplit: idx === 3 ? { provider: 'State Life', panelPct: 65, patientPct: 35 } : null,
      daysAgo: [2, 0, 1, 10, 17][idx] ?? 3,
    }))
  );

  useEffect(() => {
    let active = true;
    billingService.getInvoices().then((data) => {
      if (active && data && data.length > 0) {
        setInvoices(data.map((i, idx) => ({
          ...i,
          totalN: i.totalNum || toNumber(i.total),
          paidN: i.paidNum || toNumber(i.paid),
          dueN: i.dueNum || toNumber(i.due),
          category: i.dept || (idx % 2 === 0 ? 'Inpatient / Ward' : 'Outpatient (OPD)'),
          doctor: i.doctor || (idx % 2 === 0 ? 'Dr. Bilal Ahmed' : 'Dr. Sarah Khan'),
          insuranceSplit: null,
          daysAgo: 2,
        })));
      }
    });

    const unsubscribe = billingService.subscribe(() => {
      billingService.getInvoices().then((data) => {
        if (active && data && data.length > 0) {
          setInvoices(data.map((i, idx) => ({
            ...i,
            totalN: i.totalNum || toNumber(i.total),
            paidN: i.paidNum || toNumber(i.paid),
            dueN: i.dueNum || toNumber(i.due),
            category: i.dept || (idx % 2 === 0 ? 'Inpatient / Ward' : 'Outpatient (OPD)'),
            doctor: i.doctor || (idx % 2 === 0 ? 'Dr. Bilal Ahmed' : 'Dr. Sarah Khan'),
            insuranceSplit: null,
            daysAgo: 2,
          })));
        }
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const [invoiceItemsMap, setInvoiceItemsMap] = useState(INITIAL_INVOICE_ITEMS);
  const [receiptsMap, setReceiptsMap] = useState(INITIAL_RECEIPTS);
  const [claims, setClaims] = useState(INITIAL_CLAIMS);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Print & Payment Modal State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [printModalInvoice, setPrintModalInvoice] = useState(null);
  const [thermalInvoiceData, setThermalInvoiceData] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Shift Close & Daily Reconciliation State
  const clinic = useClinicProfile();
  const specialty = useMemo(() => getSpecialtyConfig(clinic), [clinic]);

  const dynamicServicePresets = useMemo(() => {
    if (specialty?.procedures && specialty.procedures.length > 0) {
      return specialty.procedures.map((p) => ({
        code: p.code,
        label: p.name,
        dept: p.category || specialty.practiceType || 'Clinical Procedure',
        rate: p.fee,
      }));
    }
    return SERVICE_PRESETS;
  }, [specialty]);

  const billingDoctors = useMemo(() => {
    if (specialty?.doctors && specialty.doctors.length > 0) {
      return specialty.doctors.map((d) => `${d.name} (${d.specialty || d.dept})`);
    }
    return [
      'Dr. Sarah Khan (Cardiology)',
      'Dr. Bilal Ahmed (Orthopedics)',
      'Dr. Hina Farooq (Gynecology)',
      'Dr. Ayesha Raza (Pediatrics)',
      'Dr. Imran Malik (General Medicine)',
    ];
  }, [specialty]);

  const [shiftArchive, setShiftArchive] = useState(() => {
    try {
      const saved = localStorage.getItem('medora_shift_archive');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_SHIFT_ARCHIVE;
  });

  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [thermalShiftData, setThermalShiftData] = useState(null);
  const [shiftCashier, setShiftCashier] = useState('Sadia Qureshi · Cashier 2');
  const [shiftSupervisor, setShiftSupervisor] = useState(clinic.doctorInCharge || 'Dr. Sarah Khan');
  const [shiftNotes, setShiftNotes] = useState('');
  const [denominations, setDenominations] = useState({
    5000: 0,
    1000: 0,
    500: 0,
    100: 0,
    50: 0,
  });

  const [doctorSplitPct, setDoctorSplitPct] = useState(70); // 70% Doctor / 30% Clinic
  const countedCashTotal = useMemo(() => {
    return (
      (Number(denominations[5000]) || 0) * 5000 +
      (Number(denominations[1000]) || 0) * 1000 +
      (Number(denominations[500]) || 0) * 500 +
      (Number(denominations[100]) || 0) * 100 +
      (Number(denominations[50]) || 0) * 50
    );
  }, [denominations]);

  // Today's Shift Calculations
  const todayPaidInvoices = useMemo(() => invoices.filter((i) => i.paidN > 0), [invoices]);
  const shiftCashTotal = useMemo(() => {
    return todayPaidInvoices.reduce((sum, inv) => {
      const receipts = receiptsMap[inv.id] || [];
      const isCash = receipts.some((r) => r.method === 'Cash') || (!receipts.length && inv.paidN > 0);
      return sum + (isCash ? inv.paidN : 0);
    }, 0);
  }, [todayPaidInvoices, receiptsMap]);

  const shiftDigitalTotal = useMemo(() => {
    return todayPaidInvoices.reduce((sum, inv) => {
      const receipts = receiptsMap[inv.id] || [];
      const isDigital = receipts.some((r) => r.method !== 'Cash');
      return sum + (isDigital ? inv.paidN : 0);
    }, 0);
  }, [todayPaidInvoices, receiptsMap]);

  const shiftTotalRevenue = shiftCashTotal + shiftDigitalTotal;
  const shiftVariance = countedCashTotal - shiftCashTotal;

  const doctorShiftBreakdown = useMemo(() => {
    const map = {};
    todayPaidInvoices.forEach((inv) => {
      const doc = inv.doctor || 'General OPD';
      if (!map[doc]) map[doc] = { doctor: doc, amount: 0, count: 0 };
      map[doc].amount += inv.paidN;
      map[doc].count += 1;
    });
    return Object.values(map);
  }, [todayPaidInvoices]);

  const handleCloseShiftSubmit = (e) => {
    e.preventDefault();
    const newShiftRecord = {
      shiftId: `SHIFT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(shiftArchive.length + 1).padStart(2, '0')}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      shiftHours: '09:00 AM – ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cashier: shiftCashier,
      supervisor: shiftSupervisor,
      totalCollected: shiftTotalRevenue,
      cashTotal: shiftCashTotal,
      digitalTotal: shiftDigitalTotal,
      countedCash: countedCashTotal || shiftCashTotal,
      variance: shiftVariance,
      invoicesCount: todayPaidInvoices.length,
      denominations,
      notes: shiftNotes,
      doctorBreakdown: doctorShiftBreakdown,
      status: shiftVariance === 0 ? 'Verified & Balanced' : shiftVariance < 0 ? 'Shortage Noted' : 'Surplus Logged',
    };

    const updatedArchive = [newShiftRecord, ...shiftArchive];
    setShiftArchive(updatedArchive);
    try {
      localStorage.setItem('medora_shift_archive', JSON.stringify(updatedArchive));
    } catch {
      // ignore
    }

    setShiftModalOpen(false);
    setThermalShiftData(newShiftRecord);
    showToast(`🎉 Shift ${newShiftRecord.shiftId} closed and reconciled! Printing slip...`);
  };

  // Itemized Generator State
  const [builderPatientId, setBuilderPatientId] = useState(PATIENTS[0]?.id || 'PT-00125');
  const [builderCategory, setBuilderCategory] = useState(() =>
    specialty.id === 'dental' ? 'Dental Consultation & Diagnosis' :
    specialty.id === 'pediatric' ? 'Well-Child Clinic & Immunization' :
    specialty.id === 'ophthalmology' ? 'Comprehensive Eye Exam & Refraction' : 'Outpatient Consultation (OPD)'
  );
  const [builderDoctor, setBuilderDoctor] = useState(billingDoctors[0] || 'Dr. Sarah Khan (Cardiology)');
  const [builderItems, setBuilderItems] = useState(() => {
    if (dynamicServicePresets.length >= 2) {
      return [
        { id: 1, ...dynamicServicePresets[0], qty: 1, amount: dynamicServicePresets[0].rate },
        { id: 2, ...dynamicServicePresets[1], qty: 1, amount: dynamicServicePresets[1].rate },
      ];
    }
    return [
      { id: 1, code: 'CON-GEN', label: 'Specialist Physician Consultation', dept: 'Outpatient Clinic', qty: 1, rate: 2500, amount: 2500 },
      { id: 2, code: 'LAB-CBC', label: 'Complete Blood Count (CBC) with Platelets', dept: 'Pathology Lab', qty: 1, rate: 1500, amount: 1500 },
    ];
  });

  // Synchronize builder state dynamically if user changes clinic specialty
  useEffect(() => {
    if (billingDoctors.length > 0) {
      setBuilderDoctor(billingDoctors[0]);
    }
    if (dynamicServicePresets.length >= 2) {
      setBuilderItems([
        { id: 1, ...dynamicServicePresets[0], qty: 1, amount: dynamicServicePresets[0].rate },
        { id: 2, ...dynamicServicePresets[1], qty: 1, amount: dynamicServicePresets[1].rate },
      ]);
    }
    setBuilderCategory(
      specialty.id === 'dental' ? 'Dental Consultation & Diagnosis' :
      specialty.id === 'pediatric' ? 'Well-Child Clinic & Immunization' :
      specialty.id === 'ophthalmology' ? 'Comprehensive Eye Exam & Refraction' : 'Outpatient Consultation (OPD)'
    );
  }, [specialty.id]);
  const [builderDiscount, setBuilderDiscount] = useState(0); // in PKR
  const [builderTaxApplied, setBuilderTaxApplied] = useState(false); // 5% tax
  const [builderInsuranceCovered, setBuilderInsuranceCovered] = useState(false);
  const [builderInsuranceProvider, setBuilderInsuranceProvider] = useState('State Life Insurance');
  const [builderInsurancePct, setBuilderInsurancePct] = useState(70);
  const [builderInitialPayment, setBuilderInitialPayment] = useState(0);

  // Totals calculations
  const totalRevenueCollected = useMemo(() => invoices.reduce((s, i) => s + i.paidN, 0), [invoices]);
  const totalOutstanding = useMemo(() => invoices.reduce((s, i) => s + i.dueN, 0), [invoices]);
  const totalInvoicesCount = invoices.length;
  const pendingInvoicesCount = invoices.filter((i) => i.dueN > 0).length;

  // Selected Invoice Object
  const selectedInvoice = useMemo(() => invoices.find((i) => i.id === selectedInvoiceId), [invoices, selectedInvoiceId]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((i) => {
      if (q && !i.patient.toLowerCase().includes(q) && !i.id.toLowerCase().includes(q) && !i.pid.toLowerCase().includes(q)) {
        return false;
      }
      if (statusFilter !== 'All' && i.status !== statusFilter) return false;
      return true;
    });
  }, [invoices, search, statusFilter]);

  // Aging Analysis
  const agingData = useMemo(() => {
    const buckets = {
      current: { label: 'Current (0–15 Days)', amount: 0, count: 0, items: [] },
      thirty: { label: '16–30 Days', amount: 0, count: 0, items: [] },
      sixty: { label: '31–60 Days', amount: 0, count: 0, items: [] },
      overdue: { label: '60+ Days Overdue', amount: 0, count: 0, items: [] },
    };

    invoices.forEach((inv) => {
      if (inv.dueN <= 0) return;
      if (inv.daysAgo <= 15) {
        buckets.current.amount += inv.dueN;
        buckets.current.count += 1;
        buckets.current.items.push(inv);
      } else if (inv.daysAgo <= 30) {
        buckets.thirty.amount += inv.dueN;
        buckets.thirty.count += 1;
        buckets.thirty.items.push(inv);
      } else if (inv.daysAgo <= 60) {
        buckets.sixty.amount += inv.dueN;
        buckets.sixty.count += 1;
        buckets.sixty.items.push(inv);
      } else {
        buckets.overdue.amount += inv.dueN;
        buckets.overdue.count += 1;
        buckets.overdue.items.push(inv);
      }
    });

    return buckets;
  }, [invoices]);

  // Generator Calculation Helpers
  const calcGross = useMemo(() => builderItems.reduce((s, it) => s + (Number(it.amount) || 0), 0), [builderItems]);
  const calcDiscount = Math.min(calcGross, Math.max(0, Number(builderDiscount) || 0));
  const calcAfterDiscount = calcGross - calcDiscount;
  const calcTax = builderTaxApplied ? Math.round(calcAfterDiscount * 0.05) : 0;
  const calcNetPayable = calcAfterDiscount + calcTax;
  const calcInsuranceAmount = builderInsuranceCovered ? Math.round((calcNetPayable * builderInsurancePct) / 100) : 0;
  const calcPatientShare = calcNetPayable - calcInsuranceAmount;

  // Actions
  function openInvoiceDetails(id) {
    setSelectedInvoiceId(id);
    setPaymentAmount('');
    setPaymentMethod('Cash');
  }

  function openPrintModal(inv) {
    setPrintModalInvoice(inv);
  }

  function handleRecordPayment() {
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid payment amount.');
      return;
    }
    if (amount > selectedInvoice.dueN) {
      showToast(`Amount cannot exceed the remaining due of ${toRs(selectedInvoice.dueN)}.`);
      return;
    }

    const rcptNo = `RCPT-${Math.floor(9820 + Math.random() * 900)}`;
    const newReceipt = {
      receiptNo: rcptNo,
      date: 'Today',
      amount,
      method: paymentMethod,
      cashier: 'Cashier · Active Shift',
    };

    setReceiptsMap((prev) => ({
      ...prev,
      [selectedInvoice.id]: [...(prev[selectedInvoice.id] || []), newReceipt],
    }));

    setInvoices((prev) =>
      prev.map((i) => {
        if (i.id !== selectedInvoice.id) return i;
        const paidN = i.paidN + amount;
        const dueN = i.totalN - paidN;
        const status = dueN === 0 ? 'Paid' : 'Partially Paid';
        return {
          ...i,
          paidN,
          dueN,
          status,
          paid: toRs(paidN),
          due: toRs(dueN),
        };
      })
    );

    billingService.recordPayment(selectedInvoice.id, selectedInvoice.paidN + amount);
    showToast(`Payment of ${toRs(amount)} received. Receipt ${rcptNo} issued.`);
    setPaymentAmount('');
  }

  function handleAddBuilderItem(preset) {
    const newItem = {
      id: Date.now() + Math.random(),
      code: preset.code,
      label: preset.label,
      dept: preset.dept,
      qty: 1,
      rate: preset.rate,
      amount: preset.rate,
    };
    setBuilderItems((prev) => [...prev, newItem]);
  }

  function handleUpdateBuilderItem(id, field, value) {
    setBuilderItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        if (field === 'qty' || field === 'rate') {
          updated.amount = (Number(updated.qty) || 1) * (Number(updated.rate) || 0);
        }
        return updated;
      })
    );
  }

  function handleRemoveBuilderItem(id) {
    if (builderItems.length === 1) {
      showToast('An invoice must contain at least one line item.');
      return;
    }
    setBuilderItems((prev) => prev.filter((it) => it.id !== id));
  }

  function handleCreateItemizedInvoice(e) {
    e.preventDefault();
    if (builderItems.length === 0) {
      showToast('Please add at least one medical service item.');
      return;
    }

    const patient = PATIENTS.find((p) => p.id === builderPatientId) || PATIENTS[0];
    const newInvId = `INV-${5516 + invoices.length}`;
    const initialPaid = Math.min(calcPatientShare, Number(builderInitialPayment) || 0);
    const initialDue = calcPatientShare - initialPaid;
    const invStatus = initialDue === 0 ? 'Paid' : initialPaid > 0 ? 'Partially Paid' : 'Unpaid';

    const newInvoiceObj = {
      id: newInvId,
      patient: patient.name,
      pid: patient.id,
      date: 'Today',
      category: builderCategory,
      doctor: builderDoctor,
      total: toRs(calcNetPayable),
      paid: toRs(initialPaid),
      due: toRs(initialDue),
      totalN: calcNetPayable,
      paidN: initialPaid,
      dueN: initialDue,
      status: invStatus,
      daysAgo: 0,
      insuranceSplit: builderInsuranceCovered
        ? {
            provider: builderInsuranceProvider,
            panelPct: builderInsurancePct,
            patientPct: 100 - builderInsurancePct,
            panelAmount: calcInsuranceAmount,
          }
        : null,
    };

    // Store line items
    setInvoiceItemsMap((prev) => ({
      ...prev,
      [newInvId]: builderItems.map((it) => ({
        code: it.code,
        label: it.label,
        dept: it.dept,
        qty: Number(it.qty) || 1,
        rate: Number(it.rate) || 0,
        amount: Number(it.amount) || 0,
      })),
    }));

    // If initial payment was made, generate initial receipt
    if (initialPaid > 0) {
      const rcptId = `RCPT-${Math.floor(9830 + Math.random() * 900)}`;
      setReceiptsMap((prev) => ({
        ...prev,
        [newInvId]: [
          {
            receiptNo: rcptId,
            date: 'Today',
            amount: initialPaid,
            method: 'Cash Settlement',
            cashier: 'Cashier · Active Shift',
          },
        ],
      }));
    }

    // If insurance claim, register claim
    if (builderInsuranceCovered && calcInsuranceAmount > 0) {
      const claimId = `CLM-${Math.floor(705 + claims.length)}`;
      setClaims((prev) => [
        {
          id: claimId,
          invId: newInvId,
          patient: patient.name,
          pid: patient.id,
          provider: builderInsuranceProvider,
          policyNo: `POL-${Math.floor(100000 + Math.random() * 900000)}`,
          claimedAmount: calcInsuranceAmount,
          approvedAmount: 0,
          status: 'Submitted',
          submittedDate: 'Today',
        },
        ...prev,
      ]);
    }

    setInvoices((prev) => [newInvoiceObj, ...prev]);
    showToast(`Official invoice ${newInvId} generated for ${patient.name}.`);

    // Open print preview directly for convenience
    setPrintModalInvoice(newInvoiceObj);
    setActiveTab('invoices');
  }

  return (
    <AppShell>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Hospital Billing & Financial Ledger</h1>
          <div className="sub">
            {clinic.name} · Clinical revenue, cashier shift close, and insurance claims
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShiftModalOpen(true)}
            style={{
              background: 'rgba(234, 179, 8, 0.12)',
              borderColor: 'rgba(234, 179, 8, 0.35)',
              color: '#ca8a04',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>🔒</span>
            <span>Close Cash Shift</span>
          </button>
          <button
            className={`btn ${activeTab === 'generator' ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setActiveTab('generator')}
          >
            <Icon name="plus" /> New Itemized Invoice
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard
          label="Total Revenue Collected"
          value={toRs(totalRevenueCollected)}
          iconName="billing"
          color="var(--c-success)"
          trend="Settled"
          sub="Cashier shifts reconciled"
        />
        <StatCard
          label="Accounts Receivable Due"
          value={toRs(totalOutstanding)}
          iconName="alert"
          color="var(--c-warning)"
          trend="Aging"
          sub={`${pendingInvoicesCount} invoices with balance`}
        />
        <StatCard
          label="Insurance Panel Claims"
          value={claims.length}
          iconName="bed"
          color="var(--c-info)"
          trend="TPA"
          sub={`${claims.filter((c) => c.status === 'Approved').length} claims approved`}
        />
        <StatCard
          label="Total Invoices Issued"
          value={totalInvoicesCount}
          iconName="dash"
          trend="All Time"
          sub="EHR linked accounts"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="tabs" style={{ marginBottom: 18 }}>
        <button
          className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          All Invoices & Receipts ({invoices.length})
        </button>
        <button
          className={`tab ${activeTab === 'shift_close' ? 'active' : ''}`}
          onClick={() => setActiveTab('shift_close')}
        >
          🔒 Cash Shift & Day Close
        </button>
        <button
          className={`tab ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
        >
          ⚡ Itemized Bill Generator
        </button>
        <button
          className={`tab ${activeTab === 'aging' ? 'active' : ''}`}
          onClick={() => setActiveTab('aging')}
        >
          Aging Ledger & Receivables
        </button>
        <button
          className={`tab ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          Insurance & Panel Claims ({claims.length})
        </button>
      </div>

      {/* TAB 1: ALL INVOICES */}
      {activeTab === 'invoices' && (
        <>
          <div className="toolbar" style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              className="input"
              style={{ maxWidth: 360 }}
              placeholder="Search by patient name, MRN, or invoice number…"
              aria-label="Search invoices by patient name, MRN, or invoice number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label htmlFor="billing-status-filter" className="hint">Status:</label>
              <select
                id="billing-status-filter"
                className="input"
                style={{ width: 140 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter invoices by status"
              >
                <option value="All">All Invoices</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Fully Paid</option>
              </select>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Patient (MRN)</th>
                    <th>Billing Category</th>
                    <th>Attending Doctor</th>
                    <th>Date</th>
                    <th>Gross Total</th>
                    <th>Collected</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} onClick={() => openInvoiceDetails(inv.id)}>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{inv.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={inv.patient} />
                          <div>
                            <div style={{ fontWeight: 600 }}>{inv.patient}</div>
                            <div className="hint" style={{ fontFamily: 'var(--font-mono)' }}>{inv.pid}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{inv.category || 'General'}</span>
                      </td>
                      <td style={{ fontSize: 12.5 }}>{inv.doctor}</td>
                      <td>{inv.date}</td>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{toRs(inv.totalN)}</td>
                      <td style={{ color: 'var(--c-success)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{toRs(inv.paidN)}</td>
                      <td style={{ color: inv.dueN > 0 ? 'var(--c-error)' : 'var(--c-text)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {toRs(inv.dueN)}
                      </td>
                      <td>
                        <StatusBadge status={inv.status} />
                      </td>
                      <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Print Official Tax Invoice"
                            onClick={() => openPrintModal(inv)}
                          >
                            <Icon name="print" /> Print
                          </button>
                          {inv.dueN > 0 ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => openInvoiceDetails(inv.id)}
                            >
                              Receive Pay
                            </button>
                          ) : (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => openInvoiceDetails(inv.id)}
                            >
                              Receipts
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: ITEMISED BILL GENERATOR */}
      {activeTab === 'generator' && (
        <form onSubmit={handleCreateItemizedInvoice}>
          <div className="grid grid-3" style={{ gap: 20, marginBottom: 20 }}>
            {/* Left: Patient & Case Info */}
            <div className="card card-pad" style={{ gridColumn: 'span 1' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
                1. Patient & Case Requisition
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Select Patient *</label>
                <select
                  className="input"
                  value={builderPatientId}
                  onChange={(e) => setBuilderPatientId(e.target.value)}
                >
                  {PATIENTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) · {p.gender}, {p.age}y
                    </option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ marginBottom: 12 }}>
                <label>Billing Care Stream</label>
                <select
                  className="input"
                  value={builderCategory}
                  onChange={(e) => setBuilderCategory(e.target.value)}
                >
                  {specialty.id === 'dental' ? (
                    <>
                      <option>Dental Consultation & Diagnosis</option>
                      <option>Restorative & Endodontics</option>
                      <option>Oral & Maxillofacial Surgery</option>
                      <option>Orthodontic Adjustment</option>
                      <option>Periodontics & Hygiene</option>
                    </>
                  ) : specialty.id === 'pediatric' ? (
                    <>
                      <option>Well-Child Clinic & Immunization</option>
                      <option>Pediatric Consultation & Followup</option>
                      <option>Pediatric Emergency & Nebulization</option>
                      <option>Growth & Developmental Assessment</option>
                    </>
                  ) : specialty.id === 'ophthalmology' ? (
                    <>
                      <option>Comprehensive Eye Exam & Refraction</option>
                      <option>Cataract & Anterior Segment Daycare</option>
                      <option>Retina & Glaucoma Diagnostic Imaging</option>
                      <option>Ocular Urgent Care & Minor Surgery</option>
                    </>
                  ) : (
                    <>
                      <option>Inpatient Admission (IPD)</option>
                      <option>Outpatient Consultation (OPD)</option>
                      <option>Emergency & Trauma Care (ER)</option>
                      <option>Executive Health Checkup</option>
                      <option>Daycare Surgery Unit</option>
                    </>
                  )}
                </select>
              </div>

              <div className="field" style={{ marginBottom: 16 }}>
                <label>{specialty.terminology?.providerTitle || 'Consultant Specialist'}</label>
                <select
                  className="input"
                  value={builderDoctor}
                  onChange={(e) => setBuilderDoctor(e.target.value)}
                >
                  {billingDoctors.map((doc, idx) => (
                    <option key={idx} value={doc}>{doc}</option>
                  ))}
                </select>
              </div>

              {/* Quick Presets Drawer */}
              <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--c-text-muted)' }}>
                  Quick Add {specialty.terminology?.procedureTitle || 'Clinical Services'}:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {dynamicServicePresets.slice(0, 6).map((preset) => (
                    <button
                      key={preset.code}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'space-between', fontSize: 12, padding: '5px 10px' }}
                      onClick={() => handleAddBuilderItem(preset)}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                        + {preset.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{toRs(preset.rate)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle: Line Items Table */}
            <div className="card card-pad" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  2. Itemized {specialty.terminology?.procedureTitle || 'Services'} ({builderItems.length} items)
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    className="input"
                    style={{ fontSize: 12, padding: '4px 8px', width: 240 }}
                    onChange={(e) => {
                      if (e.target.value) {
                        const preset = dynamicServicePresets.find((p) => p.code === e.target.value);
                        if (preset) handleAddBuilderItem(preset);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">+ Add From Service Catalog…</option>
                    {dynamicServicePresets.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.label} ({toRs(p.rate)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="table-wrap" style={{ marginBottom: 16 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Service Description</th>
                      <th>Department</th>
                      <th style={{ width: 70 }}>Qty</th>
                      <th style={{ width: 110 }}>Rate (PKR)</th>
                      <th style={{ width: 110 }}>Amount</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {builderItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <input
                            className="input"
                            style={{ fontSize: 12.5, padding: '5px 8px' }}
                            value={item.label}
                            onChange={(e) => handleUpdateBuilderItem(item.id, 'label', e.target.value)}
                          />
                        </td>
                        <td>
                          <span className="hint" style={{ fontSize: 11 }}>{item.dept}</span>
                        </td>
                        <td>
                          <input
                            className="input"
                            type="number"
                            min="1"
                            style={{ fontSize: 12.5, padding: '5px 8px' }}
                            value={item.qty}
                            onChange={(e) => handleUpdateBuilderItem(item.id, 'qty', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            className="input"
                            type="number"
                            style={{ fontSize: 12.5, padding: '5px 8px', fontFamily: 'var(--font-mono)' }}
                            value={item.rate}
                            onChange={(e) => handleUpdateBuilderItem(item.id, 'rate', e.target.value)}
                          />
                        </td>
                        <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                          {toRs(item.amount)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-icon"
                            title="Remove line"
                            aria-label={`Remove line ${item.description || item.id}`}
                            onClick={() => handleRemoveBuilderItem(item.id)}
                          >
                            <Icon name="x" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Deductions & Panel Calculation Row */}
              <div className="grid grid-2" style={{ gap: 16, borderTop: '1px solid var(--c-border)', paddingTop: 14 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Insurance & Discounts:</div>
                  <div className="field" style={{ marginBottom: 10 }}>
                    <label>Hospital Welfare / Concession (PKR)</label>
                    <input
                      className="input"
                      type="number"
                      placeholder="0"
                      value={builderDiscount}
                      onChange={(e) => setBuilderDiscount(e.target.value)}
                    />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 10 }}>
                    <input
                      type="checkbox"
                      checked={builderTaxApplied}
                      onChange={(e) => setBuilderTaxApplied(e.target.checked)}
                    />
                    <span style={{ fontSize: 13 }}>Apply 5% Hospital Service Tax (GST)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 10 }}>
                    <input
                      type="checkbox"
                      checked={builderInsuranceCovered}
                      onChange={(e) => setBuilderInsuranceCovered(e.target.checked)}
                    />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>TPA / Corporate Insurance Panel Split</span>
                  </label>

                  {builderInsuranceCovered && (
                    <div style={{ background: 'var(--c-surface-hover)', padding: 12, borderRadius: 8, border: '1px solid var(--c-border)', marginTop: 8 }}>
                      <div className="field" style={{ marginBottom: 8 }}>
                        <label>Panel Provider</label>
                        <select className="input" value={builderInsuranceProvider} onChange={(e) => setBuilderInsuranceProvider(e.target.value)}>
                          <option>State Life Insurance</option>
                          <option>EFU General Insurance</option>
                          <option>Jubilee Life Healthcare</option>
                          <option>Sehat Sahulat Card (National)</option>
                          <option>Pak-Qatar Takaful</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Insurance Coverage % ({builderInsurancePct}% Panel / {100 - builderInsurancePct}% Co-pay)</label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={builderInsurancePct}
                          onChange={(e) => setBuilderInsurancePct(Number(e.target.value))}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Calculation Box */}
                <div style={{ background: 'var(--c-surface-hover)', padding: 16, borderRadius: 8, border: '1px solid var(--c-border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Invoice Ledger Summary</div>
                  <div className="kv" style={{ marginBottom: 6 }}>
                    <span className="k">Gross Service Total</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{toRs(calcGross)}</span>
                  </div>
                  {calcDiscount > 0 && (
                    <div className="kv" style={{ marginBottom: 6, color: 'var(--c-success)' }}>
                      <span className="k">Hospital Welfare Subsidy</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>- {toRs(calcDiscount)}</span>
                    </div>
                  )}
                  {calcTax > 0 && (
                    <div className="kv" style={{ marginBottom: 6 }}>
                      <span className="k">Hospital Tax (5%)</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>+ {toRs(calcTax)}</span>
                    </div>
                  )}
                  <div className="kv" style={{ fontWeight: 700, fontSize: 14, borderTop: '1px solid var(--c-border)', paddingTop: 6, marginBottom: 6 }}>
                    <span className="k">Net Hospital Bill</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{toRs(calcNetPayable)}</span>
                  </div>

                  {builderInsuranceCovered && (
                    <>
                      <div className="kv" style={{ marginBottom: 6, color: 'var(--c-info)' }}>
                        <span className="k">Insurance Share ({builderInsurancePct}%)</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{toRs(calcInsuranceAmount)}</span>
                      </div>
                      <div className="kv" style={{ fontWeight: 700, marginBottom: 6 }}>
                        <span className="k">Patient Payable (Co-Pay)</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{toRs(calcPatientShare)}</span>
                      </div>
                    </>
                  )}

                  <div className="field" style={{ marginTop: 12, borderTop: '1px solid var(--c-border)', paddingTop: 10 }}>
                    <label>Initial Advance / Cash Collection (PKR)</label>
                    <input
                      className="input"
                      type="number"
                      placeholder="0"
                      value={builderInitialPayment}
                      onChange={(e) => setBuilderInitialPayment(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
                  >
                    Issue Official Tax Invoice & Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: AGING LEDGER & RECEIVABLES */}
      {activeTab === 'aging' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="grid grid-4">
            <div className="card card-pad" style={{ borderLeft: '4px solid var(--c-success)' }}>
              <div className="hint">{agingData.current.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                {toRs(agingData.current.amount)}
              </div>
              <div className="hint" style={{ marginTop: 4 }}>{agingData.current.count} open accounts</div>
            </div>

            <div className="card card-pad" style={{ borderLeft: '4px solid var(--c-info)' }}>
              <div className="hint">{agingData.thirty.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                {toRs(agingData.thirty.amount)}
              </div>
              <div className="hint" style={{ marginTop: 4 }}>{agingData.thirty.count} open accounts</div>
            </div>

            <div className="card card-pad" style={{ borderLeft: '4px solid var(--c-warning)' }}>
              <div className="hint">{agingData.sixty.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                {toRs(agingData.sixty.amount)}
              </div>
              <div className="hint" style={{ marginTop: 4 }}>{agingData.sixty.count} open accounts</div>
            </div>

            <div className="card card-pad" style={{ borderLeft: '4px solid var(--c-error)' }}>
              <div className="hint">{agingData.overdue.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: 4, color: 'var(--c-error)' }}>
                {toRs(agingData.overdue.amount)}
              </div>
              <div className="hint" style={{ marginTop: 4 }}>{agingData.overdue.count} recovery alerts</div>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-pad" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Accounts Receivable Ledger by Patient</div>
              <div className="hint">Prioritized list of pending discharge balances requiring follow-up</div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient MRN</th>
                    <th>Patient Name</th>
                    <th>Invoice ID</th>
                    <th>Original Total</th>
                    <th>Collected</th>
                    <th>Outstanding Due</th>
                    <th>Days Pending</th>
                    <th>Aging Bucket</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices
                    .filter((i) => i.dueN > 0)
                    .sort((a, b) => b.daysAgo - a.daysAgo)
                    .map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{inv.pid}</td>
                        <td style={{ fontWeight: 600 }}>{inv.patient}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{inv.id}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{toRs(inv.totalN)}</td>
                        <td style={{ color: 'var(--c-success)', fontFamily: 'var(--font-mono)' }}>{toRs(inv.paidN)}</td>
                        <td style={{ color: 'var(--c-error)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          {toRs(inv.dueN)}
                        </td>
                        <td>{inv.daysAgo} days</td>
                        <td>
                          {inv.daysAgo > 60 ? (
                            <span className="badge badge-error">60+ Days Overdue</span>
                          ) : inv.daysAgo > 30 ? (
                            <span className="badge badge-warning">31–60 Days</span>
                          ) : (
                            <span className="badge badge-info">Current (0–30 Days)</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openInvoiceDetails(inv.id)}
                          >
                            Collect
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INSURANCE & PANEL CLAIMS */}
      {activeTab === 'claims' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-pad" style={{ borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Third-Party Administrator (TPA) & Insurance Panel Ledger</div>
              <div className="hint">Corporate health insurance claims and cashless patient coverage</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => showToast('Batch claims exported for billing clearinghouse.')}>
              Export Claims Manifest
            </button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Invoice Link</th>
                  <th>Patient</th>
                  <th>Insurance Company</th>
                  <th>Policy / Card #</th>
                  <th>Claimed Amount</th>
                  <th>Approved Amount</th>
                  <th>Submitted Date</th>
                  <th>Claim Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((clm) => (
                  <tr key={clm.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{clm.id}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{clm.invId}</td>
                    <td style={{ fontWeight: 600 }}>{clm.patient}</td>
                    <td>
                      <span className="badge badge-neutral">{clm.provider}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{clm.policyNo}</td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{toRs(clm.claimedAmount)}</td>
                    <td style={{ color: 'var(--c-success)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {clm.approvedAmount > 0 ? toRs(clm.approvedAmount) : '—'}
                    </td>
                    <td>{clm.submittedDate}</td>
                    <td>
                      <span
                        className={`badge ${
                          clm.status === 'Settled'
                            ? 'badge-success'
                            : clm.status === 'Approved'
                            ? 'badge-info'
                            : 'badge-warning'
                        }`}
                      >
                        {clm.status}
                      </span>
                    </td>
                    <td>
                      {clm.status !== 'Settled' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setClaims((cs) =>
                              cs.map((c) =>
                                c.id === clm.id
                                  ? { ...c, status: 'Settled', approvedAmount: c.claimedAmount }
                                  : c
                              )
                            );
                            showToast(`Claim ${clm.id} settled by ${clm.provider}.`);
                          }}
                        >
                          Settle Reimbursement
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CASH SHIFT & DAY CLOSE */}
      {activeTab === 'shift_close' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Live Shift Financial Overview */}
          <div
            className="card card-pad"
            style={{
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  boxShadow: '0 8px 24px rgba(217, 119, 6, 0.35)',
                }}
              >
                🔒
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>
                    Today's Active Cash Shift
                  </h2>
                  <span className="badge badge-warning" style={{ fontWeight: 800 }}>
                    In Progress
                  </span>
                </div>
                <div className="hint" style={{ fontSize: 13, marginTop: 4 }}>
                  Shift hours: 09:00 AM – Now · Cashier: {shiftCashier}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div className="hint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Expected Cash in Drawer
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981' }}>
                  Rs. {shiftCashTotal.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="hint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Card / Online / Panel
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-text-muted)' }}>
                  Rs. {shiftDigitalTotal.toLocaleString()}
                </div>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShiftModalOpen(true)}
                style={{
                  padding: '10px 18px',
                  fontWeight: 800,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)',
                }}
              >
                <span>⚡</span>
                <span>Reconcile & Close Shift</span>
              </button>
            </div>
          </div>

          {/* 2-Column Split: Doctor Revenue Splits & Shift Summary */}
          <div className="grid grid-2" style={{ gap: 20 }}>
            {/* Left: Doctor-Wise Share Breakdown & Commission Engine */}
            <div className="card" style={{ borderRadius: 16 }}>
              <div
                className="card-pad"
                style={{
                  borderBottom: '1px solid var(--c-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Doctor Commission & Revenue Split</h3>
                  <p className="hint" style={{ margin: '2px 0 0 0', fontSize: 12 }}>
                    Automated consultation fee split between attending doctor and clinic
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="hint" style={{ fontSize: 11, fontWeight: 700 }}>Split Ratio:</span>
                  <select
                    className="select select-xs"
                    value={doctorSplitPct}
                    onChange={(e) => setDoctorSplitPct(Number(e.target.value))}
                    style={{ fontWeight: 700 }}
                  >
                    <option value={70}>70% Doctor / 30% Clinic</option>
                    <option value={80}>80% Doctor / 20% Clinic</option>
                    <option value={60}>60% Doctor / 40% Clinic</option>
                    <option value={50}>50% Doctor / 50% Clinic</option>
                  </select>
                </div>
              </div>

              <div style={{ padding: '6px 0' }}>
                {doctorShiftBreakdown.length === 0 ? (
                  <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--c-text-muted)' }}>
                    No paid consultations recorded in current shift.
                  </div>
                ) : (
                  <>
                    {doctorShiftBreakdown.map((doc, idx) => {
                      const doctorPayout = Math.round((doc.amount * doctorSplitPct) / 100);
                      const clinicShare = doc.amount - doctorPayout;

                      return (
                        <div
                          key={idx}
                          style={{
                            padding: '12px 18px',
                            borderBottom: '1px solid var(--c-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 8,
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{doc.doctor}</div>
                            <div className="hint" style={{ fontSize: 12 }}>
                              {doc.count} Patient Consultation{doc.count > 1 ? 's' : ''} · Gross: <strong>Rs. {doc.amount.toLocaleString()}</strong>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ textAlign: 'right' }}>
                              <div className="hint" style={{ fontSize: 11 }}>Clinic Cut ({100 - doctorSplitPct}%):</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text-muted)' }}>
                                Rs. {clinicShare.toLocaleString()}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div className="hint" style={{ fontSize: 11 }}>Doctor Payout ({doctorSplitPct}%):</div>
                              <div style={{ fontSize: 15, fontWeight: 900, color: '#10b981' }}>
                                Rs. {doctorPayout.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div style={{ padding: '12px 18px', background: 'var(--c-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="hint" style={{ fontSize: 12 }}>
                        Total Doctor Payouts: <strong>Rs. {Math.round((doctorShiftBreakdown.reduce((s, d) => s + d.amount, 0) * doctorSplitPct) / 100).toLocaleString()}</strong>
                      </div>
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => showToast(`Doctor settlement slips generated for today's shift.`)}
                      >
                        🖨️ Settle & Print Doctor Slips
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Cashier Shift Checklist & Quick Rules */}
            <div className="card card-pad" style={{ borderRadius: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Front-Desk Shift Protocol</h3>
                <p className="hint" style={{ margin: '2px 0 14px 0', fontSize: 12 }}>
                  Standard operating procedure for reception shift handover
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>1.</span>
                    <span>Physically count all Rs. 5000, 1000, 500, and 100 notes in the cash drawer.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>2.</span>
                    <span>Enter note counts into the Reconciliation modal to verify zero variance.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>3.</span>
                    <span>Print the 80mm Shift Close Slip and have the Cashier and Supervisor sign.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>4.</span>
                    <span>Leave standard opening float (e.g. Rs. 5,000) for the morning cashier.</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="hint" style={{ fontSize: 12 }}>Current Shift Status:</span>
                <span className="badge badge-success" style={{ fontWeight: 700 }}>
                  Ready to Reconcile
                </span>
              </div>
            </div>
          </div>

          {/* Historical Shift Handover Archive Table */}
          <div className="card" style={{ borderRadius: 16 }}>
            <div
              className="card-pad"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--c-border)',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Reconciled Shifts Archive</h3>
                <p className="hint" style={{ margin: '2px 0 0 0', fontSize: 12.5 }}>
                  Permanent historical audit log of verified cashier shift handovers
                </p>
              </div>
              <span className="badge badge-info" style={{ fontWeight: 700 }}>
                {shiftArchive.length} Past Shifts Logged
              </span>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Shift ID</th>
                    <th>Date & Shift Hours</th>
                    <th>Cashier on Duty</th>
                    <th>Total Revenue</th>
                    <th>Cash Counted</th>
                    <th>Variance Status</th>
                    <th>Supervisor</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftArchive.map((s) => (
                    <tr key={s.shiftId}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12 }}>
                        {s.shiftId}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.date}</div>
                        <div className="hint" style={{ fontSize: 11 }}>{s.shiftHours}</div>
                      </td>
                      <td>{s.cashier}</td>
                      <td style={{ fontWeight: 800 }}>Rs. {s.totalCollected.toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>
                        Rs. {(s.countedCash || s.cashTotal).toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            s.variance === 0 ? 'badge-success' : s.variance < 0 ? 'badge-error' : 'badge-warning'
                          }`}
                          style={{ fontWeight: 700 }}
                        >
                          {s.variance === 0 ? 'Balanced (0)' : s.variance < 0 ? `-Rs. ${Math.abs(s.variance)} Short` : `+Rs. ${s.variance} Surplus`}
                        </span>
                      </td>
                      <td>{s.supervisor}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-xs"
                          onClick={() => setThermalShiftData(s)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <span>🖨️</span>
                          <span>Slip</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW INVOICE & RECEIVE PAYMENT MODAL */}
      {selectedInvoice && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setSelectedInvoiceId(null)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-head">
              <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedInvoice.id} — Financial Statement</div>
              <button className="btn-icon" onClick={() => setSelectedInvoiceId(null)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={selectedInvoice.patient} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedInvoice.patient}</div>
                    <div className="hint" style={{ fontFamily: 'var(--font-mono)' }}>{selectedInvoice.pid}</div>
                  </div>
                </div>
                <StatusBadge status={selectedInvoice.status} />
              </div>

              {/* Service Breakdown */}
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--c-text-muted)' }}>
                Billed Services:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {(invoiceItemsMap[selectedInvoice.id] || [
                  { label: 'Hospital Care Services', qty: 1, rate: selectedInvoice.totalN, amount: selectedInvoice.totalN },
                ]).map((item, idx) => (
                  <div className="kv" key={idx} style={{ fontSize: 13 }}>
                    <span className="k">
                      {item.label} {item.qty > 1 && `(×${item.qty})`}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{toRs(item.amount)}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: 10, marginBottom: 14 }}>
                <div className="kv" style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  <span className="k">Gross Invoiced Total</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{toRs(selectedInvoice.totalN)}</span>
                </div>
                <div className="kv" style={{ marginBottom: 4 }}>
                  <span className="k">Total Collected</span>
                  <span style={{ color: 'var(--c-success)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {toRs(selectedInvoice.paidN)}
                  </span>
                </div>
                <div className="kv" style={{ fontWeight: 700, fontSize: 14 }}>
                  <span className="k">Balance Due</span>
                  <span style={{ color: selectedInvoice.dueN > 0 ? 'var(--c-error)' : 'var(--c-text)', fontFamily: 'var(--font-mono)' }}>
                    {toRs(selectedInvoice.dueN)}
                  </span>
                </div>
              </div>

              {/* Receipts History */}
              {(receiptsMap[selectedInvoice.id] || []).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--c-text-muted)' }}>
                    Payment Receipts Logged:
                  </div>
                  {(receiptsMap[selectedInvoice.id] || []).map((r, ri) => (
                    <div
                      key={ri}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        background: 'var(--c-surface-hover)',
                        padding: '6px 10px',
                        borderRadius: 6,
                        marginBottom: 4,
                        fontSize: 12,
                      }}
                    >
                      <span>
                        <strong>{r.receiptNo}</strong> · {r.method} ({r.date})
                      </span>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--c-success)' }}>
                        {toRs(r.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Record Payment Form */}
              {selectedInvoice.dueN > 0 && (
                <div style={{ background: 'var(--c-surface-hover)', padding: 14, borderRadius: 8, border: '1px solid var(--c-border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Record Cashier Payment</div>
                  <div className="grid grid-2" style={{ gap: 10, marginBottom: 10 }}>
                    <div className="field">
                      <label>Amount (PKR)</label>
                      <input
                        className="input"
                        type="number"
                        placeholder={String(selectedInvoice.dueN)}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Payment Mode</label>
                      <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                        <option value="Cash at Counter">💵 Cash at Counter</option>
                        <option value="JazzCash (Till / QR)">📱 JazzCash (Till / QR)</option>
                        <option value="EasyPaisa (QR Mobile)">📱 EasyPaisa (QR Mobile)</option>
                        <option value="Raast Instant Pay">⚡ Raast Instant Pay (IBFT)</option>
                        <option value="Card (PayPak / 1Link)">💳 Debit / Credit Card (PayPak / 1Link)</option>
                        <option value="Sehat Sahulat Card">🛡️ Sehat Sahulat Card / Panel Insurance</option>
                        <option value="Pay Order / Cheque">📄 Pay Order / Bank Cheque</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleRecordPayment}>
                    Confirm & Log Payment
                  </button>
                </div>
              )}
            </div>
            <div className="modal-foot" style={{ justifyContent: 'space-between' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedInvoiceId(null);
                  openPrintModal(selectedInvoice);
                }}
              >
                <Icon name="print" /> Official Tax Invoice
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedInvoiceId(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFICIAL PRINTABLE TAX INVOICE */}
      {printModalInvoice && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setPrintModalInvoice(null)}>
          <div className="modal" style={{ maxWidth: 780, padding: 0, overflow: 'hidden' }}>
            {/* Modal Actions Bar (hidden in physical print) */}
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 20px',
                background: 'var(--c-surface-hover)',
                borderBottom: '1px solid var(--c-border)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>Official Medical Invoice Preview</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: '#0284c7', color: '#ffffff', border: 'none', fontWeight: 700 }}
                  onClick={() => {
                    const inv = printModalInvoice;
                    const items = (invoiceItemsMap && invoiceItemsMap[inv.id]) || [
                      { name: 'Medical & Diagnostic Services', cost: inv.totalN || toNumber(inv.total) }
                    ];
                    setThermalInvoiceData({
                      invoiceNo: inv.id,
                      patientName: inv.patient,
                      patientId: inv.pid,
                      total: inv.totalN || toNumber(inv.total),
                      subtotal: inv.totalN || toNumber(inv.total),
                      paymentMethod: inv.method || 'CASH AT COUNTER',
                      items: items.map((it) => ({
                        name: it.label || it.name,
                        cost: it.amount || it.cost || it.rate || 0,
                      })),
                    });
                  }}
                  title="Preview & print on 80mm ESC/POS thermal counter roll"
                >
                  🖨️ Thermal (80mm)
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => window.print()}
                >
                  <Icon name="print" /> Print Invoice (A4)
                </button>
                <button className="btn-icon" onClick={() => setPrintModalInvoice(null)} aria-label="Close">
                  <Icon name="x" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="invoice-sheet" style={{ border: 'none', borderRadius: 0 }}>
              {/* Header Box */}
              <div className="invoice-header-box">
                <div>
                  <div className="invoice-brand-title">AL-SHIFA INTERNATIONAL HOSPITAL</div>
                  <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 3 }}>
                    Sector H-8/4, Islamabad, Pakistan · UAN: +92 51 111-AL-SHIFA
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--c-text-faint)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    NTN: 4829104-1 · STRN: 3277876123445 · License: PMDC/ICT/2026/901
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--c-primary)' }}>MEDICAL TAX INVOICE</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, marginTop: 2 }}>
                    {printModalInvoice.id}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--c-text-muted)', marginTop: 2 }}>
                    Date: {printModalInvoice.date}
                  </div>
                  <div className="barcode-box" style={{ marginTop: 8 }}>
                    <div className="barcode-stripes" />
                    <span style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginTop: 2 }}>
                      {printModalInvoice.pid}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Meta Grid */}
              <div className="invoice-patient-grid">
                <div>
                  <div className="hint" style={{ fontSize: 10.5 }}>PATIENT NAME</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{printModalInvoice.patient}</div>
                </div>
                <div>
                  <div className="hint" style={{ fontSize: 10.5 }}>HOSPITAL MRN</div>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{printModalInvoice.pid}</div>
                </div>
                <div>
                  <div className="hint" style={{ fontSize: 10.5 }}>ATTENDING PHYSICIAN</div>
                  <div style={{ fontWeight: 600 }}>{printModalInvoice.doctor}</div>
                </div>
                <div>
                  <div className="hint" style={{ fontSize: 10.5 }}>CARE CATEGORY</div>
                  <div style={{ fontWeight: 600 }}>{printModalInvoice.category || 'General Care'}</div>
                </div>
              </div>

              {/* Itemized Table */}
              <div style={{ padding: '20px 28px' }}>
                <table className="data-table" style={{ border: '1px solid var(--c-border)' }}>
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>#</th>
                      <th style={{ width: 90 }}>Code</th>
                      <th>Service Description</th>
                      <th>Department</th>
                      <th style={{ textAlign: 'center', width: 60 }}>Qty</th>
                      <th style={{ textAlign: 'right', width: 100 }}>Rate</th>
                      <th style={{ textAlign: 'right', width: 110 }}>Total (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoiceItemsMap[printModalInvoice.id] || [
                      { code: 'HOSP-01', label: 'Clinical Diagnostic & Nursing Care', dept: 'Inpatient Ward', qty: 1, rate: printModalInvoice.totalN, amount: printModalInvoice.totalN },
                    ]).map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', color: 'var(--c-text-faint)' }}>{idx + 1}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{item.code || 'SVC-01'}</td>
                        <td style={{ fontWeight: 600 }}>{item.label}</td>
                        <td style={{ fontSize: 11.5, color: 'var(--c-text-muted)' }}>{item.dept || 'Hospital'}</td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{item.qty}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{toRs(item.rate)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          {toRs(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations & Payment Ledger */}
              <div style={{ padding: '0 28px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* Receipts history */}
                <div style={{ width: '48%' }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Payment Transactions / Receipts Log:
                  </div>
                  {(receiptsMap[printModalInvoice.id] || []).length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--c-text-muted)', fontStyle: 'italic' }}>
                      No payment settlements recorded yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(receiptsMap[printModalInvoice.id] || []).map((r, ri) => (
                        <div
                          key={ri}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            background: 'var(--c-surface-hover)',
                            border: '1px solid var(--c-border)',
                            borderRadius: 4,
                            fontSize: 11.5,
                          }}
                        >
                          <span><strong>{r.receiptNo}</strong> ({r.method})</span>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{toRs(r.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {printModalInvoice.insuranceSplit && (
                    <div style={{ marginTop: 12, padding: 10, background: 'var(--c-surface-hover)', borderRadius: 6, border: '1px solid var(--c-border)', fontSize: 12 }}>
                      <strong>Insurance Panel Billed:</strong> {printModalInvoice.insuranceSplit.provider}
                      <br />
                      Panel Share: {printModalInvoice.insuranceSplit.panelPct}% · Co-pay Share: {printModalInvoice.insuranceSplit.patientPct}%
                    </div>
                  )}
                </div>

                {/* Calculation breakdown */}
                <div className="invoice-calc-box">
                  <div className="kv" style={{ marginBottom: 4 }}>
                    <span className="k">Gross Amount</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{toRs(printModalInvoice.totalN)}</span>
                  </div>
                  <div className="kv" style={{ marginBottom: 4, color: 'var(--c-success)' }}>
                    <span className="k">Hospital Subsidy</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>Rs 0</span>
                  </div>
                  <div className="kv" style={{ fontWeight: 700, fontSize: 13.5, borderTop: '1px solid var(--c-border)', paddingTop: 4, marginBottom: 4 }}>
                    <span className="k">Net Invoiced</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{toRs(printModalInvoice.totalN)}</span>
                  </div>
                  <div className="kv" style={{ marginBottom: 4 }}>
                    <span className="k">Total Paid to Date</span>
                    <span style={{ color: 'var(--c-success)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {toRs(printModalInvoice.paidN)}
                    </span>
                  </div>
                  <div className="kv" style={{ fontWeight: 800, fontSize: 14, color: printModalInvoice.dueN > 0 ? 'var(--c-error)' : 'var(--c-text)' }}>
                    <span className="k">Balance Payable</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{toRs(printModalInvoice.dueN)}</span>
                  </div>
                </div>
              </div>

              {/* Stamp & Signature Footer */}
              <div className="invoice-stamp-box" style={{ borderTop: '1px solid var(--c-border)' }}>
                <div className="official-stamp">
                  <span>AL-SHIFA HMS</span>
                  <span>ACCOUNTS DEPT</span>
                  <span>VERIFIED</span>
                </div>

                <div style={{ textAlign: 'center', minWidth: 180 }}>
                  <div style={{ borderBottom: '1px solid var(--c-text)', marginBottom: 4, width: 160 }} />
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Cashier / Billing Officer</div>
                  <div className="hint" style={{ fontSize: 10 }}>Al-Shifa Hospital Revenue Center</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 3: SHIFT CLOSE RECONCILIATION MODAL */}
      {shiftModalOpen && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setShiftModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 540, borderRadius: 20 }}>
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🔒</span>
                <div style={{ fontWeight: 800, fontSize: 17 }}>
                  Front-Desk Cash Shift Reconciliation
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShiftModalOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>

            <form onSubmit={handleCloseShiftSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Expected Cash Header Banner */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(15, 23, 42, 0.5) 100%)',
                    border: '1px solid rgba(2, 132, 199, 0.3)',
                    borderRadius: 14,
                    padding: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div className="hint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      System Calculated Expected Cash
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981', marginTop: 2 }}>
                      Rs. {shiftCashTotal.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="hint" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Card / Digital Payments
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-text-muted)', marginTop: 2 }}>
                      Rs. {shiftDigitalTotal.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Cashier & Supervisor Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="label" style={{ fontWeight: 700 }}>Cashier On Duty *</label>
                    <input
                      className="input"
                      value={shiftCashier}
                      onChange={(e) => setShiftCashier(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontWeight: 700 }}>Handover Supervisor *</label>
                    <input
                      className="input"
                      value={shiftSupervisor}
                      onChange={(e) => setShiftSupervisor(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Currency Note Denominations Counter */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 14, border: '1px solid var(--c-border)' }}>
                  <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Physical Cash Drawer Count:</span>
                    <span className="hint" style={{ fontSize: 11 }}>Count physical notes</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                    {[5000, 1000, 500, 100, 50].map((note) => (
                      <div key={note} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ minWidth: 62, fontSize: 12, fontWeight: 700 }}>Rs. {note}:</span>
                        <input
                          type="number"
                          min="0"
                          className="input input-sm"
                          placeholder="0"
                          value={denominations[note] || ''}
                          onChange={(e) =>
                            setDenominations({
                              ...denominations,
                              [note]: Math.max(0, parseInt(e.target.value, 10) || 0),
                            })
                          }
                          style={{ width: 80, textAlign: 'center' }}
                        />
                        <span className="hint" style={{ fontSize: 11, minWidth: 60, textAlign: 'right' }}>
                          = {((denominations[note] || 0) * note).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Counted Total & Variance Comparison */}
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 10,
                      borderTop: '1px solid var(--c-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div className="hint" style={{ fontSize: 11 }}>Total Physical Cash Counted:</div>
                      <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--c-text-primary)' }}>
                        Rs. {(countedCashTotal || shiftCashTotal).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div className="hint" style={{ fontSize: 11 }}>Reconcile Status:</div>
                      <span
                        className={`badge ${
                          shiftVariance === 0 ? 'badge-success' : shiftVariance < 0 ? 'badge-error' : 'badge-warning'
                        }`}
                        style={{ fontWeight: 800, marginTop: 2 }}
                      >
                        {shiftVariance === 0
                          ? '✓ Exact Match (Rs. 0)'
                          : shiftVariance < 0
                          ? `Shortage: -Rs. ${Math.abs(shiftVariance).toLocaleString()}`
                          : `Surplus: +Rs. ${shiftVariance.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Handover Notes */}
                <div>
                  <label className="label" style={{ fontWeight: 700 }}>Shift Closing & Float Notes</label>
                  <input
                    className="input"
                    placeholder="e.g. Rs. 5,000 float retained in drawer for morning shift"
                    value={shiftNotes}
                    onChange={(e) => setShiftNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-foot">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShiftModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span>🖨️</span>
                  <span>Save & Print 80mm Shift Slip</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ThermalReceiptModal
        isOpen={Boolean(thermalInvoiceData)}
        onClose={() => setThermalInvoiceData(null)}
        data={thermalInvoiceData}
        type="billing"
      />
      <ThermalReceiptModal
        isOpen={Boolean(thermalShiftData)}
        onClose={() => setThermalShiftData(null)}
        data={thermalShiftData}
        type="shift"
      />
      <Toast toast={toast} />
    </AppShell>
  );
}
