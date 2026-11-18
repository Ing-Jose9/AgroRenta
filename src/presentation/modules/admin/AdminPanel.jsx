import React, { useState } from 'react';
import { Shield, ShieldAlert, Users, BarChart3, UserCheck, FileText } from 'lucide-react';
import { MachineryModeration } from './MachineryModeration.jsx';
import { UserSupervision } from './UserSupervision.jsx';
import { AnalyticsDashboard } from './AnalyticsDashboard.jsx';
import { OwnerRequestsModeration } from './OwnerRequestsModeration.jsx';
import { UserApprovalStatus } from '../../../core/models/User.js';

export const AdminPanel = ({
  machineryList = [],
  users = [],
  onApproveMachinery,
  onRejectMachinery,
  onToggleVerifyUser,
  onApproveOwner,
  onRejectOwner
}) => {
  const pendingOwners = users.filter(u => u.approvalStatus === UserApprovalStatus.PENDING);
  const pendingOwnerCount = pendingOwners.length;
  const pendingModerationCount = machineryList.filter(m => m.status === 'PENDING_REVIEW').length;

  const [activeTab, setActiveTab] = useState(pendingOwnerCount > 0 ? 'owner_requests' : 'moderation');

  return (
    <div>
      <div className="module-header-row">
        <div>
          <h2>Panel de Administración General</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Supervisión integral de usuarios, aprobación de INE y maquinaria, y estadísticas del municipio de Candelaria.
          </p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'owner_requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('owner_requests')}
          style={{ position: 'relative' }}
        >
          <FileText size={16} />
          <span>Solicitudes de Propietarios e INE</span>
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
          className={`tab-btn ${activeTab === 'moderation' ? 'active' : ''}`}
          onClick={() => setActiveTab('moderation')}
          style={{ position: 'relative' }}
        >
          <ShieldAlert size={16} />
          <span>Moderación de Anuncios</span>
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
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          <span>Padrón de Usuarios ({users.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <BarChart3 size={16} />
          <span>Reportes y Estadísticas</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'owner_requests' && (
        <OwnerRequestsModeration
          users={users}
          machineryList={machineryList}
          onApproveOwner={onApproveOwner}
          onRejectOwner={onRejectOwner}
        />
      )}

      {activeTab === 'moderation' && (
        <MachineryModeration
          machineryList={machineryList}
          onApprove={onApproveMachinery}
          onReject={onRejectMachinery}
        />
      )}

      {activeTab === 'users' && (
        <UserSupervision
          users={users}
          onToggleVerify={onToggleVerifyUser}
        />
      )}

      {activeTab === 'reports' && (
        <AnalyticsDashboard />
      )}
    </div>
  );
};
