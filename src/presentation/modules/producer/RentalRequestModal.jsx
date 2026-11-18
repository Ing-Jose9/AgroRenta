import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  MapPin,
  UserCheck,
  AlertCircle,
  Check,
  DollarSign,
  Landmark,
  Banknote,
  Copy,
  FileText,
  UploadCloud,
  ShieldCheck
} from 'lucide-react';
import { RentalCostService } from '../../../services/RentalCostService.js';
import { AvailabilityService } from '../../../services/AvailabilityService.js';
import { RateType } from '../../../core/models/Machinery.js';
import { PaymentMethod } from '../../../core/models/Reservation.js';
import { saveDocument } from '../../../core/storage/DocumentStorage.js';

export const RentalRequestModal = ({
  machinery: machinerySelection,
  currentUser,
  isOpen,
  onClose,
  onSubmitReservation
}) => {
  const machineries = useMemo(() => (
    Array.isArray(machinerySelection)
      ? machinerySelection
      : machinerySelection ? [machinerySelection] : []
  ), [machinerySelection]);
  const machinery = machineries[0];

  // Defaults: tomorrow to +2 days
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStart = tomorrow.toISOString().split('T')[0];
  
  const endDefault = new Date();
  endDefault.setDate(endDefault.getDate() + 3);
  const defaultEnd = endDefault.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [unitsQuantity, setUnitsQuantity] = useState(
    machinery?.rateType === RateType.HECTARE ? 15 : 1
  );
  const [withOperator, setWithOperator] = useState(Boolean(machinery?.operatorAvailable));
  const [parcelLocation, setParcelLocation] = useState(
    currentUser?.community ? `Ejido ${currentUser.community}, Parcela de Producción` : 'Ejido San Miguel'
  );
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Payment method (Aesthetic bank transfer)
  const [paymentMethod, setPaymentMethod] = useState(PaymentMethod.TRANSFER);
  const [copiedClabe, setCopiedClabe] = useState(false);
  const [voucherFile, setVoucherFile] = useState(null);
  const voucherInputRef = React.useRef(null);
  const [referenceCode] = useState(() => 'SPEI-' + Math.floor(10000 + Math.random() * 90000));

  // Check availability
  const isDateRangeAvailable = useMemo(() => {
    return machineries.every(item => AvailabilityService.isAvailable(item, startDate, endDate));
  }, [machineries, startDate, endDate]);

  // Live calculation
  const costBreakdowns = useMemo(() => {
    try {
      return machineries.map(item => RentalCostService.calculate({
        machinery: item,
        unitsQuantity,
        withOperator: withOperator && item.operatorAvailable,
        startDate,
        endDate
      }));
    } catch {
      return [];
    }
  }, [machineries, unitsQuantity, withOperator, startDate, endDate]);
  const costBreakdown = costBreakdowns[0] || null;
  const totalCost = costBreakdowns.reduce((total, breakdown) => total + breakdown.totalCost, 0);

  const handleCopyClabe = (clabe) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(clabe);
    }
    setCopiedClabe(true);
    setTimeout(() => setCopiedClabe(false), 2500);
  };

  const handleVoucherUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if ((!isPdf && !file.type.startsWith('image/')) || file.size > 8 * 1024 * 1024) {
      setErrorMsg('Adjunta una foto o PDF del comprobante de máximo 8 MB.');
      return;
    }
    setVoucherFile(file);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDateRangeAvailable) {
      setErrorMsg('La maquinaria no está disponible para las fechas seleccionadas debido a mantenimiento o una reserva previa.');
      return;
    }

    if (!parcelLocation.trim()) {
      setErrorMsg('Por favor especifica la ubicación o parcela donde trabajará la máquina.');
      return;
    }

    if (!costBreakdowns.length) {
      setErrorMsg('No fue posible calcular el costo de las maquinarias seleccionadas.');
      return;
    }

    let paymentVoucher = null;
    if (voucherFile) {
      try {
        paymentVoucher = await saveDocument(voucherFile);
      } catch (error) {
        setErrorMsg(error.message || 'No se pudo guardar el comprobante de pago.');
        return;
      }
    }

    const reservationPayloads = machineries.map((item, index) => {
      const breakdown = costBreakdowns[index];
      return {
        machineryId: item.id,
        machineryTitle: item.title,
        machineryCategory: item.category,
        machineryImage: item.images?.[0] || '/images/tractor-john-deere.jpg',
        ownerId: item.ownerId,
        ownerName: item.ownerName,
        ownerPhone: item.ownerPhone,
        producerId: currentUser?.id || 'usr_baltazar',
        producerName: currentUser?.name || 'Productor de Candelaria',
        producerPhone: currentUser?.phone || '982 105 4432',
        startDate,
        endDate,
        rateType: item.rateType,
        unitsQuantity: breakdown.unitsQuantity,
        unitRate: breakdown.unitRate,
        withOperator: breakdown.withOperator,
        operatorCost: breakdown.operatorCost,
        baseCost: breakdown.baseCost,
        totalCost: breakdown.totalCost,
        parcelLocation,
        notes,
        paymentMethod,
        paymentReference: paymentMethod === PaymentMethod.TRANSFER ? referenceCode : 'PAGO_EFECTIVO',
        paymentVoucher
      };
    });

    onSubmitReservation(reservationPayloads);
    onClose();
  };

  if (!isOpen || !machinery) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Solicitar Renta de Maquinaria</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {machineries.length === 1
                ? `${machinery.title} • ${machinery.zone}`
                : `${machineries.length} equipos: ${machineries.map(item => item.title).join(', ')}`}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#fca5a5',
                fontSize: '0.875rem'
              }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Date Pickers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Fecha de Término
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                />
              </div>
            </div>

            {/* Availability Alert */}
            {!isDateRangeAvailable ? (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <AlertCircle size={14} />
                Fechas no disponibles. Por favor selecciona otro rango de fechas.
              </div>
            ) : (
              <div style={{
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#4ade80',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <Check size={14} />
                ¡Maquinaria disponible en Candelaria para estas fechas!
              </div>
            )}

            {/* If rate is by HECTARE or HOUR, show manual quantity input */}
            {machinery.rateType === RateType.HECTARE && (
              <div className="form-group">
                <label className="form-label">Superficie estimada a trabajar (Hectáreas)</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  className="form-input"
                  value={unitsQuantity}
                  onChange={(e) => setUnitsQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                />
              </div>
            )}

            {machinery.rateType === RateType.HOUR && (
              <div className="form-group">
                <label className="form-label">Horas estimadas de labor</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  className="form-input"
                  value={unitsQuantity}
                  onChange={(e) => setUnitsQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                />
              </div>
            )}

            {/* Operator Selection */}
            {machineries.some(item => item.operatorAvailable) && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  className="operator-toggle-card"
                  onClick={() => setWithOperator(!withOperator)}
                >
                  <input
                    type="checkbox"
                    checked={withOperator}
                    onChange={(e) => setWithOperator(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#22c55e' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <UserCheck size={16} color="#4ade80" />
                      Incluir Operador Certificado con la máquina
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Se agregará el operador disponible de cada maquinaria seleccionada.
                    </div>
                  </div>
                </label>
              </div>
            )}

            {/* Parcel Location */}
            <div className="form-group">
              <label className="form-label">
                <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Ubicación de la Parcela / Rancho en Candelaria
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Parcela 12, Ejido San Miguel (rumbo a Tulipán)"
                value={parcelLocation}
                onChange={(e) => setParcelLocation(e.target.value)}
                required
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Instrucciones o especificaciones para el trabajo</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Ej. Tipo de cultivo, profundidad de pase de rastra, acceso a la parcela..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Live Transparent Cost Breakdown */}
            {costBreakdown && (
              <div className="calc-breakdown-box">
                <div style={{ fontSize: '0.825rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-400)', marginBottom: '0.5rem' }}>
                  Total de {machineries.length} maquinaria(s)
                </div>
                
                {costBreakdowns.map((breakdown, index) => (
                  <div className="calc-row" key={machineries[index].id}>
                    <span>{machineries[index].title} ({breakdown.unitsQuantity} {breakdown.unitLabel})</span>
                    <span>${breakdown.totalCost.toLocaleString()} MXN</span>
                  </div>
                ))}

                <div className="calc-row">
                  <span>Comisión de plataforma municipal</span>
                  <span style={{ color: '#4ade80' }}>$0.00 (Gratuita para el campo)</span>
                </div>

                <div className="calc-row total">
                  <span>Total estimado:</span>
                  <span className="calc-total-amount">${totalCost.toLocaleString()} MXN</span>
                </div>
              </div>
            )}

            {/* Method of Payment Section (Aesthetic / Bank Transfer) */}
            <div style={{ marginTop: '1.25rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                <Landmark size={15} color="var(--primary-400)" />
                Método de Pago para la Renta
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div
                  onClick={() => setPaymentMethod(PaymentMethod.TRANSFER)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === PaymentMethod.TRANSFER ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                    background: paymentMethod === PaymentMethod.TRANSFER ? 'rgba(34, 197, 94, 0.12)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: paymentMethod === PaymentMethod.TRANSFER ? '#4ade80' : 'var(--text-primary)' }}>
                    <Landmark size={16} />
                    <span>Transferencia SPEI</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                    Depósito o transferencia bancaria (Demostrativo)
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === PaymentMethod.CASH ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                    background: paymentMethod === PaymentMethod.CASH ? 'rgba(34, 197, 94, 0.12)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: paymentMethod === PaymentMethod.CASH ? '#4ade80' : 'var(--text-primary)' }}>
                    <Banknote size={16} />
                    <span>Efectivo en Campo</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                    Pago en efectivo en campo
                  </div>
                </div>
              </div>

              {paymentMethod === PaymentMethod.CASH && (
                <div className="payment-warning" role="status">
                  Primero debe realizar el pago para que el operador inicie su trabajo. Después, suba una foto del comprobante desde “Mis Reservas”. El aviso SMS requiere configurar el servicio de notificaciones.
                </div>
              )}

              {/* Aesthetic Transfer Card */}
              {paymentMethod === PaymentMethod.TRANSFER && (
                <div style={{
                  background: 'linear-gradient(145deg, rgba(16, 44, 30, 0.75), rgba(15, 23, 42, 0.85))',
                  border: '1px solid rgba(74, 222, 128, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1rem',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.85rem', color: '#86efac' }}>
                      <Landmark size={15} />
                      <span>DATOS PARA TRANSFERENCIA BANCARIA (SPEI)</span>
                    </div>
                    <span style={{
                      fontSize: '0.68rem',
                      background: 'rgba(234, 179, 8, 0.2)',
                      color: '#fde047',
                      border: '1px solid rgba(234, 179, 8, 0.4)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      fontWeight: 600
                    }}>
                      Módulo Estético / Sin cobro real
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.825rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Institución Bancaria:</div>
                      <div style={{ fontWeight: 600 }}>BBVA México (Sucursal Campeche - Candelaria)</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Beneficiario Autorizado:</div>
                      <div style={{ fontWeight: 600 }}>{machinery.ownerName} / AgroRenta Candelaria</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>CLABE Interbancaria (18 dígitos):</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.04em', color: '#4ade80' }}>
                        <span>012 050 015489623145</span>
                        <button
                          type="button"
                          onClick={() => handleCopyClabe('012050015489623145')}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: copiedClabe ? '#4ade80' : 'var(--text-secondary)',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                          title="Copiar CLABE"
                        >
                          {copiedClabe ? <Check size={12} /> : <Copy size={12} />}
                          {copiedClabe ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Concepto / Referencia SPEI:</div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-400)', fontFamily: 'monospace' }}>
                        {referenceCode}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '0.85rem',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <FileText size={15} color={voucherFile ? '#4ade80' : 'var(--text-muted)'} />
                      <span>{voucherFile?.name || 'Comprobante de transferencia (opcional)'}</span>
                    </div>
                    <input
                      type="file"
                      ref={voucherInputRef}
                      accept="image/*,.pdf,application/pdf"
                      onChange={handleVoucherUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => voucherInputRef.current?.click()}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                    >
                      <UploadCloud size={13} />
                      {voucherFile ? 'Cambiar Comprobante' : 'Subir Comprobante'}
                    </button>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldCheck size={13} color="#4ade80" />
                    <span>La transferencia es una demostración; no se realizará ningún cargo bancario.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-accent"
              disabled={!isDateRangeAvailable}
            >
              <DollarSign size={18} />
              Confirmar Solicitud de Renta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
