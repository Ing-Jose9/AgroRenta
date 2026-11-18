import React, { useState } from 'react';
import {
  MapPin,
  Tractor,
  Users,
  CheckCircle2,
  Plus,
  Compass,
  Building2,
  Layers,
  X
} from 'lucide-react';
import { CANDELARIA_ZONES } from '../../../core/models/Machinery.js';

export const AdminZonesManager = ({
  machineryList = [],
  users = [],
  reservations = []
}) => {
  const [zones, setZones] = useState(CANDELARIA_ZONES);
  const [newZoneName, setNewZoneName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddZone = (e) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;
    if (zones.includes(newZoneName.trim())) {
      alert('Este ejido o comunidad ya existe en la lista oficial.');
      return;
    }
    const updated = [...zones, newZoneName.trim()];
    setZones(updated);
    setNewZoneName('');
    setShowAddModal(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Configuración Territorial y Cobertura de Ejidos
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Supervisión de las 10 comunidades oficiales y capacidad de mecanización instalada por ejido.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} />
          <span>Registrar Nuevo Ejido</span>
        </button>
      </div>

      {/* Grid of Ejidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
        {zones.map((zone, idx) => {
          const zoneMachinery = machineryList.filter(m => m.zone === zone);
          const zoneUsers = users.filter(u => u.community === zone);
          const zoneRentals = reservations.filter(r => r.parcelLocation?.toLowerCase().includes(zone.toLowerCase()));

          return (
            <div
              key={zone}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                border: '1px solid rgba(74, 222, 128, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#4ade80',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{zone}</h4>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {zone === 'San Francisco de Campeche' ? 'Capital Estatal / Enlace' : 'Municipio de Candelaria'}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.68rem',
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#4ade80',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    fontWeight: 700
                  }}>
                    Activo
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.65rem',
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(0,0,0,0.25)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem'
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Maquinaria:</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Tractor size={14} />
                      {zoneMachinery.length} equipos
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Productores:</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Users size={14} />
                      {zoneUsers.length} inscritos
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Rentas registradas:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-400)' }}>{zoneRentals.length} parcelas</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Registrar Nuevo Ejido / Comunidad</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddZone}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre del Ejido o Población</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Nueva Coahuila, El Triunfo, etc."
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    required
                  />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Al registrar este ejido, estará inmediatamente disponible en los filtros del catálogo de maquinaria y en el formulario de registro de productores.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Agregar a Candelaria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
