import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import Toast from '../../components/ui/Toast.jsx';
import { PATIENTS, DOCTORS, getPatientById } from '../../legacy/legacyEngine.js';
import { bedService } from '../../services/bedService.js';
import { patientService } from '../../services/patientService.js';
import { useToast } from '../../hooks/useToast.js';
import { WARDS, STATUS_LABEL } from '../../data/wardsData.js';
import PlanGateLock from '../../components/common/PlanGateLock.jsx';

export default function AdmissionsPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const [wardFilter, setWardFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBed, setSelectedBed] = useState(null); // { ward, room, code, status, patientId, equipment }
  const [wardsData, setWardsData] = useState(() => JSON.parse(JSON.stringify(WARDS)));

  useEffect(() => {
    let active = true;
    bedService.getWardsAndBeds().then((data) => {
      if (active && data && data.length > 0) {
        setWardsData(data);
      }
    });

    const unsubscribe = bedService.subscribe(() => {
      bedService.getWardsAndBeds().then((data) => {
        if (active && data && data.length > 0) {
          setWardsData(data);
        }
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Admission Modal State
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [admitForm, setAdmitForm] = useState({
    patientId: '',
    bedCode: '',
    doctorId: 'DOC-01',
    diagnosis: '',
    category: 'Emergency ER',
    diet: 'Standard Hospital Diet',
    fallRisk: 'Standard Precaution',
  });

  // Bed Transfer Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferTargetBed, setTransferTargetBed] = useState('');
  const [transferReason, setTransferReason] = useState('Clinical Step-down to General Ward');

  // Printable Bedside Clipboard Chart Modal
  const [bedsideSlipModal, setBedsideSlipModal] = useState(null);

  // Add Bed / Room Modal State
  const [addBedModalOpen, setAddBedModalOpen] = useState(false);
  const [newBedForm, setNewBedForm] = useState({
    wardName: 'General Medical Ward',
    wardId: 'general',
    roomMode: 'existing',
    room: '301',
    newRoomName: '',
    code: '',
    equipment: 'Standard Medical Bed',
    status: 'available',
    assignPatientNow: false,
    patientMode: 'existing',
    patientId: '',
    newPatientName: '',
    newPatientAge: '',
    newPatientGender: 'Male',
    newPatientPhone: '',
    newPatientDiagnosis: '',
    newPatientDoctor: 'Dr. Sarah Khan',
  });

  // Edit Bed Modal State
  const [editBedModalOpen, setEditBedModalOpen] = useState(false);
  const [editingBed, setEditingBed] = useState(null);

  const allBeds = useMemo(
    () =>
      wardsData.flatMap((w) =>
        w.rooms.flatMap((r) =>
          r.beds.map((b) => ({
            ward: w.name,
            floor: w.floor,
            room: r.room,
            code: b[0],
            status: b[1],
            patientId: b[2],
            equipment: b[3] || 'Standard Medical Bed',
          }))
        )
      ),
    [wardsData]
  );

  const totalBeds = allBeds.length;
  const occupied = allBeds.filter((b) => b.status === 'occupied').length;
  const available = allBeds.filter((b) => b.status === 'available').length;
  const sanitizing = allBeds.filter((b) => b.status === 'cleaning').length;
  const maintenance = allBeds.filter((b) => b.status === 'maintenance').length;
  const occupancyRate = Math.round((occupied / totalBeds) * 100);

  const availableBedsList = allBeds.filter((b) => b.status === 'available');
  const unadmittedPatients = PATIENTS.filter((p) => p.ward === '-' || p.status !== 'Admitted');

  const visibleWards = wardsData.filter((w) => wardFilter === 'All' || w.name === wardFilter);

  function bedMatchesFilter(status) {
    return statusFilter === 'All' || status === statusFilter;
  }

  const selectedPatient = useMemo(() => {
    if (!selectedBed || selectedBed.status !== 'occupied') return null;
    if (selectedBed.patientId) {
      const found = getPatientById(selectedBed.patientId);
      if (found) return found;
    }
    return {
      id: selectedBed.patientId || `PT-${selectedBed.code.replace(/[^A-Z0-9]/gi, '')}`,
      name: `Admitted Inpatient (${selectedBed.code})`,
      age: 48,
      gender: 'Male',
      phone: '0300-5551234',
      doctor: selectedBed.ward.includes('Cardio')
        ? 'Dr. Sarah Khan'
        : selectedBed.ward.includes('Ortho')
        ? 'Dr. Bilal Ahmed'
        : selectedBed.ward.includes('Ped')
        ? 'Dr. Ayesha Raza'
        : 'Dr. Imran Malik',
      ward: selectedBed.ward,
      bed: selectedBed.code,
      status: 'Admitted',
      blood: 'B+',
      allergy: 'None recorded',
      cnic: '36302-0000000-0',
      dob: '15 Jan 1976',
      admissionDiagnosis: 'Clinical Inpatient Care',
    };
  }, [selectedBed]);

  // Discharge patient and mark bed for terminal cleaning / sanitization
  function discharge() {
    if (!selectedBed) return;
    setWardsData((wList) =>
      wList.map((w) => {
        if (w.name !== selectedBed.ward) return w;
        return {
          ...w,
          rooms: w.rooms.map((r) => {
            if (r.room !== selectedBed.room) return r;
            return {
              ...r,
              beds: r.beds.map((b) => (b[0] === selectedBed.code ? [b[0], 'cleaning', null, b[3]] : b)),
            };
          }),
        };
      })
    );

    if (selectedPatient) {
      selectedPatient.status = 'Discharged';
      selectedPatient.ward = '-';
      selectedPatient.bed = '-';
    }

    bedService.dischargeBed(selectedBed.code, selectedPatient?.id);
    showToast(`${selectedPatient?.name || selectedBed.code} discharged. Bed ${selectedBed.code} flagged for Sanitization.`);
    setSelectedBed(null);
  }

  // Mark a sanitized bed as available for next patient
  function markBedSanitized(bedCode, wardName) {
    setWardsData((wList) =>
      wList.map((w) => {
        if (w.name !== wardName) return w;
        return {
          ...w,
          rooms: w.rooms.map((r) => ({
            ...r,
            beds: r.beds.map((b) => (b[0] === bedCode ? [b[0], 'available', null, b[3]] : b)),
          })),
        };
      })
    );
    bedService.updateBed(bedCode, { status: 'available', patientId: null });
    showToast(`Bed ${bedCode} terminal cleaning verified. Status updated to Available.`);
    setSelectedBed(null);
  }

  // Handle Clinical Admission
  function handleAdmit(e) {
    e.preventDefault();
    if (!admitForm.patientId || !admitForm.bedCode) {
      showToast('Select both a patient and an available bed.');
      return;
    }

    const patient = PATIENTS.find((p) => p.id === admitForm.patientId);
    const targetBed = allBeds.find((b) => b.code === admitForm.bedCode);
    const doctorObj = DOCTORS.find((d) => d.id === admitForm.doctorId) || DOCTORS[0];

    if (!patient || !targetBed) return;

    setWardsData((wList) =>
      wList.map((w) => {
        if (w.name !== targetBed.ward) return w;
        return {
          ...w,
          rooms: w.rooms.map((r) => {
            if (r.room !== targetBed.room) return r;
            return {
              ...r,
              beds: r.beds.map((b) => (b[0] === targetBed.code ? [b[0], 'occupied', patient.id, b[3]] : b)),
            };
          }),
        };
      })
    );

    patient.status = 'Admitted';
    patient.ward = targetBed.ward;
    patient.bed = targetBed.code;
    patient.doctor = doctorObj.name;
    patient.admissionDiagnosis = admitForm.diagnosis.trim() || 'Acute Clinical Inpatient Care';
    patient.admissionCategory = admitForm.category;
    patient.diet = admitForm.diet;
    patient.fallRisk = admitForm.fallRisk;
    patient.admissionDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    bedService.assignBed(targetBed.code, patient.id, patient.admissionDiagnosis);
    showToast(`Admitted ${patient.name} to ${targetBed.ward} · Bed ${targetBed.code}.`);
    setAdmitModalOpen(false);
    setBedsideSlipModal({ patient, bed: targetBed, doctor: doctorObj });
    setAdmitForm({
      patientId: '',
      bedCode: '',
      doctorId: 'DOC-01',
      diagnosis: '',
      category: 'Emergency ER',
      diet: 'Standard Hospital Diet',
      fallRisk: 'Standard Precaution',
    });
  }

  // Handle Bed Transfer Workflow
  function handleTransfer(e) {
    e.preventDefault();
    if (!selectedBed || !transferTargetBed) {
      showToast('Please select a destination bed.');
      return;
    }

    const patient = selectedPatient;
    const oldBed = selectedBed;
    const newBed = allBeds.find((b) => b.code === transferTargetBed);

    if (!patient || !newBed) return;

    // Atomically transfer: old bed becomes 'cleaning', new bed becomes 'occupied'
    setWardsData((wList) =>
      wList.map((w) => {
        let updatedRooms = w.rooms;
        // Check old bed ward
        if (w.name === oldBed.ward) {
          updatedRooms = updatedRooms.map((r) => ({
            ...r,
            beds: r.beds.map((b) => (b[0] === oldBed.code ? [b[0], 'cleaning', null, b[3]] : b)),
          }));
        }
        // Check new bed ward
        if (w.name === newBed.ward) {
          updatedRooms = updatedRooms.map((r) => ({
            ...r,
            beds: r.beds.map((b) => (b[0] === newBed.code ? [b[0], 'occupied', patient.id, b[3]] : b)),
          }));
        }
        return { ...w, rooms: updatedRooms };
      })
    );

    patient.ward = newBed.ward;
    patient.bed = newBed.code;

    showToast(`Transferred ${patient.name} from Bed ${oldBed.code} → Bed ${newBed.code} (${transferReason}).`);
    setTransferModalOpen(false);
    setSelectedBed(null);
  }

  // Open Edit Bed Modal
  function openEditBed(bed) {
    setEditingBed({
      code: bed.code,
      wardName: bed.ward,
      room: bed.room,
      equipment: bed.equipment || 'Standard Medical Bed',
      status: bed.status || 'available',
      patientId: bed.patientId || null,
    });
    setSelectedBed(null);
    setEditBedModalOpen(true);
  }

  // Handle Save Edit Bed
  async function handleSaveEditBed(e) {
    e.preventDefault();
    if (!editingBed) return;

    const targetRoom = (editingBed.room || '').trim();
    if (!targetRoom) {
      showToast('Please specify a room identifier or number.');
      return;
    }

    setWardsData((wList) =>
      wList.map((w) => {
        if (w.name !== editingBed.wardName) return w;

        // Remove bed from previous room
        const updatedRooms = w.rooms.map((r) => ({
          ...r,
          beds: r.beds.filter((b) => b[0] !== editingBed.code),
        }));

        // Find or create destination room
        const destRoomIdx = updatedRooms.findIndex((r) => r.room === targetRoom);
        const bedTuple = [editingBed.code, editingBed.status, editingBed.patientId || null, editingBed.equipment];

        if (destRoomIdx >= 0) {
          updatedRooms[destRoomIdx] = {
            ...updatedRooms[destRoomIdx],
            beds: [...updatedRooms[destRoomIdx].beds, bedTuple],
          };
        } else {
          updatedRooms.push({
            room: targetRoom,
            beds: [bedTuple],
          });
        }

        return {
          ...w,
          rooms: updatedRooms,
        };
      })
    );

    if (editingBed.patientId) {
      const p = PATIENTS.find((pt) => pt.id === editingBed.patientId);
      if (p) {
        p.status = 'Admitted';
        p.ward = editingBed.wardName;
        p.bed = editingBed.code;
        patientService.updatePatient(editingBed.patientId, {
          status: 'Admitted',
          ward: editingBed.wardName,
          bed: editingBed.code,
        });
      }
    }

    await bedService.updateBed(editingBed.code, {
      room: targetRoom,
      equipment: editingBed.equipment,
      status: editingBed.status,
      patientId: editingBed.patientId || null,
    });

    showToast(`Updated bed ${editingBed.code} details successfully.`);
    setEditBedModalOpen(false);
    setEditingBed(null);
  }

  // Handle Delete Bed
  async function handleDeleteBed(bedCode) {
    const ok = window.confirm(`Are you sure you want to permanently remove bed ${bedCode} from the ward?`);
    if (!ok) return;

    setWardsData((wList) =>
      wList.map((w) => ({
        ...w,
        rooms: w.rooms.map((r) => ({
          ...r,
          beds: r.beds.filter((b) => b[0] !== bedCode),
        })),
      }))
    );

    await bedService.deleteBed(bedCode);
    showToast(`Bed ${bedCode} deleted from ward inventory.`);
    setSelectedBed(null);
  }

  // Handle Add New Bed / Room
  async function handleAddBed(e) {
    e.preventDefault();
    const bedCode = newBedForm.code.trim().toUpperCase();
    if (!bedCode) {
      showToast('Please enter a bed identifier code.');
      return;
    }

    if (allBeds.some((b) => b.code === bedCode)) {
      showToast(`A bed with code "${bedCode}" already exists. Please choose a unique code.`);
      return;
    }

    const roomName = newBedForm.roomMode === 'new'
      ? newBedForm.newRoomName.trim()
      : newBedForm.room;

    if (!roomName) {
      showToast('Please specify a room.');
      return;
    }

    let assignedPatientId = null;
    let initialStatus = newBedForm.status;

    if (newBedForm.assignPatientNow) {
      if (newBedForm.patientMode === 'new') {
        if (!newBedForm.newPatientName.trim()) {
          showToast('Please enter the patient name.');
          return;
        }
        const newPtId = `PT-${Math.floor(10140 + Math.random() * 800)}`;
        const ageNum = Number(newBedForm.newPatientAge) || 35;
        const newPatient = {
          id: newPtId,
          name: newBedForm.newPatientName.trim(),
          age: ageNum,
          gender: newBedForm.newPatientGender,
          phone: newBedForm.newPatientPhone.trim() || '0300-1234567',
          doctor: newBedForm.newPatientDoctor || 'Dr. Sarah Khan',
          lastVisit: 'Today (Admitted)',
          status: 'Admitted',
          blood: 'O+',
          allergy: 'None recorded',
          cnic: 'N/A',
          ward: newBedForm.wardName,
          bed: bedCode,
          admissionDiagnosis: newBedForm.newPatientDiagnosis.trim() || 'Inpatient Admission',
        };

        PATIENTS.unshift(newPatient);
        await patientService.createPatient(newPatient);
        assignedPatientId = newPtId;
        initialStatus = 'occupied';
      } else if (newBedForm.patientId) {
        assignedPatientId = newBedForm.patientId;
        initialStatus = 'occupied';
        const p = PATIENTS.find((pt) => pt.id === assignedPatientId);
        if (p) {
          p.status = 'Admitted';
          p.ward = newBedForm.wardName;
          p.bed = bedCode;
          patientService.updatePatient(assignedPatientId, {
            status: 'Admitted',
            ward: newBedForm.wardName,
            bed: bedCode,
          });
        }
      }
    }

    setWardsData((wList) =>
      wList.map((w) => {
        if (w.name !== newBedForm.wardName) return w;
        const existingRoomIdx = w.rooms.findIndex((r) => r.room === roomName);
        const newBedTuple = [bedCode, initialStatus, assignedPatientId, newBedForm.equipment];
        if (existingRoomIdx >= 0) {
          const updatedRooms = [...w.rooms];
          updatedRooms[existingRoomIdx] = {
            ...updatedRooms[existingRoomIdx],
            beds: [...updatedRooms[existingRoomIdx].beds, newBedTuple],
          };
          return { ...w, rooms: updatedRooms };
        } else {
          return {
            ...w,
            rooms: [...w.rooms, { room: roomName, beds: [newBedTuple] }],
          };
        }
      })
    );

    const targetWard = wardsData.find((w) => w.name === newBedForm.wardName);
    await bedService.createBed({
      code: bedCode,
      wardId: targetWard?.id || 'general',
      room: roomName,
      status: initialStatus,
      patientId: assignedPatientId,
      equipment: newBedForm.equipment,
    });

    showToast(`Bed ${bedCode} added to ${newBedForm.wardName} · Room ${roomName}!`);
    setAddBedModalOpen(false);
    setNewBedForm((f) => ({
      ...f,
      code: '',
      newRoomName: '',
      assignPatientNow: false,
      newPatientName: '',
      newPatientAge: '',
      newPatientPhone: '',
      newPatientDiagnosis: '',
    }));
  }

  return (
    <AppShell>
      <PlanGateLock
        featureKey="wards_admissions"
        featureName="Inpatient Wards & Acute Bed Allocations"
        description="Room census, bed turnover tracking, nurse medication rounds, and acute inpatient bed lifecycle management are part of the Enterprise Hospital OS tier."
        benefits={[
          'Real-time Ward & Room Occupancy Census',
          'Bedside Oxygen, Monitor & Ventilator Tracking',
          'Printable 80mm Bedside Admission Slips',
          'Nurse Medication Rounds & Vitals Roster',
          'Automated Hospital Discharge Summaries',
        ]}
      >
        {/* Page Header */}
        <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1>Admissions & Inpatient Beds</h1>
            <span className={`badge ${occupancyRate >= 85 ? 'badge-error' : 'badge-primary'}`} style={{ fontWeight: 700 }}>
              ● {occupancyRate}% Hospital Occupancy
            </span>
          </div>
          <div className="sub">
            Real-time ward capacity, sterile bed lifecycle management, patient transfers, and printable bedside records
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setAddBedModalOpen(true)}>
            <Icon name="plus" /> Add New Bed / Room
          </button>
          <button className="btn btn-primary" onClick={() => setAdmitModalOpen(true)}>
            <Icon name="plus" /> Admit Patient to Ward
          </button>
        </div>
      </div>

      {/* Ward Telemetry & Status Badges */}
      <div className="toolbar" style={{ marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <select
          className="input"
          style={{ maxWidth: 220 }}
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
          aria-label="Filter beds by inpatient ward"
        >
          <option value="All">All Inpatient Wards ({wardsData.length})</option>
          {wardsData.map((w) => (
            <option key={w.name} value={w.name}>{w.name}</option>
          ))}
        </select>

        <select
          className="input"
          style={{ maxWidth: 180 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter beds by status"
        >
          <option value="All">All Bed Statuses</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <span style={{ flex: 1 }} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge badge-success">● Available ({available})</span>
          <span className="badge badge-error">● Occupied ({occupied})</span>
          <span className="badge badge-info">● Sanitizing ({sanitizing})</span>
          <span className="badge badge-warning">● Reserved</span>
          <span className="badge badge-neutral">● Maintenance ({maintenance})</span>
        </div>
      </div>

      {/* Ward Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {visibleWards.map((w) => {
          const wardBeds = w.rooms.flatMap((r) => r.beds);
          const wardTotal = wardBeds.length;
          const wardOccupied = wardBeds.filter((b) => b[1] === 'occupied').length;
          const wardPercent = Math.round((wardOccupied / wardTotal) * 100);

          return (
            <div key={w.name} className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{w.name}</div>
                    <span className="badge badge-neutral" style={{ fontSize: 11 }}>{w.floor}</span>
                    <span className="badge badge-purple" style={{ fontSize: 11 }}>{w.type}</span>
                  </div>
                  <div className="hint" style={{ fontSize: 12, marginTop: 3 }}>
                    Ward Supervisor: <strong>{w.nurseHead}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-mono)' }}>
                      {wardOccupied} / {wardTotal} Beds
                    </div>
                    <div className="hint" style={{ fontSize: 11 }}>{wardPercent}% Capacity</div>
                  </div>
                  <div
                    style={{
                      width: 60,
                      height: 6,
                      background: 'var(--c-border)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${wardPercent}%`,
                        height: '100%',
                        background: wardPercent >= 85 ? 'var(--c-error)' : 'var(--c-primary)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {w.rooms.map((r) => {
                const beds = r.beds.filter((b) => bedMatchesFilter(b[1]));
                if (beds.length === 0) return null;
                return (
                  <div key={r.room} style={{ marginBottom: 14 }}>
                    <div className="hint" style={{ marginBottom: 8, fontWeight: 700, fontSize: 12 }}>
                      Room {r.room}
                    </div>
                    <div className="bed-grid">
                      {beds.map(([code, status, patientId, equipment]) => {
                        const pt = patientId ? getPatientById(patientId) : null;
                        return (
                          <div
                            key={code}
                            className={`bed ${status}`}
                            style={{
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              minHeight: 82,
                              padding: '8px 10px',
                              borderRadius: 8,
                              position: 'relative',
                            }}
                            onClick={() =>
                              setSelectedBed({
                                ward: w.name,
                                floor: w.floor,
                                room: r.room,
                                code,
                                status,
                                patientId,
                                equipment: equipment || 'Standard Medical Bed',
                              })
                            }
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className="bed-id">{code}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                                  {STATUS_LABEL[status] || status}
                                </span>
                                <button
                                  type="button"
                                  className="btn-icon"
                                  style={{ width: 22, height: 22, padding: 2, opacity: 0.75 }}
                                  title={`Edit Bed ${code}`}
                                  aria-label={`Edit Bed ${code}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditBed({
                                      ward: w.name,
                                      floor: w.floor,
                                      room: r.room,
                                      code,
                                      status,
                                      patientId,
                                      equipment: equipment || 'Standard Medical Bed',
                                    });
                                  }}
                                >
                                  <Icon name="edit" />
                                </button>
                              </div>
                            </div>

                            {pt ? (
                              <div style={{ marginTop: 4 }}>
                                <div style={{ fontWeight: 800, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {pt.name}
                                </div>
                                <div style={{ fontSize: 10.5, opacity: 0.8, fontFamily: 'var(--font-mono)' }}>
                                  {pt.id} · {pt.blood}
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: 10, color: 'var(--c-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {equipment || 'Open'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* =========================================================
          MODAL 1: BED DETAILS & ACTIONS DRAWER
          ========================================================= */}
      {selectedBed && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setSelectedBed(null)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-head">
              <div style={{ fontWeight: 800, fontSize: 16 }}>
                Inpatient Bed {selectedBed.code} ({selectedBed.ward})
              </div>
              <button className="btn-icon" onClick={() => setSelectedBed(null)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <div className="modal-body">
              {selectedPatient ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, background: 'var(--c-surface-hover)', padding: 12, borderRadius: 8, border: '1px solid var(--c-border)' }}>
                    <Avatar name={selectedPatient.name} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{selectedPatient.name}</div>
                      <div className="hint" style={{ fontSize: 12 }}>
                        {selectedPatient.age} Yrs · {selectedPatient.gender} · Blood: <strong style={{ color: 'var(--c-text)' }}>{selectedPatient.blood}</strong>
                      </div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--c-primary)', marginTop: 2 }}>
                        MRN: {selectedPatient.id}
                      </div>
                    </div>
                    <span className="badge badge-error">Admitted</span>
                  </div>

                  <div className="kv"><span className="k">Attending Consultant</span><strong>{selectedPatient.doctor}</strong></div>
                  <div className="kv"><span className="k">Admission Ward & Room</span><span>{selectedBed.ward} · Room {selectedBed.room}</span></div>
                  <div className="kv"><span className="k">Bed Code & Tier</span><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{selectedBed.code}</span></div>
                  <div className="kv"><span className="k">Bedside Equipment</span><span>{selectedBed.equipment}</span></div>
                  <div className="kv"><span className="k">Primary Diagnosis</span><span>{selectedPatient.admissionDiagnosis || 'Clinical Inpatient Monitoring'}</span></div>
                  <div className="kv"><span className="k">Allergy Status</span><strong style={{ color: selectedPatient.allergy && selectedPatient.allergy !== 'None recorded' ? 'var(--c-error)' : 'var(--c-success)' }}>{selectedPatient.allergy || 'None recorded'}</strong></div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const bedCopy = { ...selectedBed };
                        const ptCopy = { ...selectedPatient };
                        setSelectedBed(null);
                        setBedsideSlipModal({ patient: ptCopy, bed: bedCopy, doctor: { name: ptCopy.doctor } });
                      }}
                    >
                      <Icon name="print" /> Bed Clipboard Slip
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setTransferTargetBed('');
                        setTransferModalOpen(true);
                      }}
                    >
                      <Icon name="bed" /> Transfer Bed
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/patients/${selectedPatient.id}`)}
                    >
                      <Icon name="patients" /> View Patient Chart
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={discharge}>
                      Discharge Patient
                    </button>
                  </div>
                </>
              ) : selectedBed.status === 'cleaning' ? (
                <>
                  <div className="alert-banner info" style={{ marginBottom: 14 }}>
                    <Icon name="alert" />
                    <div>
                      <strong>Bed is Under Housekeeping Sanitization:</strong> Terminal cleaning and linen sterilization in progress following patient departure.
                    </div>
                  </div>
                  <div className="kv"><span className="k">Ward Location</span><span>{selectedBed.ward}</span></div>
                  <div className="kv"><span className="k">Room Code</span><span>Room {selectedBed.room}</span></div>
                  <div className="kv"><span className="k">Equipped Facilities</span><span>{selectedBed.equipment}</span></div>

                  <div style={{ marginTop: 18 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => markBedSanitized(selectedBed.code, selectedBed.ward)}
                    >
                      <Icon name="check" /> Mark Cleaned & Set Available
                    </button>
                  </div>
                </>
              ) : selectedBed.status === 'available' ? (
                <>
                  <p className="hint" style={{ marginBottom: 14 }}>
                    This bed is clean, sanitized, and ready for immediate patient occupancy.
                  </p>
                  <div className="kv"><span className="k">Ward</span><span>{selectedBed.ward}</span></div>
                  <div className="kv"><span className="k">Room</span><span>Room {selectedBed.room}</span></div>
                  <div className="kv"><span className="k">Life Support / Equipment</span><span>{selectedBed.equipment}</span></div>

                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 18 }}
                    onClick={() => {
                      setAdmitForm((prev) => ({ ...prev, bedCode: selectedBed.code }));
                      setSelectedBed(null);
                      setAdmitModalOpen(true);
                    }}
                  >
                    Admit Patient to Bed {selectedBed.code}
                  </button>
                </>
              ) : (
                <>
                  <div className="kv"><span className="k">Status</span><strong>{STATUS_LABEL[selectedBed.status] || selectedBed.status}</strong></div>
                  <div className="kv"><span className="k">Ward Location</span><span>{selectedBed.ward}</span></div>
                  <div className="kv"><span className="k">Room Code</span><span>Room {selectedBed.room}</span></div>
                </>
              )}

              {/* Bed Inventory Management Controls */}
              <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => openEditBed(selectedBed)}
                >
                  <Icon name="edit" /> Edit Bed Details
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--c-error)', borderColor: 'var(--c-error)' }}
                  onClick={() => handleDeleteBed(selectedBed.code)}
                >
                  <Icon name="x" /> Delete Bed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: CLINICAL ADMISSION INTAKE
          ========================================================= */}
      {admitModalOpen && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setAdmitModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-head">
              <div style={{ fontWeight: 800, fontSize: 16 }}>Clinical Inpatient Admission</div>
              <button className="btn-icon" onClick={() => setAdmitModalOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <form onSubmit={handleAdmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="field">
                  <label>Select Patient to Admit *</label>
                  <select
                    className="input"
                    value={admitForm.patientId}
                    onChange={(e) => setAdmitForm({ ...admitForm, patientId: e.target.value })}
                    required
                  >
                    <option value="">Choose patient…</option>
                    {unadmittedPatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id}) — {p.status} · Blood: {p.blood}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label>Select Available Bed *</label>
                    <select
                      className="input"
                      value={admitForm.bedCode}
                      onChange={(e) => setAdmitForm({ ...admitForm, bedCode: e.target.value })}
                      required
                    >
                      <option value="">Choose bed…</option>
                      {availableBedsList.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.code} · {b.ward} ({b.equipment})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Admitting Consultant *</label>
                    <select
                      className="input"
                      value={admitForm.doctorId}
                      onChange={(e) => setAdmitForm({ ...admitForm, doctorId: e.target.value })}
                    >
                      {DOCTORS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.dept})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label>Primary Admission Diagnosis (ICD-10) *</label>
                  <input
                    className="input"
                    placeholder="e.g. Acute Coronary Syndrome (I21.9), Severe Pneumonia"
                    value={admitForm.diagnosis}
                    onChange={(e) => setAdmitForm({ ...admitForm, diagnosis: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-3" style={{ gap: 10 }}>
                  <div className="field">
                    <label>Admission Category</label>
                    <select
                      className="input"
                      value={admitForm.category}
                      onChange={(e) => setAdmitForm({ ...admitForm, category: e.target.value })}
                    >
                      <option>Emergency ER</option>
                      <option>Planned Elective</option>
                      <option>Post-Surgical ICU</option>
                      <option>Specialist Referral</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Dietary Orders</label>
                    <select
                      className="input"
                      value={admitForm.diet}
                      onChange={(e) => setAdmitForm({ ...admitForm, diet: e.target.value })}
                    >
                      <option>Standard Hospital Diet</option>
                      <option>Diabetic & Salt Restricted</option>
                      <option>Clear Liquids Only</option>
                      <option>NPO (Nil By Mouth)</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Fall Risk Level</label>
                    <select
                      className="input"
                      value={admitForm.fallRisk}
                      onChange={(e) => setAdmitForm({ ...admitForm, fallRisk: e.target.value })}
                    >
                      <option>Standard Precaution</option>
                      <option>Moderate Fall Risk</option>
                      <option>High Fall Risk (Bed Alarm)</option>
                      <option>Strict Bed Rest</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setAdmitModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Admission & Print Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: PATIENT BED TRANSFER WORKFLOW
          ========================================================= */}
      {transferModalOpen && selectedBed && selectedPatient && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setTransferModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-head">
              <div style={{ fontWeight: 800, fontSize: 16 }}>Transfer Patient Bed / Ward</div>
              <button className="btn-icon" onClick={() => setTransferModalOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <form onSubmit={handleTransfer}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'var(--c-surface-hover)', padding: 12, borderRadius: 8, border: '1px solid var(--c-border)', fontSize: 12.5 }}>
                  <div>Patient: <strong>{selectedPatient.name}</strong> ({selectedPatient.id})</div>
                  <div className="hint" style={{ marginTop: 2 }}>Current: {selectedBed.ward} · Bed {selectedBed.code}</div>
                </div>

                <div className="field">
                  <label>Destination Bed *</label>
                  <select
                    className="input"
                    value={transferTargetBed}
                    onChange={(e) => setTransferTargetBed(e.target.value)}
                    required
                  >
                    <option value="">Select target bed…</option>
                    {availableBedsList
                      .filter((b) => b.code !== selectedBed.code)
                      .map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.ward} · Bed {b.code} ({b.equipment})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="field">
                  <label>Clinical Reason for Transfer</label>
                  <select
                    className="input"
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                  >
                    <option>Clinical Step-down to General Ward</option>
                    <option>Escalation to Intensive Care (ICU/CCU)</option>
                    <option>Isolation / Infectious Disease Protocol</option>
                    <option>Post-Operative Recovery Ward Assignment</option>
                    <option>Attending Physician Bed Reallocation</option>
                  </select>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setTransferModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!transferTargetBed}>
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: ADD NEW BED & ROOM CONFIGURATION
          ========================================================= */}
      {addBedModalOpen && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setAddBedModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 580, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-head">
              <div style={{ fontWeight: 800, fontSize: 16 }}>
                Add New Bed & Room Configuration
              </div>
              <button className="btn-icon" onClick={() => setAddBedModalOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <form onSubmit={handleAddBed} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="modal-body" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Target Ward */}
                <div className="field">
                  <label>Select Inpatient Ward *</label>
                  <select
                    className="input"
                    value={newBedForm.wardName}
                    onChange={(e) => {
                      const ward = wardsData.find((w) => w.name === e.target.value);
                      setNewBedForm((f) => ({
                        ...f,
                        wardName: e.target.value,
                        wardId: ward?.id || 'general',
                        room: ward?.rooms[0]?.room || '101',
                      }));
                    }}
                    required
                  >
                    {wardsData.map((w) => (
                      <option key={w.name} value={w.name}>
                        {w.name} ({w.floor}) · {w.rooms.length} Rooms
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room Mode: Existing vs New Room */}
                <div style={{ background: 'var(--c-surface-hover)', padding: 12, borderRadius: 8, border: '1px solid var(--c-border)' }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: 12.5 }}>
                    Room Allocation
                  </label>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                      <input
                        type="radio"
                        name="roomMode"
                        value="existing"
                        checked={newBedForm.roomMode === 'existing'}
                        onChange={() => setNewBedForm((f) => ({ ...f, roomMode: 'existing' }))}
                      />
                      Add to Existing Room
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--c-primary)' }}>
                      <input
                        type="radio"
                        name="roomMode"
                        value="new"
                        checked={newBedForm.roomMode === 'new'}
                        onChange={() => setNewBedForm((f) => ({ ...f, roomMode: 'new' }))}
                      />
                      + Create Brand New Room
                    </label>
                  </div>

                  {newBedForm.roomMode === 'existing' ? (
                    <div className="field">
                      <label>Choose Existing Room in {newBedForm.wardName} *</label>
                      <select
                        className="input"
                        value={newBedForm.room}
                        onChange={(e) => setNewBedForm((f) => ({ ...f, room: e.target.value }))}
                        required
                      >
                        {wardsData
                          .find((w) => w.name === newBedForm.wardName)
                          ?.rooms.map((r) => (
                            <option key={r.room} value={r.room}>
                              Room {r.room} ({r.beds.length} current beds)
                            </option>
                          ))}
                      </select>
                    </div>
                  ) : (
                    <div className="field">
                      <label>New Room Number / Name *</label>
                      <input
                        className="input"
                        placeholder="e.g. 105, Room 402, High-Dependency Suite B"
                        value={newBedForm.newRoomName}
                        onChange={(e) => setNewBedForm((f) => ({ ...f, newRoomName: e.target.value }))}
                        required={newBedForm.roomMode === 'new'}
                      />
                      <div className="hint" style={{ marginTop: 4 }}>
                        A new room partition will be initialized in this ward with this bed.
                      </div>
                    </div>
                  )}
                </div>

                {/* Bed Code & Equipment */}
                <div className="grid grid-2" style={{ gap: 12 }}>
                  <div className="field">
                    <label>Bed Identifier Code *</label>
                    <input
                      className="input"
                      placeholder="e.g. GEN-305, ICU-08"
                      value={newBedForm.code}
                      onChange={(e) => setNewBedForm((f) => ({ ...f, code: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Bedside Life-Support & Equipment</label>
                    <select
                      className="input"
                      value={newBedForm.equipment}
                      onChange={(e) => setNewBedForm((f) => ({ ...f, equipment: e.target.value }))}
                    >
                      <option>Standard Medical Bed</option>
                      <option>Oxygen Port & Vital Monitor</option>
                      <option>High-Acuity ICU Multi-Para Telemetry</option>
                      <option>Invasive Ventilator & Life Support</option>
                      <option>Pediatric Crib & Phototherapy Warmer</option>
                      <option>Negative Pressure Air Filtration</option>
                      <option>Bariatric Heavy-Duty Hospital Bed</option>
                    </select>
                  </div>
                </div>

                {/* Initial Status */}
                <div className="field">
                  <label>Initial Bed Status</label>
                  <select
                    className="input"
                    value={newBedForm.status}
                    onChange={(e) => setNewBedForm((f) => ({ ...f, status: e.target.value }))}
                    disabled={newBedForm.assignPatientNow}
                  >
                    <option value="available">Available (Sterile & Ready for Occupancy)</option>
                    <option value="cleaning">Sanitizing / Housekeeping in Progress</option>
                    <option value="maintenance">Maintenance / Biomedical Repair</option>
                  </select>
                </div>

                {/* Patient Intake / Admission Option */}
                <div style={{ border: '1px solid var(--c-border)', borderRadius: 8, padding: 12, background: newBedForm.assignPatientNow ? 'var(--c-surface-hover)' : 'transparent' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700 }}>
                    <input
                      type="checkbox"
                      checked={newBedForm.assignPatientNow}
                      onChange={(e) => setNewBedForm((f) => ({ ...f, assignPatientNow: e.target.checked }))}
                    />
                    <span>Admit / Intake Patient into this bed immediately</span>
                  </label>

                  {newBedForm.assignPatientNow && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                          <input
                            type="radio"
                            name="patientMode"
                            value="existing"
                            checked={newBedForm.patientMode === 'existing'}
                            onChange={() => setNewBedForm((f) => ({ ...f, patientMode: 'existing' }))}
                          />
                          Select Existing Registered Patient
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--c-primary)' }}>
                          <input
                            type="radio"
                            name="patientMode"
                            value="new"
                            checked={newBedForm.patientMode === 'new'}
                            onChange={() => setNewBedForm((f) => ({ ...f, patientMode: 'new' }))}
                          />
                          + Register & Intake New Patient
                        </label>
                      </div>

                      {newBedForm.patientMode === 'existing' ? (
                        <div className="field">
                          <label>Select Patient to Admit *</label>
                          <select
                            className="input"
                            value={newBedForm.patientId}
                            onChange={(e) => setNewBedForm((f) => ({ ...f, patientId: e.target.value }))}
                            required={newBedForm.assignPatientNow && newBedForm.patientMode === 'existing'}
                          >
                            <option value="">Choose patient…</option>
                            {unadmittedPatients.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.id}) — {p.status} · Blood: {p.blood}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div className="grid grid-2" style={{ gap: 10 }}>
                            <div className="field">
                              <label>Patient Full Name *</label>
                              <input
                                className="input"
                                placeholder="e.g. Kamran Tariq"
                                value={newBedForm.newPatientName}
                                onChange={(e) => setNewBedForm((f) => ({ ...f, newPatientName: e.target.value }))}
                                required={newBedForm.assignPatientNow && newBedForm.patientMode === 'new'}
                              />
                            </div>
                            <div className="grid grid-2" style={{ gap: 8 }}>
                              <div className="field">
                                <label>Age</label>
                                <input
                                  className="input"
                                  type="number"
                                  placeholder="e.g. 42"
                                  value={newBedForm.newPatientAge}
                                  onChange={(e) => setNewBedForm((f) => ({ ...f, newPatientAge: e.target.value }))}
                                />
                              </div>
                              <div className="field">
                                <label>Gender</label>
                                <select
                                  className="input"
                                  value={newBedForm.newPatientGender}
                                  onChange={(e) => setNewBedForm((f) => ({ ...f, newPatientGender: e.target.value }))}
                                >
                                  <option>Male</option>
                                  <option>Female</option>
                                  <option>Other</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-2" style={{ gap: 10 }}>
                            <div className="field">
                              <label>Phone Contact</label>
                              <input
                                className="input"
                                placeholder="0300-1234567"
                                value={newBedForm.newPatientPhone}
                                onChange={(e) => setNewBedForm((f) => ({ ...f, newPatientPhone: e.target.value }))}
                              />
                            </div>
                            <div className="field">
                              <label>Attending Consultant</label>
                              <select
                                className="input"
                                value={newBedForm.newPatientDoctor}
                                onChange={(e) => setNewBedForm((f) => ({ ...f, newPatientDoctor: e.target.value }))}
                              >
                                {DOCTORS.map((d) => (
                                  <option key={d.id} value={d.name}>
                                    {d.name} ({d.dept})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="field">
                            <label>Primary Admission Diagnosis *</label>
                            <input
                              className="input"
                              placeholder="e.g. Severe Dehydration, Acute Appendicitis, Observation"
                              value={newBedForm.newPatientDiagnosis}
                              onChange={(e) => setNewBedForm((f) => ({ ...f, newPatientDiagnosis: e.target.value }))}
                              required={newBedForm.assignPatientNow && newBedForm.patientMode === 'new'}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setAddBedModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Icon name="check" /> Save & Register Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: EDIT BED DETAILS
          ========================================================= */}
      {editBedModalOpen && editingBed && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setEditBedModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-head">
              <div style={{ fontWeight: 800, fontSize: 16 }}>
                Edit Bed Details — {editingBed.code}
              </div>
              <button className="btn-icon" onClick={() => setEditBedModalOpen(false)} aria-label="Close">
                <Icon name="x" />
              </button>
            </div>
            <form onSubmit={handleSaveEditBed}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--c-surface-hover)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--c-border)' }}>
                  <div>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--c-text-muted)' }}>Location</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{editingBed.wardName}</div>
                  </div>
                  <span className="badge badge-primary" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>
                    {editingBed.code}
                  </span>
                </div>

                <div className="field">
                  <label>Room Number / Identifier *</label>
                  <input
                    className="input"
                    value={editingBed.room}
                    onChange={(e) => setEditingBed({ ...editingBed, room: e.target.value })}
                    placeholder="e.g. 101, 204, ICU-Suite 3"
                    required
                  />
                  <div className="hint" style={{ marginTop: 4 }}>
                    Reassign this bed to an existing room or create a new room name.
                  </div>
                </div>

                <div className="field">
                  <label>Bed Life-Support & Equipment</label>
                  <select
                    className="input"
                    value={editingBed.equipment}
                    onChange={(e) => setEditingBed({ ...editingBed, equipment: e.target.value })}
                  >
                    <option>Standard Medical Bed</option>
                    <option>Oxygen Port & Vital Monitor</option>
                    <option>High-Acuity ICU Multi-Para Telemetry</option>
                    <option>Invasive Ventilator & Life Support</option>
                    <option>Pediatric Crib & Phototherapy Warmer</option>
                    <option>Negative Pressure Air Filtration</option>
                    <option>Bariatric Heavy-Duty Hospital Bed</option>
                  </select>
                </div>

                <div className="field">
                  <label>Bed Status</label>
                  <select
                    className="input"
                    value={editingBed.status}
                    onChange={(e) => {
                      const newStat = e.target.value;
                      setEditingBed({
                        ...editingBed,
                        status: newStat,
                        patientId: newStat === 'occupied' ? editingBed.patientId : null,
                      });
                    }}
                  >
                    <option value="available">Available (Clean & Ready)</option>
                    <option value="occupied">Occupied (Patient Admitted)</option>
                    <option value="cleaning">Cleaning / Sanitizing</option>
                    <option value="maintenance">Maintenance / Biomedical Check</option>
                  </select>
                </div>

                {editingBed.status === 'occupied' && (
                  <div className="field" style={{ background: 'var(--c-surface-hover)', padding: 12, borderRadius: 8, border: '1px solid var(--c-border)' }}>
                    <label>Assigned Patient</label>
                    <select
                      className="input"
                      value={editingBed.patientId || ''}
                      onChange={(e) => setEditingBed({ ...editingBed, patientId: e.target.value || null })}
                    >
                      <option value="">No patient assigned (Open)</option>
                      {PATIENTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.id}) — {p.ward} · Bed {p.bed}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-foot" style={{ justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--c-error)', borderColor: 'var(--c-error)' }}
                  onClick={() => {
                    setEditBedModalOpen(false);
                    handleDeleteBed(editingBed.code);
                  }}
                >
                  <Icon name="x" /> Delete Bed
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditBedModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Icon name="check" /> Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          PRINTABLE MODAL 4: OFFICIAL BEDSIDE CLIPBOARD SLIP (A4)
          ========================================================= */}
      {bedsideSlipModal && (
        <div className="overlay center" onClick={(e) => e.target === e.currentTarget && setBedsideSlipModal(null)}>
          <div className="modal" style={{ maxWidth: 640, padding: 0, overflow: 'hidden' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'var(--c-surface-hover)', borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Bedside Inpatient Chart & Admission Slip</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Icon name="print" /> Print Bed Slip (A4)
                </button>
                <button className="btn-icon" onClick={() => setBedsideSlipModal(null)} aria-label="Close">
                  <Icon name="x" />
                </button>
              </div>
            </div>

            <div style={{ padding: 24, background: '#ffffff', color: '#0f172a' }}>
              <div className="rx-sheet" style={{ border: '2px solid #0f172a', borderRadius: 8, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 14, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>AL-SHIFA INTERNATIONAL HOSPITAL</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>Inpatient Nursing Station & Bedside Chart</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: 18, fontFamily: 'monospace', color: '#0284c7' }}>
                      BED: {bedsideSlipModal.bed?.code || bedsideSlipModal.patient?.bed}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{bedsideSlipModal.bed?.ward || bedsideSlipModal.patient?.ward}</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 14px', marginBottom: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12 }}>
                  <div><span style={{ color: '#64748b' }}>Patient Name:</span> <div style={{ fontWeight: 800, fontSize: 13 }}>{bedsideSlipModal.patient.name}</div></div>
                  <div><span style={{ color: '#64748b' }}>Age / Gender:</span> <div style={{ fontWeight: 600 }}>{bedsideSlipModal.patient.age} Yrs / {bedsideSlipModal.patient.gender}</div></div>
                  <div><span style={{ color: '#64748b' }}>Hospital MRN:</span> <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{bedsideSlipModal.patient.id}</div></div>
                  <div><span style={{ color: '#64748b' }}>Blood Group:</span> <strong style={{ color: '#dc2626' }}>{bedsideSlipModal.patient.blood}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Admitting Physician:</span> <div style={{ fontWeight: 700 }}>{bedsideSlipModal.patient.doctor}</div></div>
                  <div><span style={{ color: '#64748b' }}>Admission Date:</span> <div style={{ fontWeight: 600 }}>{bedsideSlipModal.patient.admissionDate || 'Today'}</div></div>
                  <div style={{ gridColumn: 'span 3' }}>
                    <span style={{ color: '#64748b' }}>Allergy Warning:</span>{' '}
                    <strong style={{ color: bedsideSlipModal.patient.allergy && bedsideSlipModal.patient.allergy !== 'None recorded' ? '#dc2626' : '#059669' }}>
                      {bedsideSlipModal.patient.allergy || 'None recorded'}
                    </strong>
                  </div>
                </div>

                <div style={{ marginBottom: 14, fontSize: 12.5 }}>
                  <div className="kv" style={{ padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Primary Admission Diagnosis:</span>
                    <strong>{bedsideSlipModal.patient.admissionDiagnosis || 'Clinical Inpatient Monitoring'}</strong>
                  </div>
                  <div className="kv" style={{ padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Dietary Orders:</span>
                    <strong>{bedsideSlipModal.patient.diet || 'Standard Hospital Diet'}</strong>
                  </div>
                  <div className="kv" style={{ padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Fall & Mobility Risk:</span>
                    <strong style={{ color: '#d97706' }}>{bedsideSlipModal.patient.fallRisk || 'Standard Precaution'}</strong>
                  </div>
                  <div className="kv" style={{ padding: '6px 0' }}>
                    <span style={{ color: '#64748b' }}>Bed Equipment Installed:</span>
                    <strong>{bedsideSlipModal.bed?.equipment || 'Standard Medical Bed'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #0f172a', paddingTop: 14, marginTop: 14 }}>
                  <div style={{ fontSize: 10.5, color: '#64748b' }}>
                    * Place this card visibly on the patient bedside acrylic clipboard.
                  </div>
                  <div style={{ textAlign: 'center', width: 160 }}>
                    <div style={{ borderBottom: '1px solid #0f172a', width: '100%', marginBottom: 4 }} />
                    <div style={{ fontWeight: 800, fontSize: 11 }}>Charge Nurse / Registrar</div>
                    <div style={{ fontSize: 9.5, color: '#64748b' }}>Clinical Verification</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      </PlanGateLock>
      <Toast text={toast} />
    </AppShell>
  );
}
