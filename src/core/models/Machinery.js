/**
 * Modelo de Maquinaria Agrícola
 * Capa 3: Gestión de Información y Modelos de Dominio
 */

export const MachineryCategory = {
  TRACTOR: 'TRACTOR',
  RASTRA: 'RASTRA',
  SEMBRADORA: 'SEMBRADORA',
  COSECHADORA: 'COSECHADORA',
  ASPERSORA: 'ASPERSORA'
};

export const RateType = {
  HOUR: 'HOUR',           // Por hora
  DAY: 'DAY',             // Por jornada / día
  HECTARE: 'HECTARE'      // Por hectárea trabajada
};

export const MachineryStatus = {
  ACTIVE: 'ACTIVE',               // Aprobado y listo para renta
  PENDING_REVIEW: 'PENDING_REVIEW', // En espera de moderación admin
  REJECTED: 'REJECTED',           // Rechazado por fraude o inconsistencia
  MAINTENANCE: 'MAINTENANCE'      // Bloqueado temporalmente por reparación
};

export const CANDELARIA_ZONES = [
  'San Miguel',
  'Tulipán',
  'Miguel Alemán',
  'Miguel Hidalgo',
  'Desengaño',
  'Benito Juárez',
  'La Tolva',
  'Pejelagarto',
  'Las Conchas',
  'San Francisco de Campeche',
  'Candelaria Cabecera'
];

export class Machinery {
  constructor({
    id,
    ownerId,
    ownerName,
    ownerPhone,
    title,
    category = MachineryCategory.TRACTOR,
    brand,
    model,
    year,
    hp = 0,
    rentalRate = 0,
    rateType = RateType.DAY,
    operatorAvailable = true,
    operatorRate = 500, // Costo extra por jornada del operador
    zone = 'El Triunfo',
    specificLocation = '',
    description = '',
    images = [],
    ownershipDocument = null,
    categories = null,
    status = MachineryStatus.PENDING_REVIEW,
    blockedDates = [], // ['2026-11-01', '2026-11-02']
    createdAt = new Date().toISOString()
  }) {
    this.id = id;
    this.ownerId = ownerId;
    this.ownerName = ownerName;
    this.ownerPhone = ownerPhone;
    this.title = title;
    this.category = category;
    this.brand = brand;
    this.model = model;
    this.year = year;
    this.hp = hp;
    this.rentalRate = rentalRate;
    this.rateType = rateType;
    this.operatorAvailable = operatorAvailable;
    this.operatorRate = operatorRate;
    this.zone = zone;
    this.specificLocation = specificLocation;
    this.description = description;
    this.images = images;
    this.ownershipDocument = ownershipDocument;
    this.categories = categories || [category];
    this.status = status;
    this.blockedDates = blockedDates;
    this.createdAt = createdAt;
  }
}
