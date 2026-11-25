import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  Users,
  BarChart3,
  FileText,
  Tractor,
  DollarSign,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  History,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { OwnerRequestsModeration } from './OwnerRequestsModeration.jsx';
import { MachineryModeration } from './MachineryModeration.jsx';
import { UserSupervision } from './UserSupervision.jsx';
import { AdminRentalsMonitor } from './AdminRentalsMonitor.jsx';
import { AdminZonesManager } from './AdminZonesManager.jsx';
import { AnalyticsDashboard } from './AnalyticsDashboard.jsx';
import { AdminAuditLog } from './AdminAuditLog.jsx';
import { UserApprovalStatus } from '../../../core/models/User.js';
import { MachineryStatus } from '../../../core/models/Machinery.js';
import { ReservationStatus } from '../../../core/models/Reservation.js';

export const AdminPortalLayout = ({
  users = [],
  machineryList = [],
  reservations = [],
  currentUser,
  onExitAdmin,
  onApproveMachinery,
  onRejectMachinery,
  onToggleVerifyUser,
  onApproveOwner,
  onRejectOwner,
  onCreateUser,
  onUpdateReservationStatus
}) => {
  // Counts
  const pendingOwners = users.filter(u => u.approvalStatus === UserApprovalStatus.PENDING);
  const pendingOwnerCount = pendingOwners.length;
  const pendingModeration = machineryList.filter(m => m.status === MachineryStatus.PENDING_REVIEW);
  const pendingModerationCount = pendingModeration.length;
  const activeInFieldCount = reservations.filter(r => r.status === ReservationStatus.ACTIVE).length;
  const totalActiveMachinery = machineryList.filter(m => m.status === MachineryStatus.ACTIVE).length;

  // Active module tab
  const [activeModule, setActiveModule] = useState(
    pendingOwnerCount > 0 ? 'solicitudes' : pendingModerationCount > 0 ? 'maquinaria' : 'solicitudes'
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Dedicated Admin Header */}
      <header style={{
        background: 'linear-gradient(180deg, rgba(16, 32, 22, 0.95) 0%, rgba(10, 19, 13, 0.98) 100%)',
        borderBottom: '1px solid rgba(74, 222, 128, 0.25)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(16px)',
        padding: '0.85rem 1.5rem'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Admin Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #15803d 0%, #052e16 100%)',
              border: '2px solid rgba(74, 222, 128, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-400)',
              boxShadow: 'var(--shadow-glow-green)'
            }}>
              <Shield size={24} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                  AgroRenta Candelaria
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  background: 'rgba(234, 179, 8, 0.2)',
                  color: '#fde047',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Módulo de Administración
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Supervisión Municipal y Control Operativo
              </div>
            </div>
          </div>

          {/* Right Admin Profile & Return to Public Portals */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 0.75rem',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}></div>
              <span style={{ color: 'var(--text-secondary)' }}>Operador:</span>
              <strong style={{ color: '#fff' }}>{currentUser?.name || 'Administrador'}</strong>
            </div>

            {/* Exit Admin Portal Button */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={onExitAdmin}
              style={{
                borderColor: 'rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Volver a la vista de Productores y Propietarios"
            >
              <ArrowLeft size={15} />
              <span>Salir al Portal Público</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Console Container */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem' }}>
        {/* Top Quick Status Ribbon */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div
            onClick={() => setActiveModule('solicitudes')}
            className="glass-panel"
            style={{
              padding: '1rem',
              cursor: 'pointer',
              border: activeModule === 'solicitudes' ? '1px solid #f59e0b' : '1px solid var(--border-subtle)',
              background: pendingOwnerCount > 0 ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)' : 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Solicitudes Propietarios e INE</span>
              <FileText size={18} color="#fbbf24" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: pendingOwnerCount > 0 ? '#fbbf24' : '#fff', marginTop: '0.35rem' }}>
              {pendingOwnerCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {pendingOwnerCount > 0 ? '⚠️ Requieren cotejo de INE' : 'Al día / sin pendientes'}
            </div>
          </div>

          <div
            onClick={() => setActiveModule('maquinaria')}
            className="glass-panel"
            style={{
              padding: '1rem',
              cursor: 'pointer',
              border: activeModule === 'maquinaria' ? '1px solid #22c55e' : '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Parque Activo</span>
              <Tractor size={18} color="#4ade80" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#4ade80', marginTop: '0.35rem' }}>
              {totalActiveMachinery}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {pendingModerationCount > 0 ? `${pendingModerationCount} por moderar` : 'Equipos verificados'}
            </div>
          </div>

          <div
            onClick={() => setActiveModule('rentas')}
            className="glass-panel"
            style={{
              padding: '1rem',
              cursor: 'pointer',
              border: activeModule === 'rentas' ? '1px solid #3b82f6' : '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Rentas en Campo</span>
              <Activity size={18} color="#93c5fd" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#93c5fd', marginTop: '0.35rem' }}>
              {activeInFieldCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {reservations.length} contratos totales
            </div>
          </div>

          <div
            onClick={() => setActiveModule('usuarios')}
            className="glass-panel"
            style={{
              padding: '1rem',
              cursor: 'pointer',
              border: activeModule === 'usuarios' ? '1px solid #c084fc' : '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Padrón de Usuarios</span>
              <Users size={18} color="#c084fc" />
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#c084fc', marginTop: '0.35rem' }}>
              {users.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Productores y dueños
            </div>
          </div>
        </div>

        {/* Modular Navigation Bar (Submodules Tabs) */}
        <div className="tabs-nav" style={{ marginBottom: '1.5rem', overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: '0.35rem' }}>
          <button
            className={`tab-btn ${activeModule === 'solicitudes' ? 'active' : ''}`}
            onClick={() => setActiveModule('solicitudes')}
            style={{ position: 'relative' }}
          >
            <FileText size={16} />
            <span>1. Solicitudes e INE</span>
            {pendingOwnerCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.7rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                marginLeft: '0.35rem'
              }}>
                {pendingOwnerCount}
              </span>
            )}
          </button>

          <button
            className={`tab-btn ${activeModule === 'maquinaria' ? 'active' : ''}`}
            onClick={() => setActiveModule('maquinaria')}
            style={{ position: 'relative' }}
          >
            <Tractor size={16} />
            <span>2. Parque de Maquinaria</span>
            {pendingModerationCount > 0 && (
              <span style={{
                background: '#f59e0b',
                color: '#1a1608',
                fontWeight: 800,
                fontSize: '0.7rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '999px',
                marginLeft: '0.35rem'
              }}>
                {pendingModerationCount}
              </span>
            )}
          </button>

          <button
            className={`tab-btn ${activeModule === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveModule('usuarios')}
          >
            <Users size={16} />
            <span>3. Padrón de Usuarios</span>
          </button>

          <button
            className={`tab-btn ${activeModule === 'rentas' ? 'active' : ''}`}
            onClick={() => setActiveModule('rentas')}
          >
            <DollarSign size={16} />
            <span>4. Monitoreo de Rentas y Contratos</span>
          </button>

          <button
            className={`tab-btn ${activeModule === 'ejidos' ? 'active' : ''}`}
            onClick={() => setActiveModule('ejidos')}
          >
            <MapPin size={16} />
            <span>5. Zonas y Ejidos</span>
          </button>

          <button
            className={`tab-btn ${activeModule === 'reportes' ? 'active' : ''}`}
            onClick={() => setActiveModule('reportes')}
          >
            <BarChart3 size={16} />
            <span>6. Analítica y Reportes</span>
          </button>

          <button
            className={`tab-btn ${activeModule === 'auditoria' ? 'active' : ''}`}
            onClick={() => setActiveModule('auditoria')}
          >
            <History size={16} />
            <span>7. Bitácora de Auditoría</span>
          </button>
        </div>

        {/* Active Module Content */}
        <div style={{ marginTop: '0.5rem' }}>
          {activeModule === 'solicitudes' && (
            <OwnerRequestsModeration
              users={users}
              machineryList={machineryList}
              onApproveOwner={onApproveOwner}
              onRejectOwner={onRejectOwner}
            />
          )}

          {activeModule === 'maquinaria' && (
            <MachineryModeration
              machineryList={machineryList}
              onApprove={onApproveMachinery}
              onReject={onRejectMachinery}
            />
          )}

          {activeModule === 'usuarios' && (
            <UserSupervision
              users={users}
              machineryList={machineryList}
              reservations={reservations}
              onToggleVerify={onToggleVerifyUser}
              onCreateUser={onCreateUser}
            />
          )}

          {activeModule === 'rentas' && (
            <AdminRentalsMonitor
              reservations={reservations}
              onUpdateReservationStatus={onUpdateReservationStatus}
            />
          )}

          {activeModule === 'ejidos' && (
            <AdminZonesManager
              machineryList={machineryList}
              users={users}
              reservations={reservations}
            />
          )}

          {activeModule === 'reportes' && (
            <AnalyticsDashboard />
          )}

          {activeModule === 'auditoria' && (
            <AdminAuditLog />
          )}
        </div>
      </div>
    </div>
  );
};
