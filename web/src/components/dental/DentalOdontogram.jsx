import React, { useState } from 'react';
import { SPECIALTY_ARCHETYPES } from '../../utils/specialtyConfig.js';

// Dental Teeth Database (Universal 1-32 & FDI System)
const ADULT_TEETH = [
  // Upper Right Quadrant (Maxillary Right)
  { num: 1, fdi: 18, name: 'Maxillary Right 3rd Molar (Wisdom)', type: 'molar', arch: 'upper', side: 'right' },
  { num: 2, fdi: 17, name: 'Maxillary Right 2nd Molar', type: 'molar', arch: 'upper', side: 'right' },
  { num: 3, fdi: 16, name: 'Maxillary Right 1st Molar', type: 'molar', arch: 'upper', side: 'right' },
  { num: 4, fdi: 15, name: 'Maxillary Right 2nd Premolar', type: 'premolar', arch: 'upper', side: 'right' },
  { num: 5, fdi: 14, name: 'Maxillary Right 1st Premolar', type: 'premolar', arch: 'upper', side: 'right' },
  { num: 6, fdi: 13, name: 'Maxillary Right Canine', type: 'canine', arch: 'upper', side: 'right' },
  { num: 7, fdi: 12, name: 'Maxillary Right Lateral Incisor', type: 'incisor', arch: 'upper', side: 'right' },
  { num: 8, fdi: 11, name: 'Maxillary Right Central Incisor', type: 'incisor', arch: 'upper', side: 'right' },

  // Upper Left Quadrant (Maxillary Left)
  { num: 9, fdi: 21, name: 'Maxillary Left Central Incisor', type: 'incisor', arch: 'upper', side: 'left' },
  { num: 10, fdi: 22, name: 'Maxillary Left Lateral Incisor', type: 'incisor', arch: 'upper', side: 'left' },
  { num: 11, fdi: 23, name: 'Maxillary Left Canine', type: 'canine', arch: 'upper', side: 'left' },
  { num: 12, fdi: 24, name: 'Maxillary Left 1st Premolar', type: 'premolar', arch: 'upper', side: 'left' },
  { num: 13, fdi: 25, name: 'Maxillary Left 2nd Premolar', type: 'premolar', arch: 'upper', side: 'left' },
  { num: 14, fdi: 26, name: 'Maxillary Left 1st Molar', type: 'molar', arch: 'upper', side: 'left' },
  { num: 15, fdi: 27, name: 'Maxillary Left 2nd Molar', type: 'molar', arch: 'upper', side: 'left' },
  { num: 16, fdi: 28, name: 'Maxillary Left 3rd Molar (Wisdom)', type: 'molar', arch: 'upper', side: 'left' },

  // Lower Left Quadrant (Mandibular Left)
  { num: 17, fdi: 38, name: 'Mandibular Left 3rd Molar (Wisdom)', type: 'molar', arch: 'lower', side: 'left' },
  { num: 18, fdi: 37, name: 'Mandibular Left 2nd Molar', type: 'molar', arch: 'lower', side: 'left' },
  { num: 19, fdi: 36, name: 'Mandibular Left 1st Molar', type: 'molar', arch: 'lower', side: 'left' },
  { num: 20, fdi: 35, name: 'Mandibular Left 2nd Premolar', type: 'premolar', arch: 'lower', side: 'left' },
  { num: 21, fdi: 34, name: 'Mandibular Left 1st Premolar', type: 'premolar', arch: 'lower', side: 'left' },
  { num: 22, fdi: 33, name: 'Mandibular Left Canine', type: 'canine', arch: 'lower', side: 'left' },
  { num: 23, fdi: 32, name: 'Mandibular Left Lateral Incisor', type: 'incisor', arch: 'lower', side: 'left' },
  { num: 24, fdi: 31, name: 'Mandibular Left Central Incisor', type: 'incisor', arch: 'lower', side: 'left' },

  // Lower Right Quadrant (Mandibular Right)
  { num: 25, fdi: 41, name: 'Mandibular Right Central Incisor', type: 'incisor', arch: 'lower', side: 'right' },
  { num: 26, fdi: 42, name: 'Mandibular Right Lateral Incisor', type: 'incisor', arch: 'lower', side: 'right' },
  { num: 27, fdi: 43, name: 'Mandibular Right Canine', type: 'canine', arch: 'lower', side: 'right' },
  { num: 28, fdi: 44, name: 'Mandibular Right 1st Premolar', type: 'premolar', arch: 'lower', side: 'right' },
  { num: 29, fdi: 45, name: 'Mandibular Right 2nd Premolar', type: 'premolar', arch: 'lower', side: 'right' },
  { num: 30, fdi: 46, name: 'Mandibular Right 1st Molar', type: 'molar', arch: 'lower', side: 'right' },
  { num: 31, fdi: 47, name: 'Mandibular Right 2nd Molar', type: 'molar', arch: 'lower', side: 'right' },
  { num: 32, fdi: 48, name: 'Mandibular Right 3rd Molar (Wisdom)', type: 'molar', arch: 'lower', side: 'right' },
];

const CONDITIONS = [
  { id: 'healthy', label: 'Healthy', color: '#10b981', bg: '#ecfdf5', icon: '✨' },
  { id: 'cavity', label: 'Caries / Cavity', color: '#ef4444', bg: '#fef2f2', icon: '🔴' },
  { id: 'filled', label: 'Composite Filled', color: '#3b82f6', bg: '#eff6ff', icon: '🔵' },
  { id: 'rct', label: 'RCT Required', color: '#8b5cf6', bg: '#f5f3ff', icon: '🟣' },
  { id: 'crown', label: 'Crown / Cap', color: '#f59e0b', bg: '#fffbeb', icon: '👑' },
  { id: 'missing', label: 'Missing / Extracted', color: '#64748b', bg: '#f8fafc', icon: '❌' },
  { id: 'fracture', label: 'Fractured / Broken', color: '#d97706', bg: '#fff7ed', icon: '⚡' },
];

export default function DentalOdontogram({ onAddProcedure, onConditionChange }) {
  const [selectedTooth, setSelectedTooth] = useState(ADULT_TEETH[13]); // Default to #14 Upper Left 1st Molar
  const [toothConditions, setToothConditions] = useState({
    14: { condition: 'cavity', note: 'Mesial occlusal caries' },
    19: { condition: 'filled', note: 'Composite restoration' },
    30: { condition: 'rct', note: 'Deep pulp involvement' },
  });
  const [numberingSystem, setNumberingSystem] = useState('universal'); // 'universal' | 'fdi'
  const dentalProcedures = SPECIALTY_ARCHETYPES.dental.procedures;

  function handleToothClick(tooth) {
    setSelectedTooth(tooth);
  }

  function handleSetCondition(condId) {
    if (!selectedTooth) return;
    const updated = {
      ...toothConditions,
      [selectedTooth.num]: {
        ...(toothConditions[selectedTooth.num] || {}),
        condition: condId,
      },
    };
    setToothConditions(updated);
    if (onConditionChange) {
      onConditionChange(selectedTooth, condId);
    }
  }

  function handleProcedureClick(proc) {
    if (!selectedTooth || !onAddProcedure) return;
    const toothDisplay = numberingSystem === 'universal' ? `#${selectedTooth.num}` : `FDI ${selectedTooth.fdi}`;
    onAddProcedure({
      code: proc.code,
      name: `Tooth ${toothDisplay} — ${proc.name}`,
      fee: proc.fee,
      tooth: selectedTooth.num,
      fdi: selectedTooth.fdi,
      category: proc.category,
    });
  }

  const currentCondition = selectedTooth ? (toothConditions[selectedTooth.num]?.condition || 'healthy') : 'healthy';

  return (
    <div style={{
      backgroundColor: 'var(--c-surface, #ffffff)',
      border: '1.5px solid var(--c-primary, #0ea5e9)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: '0 8px 30px rgba(14, 165, 233, 0.08)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>🦷</span>
            <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--c-text-primary, #0f172a)' }}>
              Interactive Dental Odontogram & Clinical Tooth Chart
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--c-text-secondary, #64748b)', marginTop: '2px' }}>
            Click any tooth to examine, mark pathology (Cavity, RCT, Crown), or attach direct dental procedures to billing.
          </div>
        </div>

        {/* Numbering System Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--c-surface-hover, #f1f5f9)', padding: '3px 6px', borderRadius: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--c-text-secondary, #64748b)' }}>Notation:</span>
          <button
            type="button"
            onClick={() => setNumberingSystem('universal')}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: '700',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: numberingSystem === 'universal' ? 'var(--c-primary, #0ea5e9)' : 'transparent',
              color: numberingSystem === 'universal' ? '#ffffff' : 'inherit'
            }}
          >
            Universal (#1-32)
          </button>
          <button
            type="button"
            onClick={() => setNumberingSystem('fdi')}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: '700',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: numberingSystem === 'fdi' ? 'var(--c-primary, #0ea5e9)' : 'transparent',
              color: numberingSystem === 'fdi' ? '#ffffff' : 'inherit'
            }}
          >
            FDI 2-Digit (18-48)
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', padding: '8px 12px', backgroundColor: 'var(--c-surface-hover, #f8fafc)', borderRadius: '10px' }}>
        {CONDITIONS.map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--c-text-secondary, #475569)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color }} />
            <span>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Tooth Arch Visualization */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '16px',
        backgroundColor: 'var(--c-bg-subtle, #f8fafc)',
        borderRadius: '12px',
        border: '1px solid var(--c-border, #e2e8f0)',
        overflowX: 'auto'
      }}>
        {/* Upper Arch (Maxilla) */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--c-text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center', marginBottom: '6px' }}>
            ▲ Upper Dental Arch (Maxilla)
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', minWidth: '680px' }}>
            {ADULT_TEETH.slice(0, 16).map((t) => {
              const condKey = toothConditions[t.num]?.condition || 'healthy';
              const cond = CONDITIONS.find((c) => c.id === condKey) || CONDITIONS[0];
              const isSelected = selectedTooth?.num === t.num;
              const displayNum = numberingSystem === 'universal' ? t.num : t.fdi;

              return (
                <button
                  key={t.num}
                  type="button"
                  onClick={() => handleToothClick(t)}
                  style={{
                    flex: '1',
                    maxWidth: '42px',
                    minWidth: '34px',
                    height: '62px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 2px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #0284c7' : `1.5px solid ${cond.color}`,
                    backgroundColor: isSelected ? '#e0f2fe' : cond.bg,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 3px rgba(14, 165, 233, 0.3)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title={`${t.name} · Condition: ${cond.label}`}
                >
                  <span style={{ fontSize: '10px', fontWeight: '800', color: isSelected ? '#0369a1' : cond.color }}>
                    {displayNum}
                  </span>
                  <span style={{ fontSize: '14px' }}>
                    {t.type === 'molar' ? '🦷' : t.type === 'canine' ? '🔺' : '▫️'}
                  </span>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: cond.color
                  }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Lower Arch (Mandible) */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--c-text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center', marginBottom: '6px' }}>
            ▼ Lower Dental Arch (Mandible)
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', minWidth: '680px' }}>
            {ADULT_TEETH.slice(16, 32).map((t) => {
              const condKey = toothConditions[t.num]?.condition || 'healthy';
              const cond = CONDITIONS.find((c) => c.id === condKey) || CONDITIONS[0];
              const isSelected = selectedTooth?.num === t.num;
              const displayNum = numberingSystem === 'universal' ? t.num : t.fdi;

              return (
                <button
                  key={t.num}
                  type="button"
                  onClick={() => handleToothClick(t)}
                  style={{
                    flex: '1',
                    maxWidth: '42px',
                    minWidth: '34px',
                    height: '62px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 2px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #0284c7' : `1.5px solid ${cond.color}`,
                    backgroundColor: isSelected ? '#e0f2fe' : cond.bg,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 3px rgba(14, 165, 233, 0.3)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title={`${t.name} · Condition: ${cond.label}`}
                >
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: cond.color
                  }} />
                  <span style={{ fontSize: '14px' }}>
                    {t.type === 'molar' ? '🦷' : t.type === 'canine' ? '🔻' : '▫️'}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: isSelected ? '#0369a1' : cond.color }}>
                    {displayNum}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Tooth Action Panel */}
      {selectedTooth && (
        <div style={{
          marginTop: '16px',
          padding: '14px 16px',
          backgroundColor: '#f0fdf4',
          border: '1.5px solid #10b981',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ fontWeight: '800', fontSize: '13.5px', color: '#064e3b' }}>
                Selected: Tooth {numberingSystem === 'universal' ? `#${selectedTooth.num}` : `FDI ${selectedTooth.fdi}`}
              </span>
              <span style={{ fontSize: '12px', color: '#047857', marginLeft: '6px' }}>
                ({selectedTooth.name})
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontStyle: 'italic' }}>
              1-Click attach procedures directly into patient invoice & consultation
            </div>
          </div>

          {/* Condition Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#065f46' }}>Condition:</span>
            {CONDITIONS.map((cond) => (
              <button
                key={cond.id}
                type="button"
                onClick={() => handleSetCondition(cond.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: currentCondition === cond.id ? '800' : '600',
                  border: currentCondition === cond.id ? `2px solid ${cond.color}` : '1px solid #cbd5e1',
                  backgroundColor: currentCondition === cond.id ? cond.bg : '#ffffff',
                  color: currentCondition === cond.id ? cond.color : '#334155',
                  cursor: 'pointer'
                }}
              >
                <span>{cond.icon}</span>
                <span>{cond.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Procedure Adder */}
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#065f46', marginBottom: '6px' }}>
              ⚡ Attach Dental Treatment to Consultation & Billing:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {dentalProcedures.slice(0, 6).map((proc) => (
                <button
                  key={proc.code}
                  type="button"
                  onClick={() => handleProcedureClick(proc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #86efac',
                    color: '#065f46',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.15s ease'
                  }}
                  title={`Add ${proc.name} (Rs. ${proc.fee}) for Tooth #${selectedTooth.num}`}
                >
                  <span>➕ {proc.name}</span>
                  <span style={{ padding: '2px 6px', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '4px', fontSize: '10.5px' }}>
                    Rs. {proc.fee}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
