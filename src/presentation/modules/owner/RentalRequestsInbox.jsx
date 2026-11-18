import React, { useState } from 'react';
import { ReservationStatus } from '../../../core/models/Reservation.js';
import { Badge } from '../../components/Badge.jsx';
import {
  Check,
  X,
  Calendar,
  MapPin,
  UserCheck,
  Phone,
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  Landmark,
  Banknote,
  FileText,
  Info
} from 'lucide-react';

export const RentalRequestsInbox = ({
  requests = [],
  onApprove,
  onReject,
  onSetActive,
  onComplete
}) => {
  const [selectedVoucherReq, setSelectedVoucherReq] = useState(null);

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Solicitudes de Renta de Productores</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Aprueba o gestiona las solicitudes de productores del municipio de Candelaria y comunidades aliadas.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <AlertCircle size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
          <h4>No tienes solicitudes pendientes</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            Cuando los productores locales soliciten tus tractores o implementos, aparecerán aquí.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {requests.map(req => (
            <div key={req.id} className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <Badge status={req.status} type="reservation" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: #{req.id}
                    </span>
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
                      {req.paymentMethod === 'EFECTIVO' ? <Banknote size={13} /> : <Landmark size={13} />}
                      {req.paymentMethod === 'EFECTIVO' ? 'Pago en Efectivo' : 'Transferencia SPEI'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem' }}>{req.machineryTitle}</h4>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monto a Cobrar:</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-400)' }}>
                    ${req.totalCost?.toLocaleString()} MXN
                  </div>
                </div>
              </div>

              {/* Producer & Parcel Details */}
              <div style={{
                margin: '1rem 0',
                padding: '0.85rem',
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.85rem',
                fontSize: '0.875rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Productor Solicitante:</div>
                  <div style={{ fontWeight: 600 }}>{req.producerName}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{req.producerPhone}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ubicación de la Parcela:</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="#4ade80" />
                    <span>{req.parcelLocation}</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Período / Detalle:</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} />
                    <span>{req.startDate} al {req.endDate}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {req.unitsQuantity} {req.rateType === 'DAY' ? 'días' : req.rateType === 'HECTARE' ? 'hectáreas' : 'horas'}
                    {req.withOperator ? ' • Con operador' : ' • Sin operador'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Método de Pago:</div>
                  <div style={{ fontWeight: 600, color: '#86efac', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {req.paymentMethod === 'EFECTIVO' ? 'Efectivo en Parcela' : 'Transferencia Bancaria'}
                  </div>
                  {req.paymentReference && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      Ref: {req.paymentReference}
                    </div>
                  )}
                </div>
              </div>

              {req.notes && (
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontStyle: 'italic' }}>
                  Nota del productor: "{req.notes}"
                </div>
              )}

              {/* Action Buttons depending on status */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', flexWrap: 'wrap' }}>
                <a
                  href={`https://wa.me/52${req.producerPhone?.replace(/\s+/g, '')}?text=Hola%20${encodeURIComponent(req.producerName)},%20le%20contacto%20sobre%20su%20solicitud%20de%20maquinaria%20en%20Candelaria.`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <Phone size={14} />
                  WhatsApp
                </a>

                {req.paymentMethod !== 'EFECTIVO' && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedVoucherReq(req)}
                    title="Ver datos de transferencia bancaria"
                  >
                    <Landmark size={14} />
                    <span>Datos Transferencia</span>
                  </button>
                )}

                {req.status === ReservationStatus.PENDING && (
                  <>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        const reason = prompt('Indica el motivo del rechazo para informar al productor:', 'Equipo no disponible en esas fechas.');
                        if (reason !== null) {
                          onReject(req.id, reason);
                        }
                      }}
                    >
                      <X size={15} />
                      Rechazar
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onApprove(req.id)}
                    >
                      <Check size={15} />
                      Aprobar Solicitud
                    </button>
                  </>
                )}

                {req.status === ReservationStatus.APPROVED && (
                  <button
                    className="btn btn-accent btn-sm"
                    onClick={() => onSetActive(req.id)}
                  >
                    <PlayCircle size={15} />
                    Iniciar Trabajo en Campo
                  </button>
                )}

                {req.status === ReservationStatus.ACTIVE && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onComplete(req.id)}
                  >
                    <CheckCircle2 size={15} />
                    Marcar Renta Finalizada
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing Transfer details */}
      {selectedVoucherReq && (
        <div className="modal-overlay" onClick={() => setSelectedVoucherReq(null)}>
          <div className="modal-container" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Detalle de Pago por Transferencia</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Solicitud #{selectedVoucherReq.id} • {selectedVoucherReq.producerName}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedVoucherReq(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gap: '0.75rem',
                fontSize: '0.875rem'
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Banco Destino:</div>
                  <div style={{ fontWeight: 600 }}>BBVA México (Campeche / Candelaria)</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>CLABE Interbancaria:</div>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#4ade80' }}>012 050 015489623145</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Referencia / Folio SPEI:</div>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent-400)' }}>
                    {selectedVoucherReq.paymentReference || 'SPEI-DEMO'}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Monto de la Operación:</div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#4ade80' }}>
                    ${selectedVoucherReq.totalCost?.toLocaleString()} MXN
                  </div>
                </div>
                <div style={{
                  padding: '0.5rem',
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: '#fef08a'
                }}>
                  ℹ️ Modo Estético: Registro informativo para control de cobro. No realiza cargos bancarios automatizados.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedVoucherReq(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
