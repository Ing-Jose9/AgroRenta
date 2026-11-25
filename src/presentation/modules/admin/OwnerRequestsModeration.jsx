import { useState } from 'react';
import {
  Check,
  X,
  FileText,
  Phone,
  Mail,
  MapPin,
  Tractor,
  CheckCircle2,
} from 'lucide-react';
import { UserApprovalStatus } from '../../../core/models/User.js';
import { DocumentAttachment } from '../../components/DocumentAttachment.jsx';

export const OwnerRequestsModeration = ({
  users = [],
  machineryList = [],
  onApproveOwner,
  onRejectOwner
}) => {
  const [selectedIneModal, setSelectedIneModal] = useState(null);

  // Filter pending owner registrations
  const pendingOwners = users.filter(u => u.approvalStatus === UserApprovalStatus.PENDING);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          Solicitudes de Registro de Propietarios y Maquinaria
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Revisa la identidad (Credencial INE), datos de contacto y fotos de maquinaria de los nuevos propietarios antes de permitirles publicar en el catálogo.
        </p>
      </div>

      {pendingOwners.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <CheckCircle2 size={40} color="#4ade80" style={{ margin: '0 auto 1rem' }} />
          <h4>¡No hay solicitudes de registro pendientes!</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
            Todos los propietarios registrados cuentan con su INE y maquinaria verificada por la administración.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {pendingOwners.map(owner => {
            // Find machinery registered by this pending owner
            const relatedMachinery = machineryList.filter(m => m.ownerId === owner.id);

            return (
              <div
                key={owner.id}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  background: 'linear-gradient(180deg, rgba(234, 179, 8, 0.04) 0%, rgba(15, 23, 42, 0.6) 100%)'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img
                      src={owner.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                      alt={owner.name}
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-500)' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.15rem' }}>{owner.name}</h4>
                        <span style={{
                          background: 'rgba(234, 179, 8, 0.2)',
                          color: '#fde047',
                          border: '1px solid rgba(234, 179, 8, 0.4)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px'
                        }}>
                          Pendiente de Aprobación
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Phone size={13} /> {owner.phone}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Mail size={13} /> {owner.email}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={13} color="#4ade80" /> {owner.community} ({owner.address || 'Domicilio en ejido'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* INE Document Inspection Button */}
                  <div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedIneModal(owner)}
                      style={{ borderColor: 'var(--accent-400)', color: '#fde047' }}
                    >
                      <FileText size={15} />
                      <span>Revisar Credencial INE</span>
                    </button>
                  </div>
                </div>

                {/* Submitted Machinery Details */}
                <div style={{ marginTop: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Tractor size={16} />
                    <span>Maquinaria Propuesta para Publicación ({relatedMachinery.length})</span>
                  </div>

                  {relatedMachinery.length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      El propietario no adjuntó maquinaria en el registro inicial.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '0.85rem' }}>
                      {relatedMachinery.map(item => (
                        <div
                          key={item.id}
                          style={{
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem',
                            display: 'flex',
                            gap: '1.25rem',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap'
                          }}
                        >
                          <img
                            src={item.images?.[0] || '/images/tractor-john-deere.jpg'}
                            alt={item.title}
                            style={{ width: '120px', height: '85px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          />

                          <div style={{ flex: 1, minWidth: '220px' }}>
                            <h5 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{item.title}</h5>
                            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                              <strong>Marca:</strong> {item.brand || 'Por confirmar'} • <strong>Modelo:</strong> {item.model || 'Por confirmar'} • <strong>Año:</strong> {item.year || 'Por confirmar'} • <strong>HP:</strong> {item.hp > 0 ? item.hp : 'Por confirmar'}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--accent-400)', fontWeight: 700, margin: '0.35rem 0' }}>
                              Tarifa Propuesta: {item.rentalRate > 0 ? `$${item.rentalRate.toLocaleString()} MXN / ${item.rateType}` : 'Pendiente de definir'}
                              {item.operatorAvailable && (
                                <span style={{ fontSize: '0.78rem', color: '#86efac', fontWeight: 500, marginLeft: '0.5rem' }}>
                                  (Incluye operador + ${item.operatorRate})
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              📍 Ubicación de resguardo: {item.specificLocation || item.zone}
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                              <strong>Comprobante de propiedad:</strong>{' '}
                              <DocumentAttachment document={item.ownershipDocument} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Administrative Decision Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      const reason = prompt('Indica el motivo de rechazo (ej. INE borrosa o no coincide, fotos falsas):', 'Credencial INE o documentación no legible.');
                      if (reason !== null) {
                        onRejectOwner(owner.id, reason);
                      }
                    }}
                  >
                    <X size={15} />
                    Rechazar Solicitud
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={() => onApproveOwner(owner.id)}
                    style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
                  >
                    <Check size={16} />
                    Aprobar Propietario y Publicar Maquinaria
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Inspecting INE Document */}
      {selectedIneModal && (
        <div className="modal-overlay" onClick={() => setSelectedIneModal(null)}>
          <div className="modal-container" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Inspección de Credencial INE Oficial</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Titular: {selectedIneModal.name} {selectedIneModal.lastName || ''} • {selectedIneModal.community}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedIneModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="document-review-list">
                {(selectedIneModal.ineDocuments || []).length ? (
                  selectedIneModal.ineDocuments.map(document => (
                    <DocumentAttachment key={document.id} document={document} />
                  ))
                ) : (
                  <p>No hay un archivo INE adjunto en este dispositivo.</p>
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedIneModal(null)}>
                Cerrar Visor
              </button>

              <button
                className="btn btn-primary"
                onClick={() => {
                  onApproveOwner(selectedIneModal.id);
                  setSelectedIneModal(null);
                }}
              >
                <Check size={15} />
                Aprobar Directamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
