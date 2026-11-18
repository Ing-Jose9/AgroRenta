import React, { useState, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  User,
  DollarSign,
  Landmark,
  Banknote,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
  FileText,
  AlertTriangle,
  X
} from 'lucide-react';
import { Badge } from '../../components/Badge.jsx';
import { ReservationStatus } from '../../../core/models/Reservation.js';

export const AdminRentalsMonitor = ({
  reservations = [],
  onUpdateReservationStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedRentalForDetail, setSelectedRentalForDetail] = useState(null);

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (paymentFilter !== 'ALL' && r.paymentMethod !== paymentFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesMac = r.machineryTitle?.toLowerCase().includes(q);
        const matchesProd = r.producerName?.toLowerCase().includes(q);
        const matchesOwner = r.ownerName?.toLowerCase().includes(q);
        const matchesParcel = r.parcelLocation?.toLowerCase().includes(q);
        const matchesRef = r.paymentReference?.toLowerCase().includes(q);
        if (!matchesMac && !matchesProd && !matchesOwner && !matchesParcel && !matchesRef) {
          return false;
        }
      }
      return true;
    });
  }, [reservations, statusFilter, paymentFilter, searchTerm]);

  // Financial aggregates
  const totalFinancialVolume = useMemo(() => {
    return reservations.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);
  }, [reservations]);

  const activeInFieldVolume = useMemo(() => {
    return reservations
      .filter(r => r.status === ReservationStatus.ACTIVE || r.status === ReservationStatus.APPROVED)
      .reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);
  }, [reservations]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          Supervisión y Monitoreo Municipal de Rentas y Contratos
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Seguimiento oficial de todas las operaciones entre productores y propietarios en la cuenca de Candelaria.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--accent-400)' }}>
              ${totalFinancialVolume.toLocaleString()} MXN
            </div>
            <div className="stat-label">Valor Total de Rentas Registradas</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
            <PlayCircle size={24} />
          </div>
          <div>
            <div className="stat-value">${activeInFieldVolume.toLocaleString()} MXN</div>
            <div className="stat-label">Comprometido en Campo Actualmente</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd' }}>
            <Landmark size={24} />
          </div>
          <div>
            <div className="stat-value">
              {reservations.filter(r => r.paymentMethod !== 'EFECTIVO').length}
            </div>
            <div className="stat-label">Operaciones vía Transferencia SPEI</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">
              {reservations.filter(r => r.status === ReservationStatus.COMPLETED).length}
            </div>
            <div className="stat-label">Labores Concluidas con Éxito</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Buscar por productor, dueño, tractor, ejido o folio SPEI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">📋 Todos los Estados</option>
            <option value={ReservationStatus.PENDING}>⏳ Pendientes de Aprobación</option>
            <option value={ReservationStatus.APPROVED}>✅ Aprobadas por Dueño</option>
            <option value={ReservationStatus.ACTIVE}>🚜 En Campo / Trabajando</option>
            <option value={ReservationStatus.COMPLETED}>🏆 Finalizadas</option>
            <option value={ReservationStatus.CANCELLED}>❌ Canceladas</option>
          </select>
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="ALL">💳 Cualquier Método de Pago</option>
            <option value="TRANSFERENCIA">🏦 Transferencia SPEI</option>
            <option value="EFECTIVO">💵 Pago en Efectivo</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Folio / Equipo</th>
              <th>Productor Solicitante</th>
              <th>Propietario</th>
              <th>Ubicación Parcela</th>
              <th>Período</th>
              <th>Monto Total</th>
              <th>Método de Pago</th>
              <th>Estado</th>
              <th>Intervención Admin</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No se encontraron rentas con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredReservations.map(res => (
                <tr key={res.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{res.machineryTitle}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{res.id}</div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600 }}>{res.producerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{res.producerPhone}</div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600 }}>{res.ownerName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{res.ownerPhone}</div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                      <MapPin size={12} color="#4ade80" />
                      <span>{res.parcelLocation}</span>
                    </div>
                  </td>

                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} />
                      <span>{res.startDate} al {res.endDate}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {res.unitsQuantity} {res.rateType === 'DAY' ? 'días' : res.rateType === 'HECTARE' ? 'ha' : 'hrs'}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--accent-400)', fontSize: '0.95rem' }}>
                      ${res.totalCost?.toLocaleString()}
                    </div>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => setSelectedRentalForDetail(res)}
                      style={{
                        background: res.paymentMethod === 'EFECTIVO' ? 'rgba(255,255,255,0.06)' : 'rgba(34, 197, 94, 0.12)',
                        border: '1px solid ' + (res.paymentMethod === 'EFECTIVO' ? 'rgba(255,255,255,0.15)' : 'rgba(34, 197, 94, 0.3)'),
                        color: res.paymentMethod === 'EFECTIVO' ? 'var(--text-primary)' : '#4ade80',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                      title="Ver detalles de transferencia"
                    >
                      {res.paymentMethod === 'EFECTIVO' ? <Banknote size={12} /> : <Landmark size={12} />}
                      <span>{res.paymentMethod === 'EFECTIVO' ? 'Efectivo' : 'SPEI: ' + (res.paymentReference || 'OK')}</span>
                    </button>
                  </td>

                  <td>
                    <Badge status={res.status} type="reservation" />
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {res.status === ReservationStatus.ACTIVE && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                          onClick={() => {
                            if (window.confirm(`¿Marcar la renta #${res.id} como FINALIZADA en nombre de la administración?`)) {
                              onUpdateReservationStatus(res.id, ReservationStatus.COMPLETED);
                            }
                          }}
                          title="Finalizar administrativamente"
                        >
                          Concluir
                        </button>
                      )}

                      {res.status === ReservationStatus.PENDING && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                          onClick={() => {
                            onUpdateReservationStatus(res.id, ReservationStatus.APPROVED);
                          }}
                          title="Aprobar administrativamente"
                        >
                          Aprobar
                        </button>
                      )}

                      {res.status !== ReservationStatus.CANCELLED && res.status !== ReservationStatus.COMPLETED && (
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
                          onClick={() => {
                            const reason = prompt('Indica el motivo de cancelación administrativa:', 'Cancelado por acuerdo entre partes o fuerza mayor.');
                            if (reason) {
                              onUpdateReservationStatus(res.id, ReservationStatus.CANCELLED, reason);
                            }
                          }}
                          title="Cancelar renta"
                        >
                          Cancelar
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

      {/* Detail Inspection Modal */}
      {selectedRentalForDetail && (
        <div className="modal-overlay" onClick={() => setSelectedRentalForDetail(null)}>
          <div className="modal-container" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Detalle de Renta #{selectedRentalForDetail.id}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Supervisión Administrativa de Contrato y Transferencia
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedRentalForDetail(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                background: 'linear-gradient(145deg, #12241b, #0c1711)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'grid',
                gap: '0.85rem',
                fontSize: '0.875rem'
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Maquinaria:</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedRentalForDetail.machineryTitle}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Productor:</div>
                    <div style={{ fontWeight: 600 }}>{selectedRentalForDetail.producerName}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{selectedRentalForDetail.producerPhone}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Propietario:</div>
                    <div style={{ fontWeight: 600 }}>{selectedRentalForDetail.ownerName}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{selectedRentalForDetail.ownerPhone}</div>
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Ubicación en Ejido:</div>
                  <div style={{ fontWeight: 600 }}>{selectedRentalForDetail.parcelLocation}</div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Método de Pago Seleccionado:</div>
                  <div style={{ fontWeight: 700, color: '#86efac', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                    <Landmark size={15} />
                    <span>{selectedRentalForDetail.paymentMethod === 'EFECTIVO' ? 'Pago en Efectivo contraentrega' : 'Transferencia SPEI'}</span>
                  </div>
                  {selectedRentalForDetail.paymentReference && (
                    <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--accent-400)' }}>
                      Referencia SPEI: {selectedRentalForDetail.paymentReference}
                    </div>
                  )}
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem' }}>CLABE Destino: 012 050 015489623145 (BBVA Campeche / Candelaria)</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>Monto Total Pactado:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-400)' }}>
                    ${selectedRentalForDetail.totalCost?.toLocaleString()} MXN
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedRentalForDetail(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
