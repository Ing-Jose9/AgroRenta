/**
 * Modelo de Solicitud de Renta y Reserva
 * Capa 3: Gestión de Información y Modelos de Dominio
 */

export const ReservationStatus = {
  PENDING: 'PENDING',       // Solicitada por el productor, esperando aprobación del dueño
  APPROVED: 'APPROVED',     // Aprobada por el dueño, lista para la fecha
  ACTIVE: 'ACTIVE',         // En campo / trabajando actualmente
  COMPLETED: 'COMPLETED',   // Trabajo terminado satisfactoriamente
  REJECTED: 'REJECTED',     // Rechazada por el dueño
  CANCELLED: 'CANCELLED'    // Cancelada por el productor
};

export const PaymentMethod = {
  TRANSFER: 'TRANSFERENCIA', // Transferencia SPEI bancaria (estética/demostrativa)
  CASH: 'EFECTIVO'           // Pago en efectivo contraentrega en campo
};

export class Reservation {
  constructor({
    id,
    machineryId,
    machineryTitle,
    machineryCategory,
    machineryImage,
    ownerId,
    ownerName,
    ownerPhone,
    producerId,
    producerName,
    producerPhone,
    startDate,
    endDate,
    rateType,
    unitsQuantity = 1, // Días, horas o hectáreas según rateType
    unitRate = 0,
    withOperator = false,
    operatorCost = 0,
    baseCost = 0,
    totalCost = 0,
    parcelLocation = '',
    notes = '',
    status = ReservationStatus.PENDING,
    paymentMethod = PaymentMethod.TRANSFER,
    paymentReference = '',
    paymentVoucher = null,
    paymentEvidence = null,
    rejectionReason = '',
    createdAt = new Date().toISOString()
  }) {
    this.id = id;
    this.machineryId = machineryId;
    this.machineryTitle = machineryTitle;
    this.machineryCategory = machineryCategory;
    this.machineryImage = machineryImage;
    this.ownerId = ownerId;
    this.ownerName = ownerName;
    this.ownerPhone = ownerPhone;
    this.producerId = producerId;
    this.producerName = producerName;
    this.producerPhone = producerPhone;
    this.startDate = startDate;
    this.endDate = endDate;
    this.rateType = rateType;
    this.unitsQuantity = unitsQuantity;
    this.unitRate = unitRate;
    this.withOperator = withOperator;
    this.operatorCost = operatorCost;
    this.baseCost = baseCost;
    this.totalCost = totalCost;
    this.parcelLocation = parcelLocation;
    this.notes = notes;
    this.status = status;
    this.paymentMethod = paymentMethod;
    this.paymentReference = paymentReference;
    this.paymentVoucher = paymentVoucher;
    this.paymentEvidence = paymentEvidence;
    this.rejectionReason = rejectionReason;
    this.createdAt = createdAt;
  }
}
