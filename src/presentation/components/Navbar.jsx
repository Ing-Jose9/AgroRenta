import { UserRole } from '../../core/models/User.js';
import {
  Tractor,
  User,
  Briefcase,
  RefreshCw,
  CheckCircle2,
  UserPlus
} from 'lucide-react';
import { storage } from '../../core/storage/StorageAdapter.js';

export const Navbar = ({
  currentUser,
  activeRole,
  onRoleChange,
  onTabChange,
  onOpenAuthModal,
  onOpenProducerRegister,
  onOpenOwnerRegister
}) => {
  const handleResetData = () => {
    if (window.confirm('¿Deseas reiniciar los datos de demostración a los valores iniciales de Candelaria?')) {
      storage.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-wrapper" onClick={() => onTabChange('catalog')}>
          <div className="brand-logo-icon">
            <Tractor size={24} />
          </div>
          <div>
            <div className="brand-title">AgroRenta</div>
            <div className="brand-subtitle">Candelaria, Campeche</div>
          </div>
        </div>

        {/* 2-Role Switcher (Productores y Propietarios del Campo) */}
        <div className="role-switcher-container" title="Alterna entre los dos perfiles de campo">
          <button
            className={`role-pill ${activeRole === UserRole.PRODUCER ? 'active' : ''}`}
            onClick={() => onRoleChange(UserRole.PRODUCER)}
          >
            <User size={15} />
            <span>Productor (Rentar)</span>
          </button>

          <button
            className={`role-pill owner-pill ${activeRole === UserRole.OWNER ? 'active' : ''}`}
            onClick={() => onRoleChange(UserRole.OWNER)}
          >
            <Briefcase size={15} />
            <span>Propietario (Mi Flota)</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="header-actions">
          {/* Direct Registration Portals */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenProducerRegister}
            title="Crear cuenta para rentar maquinaria (con credencial INE)"
          >
            <UserPlus size={15} />
            <span>Crear Cuenta</span>
          </button>

          <button
            className="btn btn-accent btn-sm"
            onClick={onOpenOwnerRegister}
            title="Portal para registrarte y subir tu maquinaria con fotos e INE"
          >
            <Tractor size={15} />
            <span>Poner en Renta</span>
          </button>

          {/* Current User Pill */}
          <div className="user-profile-badge" onClick={onOpenAuthModal} style={{ cursor: 'pointer' }} title="Ver perfil o cambiar de cuenta">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar-img" />
            ) : (
              <div className="user-avatar-img" style={{ background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color="#fff" />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {currentUser?.name?.split(' ')[0]} {currentUser?.name?.split(' ')[1] || ''}
                {currentUser?.verified && <CheckCircle2 size={13} color="#4ade80" />}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {currentUser?.community || 'Candelaria'}
              </div>
            </div>
          </div>

          {/* Seed Reset */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleResetData}
            title="Restablecer datos de prueba de Candelaria"
            style={{ padding: '0.45rem' }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
