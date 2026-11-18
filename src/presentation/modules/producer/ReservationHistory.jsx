import { useState } from 'react';
import { ReservationStatus } from '../../../core/models/Reservation.js';
import { Badge } from '../../components/Badge.jsx';
import {
  Calendar,
  MapPin,
  UserCheck,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  Landmark,
  Banknote,
  Copy,
  Check,
  X
} from 'lucide-react';
import { DocumentAttachment } from '../../components/DocumentAttachment.jsx';

export const ReservationHistory = ({
  reservations = [],
  onCancelReservation,
  onUploadPaymentEvidence
}) => {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedBankModal, setSelectedBankModal] = useState(null);
  const [copiedClabe, setCopiedClabe] = useState(false);

  const filtered = reservations.filter(r => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const handleCopy = (clabe) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(clabe);
    }
    setCopiedClabe(true);
    setTimeout(() => setCopiedClabe(false), 2500);
  };

  return (
    <div>
      <div className="module-header-row">
        <div>
          <h2>Historial y Seguimiento de Reservas</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Monitorea el estado de tus solicitudes de maquinaria en Candelaria en tiempo real.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterStatus('ALL')}
        >
          Todas ({reservations.length})
        </button>
        <button
          className={`tab-btn ${filterStatus === ReservationStatus.PENDING ? 'active' : ''}`}
          onClick={() => setFilterStatus(ReservationStatus.PENDING)}
        >
          <Clock size={15} />
          Pendientes ({reservations.filter(r => r.status === ReservationStatus.PENDING).length})
        </button>
        <button
          className={`tab-btn ${filterStatus === ReservationStatus.APPROVED ? 'active' : ''}`}
          onClick={() => setFilterStatus(ReservationStatus.APPROVED)}
        >
          <CheckCircle size={15} />
          Aprobadas ({reservations.filter(r => r.status === ReservationStatus.APPROVED).length})
        </button>
        <button
          className={`tab-btn ${filterStatus === ReservationStatus.ACTIVE ? 'active' : ''}`}
          onClick={() => setFilterStatus(ReservationStatus.ACTIVE)}
        >
          En Campo ({reservations.filter(r => r.status === ReservationStatus.ACTIVE).length})
        </button>
        <button
          className={`tab-btn ${filterStatus === ReservationStatus.COMPLETED ? 'active' : ''}`}
          onClick={() => setFilterStatus(ReservationStatus.COMPLETED)}
        >
          Finalizadas ({reservations.filter(r => r.status === ReservationStatus.COMPLETED).length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>No hay reservas en esta categoría</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Explora el catálogo para solicitar maquinaria para tu parcela o rancho.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {filtered.map(res => (
            <div key={res.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={res.machineryImage || '/images/tractor-john-deere.jpg'}
                    alt={res.machineryTitle}
                    style={{ width: '80px', height: '65px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{res.machineryTitle}</h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} />
                      {res.startDate} al {res.endDate}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Badge status={res.status} type="reservation" />
                  <span style={{
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: 'rgba(34, 197, 94, 0.12)',
                    color: '#4ade80',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '999px',
                    fontWeight: 600
                  }}>
                    {res.paymentMethod === 'EFECTIVO' ? <Banknote size={13} /> : <Landmark size={13} />}
                    {res.paymentMethod === 'EFECTIVO' ? 'Efectivo' : 'Transferencia SPEI'}
                  </span>
                </div>
              </div>

              {/* Details Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                background: 'rgba(0,0,0,0.2)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ubicación de Trabajo:</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={13} color="#4ade80" />
                    {res.parcelLocation}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Modalidad / Operador:</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <UserCheck size={13} color={res.withOperator ? '#4ade80' : 'var(--text-muted)'} />
                    {res.unitsQuantity} {res.rateType === 'DAY' ? 'jornadas' : res.rateType === 'HECTARE' ? 'hectáreas' : 'horas'}
                    {res.withOperator ? ' • Con operador' : ' • Sin operador'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Propietario / Contacto:</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {res.ownerName} ({res.ownerPhone})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Costo Total Acordado:</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-400)' }}>
                    ${res.totalCost?.toLocaleString()} MXN
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              {res.paymentMethod === 'EFECTIVO' && (
                <div className="payment-evidence-panel">
                  <div>
                    <strong>Pago en efectivo:</strong> primero realiza el pago antes de que el operador inicie el trabajo.
                    {res.paymentEvidence && (
                      <div style={{ marginTop: '0.35rem' }}>
                        Evidencia: <DocumentAttachment document={res.paymentEvidence} />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      id={`payment-evidence-${res.id}`}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = '';
                        if (file) onUploadPaymentEvidence?.(res.id, file);
                      }}
                      style={{ display: 'none' }}
                    />
                    <label className="btn btn-secondary btn-sm" htmlFor={`payment-evidence-${res.id}`}>
                      {res.paymentEvidence ? 'Cambiar foto de evidencia' : 'Subir foto de evidencia'}
                    </label>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Solicitud registrada el {new Date(res.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {res.paymentMethod !== 'EFECTIVO' && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedBankModal(res)}
                      title="Ver datos de transferencia bancaria"
                    >
                      <Landmark size={14} />
                      <span>Datos para Transferir</span>
                    </button>
                  )}

                  <a
                    href={`https://wa.me/52${res.ownerPhone?.replace(/\s+/g, '')}?text=Hola%20${encodeURIComponent(res.ownerName)},%20le%20contacto%20sobre%20la%20reserva%20de%20la%20maquinaria%20${encodeURIComponent(res.machineryTitle)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    <Phone size={14} />
                    Contactar Dueño
                  </a>

                  {res.status === ReservationStatus.PENDING && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onCancelReservation(res.id)}
                    >
                      Cancelar Solicitud
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for bank transfer instructions */}
      {selectedBankModal && (
        <div className="modal-overlay" onClick={() => setSelectedBankModal(null)}>
          <div className="modal-container" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Datos para Transferencia Bancaria (SPEI)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {selectedBankModal.machineryTitle} • Renta #{selectedBankModal.id}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedBankModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                background: 'linear-gradient(145deg, rgba(16, 44, 30, 0.75), rgba(15, 23, 42, 0.85))',
                border: '1px solid rgba(74, 222, 128, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'grid',
                gap: '0.85rem'
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Banco Destinatario:</div>
                  <div style={{ fontWeight: 600 }}>BBVA México (Sucursal Campeche - Candelaria)</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Beneficiario:</div>
                  <div style={{ fontWeight: 600 }}>{selectedBankModal.ownerName} / AgroRenta Candelaria</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>CLABE Interbancaria:</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontFamily: 'monospace', color: '#4ade80' }}>
                    <span>012 050 015489623145</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('012050015489623145')}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: copiedClabe ? '#4ade80' : 'var(--text-secondary)',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {copiedClabe ? <Check size={12} /> : <Copy size={12} />}
                      {copiedClabe ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Concepto / Referencia SPEI:</div>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-400)', fontSize: '1rem' }}>
                    {selectedBankModal.paymentReference || 'SPEI-DEMO'}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Monto Total a Transferir:</div>
                  <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#4ade80' }}>
                    ${selectedBankModal.totalCost?.toLocaleString()} MXN
                  </div>
                </div>
                <div style={{
                  padding: '0.65rem',
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: '#fef08a'
                }}>
                  ℹ️ <strong>Método solo estético:</strong> Este módulo es de carácter demostrativo. No realiza transferencias ni cargos bancarios reales.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedBankModal(null)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
