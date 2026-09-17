export const WARDS = [
  {
    name: 'ICU & Critical Care Unit',
    type: 'Critical Care',
    floor: 'Floor 3 · East Wing',
    nurseHead: 'Sister Rukhsana (ICU Specialist)',
    rooms: [
      { room: 'ICU-A', beds: [['ICU-01', 'occupied', 'PT-00109', 'Mechanical Ventilator + Arterial Line'], ['ICU-02', 'available', null, 'Mechanical Ventilator + Central Telemetry']] },
      { room: 'ICU-B', beds: [['ICU-03', 'cleaning', null, 'Continuous BiPAP / CPAP'], ['ICU-04', 'occupied', 'PT-00120', 'Mechanical Ventilator + Dialysis Port']] },
    ],
  },
  {
    name: 'Cardiology Ward',
    type: 'Step-Down & Inpatient',
    floor: 'Floor 2 · East Wing',
    nurseHead: 'Nadia Yousaf (Charge Nurse)',
    rooms: [
      { room: '101', beds: [['C-01', 'occupied', 'PT-00121', 'Wall Oxygen + Telemetry'], ['C-02', 'occupied', 'PT-00122', 'Wall Oxygen + Telemetry'], ['C-03', 'available', null, 'Wall Oxygen']] },
      { room: '102', beds: [['C-04', 'occupied', 'PT-00125', 'Telemetry Monitor'], ['C-05', 'reserved', null, 'Wall Oxygen'], ['C-06', 'available', null, 'Standard Medical Bed']] },
    ],
  },
  {
    name: 'Orthopedic Ward',
    type: 'Post-Surgical Care',
    floor: 'Floor 1 · West Wing',
    nurseHead: 'Kamran Sheikh (Staff Nurse)',
    rooms: [
      { room: '201', beds: [['O-07', 'occupied', 'PT-00123', 'Orthopedic Traction Frame'], ['O-08', 'available', null, 'Low-Height Fall Risk Bed'], ['O-09', 'occupied', 'PT-00124', 'Standard Medical Bed']] },
      { room: '202', beds: [['O-10', 'maintenance', null, 'Under Electrical Repair'], ['O-11', 'occupied', 'PT-00129', 'Trapeze Bar + Fall Sensor'], ['O-12', 'cleaning', null, 'Standard Medical Bed']] },
    ],
  },
  {
    name: 'Pediatric & Neonatal Ward',
    type: 'Pediatrics & NICU',
    floor: 'Floor 2 · North Wing',
    nurseHead: 'Farhat Naz (Pediatric Nurse)',
    rooms: [
      { room: 'PED-1', beds: [['P-01', 'occupied', 'PT-00137', 'Pediatric Crib + Phototherapy'], ['P-02', 'available', null, 'Pediatric Safety Bed'], ['P-03', 'available', null, 'Pediatric Safety Bed']] },
      { room: 'PED-2', beds: [['P-04', 'reserved', null, 'Infant Incubator Unit'], ['P-05', 'occupied', 'PT-00133', 'Pediatric Safety Bed'], ['P-06', 'available', null, 'Standard Child Bed']] },
    ],
  },
  {
    name: 'General Medical Ward',
    type: 'General Medicine',
    floor: 'Floor 1 · East Wing',
    nurseHead: 'Zahid Iqbal (Charge Nurse)',
    rooms: [
      { room: '301', beds: [['G-13', 'available', null, 'Standard Medical Bed'], ['G-14', 'available', null, 'Wall Oxygen'], ['G-15', 'occupied', 'PT-00134', 'Standard Medical Bed']] },
      { room: '302', beds: [['G-16', 'reserved', null, 'Standard Medical Bed'], ['G-17', 'cleaning', null, 'Standard Medical Bed'], ['G-18', 'occupied', 'PT-00136', 'Wall Oxygen']] },
    ],
  },
];

export const STATUS_LABEL = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  cleaning: 'Sanitizing',
  maintenance: 'Maintenance',
};

export function getAllBeds() {
  return WARDS.flatMap((w) =>
    w.rooms.flatMap((r) =>
      r.beds.map((b) => ({
        ward: w.name,
        room: r.room,
        code: b[0],
        status: b[1],
        patientId: b[2],
        equipment: b[3] || 'Standard Medical Bed',
      }))
    )
  );
}

export function getBedCounts() {
  const beds = getAllBeds();
  return {
    total: beds.length,
    available: beds.filter((b) => b.status === 'available').length,
    occupied: beds.filter((b) => b.status === 'occupied').length,
    reserved: beds.filter((b) => b.status === 'reserved').length,
    cleaning: beds.filter((b) => b.status === 'cleaning').length,
    maintenance: beds.filter((b) => b.status === 'maintenance').length,
  };
}

export function getWardSummaries() {
  return WARDS.map((w) => {
    const wardBeds = w.rooms.flatMap((r) => r.beds);
    const total = wardBeds.length;
    const occupied = wardBeds.filter((b) => b[1] === 'occupied').length;
    const available = wardBeds.filter((b) => b[1] === 'available').length;
    const cleaning = wardBeds.filter((b) => b[1] === 'cleaning').length;
    const reserved = wardBeds.filter((b) => b[1] === 'reserved').length;
    const maintenance = wardBeds.filter((b) => b[1] === 'maintenance').length;
    return {
      name: w.name,
      type: w.type,
      floor: w.floor,
      nurse: w.nurseHead,
      total,
      occupied,
      available,
      cleaning,
      reserved,
      maintenance,
      pct: total > 0 ? Math.round((occupied / total) * 100) : 0,
    };
  });
}

