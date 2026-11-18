import { useState } from 'react';
import {
  X,
  User,
  Check,
  Tractor,
  UserPlus,
  MessageSquareText
} from 'lucide-react';
import { UserRole } from '../../../core/models/User.js';
import { NotificationService } from '../../../services/NotificationService.js';

export const AuthModal = ({
  isOpen,
  onClose,
  currentUser,
  allUsers = [],
  onSwitchUser,
  onPasswordReset,
  onOpenProducerRegister,
  onOpenOwnerRegister
}) => {
  const [resetOpen, setResetOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetBusy, setResetBusy] = useState(false);

  const handleRequestReset = async (event) => {
    event.preventDefault();
    setResetBusy(true);
    setResetError('');
    try {
      await NotificationService.requestPasswordReset(resetPhone.trim());
      setResetSent(true);
    } catch (error) {
      setResetError(error.message);
    } finally {
      setResetBusy(false);
    }
  };

  const handleConfirmReset = async (event) => {
    event.preventDefault();
    if (newPassword.length < 6) {
      setResetError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setResetBusy(true);
    setResetError('');
    try {
      await NotificationService.confirmPasswordReset({
        phone: resetPhone.trim(),
        code: resetCode.trim(),
        password: newPassword
      });
      onPasswordReset?.(resetPhone.trim(), newPassword);
      setResetError('Contraseña actualizada. Ya puedes iniciar sesión con la nueva contraseña.');
      setResetOpen(false);
      setResetSent(false);
      setResetCode('');
      setNewPassword('');
    } catch (error) {
      setResetError(error.message);
    } finally {
      setResetBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Gestión de Cuentas y Accesos</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              AgroRenta Candelaria • Control de Perfiles y Registro
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Registration Portals Banner */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.75rem', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}
              onClick={() => {
                onClose();
                if (onOpenProducerRegister) onOpenProducerRegister();
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#4ade80', fontSize: '0.85rem' }}>
                <UserPlus size={16} />
                <span>Crear Cuenta Productor</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Para rentar tractores con INE y contraseña
              </div>
            </button>

            <button
              type="button"
              className="btn btn-accent"
              style={{ padding: '0.75rem', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}
              onClick={() => {
                onClose();
                if (onOpenOwnerRegister) onOpenOwnerRegister();
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
                <Tractor size={16} />
                <span>Registrar Maquinaria</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#1a1608' }}>
                Sube tu equipo, precios, fotos e INE
              </div>
            </button>
          </div>

          <div className="password-reset-section">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setResetOpen(open => !open);
                setResetError('');
              }}
            >
              <MessageSquareText size={15} />
              ¿Olvidaste tu contraseña? Recuperar por SMS
            </button>
            {resetOpen && (
              <form onSubmit={resetSent ? handleConfirmReset : handleRequestReset} className="password-reset-form">
                {!resetSent ? (
                  <>
                    <label className="form-label" htmlFor="password-reset-phone">Teléfono registrado</label>
                    <input
                      id="password-reset-phone"
                      type="tel"
                      className="form-input"
                      autoComplete="tel"
                      value={resetPhone}
                      onChange={event => setResetPhone(event.target.value)}
                      required
                    />
                    <button className="btn btn-primary btn-sm" type="submit" disabled={resetBusy}>
                      {resetBusy ? 'Enviando...' : 'Enviar código por SMS'}
                    </button>
                  </>
                ) : (
                  <>
                    <label className="form-label" htmlFor="password-reset-code">Código recibido por SMS</label>
                    <input
                      id="password-reset-code"
                      className="form-input"
                      inputMode="numeric"
                      value={resetCode}
                      onChange={event => setResetCode(event.target.value)}
                      required
                    />
                    <label className="form-label" htmlFor="password-reset-new">Nueva contraseña</label>
                    <input
                      id="password-reset-new"
                      type="password"
                      className="form-input"
                      minLength={6}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={event => setNewPassword(event.target.value)}
                      required
                    />
                    <button className="btn btn-primary btn-sm" type="submit" disabled={resetBusy}>
                      {resetBusy ? 'Verificando...' : 'Cambiar contraseña'}
                    </button>
                  </>
                )}
              </form>
            )}
            {resetError && (
              <p className={resetOpen ? 'password-reset-error' : 'password-reset-success'} role="status">
                {resetError}
              </p>
            )}
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Perfiles Registrados en el Sistema:
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Selecciona un perfil para cambiar inmediatamente de perspectiva en la plataforma:
            </p>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {allUsers.map(user => {
                const isCurrent = currentUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      onSwitchUser(user.id);
                      onClose();
                    }}
                    className="glass-panel"
                    style={{
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderColor: isCurrent ? 'var(--primary-500)' : 'var(--border-subtle)',
                      background: isCurrent ? 'rgba(34, 197, 94, 0.12)' : 'var(--bg-card)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={18} color="#fff" />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {user.name} {user.lastName || ''}
                          {user.approvalStatus === 'PENDING' && (
                            <span style={{ fontSize: '0.65rem', background: '#f59e0b', color: '#1a1608', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                              Revisión Pendiente
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {user.role === UserRole.ADMIN ? '🛡️ Administrador' : user.role === UserRole.OWNER ? '🚜 Dueño de Maquinaria' : '🌱 Productor Local'} • {user.community}
                        </div>
                      </div>
                    </div>

                    {isCurrent ? (
                      <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 700 }}>
                        <Check size={16} /> Activo
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Seleccionar
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
