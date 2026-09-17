import { useEffect, useState, useMemo } from 'react';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { pharmacyService } from '../../services/pharmacyService.js';
import { useToast } from '../../hooks/useToast.js';

const INITIAL_MEDICINES = [
  {
    id: 'MED-101',
    name: 'Augmentin 625mg',
    generic: 'Co-Amoxiclav',
    category: 'Antibiotic',
    form: 'Tablet',
    batchNo: 'BT-9921',
    stock: 0,
    minStock: 40,
    unit: 'Tablets',
    price: 'Rs 45/unit',
    priceN: 45,
    expiry: 'Dec 2026',
    daysToExpiry: 88,
    status: 'Out of Stock',
    allergyClass: 'Penicillin',
  },
  {
    id: 'MED-102',
    name: 'Panadol 500mg',
    generic: 'Paracetamol',
    category: 'Analgesic',
    form: 'Tablet',
    batchNo: 'BT-8842',
    stock: 18,
    minStock: 50,
    unit: 'Tablets',
    price: 'Rs 4/unit',
    priceN: 4,
    expiry: 'Jan 2027',
    daysToExpiry: 120,
    status: 'Low Stock',
    allergyClass: 'None',
  },
  {
    id: 'MED-103',
    name: 'Amoxicillin 500mg',
    generic: 'Amoxicillin',
    category: 'Antibiotic',
    form: 'Capsule',
    batchNo: 'BT-7719',
    stock: 320,
    minStock: 100,
    unit: 'Capsules',
    price: 'Rs 8/unit',
    priceN: 8,
    expiry: 'Oct 2026',
    daysToExpiry: 26,
    status: 'Expiring Soon',
    allergyClass: 'Penicillin',
  },
  {
    id: 'MED-104',
    name: 'Metformin 500mg',
    generic: 'Metformin HCl',
    category: 'Antidiabetic',
    form: 'Tablet',
    batchNo: 'BT-6631',
    stock: 240,
    minStock: 80,
    unit: 'Tablets',
    price: 'Rs 6/unit',
    priceN: 6,
    expiry: 'Sep 2026',
    daysToExpiry: 16,
    status: 'Expiring Soon',
    allergyClass: 'None',
  },
  {
    id: 'MED-105',
    name: 'Losartan 50mg',
    generic: 'Losartan Potassium',
    category: 'Antihypertensive',
    form: 'Tablet',
    batchNo: 'BT-5520',
    stock: 180,
    minStock: 60,
    unit: 'Tablets',
    price: 'Rs 10/unit',
    priceN: 10,
    expiry: 'Nov 2027',
    daysToExpiry: 420,
    status: 'In Stock',
    allergyClass: 'None',
  },
  {
    id: 'MED-106',
    name: 'Ceftriaxone 1g IV',
    generic: 'Ceftriaxone Sodium',
    category: 'Antibiotic',
    form: 'Injection / Vial',
    batchNo: 'BT-4411',
    stock: 65,
    minStock: 30,
    unit: 'Vials',
    price: 'Rs 320/unit',
    priceN: 320,
    expiry: 'Aug 2027',
    daysToExpiry: 330,
    status: 'In Stock',
    allergyClass: 'Cephalosporin',
  },
  {
    id: 'MED-107',
    name: 'Omeprazole 40mg',
    generic: 'Omeprazole',
    category: 'Gastrointestinal',
    form: 'Capsule',
    batchNo: 'BT-3329',
    stock: 190,
    minStock: 50,
    unit: 'Capsules',
    price: 'Rs 15/unit',
    priceN: 15,
    expiry: 'Jun 2027',
    daysToExpiry: 280,
    status: 'In Stock',
    allergyClass: 'None',
  },
  {
    id: 'MED-108',
    name: 'Salbutamol Inhaler 100mcg',
    generic: 'Salbutamol Sulfate',
    category: 'Respiratory',
    form: 'Inhaler',
    batchNo: 'BT-2210',
    stock: 12,
    minStock: 25,
    unit: 'Canisters',
    price: 'Rs 380/unit',
    priceN: 380,
    expiry: 'Dec 2026',
    daysToExpiry: 88,
    status: 'Low Stock',
    allergyClass: 'None',
  },
];

const INITIAL_PENDING_QUEUE = [
  {
    id: 'RX-901',
    pid: 'PT-00125',
    patient: 'Muhammad Ahmed',
    doctor: 'Dr. Sarah Khan (Cardiology)',
    ward: 'Cardiology Ward · Bed C-04',
    timestamp: '10:15 AM',
    patientAllergy: 'Sulfa Drugs',
    items: [
      { medicine: 'Losartan 50mg', qty: 30, instructions: '1 tablet once daily with morning meal' },
      { medicine: 'Metformin 500mg', qty: 60, instructions: '1 tablet twice daily after meals' },
    ],
  },
  {
    id: 'RX-902',
    pid: 'PT-00130',
    patient: 'Sana Malik',
    doctor: 'Dr. Sarah Khan (Endocrinology)',
    ward: 'Outpatient Clinic (OPD)',
    timestamp: '10:35 AM',
    patientAllergy: 'None reported',
    items: [
      { medicine: 'Metformin 500mg', qty: 30, instructions: '1 tablet daily with dinner' },
    ],
  },
  {
    id: 'RX-903',
    pid: 'PT-00129',
    patient: 'Bilal Chaudhry',
    doctor: 'Dr. Bilal Ahmed (Orthopedics)',
    ward: 'Orthopedic Ward · Bed O-11',
    timestamp: '11:00 AM',
    patientAllergy: 'Penicillin Allergy',
    items: [
      { medicine: 'Augmentin 625mg', qty: 14, instructions: '1 tablet every 12 hours (High Alert!)' },
      { medicine: 'Panadol 500mg', qty: 20, instructions: '2 tablets SOS for post-op pain' },
    ],
  },
  {
    id: 'RX-904',
    pid: 'PT-00127',
    patient: 'Fahad Iqbal',
    doctor: 'Dr. Ayesha Raza (Pediatrics)',
    ward: 'Pediatric Clinic (OPD)',
    timestamp: '11:15 AM',
    patientAllergy: 'None reported',
    items: [
      { medicine: 'Amoxicillin 500mg', qty: 15, instructions: '1 capsule three times daily for 5 days' },
    ],
  },
];

const EMPTY_MEDICINE_FORM = {
  name: '',
  generic: '',
  category: 'Antibiotic',
  form: 'Tablet',
  batchNo: 'BT-9001',
  stock: 100,
  minStock: 40,
  unit: 'Tablets',
  price: 25,
  expiry: 'Dec 2027',
  allergyClass: 'None',
};

export default function PharmacyPage() {
  const { toast, showToast } = useToast();

  // Active Tab: 'queue' | 'formulary' | 'watchlist'
  const [activeTab, setActiveTab] = useState('queue');

  // Main State
  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);

  useEffect(() => {
    let active = true;
    pharmacyService.getMedicines().then((data) => {
      if (active && data && data.length > 0) {
        setMedicines(data);
      }
    });

    const unsubscribe = pharmacyService.subscribe(() => {
      pharmacyService.getMedicines().then((data) => {
        if (active && data && data.length > 0) {
          setMedicines(data);
        }
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const [queue, setQueue] = useState(INITIAL_PENDING_QUEUE);
  const [dispensedTodayUnits, setDispensedTodayUnits] = useState(42);
  const [dispensedOrdersLog, setDispensedOrdersLog] = useState([]);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMed, setNewMed] = useState(EMPTY_MEDICINE_FORM);
  const [editMed, setEditMed] = useState(null);
  const [activeLabelData, setActiveLabelData] = useState(null); // Label Print Modal
  const [poModalOpen, setPoModalOpen] = useState(false); // Procurement Requisition Manifest Modal
  const [stockModal, setStockModal] = useState(null); // Dedicated Stock Adjustment & Restock Modal

  // Categories list
  const categories = useMemo(() => [...new Set(medicines.map((m) => m.category))], [medicines]);

  // KPI Metrics
  const totalFormulariesCount = medicines.length;
  const outOfStockCount = medicines.filter((m) => m.stock === 0).length;
  const lowStockCount = medicines.filter((m) => m.stock > 0 && m.stock < m.minStock).length;
  const expiringSoonCount = medicines.filter((m) => m.daysToExpiry <= 60).length;
  const totalInventoryValue = useMemo(
    () => medicines.reduce((sum, m) => sum + m.stock * (m.priceN || 10), 0),
    [medicines]
  );

  // Filtered Formulary
  const filteredFormulary = useMemo(() => {
    const q = search.trim().toLowerCase();
    return medicines.filter((m) => {
      if (q && !m.name.toLowerCase().includes(q) && !m.generic.toLowerCase().includes(q) && !m.batchNo.toLowerCase().includes(q)) {
        return false;
      }
      if (categoryFilter !== 'All' && m.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && m.status !== statusFilter) return false;
      return true;
    });
  }, [medicines, search, categoryFilter, statusFilter]);

  // Watchlist Items (critical stocks & expiring batches)
  const watchlistItems = useMemo(() => {
    return medicines
      .filter((m) => m.stock < m.minStock || m.daysToExpiry <= 90)
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [medicines]);

  // Dispense Fulfillment Handler
  function handleDispenseRx(rx) {
    // Check allergy safety
    const hasPenicillinAllergy = rx.patientAllergy?.toLowerCase().includes('penicillin');
    const hasPenicillinMed = rx.items.some((it) => {
      const med = medicines.find((m) => m.name === it.medicine);
      return med?.allergyClass === 'Penicillin';
    });

    if (hasPenicillinAllergy && hasPenicillinMed) {
      const proceed = window.confirm(
        `🚨 CRITICAL SAFETY ALERT:\n\nPatient ${rx.patient} has a documented ${rx.patientAllergy.toUpperCase()}.\nYou are about to dispense a penicillin-based drug.\n\nAre you sure an attending physician authorized this override?`
      );
      if (!proceed) return;
    }

    // Check stock availability
    let insufficient = null;
    for (const item of rx.items) {
      const med = medicines.find((m) => m.name === item.medicine);
      if (!med || med.stock < item.qty) {
        insufficient = `${item.medicine} (Required: ${item.qty}, In Stock: ${med ? med.stock : 0})`;
        break;
      }
    }

    if (insufficient) {
      showToast(`Cannot dispense — Insufficient stock for ${insufficient}.`);
      return;
    }

    // Deduct stock and persist to Supabase
    setMedicines((prev) =>
      prev.map((m) => {
        const item = rx.items.find((it) => it.medicine === m.name);
        if (!item) return m;
        const newStock = Math.max(0, m.stock - item.qty);
        const status =
          newStock === 0
            ? 'Out of Stock'
            : newStock < m.minStock
            ? 'Low Stock'
            : m.daysToExpiry <= 60
            ? 'Expiring Soon'
            : 'In Stock';
        pharmacyService.adjustStock(m.id, newStock, status);
        return { ...m, stock: newStock, status };
      })
    );

    const totalUnits = rx.items.reduce((sum, it) => sum + (it.qty || 1), 0);
    setDispensedTodayUnits((prev) => prev + totalUnits);

    // Remove from queue and log
    setQueue((prev) => prev.filter((r) => r.id !== rx.id));
    setDispensedOrdersLog((prev) => [
      {
        ...rx,
        dispensedAt: 'Just now',
        dispensingPharmacist: 'Pharm. Tariq Mansoor',
      },
      ...prev,
    ]);

    showToast(`Dispensed prescription ${rx.id} to ${rx.patient}. Stock updated.`);

    // Automatically prompt dosage bottle label for the primary medication
    if (rx.items[0]) {
      setActiveLabelData({
        rxId: rx.id,
        patient: rx.patient,
        pid: rx.pid,
        doctor: rx.doctor,
        medicine: rx.items[0].medicine,
        qty: rx.items[0].qty,
        instructions: rx.items[0].instructions,
        date: 'Today',
      });
    }
  }

  // Quick Stock Increment Handler
  async function handleQuickStockAdd(medId, amount) {
    const target = medicines.find((m) => m.id === medId);
    if (!target) return;

    const newStock = target.stock + amount;
    const status = newStock === 0 ? 'Out of Stock' : newStock < target.minStock ? 'Low Stock' : 'In Stock';

    setMedicines((prev) =>
      prev.map((m) => (m.id === medId ? { ...m, stock: newStock, status } : m))
    );

    await pharmacyService.adjustStock(medId, newStock, status);
    showToast(`Received delivery: +${amount} units added to ${target.name}.`);
  }

  // Open Dedicated Stock Adjustment / Restock Modal
  function openStockModal(med = null, defaultMode = 'add', defaultQty = '') {
    const target = med || medicines[0] || null;
    if (!target) {
      showToast('No medications available in formulary to adjust.');
      return;
    }
    setStockModal({
      medId: target.id,
      mode: defaultMode,
      qty: defaultQty,
      batchNo: target.batchNo || '',
      expiry: target.expiry || '',
      reason:
        defaultMode === 'add'
          ? 'Vendor Shipment Delivery'
          : defaultMode === 'deduct'
          ? 'Damaged / Wastage Write-off'
          : 'Weekly Physical Shelf Audit',
    });
  }

  // Confirm and Apply Stock Adjustment (Add, Deduct, or Exact Count)
  async function handleConfirmStockAdjustment(e) {
    e.preventDefault();
    if (!stockModal) return;

    const target = medicines.find((m) => m.id === stockModal.medId);
    if (!target) {
      showToast('Selected medication not found.');
      return;
    }

    const qtyNum = Number(stockModal.qty);
    if (isNaN(qtyNum) || (stockModal.mode !== 'set' && qtyNum <= 0) || (stockModal.mode === 'set' && qtyNum < 0)) {
      showToast('Please specify a valid numeric quantity.');
      return;
    }

    let newStock = target.stock;
    if (stockModal.mode === 'add') {
      newStock = target.stock + qtyNum;
    } else if (stockModal.mode === 'deduct') {
      if (qtyNum > target.stock) {
        showToast(`Cannot deduct ${qtyNum} units. Only ${target.stock} units currently on hand.`);
        return;
      }
      newStock = Math.max(0, target.stock - qtyNum);
    } else if (stockModal.mode === 'set') {
      newStock = Math.max(0, qtyNum);
    }

    const newStatus =
      newStock === 0
        ? 'Out of Stock'
        : newStock < target.minStock
        ? 'Low Stock'
        : (target.daysToExpiry || 120) <= 60
        ? 'Expiring Soon'
        : 'In Stock';

    const updatedBatch = stockModal.batchNo?.trim() || target.batchNo;
    const updatedExpiry = stockModal.expiry?.trim() || target.expiry;

    const updates = {
      stock: newStock,
      status: newStatus,
      batchNo: updatedBatch,
      expiry: updatedExpiry,
    };

    setMedicines((prev) =>
      prev.map((m) => (m.id === target.id ? { ...m, ...updates } : m))
    );

    await pharmacyService.updateMedicine(target.id, updates);

    const actionDesc =
      stockModal.mode === 'add'
        ? `Received +${qtyNum} ${target.unit}`
        : stockModal.mode === 'deduct'
        ? `Deducted -${qtyNum} ${target.unit}`
        : `Physical count adjusted to ${qtyNum} ${target.unit}`;

    showToast(`${actionDesc} for ${target.name}. New total: ${newStock} ${target.unit} (${newStatus}).`);
    setStockModal(null);
  }

  // Save Edit Medication Handler
  async function handleSaveEditMedication(e) {
    e.preventDefault();
    if (!editMed) return;

    const stockNum = Number(editMed.stock) || 0;
    const minStockNum = Number(editMed.minStock) || 30;
    const priceNum = Number(editMed.priceN || String(editMed.price).replace(/[^0-9.]/g, '')) || 10;
    const status =
      stockNum === 0
        ? 'Out of Stock'
        : stockNum < minStockNum
        ? 'Low Stock'
        : (editMed.daysToExpiry || 120) <= 60
        ? 'Expiring Soon'
        : 'In Stock';

    const updates = {
      name: editMed.name.trim(),
      generic: editMed.generic.trim(),
      category: editMed.category,
      form: editMed.form,
      batchNo: editMed.batchNo,
      stock: stockNum,
      minStock: minStockNum,
      unit: editMed.unit || 'Tablets',
      price: `Rs ${priceNum}/unit`,
      priceN: priceNum,
      expiry: editMed.expiry,
      status,
      allergyClass: editMed.allergyClass || 'None',
    };

    setMedicines((prev) =>
      prev.map((m) => (m.id === editMed.id ? { ...m, ...updates } : m))
    );

    await pharmacyService.updateMedicine(editMed.id, updates);
    showToast(`Updated formulary entry for ${updates.name}.`);
    setEditMed(null);
  }

  // Delete Medication Handler
  async function handleDeleteMedication(id) {
    const med = medicines.find((m) => m.id === id);
    const ok = window.confirm(`Are you sure you want to permanently remove ${med?.name || 'this medicine'} from the hospital formulary?`);
    if (!ok) return;

    setMedicines((prev) => prev.filter((m) => m.id !== id));
    await pharmacyService.deleteMedicine(id);
    showToast(`Removed medication ${id} from formulary catalog.`);
    setEditMed(null);
  }

  // Add Medication Handler
  async function handleAddMedication(e) {
    e.preventDefault();
    if (!newMed.name.trim() || !newMed.generic.trim()) {
      showToast('Medicine brand name and generic formula are required.');
      return;
    }

    const stockNum = Number(newMed.stock) || 0;
    const minStockNum = Number(newMed.minStock) || 30;
    const priceNum = Number(newMed.price) || 10;
    const status = stockNum === 0 ? 'Out of Stock' : stockNum < minStockNum ? 'Low Stock' : 'In Stock';

    const entry = {
      id: `MED-${100 + medicines.length + 1}`,
      name: newMed.name.trim(),
      generic: newMed.generic.trim(),
      category: newMed.category,
      form: newMed.form,
      batchNo: newMed.batchNo.trim() || `BT-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: stockNum,
      minStock: minStockNum,
      unit: newMed.unit,
      price: `Rs ${priceNum}/unit`,
      priceN: priceNum,
      expiry: newMed.expiry,
      daysToExpiry: 365,
      status,
      allergyClass: newMed.allergyClass,
    };

    setMedicines((prev) => [entry, ...prev]);
    await pharmacyService.createMedicine(entry);
    showToast(`Registered ${entry.name} in hospital formulary.`);
    setNewMed(EMPTY_MEDICINE_FORM);
    setAddModalOpen(false);
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1>Pharmacy Operations & Formulary</h1>
            <span className="badge badge-success" style={{ fontSize: 12 }}>● Live Sync</span>
          </div>
          <div className="sub">
            Al-Shifa Central Dispensary · 24/7 Prescription fulfillment, formulary inventory, and batch expiry surveillance
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => openStockModal(null, 'add')}
            title="Receive vendor shipments, write off damages, or update physical stock counts"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              borderColor: '#059669',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 700,
            }}
          >
            <Icon name="plus" /> Update / Receive Stock
          </button>
          <button className="btn btn-secondary" onClick={() => setAddModalOpen(true)}>
            <Icon name="plus" /> Register New Medicine
          </button>
          <button className="btn btn-secondary" onClick={() => setPoModalOpen(true)}>
            <Icon name="print" /> PO Requisition
          </button>
        </div>
      </div>

      {/* KPI Stats Row (Interactive Click-to-Filter) */}
      <div className="grid grid-5" style={{ marginBottom: 20 }}>
        <div
          onClick={() => setActiveTab('queue')}
          title="Click to view Live Dispensary Queue"
          style={{ cursor: 'pointer' }}
        >
          <StatCard
            label="Prescriptions Waiting"
            value={queue.length}
            color="var(--c-primary)"
            iconName="rx"
            trend="Live Queue"
            sub="Pending dispensation"
          />
        </div>
        <div
          onClick={() => {
            setActiveTab('formulary');
            setStatusFilter('All');
            setCategoryFilter('All');
          }}
          title="Click to view complete Formulary Catalog"
          style={{ cursor: 'pointer' }}
        >
          <StatCard
            label="Active Formularies"
            value={totalFormulariesCount}
            iconName="pharmacy"
            trend="Catalog"
            sub="Registered drug molecules"
          />
        </div>
        <div
          onClick={() => {
            setActiveTab('formulary');
            setStatusFilter('Low Stock');
          }}
          title="Click to filter low stock formularies"
          style={{ cursor: 'pointer' }}
        >
          <StatCard
            label="Critical Low Stock"
            value={outOfStockCount + lowStockCount}
            color="var(--c-warning)"
            iconName="alert"
            trend="Restock"
            sub={`${outOfStockCount} out of stock`}
          />
        </div>
        <div
          onClick={() => setActiveTab('watchlist')}
          title="Click to view Batch Expiry Watchlist"
          style={{ cursor: 'pointer' }}
        >
          <StatCard
            label="Expiring in <60 Days"
            value={expiringSoonCount}
            color="var(--c-error)"
            iconName="alert"
            trend="Quarantine"
            sub="FEFO prioritization"
          />
        </div>
        <div>
          <StatCard
            label="Dispensed Today"
            value={`${dispensedTodayUnits} Units`}
            color="var(--c-success)"
            iconName="check"
            trend="Dispensed"
            sub={`Est. Value Rs ${Number(totalInventoryValue).toLocaleString()}`}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs" style={{ marginBottom: 18 }}>
        <button
          className={`tab ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          🚨 Live Dispensary Queue ({queue.length})
        </button>
        <button
          className={`tab ${activeTab === 'formulary' ? 'active' : ''}`}
          onClick={() => setActiveTab('formulary')}
        >
          Formulary Inventory Matrix ({medicines.length})
        </button>
        <button
          className={`tab ${activeTab === 'watchlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('watchlist')}
        >
          ⚠️ Expiry & Critical Stock Watchlist ({watchlistItems.length})
        </button>
      </div>

      {/* TAB 1: LIVE DISPENSARY QUEUE */}
      {activeTab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {queue.length === 0 ? (
            <div className="card card-pad empty-state">
              <Icon name="check" style={{ width: 44, height: 44, color: 'var(--c-success)' }} />
              <div style={{ fontWeight: 700, fontSize: 16, marginTop: 12 }}>All Prescriptions Dispensed!</div>
              <div className="hint" style={{ marginTop: 4 }}>
                No patient orders are currently waiting in the dispensary queue.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {queue.map((rx) => {
                const hasPenicillinAllergy = rx.patientAllergy?.toLowerCase().includes('penicillin');
                const hasPenicillinMed = rx.items.some((it) => {
                  const med = medicines.find((m) => m.name === it.medicine);
                  return med?.allergyClass === 'Penicillin';
                });
                const isAllergyConflict = hasPenicillinAllergy && hasPenicillinMed;

                return (
                  <div
                    key={rx.id}
                    className="card"
                    style={{
                      borderLeft: isAllergyConflict ? '5px solid var(--c-error)' : '5px solid var(--c-primary)',
                      padding: '18px 22px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={rx.patient} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontWeight: 800, fontSize: 16 }}>{rx.patient}</span>
                            <span className="hint" style={{ fontFamily: 'var(--font-mono)' }}>{rx.pid}</span>
                            <span className="badge badge-info">{rx.id}</span>
                          </div>
                          <div className="hint" style={{ marginTop: 2 }}>
                            Prescribed by {rx.doctor} · {rx.ward} · Ordered at {rx.timestamp}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        {rx.items[0] && (
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Print Dosage Thermal Label"
                            onClick={() =>
                              setActiveLabelData({
                                rxId: rx.id,
                                patient: rx.patient,
                                pid: rx.pid,
                                doctor: rx.doctor,
                                medicine: rx.items[0].medicine,
                                qty: rx.items[0].qty,
                                instructions: rx.items[0].instructions,
                                date: 'Today',
                              })
                            }
                          >
                            <Icon name="print" /> Thermal Label
                          </button>
                        )}
                        <button
                          className={`btn ${isAllergyConflict ? 'btn-danger' : 'btn-primary'} btn-sm`}
                          onClick={() => handleDispenseRx(rx)}
                        >
                          <Icon name="check" /> Dispense & Deduct Stock
                        </button>
                      </div>
                    </div>

                    {/* Patient Allergy Alert Warning Banner */}
                    {isAllergyConflict && (
                      <div
                        style={{
                          background: 'var(--c-error-bg)',
                          border: '1px solid var(--c-error-border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          color: '#b91c1c',
                          marginBottom: 12,
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        <Icon name="alert" style={{ color: 'var(--c-error)' }} />
                        <span>
                          CRITICAL CONTRAINDICATION: Patient has a recorded <u>{rx.patientAllergy}</u>. Prescribed drug contains penicillin molecule!
                        </span>
                      </div>
                    )}

                    {/* Prescribed Items & Live Stock Check */}
                    <div style={{ background: 'var(--c-surface-hover)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--c-border)' }}>
                      <div style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--c-text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                        Prescribed Medication Regimen:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {rx.items.map((item, idx) => {
                          const medStockObj = medicines.find((m) => m.name === item.medicine);
                          const isAvailable = medStockObj && medStockObj.stock >= item.qty;

                          return (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 12px',
                                background: 'var(--c-surface)',
                                borderRadius: 6,
                                border: '1px solid var(--c-border)',
                              }}
                            >
                              <div>
                                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{item.medicine}</span>
                                <span style={{ marginLeft: 8, color: 'var(--c-text-muted)', fontSize: 12.5 }}>
                                  Qty: <strong>{item.qty}</strong> · Instructions: <em>{item.instructions}</em>
                                </span>
                              </div>

                              <div>
                                {isAvailable ? (
                                  <span className="badge badge-success">
                                    <span className="badge-dot" />
                                    In Stock ({medStockObj.stock} on hand)
                                  </span>
                                ) : (
                                  <span className="badge badge-error">
                                    <span className="badge-dot" />
                                    Stock Alert: Only {medStockObj ? medStockObj.stock : 0} available!
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Dispensation Log */}
          {dispensedOrdersLog.length > 0 && (
            <div className="card" style={{ marginTop: 10, overflow: 'hidden' }}>
              <div className="card-pad" style={{ borderBottom: '1px solid var(--c-border)' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Completed Dispensations Audit Log (This Shift)</div>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rx ID</th>
                      <th>Patient</th>
                      <th>Items Dispensed</th>
                      <th>Time</th>
                      <th>Dispensing Pharmacist</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispensedOrdersLog.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{log.id}</td>
                        <td style={{ fontWeight: 600 }}>{log.patient}</td>
                        <td>{log.items.map((i) => `${i.medicine} (×${i.qty})`).join(', ')}</td>
                        <td>{log.dispensedAt}</td>
                        <td style={{ fontSize: 12 }}>{log.dispensingPharmacist}</td>
                        <td><span className="badge badge-success">Dispensed</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FORMULARY STOCK MATRIX */}
      {activeTab === 'formulary' && (
        <>
          {/* Quick Status Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
            <span className="hint" style={{ fontSize: 12, fontWeight: 700, marginRight: 4 }}>Stock Status:</span>
            <button
              type="button"
              className={`badge ${statusFilter === 'All' ? 'badge-primary' : 'badge-neutral'}`}
              style={{ cursor: 'pointer', padding: '5px 12px', fontSize: 12, border: 'none' }}
              onClick={() => setStatusFilter('All')}
            >
              All Statuses ({medicines.length})
            </button>
            <button
              type="button"
              className={`badge ${statusFilter === 'In Stock' ? 'badge-success' : 'badge-neutral'}`}
              style={{ cursor: 'pointer', padding: '5px 12px', fontSize: 12, border: 'none' }}
              onClick={() => setStatusFilter('In Stock')}
            >
              ● In Stock ({medicines.filter((m) => m.status === 'In Stock').length})
            </button>
            <button
              type="button"
              className={`badge ${statusFilter === 'Low Stock' ? 'badge-warning' : 'badge-neutral'}`}
              style={{ cursor: 'pointer', padding: '5px 12px', fontSize: 12, border: 'none' }}
              onClick={() => setStatusFilter('Low Stock')}
            >
              ▲ Low Stock ({lowStockCount})
            </button>
            <button
              type="button"
              className={`badge ${statusFilter === 'Out of Stock' ? 'badge-error' : 'badge-neutral'}`}
              style={{ cursor: 'pointer', padding: '5px 12px', fontSize: 12, border: 'none' }}
              onClick={() => setStatusFilter('Out of Stock')}
            >
              ✕ Out of Stock ({outOfStockCount})
            </button>
            <button
              type="button"
              className={`badge ${statusFilter === 'Expiring Soon' ? 'badge-purple' : 'badge-neutral'}`}
              style={{ cursor: 'pointer', padding: '5px 12px', fontSize: 12, border: 'none' }}
              onClick={() => setStatusFilter('Expiring Soon')}
            >
              ⏱ Expiring Soon ({expiringSoonCount})
            </button>
          </div>

          {/* Quick Category Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
            <span className="hint" style={{ fontSize: 12, fontWeight: 700, marginRight: 4 }}>Therapeutic Class:</span>
            <button
              type="button"
              className={`badge ${categoryFilter === 'All' ? 'badge-primary' : 'badge-neutral'}`}
              style={{ cursor: 'pointer', padding: '5px 11px', fontSize: 12, border: 'none' }}
              onClick={() => setCategoryFilter('All')}
            >
              All Classes ({medicines.length})
            </button>
            {categories.map((c) => {
              const count = medicines.filter((m) => m.category === c).length;
              return (
                <button
                  key={c}
                  type="button"
                  className={`badge ${categoryFilter === c ? 'badge-primary' : 'badge-neutral'}`}
                  style={{ cursor: 'pointer', padding: '5px 11px', fontSize: 12, border: 'none' }}
                  onClick={() => setCategoryFilter(c)}
                >
                  {c} ({count})
                </button>
              );
            })}
          </div>

          <div className="toolbar" style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              className="input"
              style={{ maxWidth: 360 }}
              placeholder="Search formulary by brand name, generic molecule, or batch…"
              aria-label="Search formulary by brand name, generic molecule, or batch"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label htmlFor="pharm-category-select" className="hint">Category:</label>
              <select
                id="pharm-category-select"
                className="input"
                style={{ width: 160 }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter medications by category"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label htmlFor="pharm-status-select" className="hint">Status:</label>
              <select
                id="pharm-status-select"
                className="input"
                style={{ width: 140 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter medications by status"
              >
                <option value="All">All Statuses</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Expiring Soon">Expiring Soon</option>
              </select>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medication Code</th>
                    <th>Brand Name</th>
                    <th>Generic Molecule</th>
                    <th>Dosage Form</th>
                    <th>Category</th>
                    <th>Batch Lot</th>
                    <th style={{ minWidth: 150 }}>Stock on Hand</th>
                    <th>Unit Retail</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th style={{ minWidth: 260 }}>Stock Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFormulary.map((med) => {
                    const pct = Math.min(100, Math.max(med.stock > 0 ? 6 : 0, Math.round((med.stock / Math.max(med.minStock, 1)) * 100)));
                    const barColor =
                      med.stock === 0
                        ? 'var(--c-error)'
                        : med.stock < med.minStock
                        ? 'var(--c-warning)'
                        : 'var(--c-success)';

                    return (
                      <tr key={med.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{med.id}</td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{med.name}</div>
                          {med.allergyClass !== 'None' && (
                            <span className="hint" style={{ color: 'var(--c-warning)', fontSize: 11 }}>
                              Contains: {med.allergyClass}
                            </span>
                          )}
                        </td>
                        <td style={{ color: 'var(--c-text-muted)' }}>{med.generic}</td>
                        <td>
                          <span className="badge badge-neutral">{med.form || 'Tablet'}</span>
                        </td>
                        <td>{med.category}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{med.batchNo}</td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: 14, color: med.stock === 0 ? 'var(--c-error)' : med.stock < med.minStock ? 'var(--c-warning)' : 'var(--c-text)' }}>
                              {med.stock} <span style={{ fontSize: 11, fontWeight: 500 }}>{med.unit}</span>
                            </span>
                            <span className="hint" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                              min {med.minStock}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: 5, background: 'var(--c-border)', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
                            <div
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: barColor,
                                borderRadius: 3,
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{med.price}</td>
                        <td style={{ fontSize: 12.5 }}>
                          <span style={{ color: med.daysToExpiry <= 60 ? 'var(--c-error)' : 'inherit', fontWeight: med.daysToExpiry <= 60 ? 700 : 400 }}>
                            {med.expiry}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={med.status} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                borderColor: '#059669',
                                fontSize: 12,
                                padding: '5px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                              }}
                              title={`Update or adjust stock for ${med.name}`}
                              onClick={() => openStockModal(med, 'add')}
                            >
                              <Icon name="plus" style={{ width: 12, height: 12 }} /> Update Stock
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 12, padding: '5px 9px' }}
                              title="Edit Medicine Formulary Details"
                              onClick={() => setEditMed({ ...med })}
                            >
                              <Icon name="edit" style={{ width: 12, height: 12 }} /> Edit
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 7px', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                              title="Quick Stock In +50 units"
                              onClick={() => handleQuickStockAdd(med.id, 50)}
                            >
                              +50
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 7px', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                              title="Quick Stock In +100 units"
                              onClick={() => handleQuickStockAdd(med.id, 100)}
                            >
                              +100
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 3: EXPIRY & CRITICAL STOCK WATCHLIST */}
      {activeTab === 'watchlist' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="grid grid-3">
            <div className="card card-pad" style={{ borderLeft: '4px solid var(--c-error)' }}>
              <div className="hint">Quarantine / Immediate Expiring (&lt;30 Days)</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-error)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                {medicines.filter((m) => m.daysToExpiry <= 30).length} Batches
              </div>
              <div className="hint" style={{ marginTop: 4 }}>Requires FEFO prioritization or write-off</div>
            </div>

            <div className="card card-pad" style={{ borderLeft: '4px solid var(--c-warning)' }}>
              <div className="hint">Stockout Alerts (0 Count on Hand)</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-warning)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                {outOfStockCount} Formularies
              </div>
              <div className="hint" style={{ marginTop: 4 }}>Prescriptions blocked for fulfillment</div>
            </div>

            <div className="card card-pad" style={{ borderLeft: '4px solid var(--c-primary)' }}>
              <div className="hint">Low Buffer Below Minimum Safety Level</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-primary)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                {lowStockCount} Formularies
              </div>
              <div className="hint" style={{ marginTop: 4 }}>Recommended for supplier reorder PO</div>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-pad" style={{ borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Surveillance Matrix: Critical & Expiring Inventory</div>
                <div className="hint">Sorted by earliest expiration and stock deficit</div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPoModalOpen(true)}
              >
                <Icon name="print" /> Draft Supplier Reorder Manifest (PO)
              </button>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Batch Lot</th>
                    <th>Current Stock</th>
                    <th>Buffer Deficit</th>
                    <th>Expiry Date</th>
                    <th>Surveillance Urgency</th>
                    <th>Recommended Order</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlistItems.map((med) => {
                    const deficit = Math.max(0, med.minStock - med.stock);
                    const isUrgentExpiry = med.daysToExpiry <= 30;
                    const isWarningExpiry = med.daysToExpiry <= 60;

                    return (
                      <tr key={med.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{med.name}</div>
                          <div className="hint">{med.generic} · {med.category}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{med.batchNo}</td>
                        <td style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                          <span style={{ color: med.stock === 0 ? 'var(--c-error)' : 'var(--c-warning)' }}>
                            {med.stock} {med.unit}
                          </span>
                        </td>
                        <td style={{ color: 'var(--c-error)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                          {deficit > 0 ? `-${deficit} ${med.unit}` : 'Safe'}
                        </td>
                        <td style={{ fontWeight: 600 }}>{med.expiry}</td>
                        <td>
                          {isUrgentExpiry ? (
                            <span className="badge badge-error">Expires in {med.daysToExpiry}d!</span>
                          ) : isWarningExpiry ? (
                            <span className="badge badge-warning">Expires in {med.daysToExpiry}d</span>
                          ) : med.stock === 0 ? (
                            <span className="badge badge-error">Out of Stock</span>
                          ) : (
                            <span className="badge badge-warning">Low Buffer</span>
                          )}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          +{Math.max(50, deficit + 100)} {med.unit}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                borderColor: '#059669',
                                fontWeight: 700,
                                fontSize: 12,
                                padding: '5px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                whiteSpace: 'nowrap',
                              }}
                              onClick={() => openStockModal(med, 'add', Math.max(50, deficit + 50))}
                              title={`Restock ${med.name}`}
                            >
                              <Icon name="plus" style={{ width: 12, height: 12 }} /> Restock Now
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 8px', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                              title="Quick add +100 units"
                              onClick={() => handleQuickStockAdd(med.id, 100)}
                            >
                              +100
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Edit Formulary"
                              onClick={() => setEditMed({ ...med })}
                            >
                              <Icon name="edit" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT MEDICINE FORMULARY RECORD */}
      {editMed && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setEditMed(null)}>
          <div className="modal" style={{ maxWidth: 540, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-head">
              <div style={{ fontWeight: 800, fontSize: 16 }}>
                Edit Medication Formulary — {editMed.name}
              </div>
              <button className="btn-icon" onClick={() => setEditMed(null)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <form onSubmit={handleSaveEditMedication} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="modal-body" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-surface-hover)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--c-border)' }}>
                  <div>
                    <span className="hint" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{editMed.id}</span>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{editMed.name}</div>
                  </div>
                  <StatusBadge status={editMed.status} />
                </div>

                <div className="grid grid-2" style={{ gap: 10 }}>
                  <div className="field">
                    <label>Brand Name & Strength *</label>
                    <input
                      className="input"
                      value={editMed.name}
                      onChange={(e) => setEditMed({ ...editMed, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Generic Molecule *</label>
                    <input
                      className="input"
                      value={editMed.generic}
                      onChange={(e) => setEditMed({ ...editMed, generic: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: 10 }}>
                  <div className="field">
                    <label>Therapeutic Category</label>
                    <select
                      className="input"
                      value={editMed.category}
                      onChange={(e) => setEditMed({ ...editMed, category: e.target.value })}
                    >
                      <option>Antibiotic</option>
                      <option>Analgesic</option>
                      <option>Antihypertensive</option>
                      <option>Antidiabetic</option>
                      <option>Gastrointestinal</option>
                      <option>Respiratory</option>
                      <option>Cardiovascular</option>
                      <option>General</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Dosage Form</label>
                    <select
                      className="input"
                      value={editMed.form || 'Tablet'}
                      onChange={(e) => setEditMed({ ...editMed, form: e.target.value })}
                    >
                      <option>Tablet</option>
                      <option>Capsule</option>
                      <option>Injection / Vial</option>
                      <option>Syrup / Suspension</option>
                      <option>Inhaler</option>
                      <option>IV Infusion</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-3" style={{ gap: 10 }}>
                  <div className="field">
                    <label>Stock on Hand *</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={editMed.stock}
                      onChange={(e) => setEditMed({ ...editMed, stock: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Safety Buffer (Min)</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={editMed.minStock}
                      onChange={(e) => setEditMed({ ...editMed, minStock: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Unit Price (PKR)</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={editMed.priceN || String(editMed.price).replace(/[^0-9.]/g, '') || ''}
                      onChange={(e) => setEditMed({ ...editMed, priceN: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-3" style={{ gap: 10 }}>
                  <div className="field">
                    <label>Dispensing Unit</label>
                    <select
                      className="input"
                      value={editMed.unit || 'Tablets'}
                      onChange={(e) => setEditMed({ ...editMed, unit: e.target.value })}
                    >
                      <option>Tablets</option>
                      <option>Capsules</option>
                      <option>Vials</option>
                      <option>Canisters</option>
                      <option>Bottles</option>
                      <option>Ampoules</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Batch / Lot No</label>
                    <input
                      className="input"
                      value={editMed.batchNo}
                      onChange={(e) => setEditMed({ ...editMed, batchNo: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Expiry Date</label>
                    <input
                      className="input"
                      value={editMed.expiry}
                      onChange={(e) => setEditMed({ ...editMed, expiry: e.target.value })}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Allergy Safety Molecule Class</label>
                  <select
                    className="input"
                    value={editMed.allergyClass || 'None'}
                    onChange={(e) => setEditMed({ ...editMed, allergyClass: e.target.value })}
                  >
                    <option value="None">None (Standard Precaution)</option>
                    <option value="Penicillin">Penicillin (Beta-Lactam)</option>
                    <option value="Cephalosporin">Cephalosporin</option>
                    <option value="Sulfa">Sulfa / Sulfonamide</option>
                    <option value="NSAID">NSAID / Aspirin Class</option>
                  </select>
                  <div className="hint" style={{ marginTop: 4 }}>
                    Automated dispensing safety check warns if patient chart has matching allergy.
                  </div>
                </div>
              </div>

              <div className="modal-foot" style={{ justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--c-error)', borderColor: 'var(--c-error)' }}
                  onClick={() => handleDeleteMedication(editMed.id)}
                >
                  <Icon name="x" /> Delete Medication
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditMed(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Icon name="check" /> Save Formulary Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER NEW FORMULARY */}
      {addModalOpen && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setAddModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-head">
              <div style={{ fontWeight: 700, fontSize: 16 }}>Register New Formulary Medication</div>
              <button className="btn-icon" onClick={() => setAddModalOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <form onSubmit={handleAddMedication}>
              <div className="modal-body">
                <div className="grid grid-2" style={{ gap: 10, marginBottom: 10 }}>
                  <div className="field">
                    <label>Brand Name & Strength *</label>
                    <input
                      className="input"
                      placeholder="e.g. Lipitor 20mg"
                      value={newMed.name}
                      onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Generic Molecule *</label>
                    <input
                      className="input"
                      placeholder="e.g. Atorvastatin"
                      value={newMed.generic}
                      onChange={(e) => setNewMed({ ...newMed, generic: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: 10, marginBottom: 10 }}>
                  <div className="field">
                    <label>Therapeutic Category</label>
                    <select
                      className="input"
                      value={newMed.category}
                      onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                    >
                      <option>Antibiotic</option>
                      <option>Analgesic</option>
                      <option>Antihypertensive</option>
                      <option>Antidiabetic</option>
                      <option>Gastrointestinal</option>
                      <option>Respiratory</option>
                      <option>Cardiovascular</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Dosage Form</label>
                    <select
                      className="input"
                      value={newMed.form}
                      onChange={(e) => setNewMed({ ...newMed, form: e.target.value })}
                    >
                      <option>Tablet</option>
                      <option>Capsule</option>
                      <option>Injection / Vial</option>
                      <option>Syrup / Suspension</option>
                      <option>Inhaler</option>
                      <option>IV Infusion</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-3" style={{ gap: 10, marginBottom: 10 }}>
                  <div className="field">
                    <label>Initial Stock</label>
                    <input
                      className="input"
                      type="number"
                      value={newMed.stock}
                      onChange={(e) => setNewMed({ ...newMed, stock: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Min Threshold</label>
                    <input
                      className="input"
                      type="number"
                      value={newMed.minStock}
                      onChange={(e) => setNewMed({ ...newMed, minStock: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Unit Price (PKR)</label>
                    <input
                      className="input"
                      type="number"
                      value={newMed.price}
                      onChange={(e) => setNewMed({ ...newMed, price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-2" style={{ gap: 10 }}>
                  <div className="field">
                    <label>Batch / Lot Number</label>
                    <input
                      className="input"
                      placeholder="e.g. BT-9021"
                      value={newMed.batchNo}
                      onChange={(e) => setNewMed({ ...newMed, batchNo: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Expiration Date</label>
                    <input
                      className="input"
                      placeholder="e.g. Dec 2027"
                      value={newMed.expiry}
                      onChange={(e) => setNewMed({ ...newMed, expiry: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register in Formulary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: THERMAL BOTTLE / STRIP DOSAGE LABEL */}
      {activeLabelData && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setActiveLabelData(null)}>
          <div className="modal" style={{ maxWidth: 440, padding: 0, overflow: 'hidden' }}>
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                background: 'var(--c-surface-hover)',
                borderBottom: '1px solid var(--c-border)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Prescription Bottle Thermal Label</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Icon name="print" /> Print Thermal Label
                </button>
                <button className="btn-icon" onClick={() => setActiveLabelData(null)} aria-label="Close">
                  <Icon name="x" />
                </button>
              </div>
            </div>

            <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
              <div className="rx-bottle-label">
                <div style={{ textAlign: 'center', borderBottom: '2px solid var(--c-border-strong)', paddingBottom: 8, marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.04em', color: 'var(--c-primary)' }}>
                    AL-SHIFA HOSPITAL DISPENSARY
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>
                    Licensed Hospital Pharmacy · Islamabad · Tel: 051-111-257443
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span>Patient: <strong>{activeLabelData.patient}</strong></span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>MRN: {activeLabelData.pid}</span>
                </div>

                <div style={{ background: 'var(--c-surface-hover)', padding: '8px 10px', borderRadius: 6, margin: '8px 0', border: '1px dashed var(--c-border-strong)' }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{activeLabelData.medicine}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--c-text-muted)' }}>Dispensed Quantity: {activeLabelData.qty} Units</div>
                </div>

                <div style={{ fontSize: 12.5, fontWeight: 700, margin: '8px 0', color: 'var(--c-text)' }}>
                  DIRECTIONS: {activeLabelData.instructions}
                </div>

                <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: 8, marginTop: 10, fontSize: 10.5, color: 'var(--c-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Doctor: {activeLabelData.doctor.split(' ')[0]} {activeLabelData.doctor.split(' ')[1]}</span>
                  <span>Date: {activeLabelData.date}</span>
                </div>

                <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, fontWeight: 700, color: 'var(--c-error)' }}>
                  KEEP ALL MEDICINES OUT OF REACH OF CHILDREN
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 4: PROCUREMENT PURCHASE ORDER REQUISITION MANIFEST */}
      {poModalOpen && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setPoModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 640, padding: 0, overflow: 'hidden' }}>
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                background: 'var(--c-surface-hover)',
                borderBottom: '1px solid var(--c-border)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Supplier Reorder Manifest (PO Requisition)</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Icon name="print" /> Print Manifest (A4)
                </button>
                <button className="btn-icon" onClick={() => setPoModalOpen(false)} aria-label="Close">
                  <Icon name="x" />
                </button>
              </div>
            </div>

            <div style={{ padding: 24, background: '#ffffff', color: '#0f172a' }}>
              <div style={{ border: '2px solid #0f172a', borderRadius: 8, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>AL-SHIFA CENTRAL HOSPITAL PHARMACY</div>
                    <div style={{ fontSize: 11.5, color: '#475569' }}>Pharmaceutical Procurement & Restock Requisition</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 14, fontFamily: 'monospace', color: '#0284c7' }}>
                      PO-2026-089
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>

                <div style={{ marginBottom: 14, fontSize: 12 }}>
                  <div style={{ color: '#64748b', marginBottom: 6 }}>Surveillance trigger: Items below safety buffer threshold or expiring within 60 days.</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, marginTop: 8 }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                        <th style={{ padding: '6px 8px' }}>Medication</th>
                        <th style={{ padding: '6px 8px' }}>Batch</th>
                        <th style={{ padding: '6px 8px' }}>Current</th>
                        <th style={{ padding: '6px 8px' }}>Min Buffer</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Order Qty</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Unit Est.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {watchlistItems.map((m) => {
                        const deficit = Math.max(0, m.minStock - m.stock);
                        const orderUnits = Math.max(50, deficit + 100);
                        return (
                          <tr key={m.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px 8px' }}>
                              <strong>{m.name}</strong> <span style={{ color: '#64748b' }}>({m.generic})</span>
                            </td>
                            <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{m.batchNo}</td>
                            <td style={{ padding: '6px 8px', color: m.stock === 0 ? '#dc2626' : '#d97706', fontWeight: 700 }}>
                              {m.stock} {m.unit}
                            </td>
                            <td style={{ padding: '6px 8px' }}>{m.minStock}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: '#0284c7' }}>
                              +{orderUnits} {m.unit}
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'right' }}>{m.price}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: 14, marginTop: 14 }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Authorized under Al-Shifa Pharmacy Formulary Standards
                  </div>
                  <div style={{ textAlign: 'center', width: 160 }}>
                    <div style={{ borderBottom: '1px solid #0f172a', width: '100%', marginBottom: 4 }} />
                    <div style={{ fontWeight: 800, fontSize: 11 }}>Chief Pharmacist</div>
                    <div style={{ fontSize: 9.5, color: '#64748b' }}>Procurement Signature</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: DEDICATED STOCK UPDATE & INVENTORY ADJUSTMENT */}
      {stockModal && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setStockModal(null)}>
          <div className="modal" style={{ maxWidth: 540, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(5, 150, 105, 0.15)',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="plus" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>
                    Update Inventory Stock
                  </div>
                  <div className="hint" style={{ fontSize: 12 }}>
                    Record incoming deliveries, write-off wastage, or reconcile physical shelf counts
                  </div>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setStockModal(null)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>

            <form onSubmit={handleConfirmStockAdjustment} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="modal-body" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* 1. Select Medication */}
                <div className="field">
                  <label htmlFor="stock-med-select" style={{ fontWeight: 700 }}>Select Medication Formulary *</label>
                  <select
                    id="stock-med-select"
                    className="input"
                    value={stockModal.medId}
                    onChange={(e) => {
                      const sel = medicines.find((m) => m.id === e.target.value);
                      if (sel) {
                        setStockModal({
                          ...stockModal,
                          medId: sel.id,
                          batchNo: sel.batchNo || '',
                          expiry: sel.expiry || '',
                        });
                      }
                    }}
                    aria-label="Select Medication to adjust stock"
                    required
                  >
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.generic}) — Current: {m.stock} {m.unit} [{m.status}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current Medicine Overview Card */}
                {(() => {
                  const selMed = medicines.find((m) => m.id === stockModal.medId);
                  if (!selMed) return null;
                  return (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--c-surface-hover)',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--c-border)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{selMed.name}</div>
                        <div className="hint" style={{ fontSize: 12 }}>
                          {selMed.generic} · Batch: <code style={{ fontFamily: 'var(--font-mono)' }}>{selMed.batchNo}</code> · Expiry: {selMed.expiry}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: 15, fontFamily: 'var(--font-mono)' }}>
                          {selMed.stock} {selMed.unit}
                        </div>
                        <div className="hint" style={{ fontSize: 11 }}>
                          Min Buffer: {selMed.minStock}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Adjustment Mode Selector */}
                <div className="field">
                  <label style={{ fontWeight: 700, marginBottom: 6, display: 'block' }}>Adjustment Type *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <button
                      type="button"
                      className={`btn ${stockModal.mode === 'add' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '9px 10px',
                        fontSize: 12.5,
                        fontWeight: 700,
                        background: stockModal.mode === 'add' ? '#059669' : undefined,
                        borderColor: stockModal.mode === 'add' ? '#059669' : undefined,
                        color: stockModal.mode === 'add' ? '#ffffff' : undefined,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                      }}
                      onClick={() => setStockModal({ ...stockModal, mode: 'add', reason: 'Vendor Shipment Delivery' })}
                    >
                      <span>+ Receive Stock</span>
                      <span style={{ fontSize: 10.5, opacity: 0.85, fontWeight: 400 }}>Shipment delivery</span>
                    </button>

                    <button
                      type="button"
                      className={`btn ${stockModal.mode === 'deduct' ? 'btn-danger' : 'btn-secondary'}`}
                      style={{
                        padding: '9px 10px',
                        fontSize: 12.5,
                        fontWeight: 700,
                        background: stockModal.mode === 'deduct' ? '#dc2626' : undefined,
                        borderColor: stockModal.mode === 'deduct' ? '#dc2626' : undefined,
                        color: stockModal.mode === 'deduct' ? '#ffffff' : undefined,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                      }}
                      onClick={() => setStockModal({ ...stockModal, mode: 'deduct', reason: 'Damaged / Wastage Write-off' })}
                    >
                      <span>- Deduct Stock</span>
                      <span style={{ fontSize: 10.5, opacity: 0.85, fontWeight: 400 }}>Damage / Waste</span>
                    </button>

                    <button
                      type="button"
                      className={`btn ${stockModal.mode === 'set' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '9px 10px',
                        fontSize: 12.5,
                        fontWeight: 700,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                      }}
                      onClick={() => {
                        const selMed = medicines.find((m) => m.id === stockModal.medId);
                        setStockModal({ ...stockModal, mode: 'set', qty: selMed ? selMed.stock : '', reason: 'Weekly Physical Shelf Audit' });
                      }}
                    >
                      <span>= Exact Count</span>
                      <span style={{ fontSize: 10.5, opacity: 0.85, fontWeight: 400 }}>Shelf audit count</span>
                    </button>
                  </div>
                </div>

                {/* 3. Quantity Input with Quick Addition Chips */}
                <div className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label htmlFor="stock-qty-input" style={{ fontWeight: 700 }}>
                      {stockModal.mode === 'add'
                        ? 'Units to Receive (Add) *'
                        : stockModal.mode === 'deduct'
                        ? 'Units to Deduct (Write-off) *'
                        : 'Total Counted Shelf Units *'}
                    </label>
                    {stockModal.mode === 'add' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[25, 50, 100, 250, 500].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 7px', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                            onClick={() => setStockModal({ ...stockModal, qty: (Number(stockModal.qty) || 0) + preset })}
                          >
                            +{preset}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    id="stock-qty-input"
                    type="number"
                    min={stockModal.mode === 'set' ? '0' : '1'}
                    className="input"
                    style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                    placeholder={stockModal.mode === 'set' ? 'e.g. 150' : 'e.g. 50'}
                    value={stockModal.qty}
                    onChange={(e) => setStockModal({ ...stockModal, qty: e.target.value })}
                    aria-label="Stock quantity"
                    required
                    autoFocus
                  />
                </div>

                {/* 4. Batch Lot & Expiry Date */}
                <div className="grid grid-2" style={{ gap: 10 }}>
                  <div className="field">
                    <label>Batch / Lot Number</label>
                    <input
                      className="input"
                      placeholder="e.g. BT-9942"
                      value={stockModal.batchNo}
                      onChange={(e) => setStockModal({ ...stockModal, batchNo: e.target.value })}
                      aria-label="Batch or Lot Number"
                    />
                  </div>
                  <div className="field">
                    <label>Expiry Date</label>
                    <input
                      className="input"
                      placeholder="e.g. Dec 2027"
                      value={stockModal.expiry}
                      onChange={(e) => setStockModal({ ...stockModal, expiry: e.target.value })}
                      aria-label="Expiry Date"
                    />
                  </div>
                </div>

                {/* 5. Adjustment Reason */}
                <div className="field">
                  <label>Audit Reason / Procurement Reference</label>
                  <select
                    className="input"
                    value={stockModal.reason}
                    onChange={(e) => setStockModal({ ...stockModal, reason: e.target.value })}
                    aria-label="Audit Reason or Reference"
                  >
                    <option>Vendor Shipment Delivery</option>
                    <option>Weekly Physical Shelf Audit</option>
                    <option>Monthly Inventory Reconciliation</option>
                    <option>Damaged / Broken Ampoules</option>
                    <option>Expired Batch Quarantine & Disposal</option>
                    <option>Return from Inpatient Ward</option>
                    <option>Inter-Dispensary Emergency Transfer</option>
                    <option>Data Correction / System Adjustment</option>
                  </select>
                </div>

                {/* 6. Live Telemetry Preview Card */}
                {(() => {
                  const selMed = medicines.find((m) => m.id === stockModal.medId);
                  if (!selMed) return null;
                  const qtyNum = Number(stockModal.qty) || 0;
                  let projectedStock = selMed.stock;
                  if (stockModal.mode === 'add') projectedStock = selMed.stock + qtyNum;
                  else if (stockModal.mode === 'deduct') projectedStock = Math.max(0, selMed.stock - qtyNum);
                  else if (stockModal.mode === 'set') projectedStock = Math.max(0, qtyNum);

                  const projectedStatus =
                    projectedStock === 0
                      ? 'Out of Stock'
                      : projectedStock < selMed.minStock
                      ? 'Low Stock'
                      : 'In Stock';

                  return (
                    <div
                      style={{
                        background: 'var(--c-surface-hover)',
                        border: '1px solid var(--c-border)',
                        borderRadius: 8,
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div className="hint" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>
                          Projected Stock Count
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          <span style={{ fontSize: 13, textDecoration: 'line-through', color: 'var(--c-text-muted)' }}>
                            {selMed.stock} {selMed.unit}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 700 }}>→</span>
                          <span
                            style={{
                              fontSize: 18,
                              fontWeight: 900,
                              fontFamily: 'var(--font-mono)',
                              color:
                                projectedStock === 0
                                  ? 'var(--c-error)'
                                  : projectedStock < selMed.minStock
                                  ? 'var(--c-warning)'
                                  : 'var(--c-success)',
                            }}
                          >
                            {projectedStock} {selMed.unit}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={projectedStatus} />
                    </div>
                  );
                })()}
              </div>

              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setStockModal(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    background: stockModal.mode === 'deduct' ? '#dc2626' : '#059669',
                    borderColor: stockModal.mode === 'deduct' ? '#dc2626' : '#059669',
                    fontWeight: 700,
                  }}
                >
                  <Icon name="check" /> Confirm & Apply Stock Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast text={toast} />
    </AppShell>
  );
}
