import React, { useState, useMemo } from 'react';
import { UserRole } from '../../../core/models/User.js';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  User,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  FileText,
  UserPlus,
  ShieldAlert,
  Trash2,
  X
} from 'lucide-react';
import { CANDELARIA_ZONES } from '../../../core/models/Machinery.js';

export const UserSupervision = ({
  users = [],
  machineryList = [],
  reservations = [],
  onToggleVerify,
  onCreateUser,
  onDeleteUser
}) => {
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterVerified, setFilterVerified] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState(UserRole.PRODUCER);
  const [newCommunity, setNewCommunity] = useState(CANDELARIA_ZONES[0] || 'San Miguel');
  const [newAddress, setNewAddress] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (filterRole !== 'ALL' && u.role !== filterRole) return false;
      if (filterVerified === 'VERIFIED' && !u.verified) return false;
      if (filterVerified === 'UNVERIFIED' && u.verified) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const fullName = `${u.name || ''} ${u.lastName || ''}`.toLowerCase();
        const matchesName = fullName.includes(q);
        const matchesEmail = u.email?.toLowerCase().includes(q);
        const matchesPhone = u.phone?.toLowerCase().includes(q);
        const matchesCommunity = u.community?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesCommunity) return false;
      }
      return true;
    });
  }, [users, filterRole, filterVerified, searchQuery]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      alert('Nombre y correo son requeridos.');
      return;
    }

    if (onCreateUser) {
      onCreateUser({
        name: newName.trim(),
        lastName: newLastName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim() || '982 100 0000',
        role: newRole,
        community: newCommunity,
        address: newAddress.trim(),
        verified: true,
        ineDocument: 'INE_ADMIN_REGISTRADA.PDF'
      });
    }

    setShowAddUserModal(false);
    setNewName('');
    setNewLastName('');
    setNewEmail('');
    setNewPhone('');
    setNewAddress('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Padrón y Supervisión de Usuarios Municipales
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Control de identidades, credenciales INE y roles de productores y propietarios en Candelaria.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowAddUserModal(true)}
        >
          <UserPlus size={16} />
          <span>Alta Directa de Usuario</span>
        </button>
      </div>

      {/* Role Tabs */}
      <div className="tabs-nav" style={{ marginBottom: '1rem' }}>
        <button
          className={`tab-btn ${filterRole === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterRole('ALL')}
        >
          Todos ({users.length})
        </button>
        <button
          className={`tab-btn ${filterRole === UserRole.PRODUCER ? 'active' : ''}`}
          onClick={() => setFilterRole(UserRole.PRODUCER)}
        >
          <User size={15} />
          Productores ({users.filter(u => u.role === UserRole.PRODUCER).length})
        </button>
        <button
          className={`tab-btn ${filterRole === UserRole.OWNER ? 'active' : ''}`}
          onClick={() => setFilterRole(UserRole.OWNER)}
        >
          <Briefcase size={15} />
          Propietarios ({users.filter(u => u.role === UserRole.OWNER).length})
        </button>
        <button
          className={`tab-btn ${filterRole === UserRole.ADMIN ? 'active' : ''}`}
          onClick={() => setFilterRole(UserRole.ADMIN)}
        >
          <ShieldCheck size={15} />
          Administradores ({users.filter(u => u.role === UserRole.ADMIN).length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Buscar por nombre, teléfono, correo o ejido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
          >
            <option value="ALL">🔍 Todas las Verificaciones</option>
            <option value="VERIFIED">✅ Verificados con INE</option>
            <option value="UNVERIFIED">⚠️ Sin Verificar</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Usuario / Contacto</th>
              <th>Rol en Sistema</th>
              <th>Comunidad (Candelaria)</th>
              <th>Credencial INE</th>
              <th>Estado de Certificación</th>
              <th>Acción Administrativa</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No se encontraron usuarios con los criterios indicados.
                </td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={16} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name} {u.lastName || ''}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {u.phone} • {u.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={`badge ${u.role === UserRole.ADMIN ? 'badge-completed' : u.role === UserRole.OWNER ? 'badge-pending' : 'badge-active'}`}>
                      {u.role === UserRole.ADMIN ? 'Administrador' : u.role === UserRole.OWNER ? 'Propietario' : 'Productor'}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                      <MapPin size={13} color="#4ade80" />
                      {u.community}
                    </div>
                    {u.address && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.address}</div>
                    )}
                  </td>

                  <td>
                    {u.ineDocument ? (
                      <span style={{ fontSize: '0.78rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                        <ShieldCheck size={14} color="#4ade80" />
                        INE Oficial
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Sin documento
                      </span>
                    )}
                  </td>

                  <td>
                    {u.verified ? (
                      <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600 }}>
                        <CheckCircle2 size={16} />
                        Verificado
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <XCircle size={16} />
                        Sin Verificar
                      </span>
                    )}
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className={`btn btn-sm ${u.verified ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        onClick={() => onToggleVerify(u.id)}
                        title={u.verified ? 'Quitar verificación' : 'Validar cuenta'}
                      >
                        <ShieldCheck size={13} />
                        {u.verified ? 'Revocar' : 'Certificar'}
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        onClick={() => setSelectedUserForDetail(u)}
                        title="Ver ficha completa"
                      >
                        Ficha
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Detail Inspection Modal */}
      {selectedUserForDetail && (
        <div className="modal-overlay" onClick={() => setSelectedUserForDetail(null)}>
          <div className="modal-container" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Ficha Oficial del Usuario</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ID: #{selectedUserForDetail.id} • Rol: {selectedUserForDetail.role}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedUserForDetail(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                <img
                  src={selectedUserForDetail.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                  alt={selectedUserForDetail.name}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-500)' }}
                />
                <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    {selectedUserForDetail.name} {selectedUserForDetail.lastName || ''}
                  </h4>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    {selectedUserForDetail.email} • {selectedUserForDetail.phone}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gap: '0.75rem',
                fontSize: '0.85rem'
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Comunidad / Ejido:</div>
                  <div style={{ fontWeight: 600 }}>{selectedUserForDetail.community}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Domicilio / Parcela:</div>
                  <div style={{ fontWeight: 600 }}>{selectedUserForDetail.address || 'No especificada'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Documento INE Registrado:</div>
                  <div style={{ fontWeight: 700, color: '#4ade80' }}>
                    {selectedUserForDetail.ineDocument || 'Sin documento adjunto'}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Fecha de Registro:</div>
                  <div>{new Date(selectedUserForDetail.createdAt || Date.now()).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedUserForDetail(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Direct User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-container" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Alta Directa de Usuario Municipal</h3>
              <button className="modal-close-btn" onClick={() => setShowAddUserModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nombre(s) *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej. Jorge"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Apellidos</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej. Hernandez"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Correo Electrónico *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="usuario@candelaria.mx"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono (WhatsApp)</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="982 100 0000"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Rol en Plataforma</label>
                    <select
                      className="form-select"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                    >
                      <option value={UserRole.PRODUCER}>Productor (Renta equipo)</option>
                      <option value={UserRole.OWNER}>Propietario (Ofrece maquinaria)</option>
                      <option value={UserRole.ADMIN}>Administrador General</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ejido / Zona</label>
                    <select
                      className="form-select"
                      value={newCommunity}
                      onChange={(e) => setNewCommunity(e.target.value)}
                    >
                      {CANDELARIA_ZONES.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Dirección o Parcela</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Parcela 15, Ejido San Miguel"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddUserModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar en Padrón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
