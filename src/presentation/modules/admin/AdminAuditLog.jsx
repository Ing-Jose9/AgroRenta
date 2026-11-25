import React, { useState } from 'react';
import {
  Shield,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  RefreshCw,
  UserCheck,
  Tractor,
  DollarSign
} from 'lucide-react';
import { AuditService } from '../../../services/AuditService.js';

export const AdminAuditLog = () => {
  const [logs, setLogs] = useState(() => AuditService.getLogs());
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const refreshLogs = () => {
    setLogs(AuditService.getLogs());
  };

  const handleClear = () => {
    if (window.confirm('¿Deseas vaciar la bitácora de auditoría histórica?')) {
      AuditService.clear();
      setLogs([]);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterCategory !== 'ALL' && log.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTarget = log.target?.toLowerCase().includes(q);
      const matchDetails = log.details?.toLowerCase().includes(q);
      const matchAdmin = log.adminName?.toLowerCase().includes(q);
      const matchAction = log.action?.toLowerCase().includes(q);
      if (!matchTarget && !matchDetails && !matchAdmin && !matchAction) return false;
    }
    return true;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'PROPIETARIO':
      case 'USUARIO':
        return <UserCheck size={14} color="#4ade80" />;
      case 'MAQUINARIA':
        return <Tractor size={14} color="#93c5fd" />;
      case 'RENTA':
        return <DollarSign size={14} color="#fbbf24" />;
      default:
        return <Shield size={14} color="#c4b5fd" />;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Bitácora de Auditoría y Eventos del Sistema
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Registro inmutable de acciones administrativas, aprobaciones de INE y cambios de estado en Candelaria.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={refreshLogs} title="Actualizar">
            <RefreshCw size={14} />
            <span>Refrescar</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleClear} title="Limpiar bitácora">
            <Trash2 size={14} />
            <span>Vaciar Registro</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Buscar por usuario, acción, tractor o detalle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="ALL">🔍 Todas las Categorías</option>
            <option value="PROPIETARIO">👤 Propietarios e INE</option>
            <option value="MAQUINARIA">🚜 Maquinaria y Moderación</option>
            <option value="USUARIO">👥 Usuarios y Certificación</option>
            <option value="RENTA">💰 Rentas y SPEI</option>
            <option value="SISTEMA">⚙️ Sistema y Configuración</option>
          </select>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No hay registros de auditoría para los criterios seleccionados.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredLogs.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  padding: '0.85rem 1rem',
                  background: 'rgba(0,0,0,0.25)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: `3px solid ${
                    item.status === 'SUCCESS' ? '#22c55e' : item.status === 'WARNING' ? '#f59e0b' : '#3b82f6'
                  }`
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  {getCategoryIcon(item.category)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {item.action} • <span style={{ color: '#86efac' }}>{item.target}</span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} />
                      {new Date(item.timestamp).toLocaleString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {item.details}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Operado por: <strong>{item.adminName}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
