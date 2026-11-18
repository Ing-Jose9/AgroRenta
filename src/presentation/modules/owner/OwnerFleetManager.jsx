import React, { useState, useRef } from 'react';
import {
  Plus,
  Tractor,
  Calendar,
  Wrench,
  Trash2,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  MapPin,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../../components/Badge.jsx';
import { RentalRequestsInbox } from './RentalRequestsInbox.jsx';
import { AvailabilityCalendarModal } from './AvailabilityCalendarModal.jsx';
import { AddMachineryModal } from './AddMachineryModal.jsx';
import { RentalCostService } from '../../../services/RentalCostService.js';
import { MachineryStatus } from '../../../core/models/Machinery.js';
import { userRepository } from '../../../core/repositories/UserRepository.js';
import { AuditService } from '../../../services/AuditService.js';

export const OwnerFleetManager = ({
  currentUser,
  fleet = [],
  requests = [],
  onSaveMachinery,
  onToggleMaintenance,
  onToggleBlockedDate,
  onDeleteMachinery,
  onApproveRequest,
  onRejectRequest,
  onSetActiveRequest,
  onCompleteRequest
}) => {
  const [activeTab, setActiveTab] = useState('fleet'); // 'fleet' | 'requests'
  const [calendarMachinery, setCalendarMachinery] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const photoInputRef = useRef(null);
  const [photoUpdatedToast, setPhotoUpdatedToast] = useState(false);

  const handleDevicePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      if (currentUser?.id) {
        userRepository.update(currentUser.id, { avatar: base64 });
        AuditService.log({
          action: 'ACTUALIZACION_PERFIL',
          category: 'PROPIETARIO',
          target: currentUser.name,
          details: 'Foto de perfil actualizada desde el dispositivo local.',
          status: 'INFO'
        });
        setPhotoUpdatedToast(true);
        setTimeout(() => setPhotoUpdatedToast(false), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  // Statistics for this owner
  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;
  const activeJobsCount = requests.filter(r => r.status === 'ACTIVE').length;
  const totalRevenue = requests
    .filter(r => r.status === 'COMPLETED' || r.status === 'ACTIVE' || r.status === 'APPROVED')
    .reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);

  return (
    <div>
      {/* Tarjeta de Identidad del Propietario con Carga de Foto desde Dispositivo */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        background: 'linear-gradient(135deg, rgba(21, 128, 61, 0.2) 0%, rgba(15, 23, 42, 0.6) 100%)',
        border: '1px solid rgba(74, 222, 128, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--accent-500)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}
            />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              title="Elegir foto de perfil de mi dispositivo"
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                background: 'var(--primary-600)',
                color: '#fff',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0b130e',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
            >
              <Camera size={13} />
            </button>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                {currentUser?.name} {currentUser?.lastName || ''}
              </h3>
              {currentUser?.verified ? (
                <span style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#4ade80',
                  fontSize: '0.72rem',
                  padding: '0.15rem 0.6rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(74, 222, 128, 0.4)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <ShieldCheck size={12} />
                  Titular Verificado INE
                </span>
              ) : (
                <span style={{
                  background: 'rgba(234, 179, 8, 0.2)',
                  color: '#fde047',
                  fontSize: '0.72rem',
                  padding: '0.15rem 0.6rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  fontWeight: 600
                }}>
                  En Verificación
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={13} color="#4ade80" />
                Ejido / Zona: <strong>{currentUser?.community || 'Candelaria'}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Phone size={13} />
                {currentUser?.phone || 'Sin teléfono'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <input
            type="file"
            ref={photoInputRef}
            accept="image/*"
            onChange={handleDevicePhotoChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => photoInputRef.current?.click()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem' }}
          >
            <Camera size={15} color="#fbbf24" />
            <span>Elegir Foto de mi Dispositivo</span>
          </button>
          {photoUpdatedToast && (
            <div style={{ color: '#4ade80', fontSize: '0.75rem', marginTop: '0.35rem', textAlign: 'right', fontWeight: 600 }}>
              ✓ ¡Foto de perfil actualizada con éxito!
            </div>
          )}
        </div>
      </div>
      {/* Pending Account Review Banner */}
      {currentUser?.approvalStatus === 'PENDING' && (
        <div style={{
          background: 'rgba(234, 179, 8, 0.15)',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#fef08a'
        }}>
          <AlertCircle size={24} color="#fde047" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Cuenta y Maquinaria en Revisión Administrativa</div>
            <div style={{ fontSize: '0.825rem', marginTop: '0.2rem' }}>
              Tu registro y tu credencial INE están en espera de validación por el Administrador. Una vez aprobados, tus equipos aparecerán en el catálogo público y podrás dar de alta más maquinaria para rentar.
            </div>
          </div>
        </div>
      )}

      {/* Header Row */}
      <div className="module-header-row">
        <div>
          <h2>Panel del Propietario de Maquinaria</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Gestiona tu flota agrícola, bloquea fechas por mantenimiento y aprueba solicitudes de productores.
          </p>
        </div>

        {currentUser?.approvalStatus === 'PENDING' ? (
          <button
            className="btn btn-secondary"
            disabled
            style={{ opacity: 0.65, cursor: 'not-allowed' }}
            title="Podrás publicar más maquinaria cuando el Administrador apruebe tu cuenta e INE."
          >
            <Clock size={16} />
            Aprobación Pendiente para Publicar
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} />
            Dar de Alta Maquinaria
          </button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
            <Tractor size={24} />
          </div>
          <div>
            <div className="stat-value">{fleet.length}</div>
            <div className="stat-label">Equipos en Flota</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{pendingRequestsCount}</div>
            <div className="stat-label">Solicitudes Pendientes</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">{activeJobsCount}</div>
            <div className="stat-label">Trabajos en Campo</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#fbbf24' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--accent-400)' }}>
              ${totalRevenue.toLocaleString()}
            </div>
            <div className="stat-label">Volumen Acordado ($ MXN)</div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'fleet' ? 'active' : ''}`}
          onClick={() => setActiveTab('fleet')}
        >
          <Tractor size={16} />
          <span>Mi Flota ({fleet.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
          style={{ position: 'relative' }}
        >
          <Clock size={16} />
          <span>Solicitudes Recibidas ({requests.length})</span>
          {pendingRequestsCount > 0 && (
            <span style={{
              background: '#f59e0b',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.7rem',
              padding: '0.1rem 0.4rem',
              borderRadius: '999px',
              marginLeft: '0.25rem'
            }}>
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'fleet' ? (
        fleet.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <Tractor size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3>No has registrado maquinaria en tu flota</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
              Registra tus tractores o implementos agrícolas para comenzar a recibir solicitudes de productores de Candelaria.
            </p>
            <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} />
              Registrar Primera Máquina
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {fleet.map(item => (
              <div key={item.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <img
                  src={item.images?.[0] || '/images/tractor-john-deere.jpg'}
                  alt={item.title}
                  style={{ width: '110px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                />

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Badge status={item.status} type="machinery" />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      📍 {item.zone}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.15rem' }}>{item.title}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {item.hp} HP • Año {item.year} • Tarifa: <strong>${item.rentalRate?.toLocaleString()} MXN</strong> ({RentalCostService.getRateTypeLabel(item.rateType)})
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCalendarMachinery(item)}
                    title="Bloquear fechas por mantenimiento o descanso"
                  >
                    <Calendar size={15} />
                    <span>Disponibilidad & Calendario</span>
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onToggleMaintenance(item.id)}
                  >
                    <Wrench size={15} />
                    <span>{item.status === MachineryStatus.MAINTENANCE ? 'Reactivar' : 'Mantenimiento'}</span>
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      if (window.confirm(`¿Estás seguro de eliminar "${item.title}" de tu flota?`)) {
                        onDeleteMachinery(item.id);
                      }
                    }}
                    title="Eliminar de la plataforma"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <RentalRequestsInbox
          requests={requests}
          onApprove={onApproveRequest}
          onReject={onRejectRequest}
          onSetActive={onSetActiveRequest}
          onComplete={onCompleteRequest}
        />
      )}

      {/* Add Modal */}
      <AddMachineryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentUser={currentUser}
        onSaveMachinery={onSaveMachinery}
      />

      {/* Calendar Modal */}
      <AvailabilityCalendarModal
        machinery={calendarMachinery}
        isOpen={Boolean(calendarMachinery)}
        onClose={() => setCalendarMachinery(null)}
        onToggleBlockedDate={onToggleBlockedDate}
      />
    </div>
  );
};
