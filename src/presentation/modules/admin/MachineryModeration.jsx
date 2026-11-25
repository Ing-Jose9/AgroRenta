import { useState, useMemo } from 'react';
import { Badge } from '../../components/Badge.jsx';
import {
  Check,
  X,
  MapPin,
  AlertTriangle,
  Search,
  Eye
} from 'lucide-react';
import { MachineryStatus, MachineryCategory, CANDELARIA_ZONES } from '../../../core/models/Machinery.js';
import { DocumentAttachment } from '../../components/DocumentAttachment.jsx';

export const MachineryModeration = ({
  machineryList = [],
  onApprove,
  onReject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [selectedForDetail, setSelectedForDetail] = useState(null);

  const pendingItems = machineryList.filter(m => m.status === MachineryStatus.PENDING_REVIEW);

  const filteredItems = useMemo(() => {
    return machineryList.filter(item => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (zoneFilter !== 'ALL' && item.zone !== zoneFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesBrand = item.brand?.toLowerCase().includes(q);
        const matchesModel = item.model?.toLowerCase().includes(q);
        const matchesOwner = item.ownerName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesModel && !matchesOwner) return false;
      }
      return true;
    });
  }, [machineryList, statusFilter, categoryFilter, zoneFilter, searchTerm]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          Control y Moderación del Parque de Maquinaria Agrícola
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Supervisa, modera y gestiona el inventario de tractores e implementos disponibles para los productores de Candelaria.
        </p>
      </div>

      {/* Pending Items Urgent Box if any */}
      {pendingItems.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--accent-400)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '0.75rem'
          }}>
            <AlertTriangle size={16} />
            Anuncios Pendientes de Aprobación ({pendingItems.length})
          </div>

          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {pendingItems.map(item => (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, rgba(15, 23, 42, 0.7) 100%)'
                }}
              >
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <img
                    src={item.images?.[0] || '/images/tractor-john-deere.jpg'}
                    alt={item.title}
                    style={{ width: '110px', height: '80px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />

                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Badge status={item.status} type="machinery" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {item.zone}</span>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{item.title}</h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong>Dueño:</strong> {item.ownerName} • <strong>Tarifa:</strong> ${item.rentalRate?.toLocaleString()} / {item.rateType}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedForDetail(item)}
                    >
                      <Eye size={14} />
                      Detalles
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        const reason = prompt('Indica el motivo de rechazo de la maquinaria:', 'Datos técnicos o fotos no comprobables.');
                        if (reason) onReject(item.id, reason);
                      }}
                    >
                      <X size={14} />
                      Rechazar
                    </button>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onApprove(item.id)}
                    >
                      <Check size={14} />
                      Aprobar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar for Full Inventory */}
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Buscar por tractor, implemento, marca, modelo o dueño..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '160px' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">📋 Todos los Estados</option>
            <option value={MachineryStatus.ACTIVE}>✅ Activas en Catálogo</option>
            <option value={MachineryStatus.PENDING_REVIEW}>⏳ En Revisión</option>
            <option value={MachineryStatus.MAINTENANCE}>🔧 En Mantenimiento</option>
            <option value={MachineryStatus.REJECTED}>❌ Rechazadas</option>
          </select>
        </div>

        <div style={{ minWidth: '160px' }}>
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">🚜 Todas las Categorías</option>
            <option value={MachineryCategory.TRACTOR}>Tractores</option>
            <option value={MachineryCategory.RASTRA}>Rastras</option>
            <option value={MachineryCategory.SEMBRADORA}>Sembradoras</option>
            <option value={MachineryCategory.ASPERSORA}>Aspersoras</option>
            <option value={MachineryCategory.COSECHADORA}>Cosechadoras</option>
          </select>
        </div>

        <div style={{ minWidth: '160px' }}>
          <select
            className="form-select"
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
          >
            <option value="ALL">📍 Todos los Ejidos</option>
            {CANDELARIA_ZONES.map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Full Inventory Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Maquinaria / Foto</th>
              <th>Categoría & Marca</th>
              <th>Propietario</th>
              <th>Ejido de Resguardo</th>
              <th>Tarifa Oficial</th>
              <th>Operador</th>
              <th>Estado</th>
              <th>Control Admin</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No se encontraron maquinarias que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={item.images?.[0] || '/images/tractor-john-deere.jpg'}
                        alt={item.title}
                        style={{ width: '45px', height: '35px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.model} • {item.year} ({item.hp} HP)</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{item.category}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.brand}</div>
                  </td>

                  <td style={{ fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600 }}>{item.ownerName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.ownerPhone}</div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                      <MapPin size={12} color="#4ade80" />
                      {item.zone}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--accent-400)', fontSize: '0.875rem' }}>
                      ${item.rentalRate?.toLocaleString()} MXN
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/{item.rateType}</div>
                  </td>

                  <td style={{ fontSize: '0.78rem' }}>
                    {item.operatorAvailable ? (
                      <span style={{ color: '#4ade80', fontWeight: 600 }}>
                        Sí (+${item.operatorRate})
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No incluye</span>
                    )}
                  </td>

                  <td>
                    <Badge status={item.status} type="machinery" />
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
                        onClick={() => setSelectedForDetail(item)}
                        title="Ver detalles completos"
                      >
                        <Eye size={13} />
                      </button>

                      {item.status === MachineryStatus.ACTIVE ? (
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
                          onClick={() => {
                            const reason = prompt('Motivo de suspensión administrativa:', 'Reporte o inconsistencia en datos.');
                            if (reason) onReject(item.id, reason);
                          }}
                          title="Suspender anuncio"
                        >
                          Pausar
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
                          onClick={() => onApprove(item.id)}
                          title="Aprobar o Reactivar"
                        >
                          Activar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Machinery Detail Modal */}
      {selectedForDetail && (
        <div className="modal-overlay" onClick={() => setSelectedForDetail(null)}>
          <div className="modal-container" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Ficha Técnica de Maquinaria</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ID: #{selectedForDetail.id} • Propietario: {selectedForDetail.ownerName}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedForDetail(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <img
                src={selectedForDetail.images?.[0] || '/images/tractor-john-deere.jpg'}
                alt={selectedForDetail.title}
                style={{ width: '100%', height: '220px', borderRadius: 'var(--radius-md)', objectFit: 'cover', marginBottom: '1rem' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Título:</div>
                  <div style={{ fontWeight: 700 }}>{selectedForDetail.title}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Categoría / Marca:</div>
                  <div style={{ fontWeight: 600 }}>{selectedForDetail.category} ({selectedForDetail.brand} {selectedForDetail.model})</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Año / Potencia:</div>
                  <div style={{ fontWeight: 600 }}>{selectedForDetail.year} • {selectedForDetail.hp} HP</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Tarifa y Modalidad:</div>
                  <div style={{ fontWeight: 800, color: 'var(--accent-400)' }}>
                    ${selectedForDetail.rentalRate?.toLocaleString()} MXN / {selectedForDetail.rateType}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Ubicación en Ejido:</div>
                  <div style={{ fontWeight: 600 }}>{selectedForDetail.specificLocation || selectedForDetail.zone}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Estado:</div>
                  <Badge status={selectedForDetail.status} type="machinery" />
                </div>
              </div>

              {selectedForDetail.description && (
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>Descripción:</strong> {selectedForDetail.description}
                </div>
              )}
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                <strong>Comprobante de propiedad:</strong>{' '}
                <DocumentAttachment document={selectedForDetail.ownershipDocument} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedForDetail(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
