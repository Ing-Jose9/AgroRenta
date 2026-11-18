/**
 * Datos semilla iniciales para Candelaria, Campeche
 * Capa 3: Persistencia y Gestión de Datos
 */

import { UserRole, UserApprovalStatus } from '../models/User.js';
import { MachineryCategory, RateType, MachineryStatus } from '../models/Machinery.js';
import { ReservationStatus, PaymentMethod } from '../models/Reservation.js';

export const SEED_USERS = [
  {
    id: 'usr_seed_baltazar_damian',
    name: 'Baltazar Damian',
    role: UserRole.OWNER,
    community: 'San Miguel',
    address: 'San Miguel, Candelaria',
    verified: false,
    approvalStatus: UserApprovalStatus.PENDING
  },
  {
    id: 'usr_seed_jorge_hernandez',
    name: 'Jorge Hernandez',
    role: UserRole.OWNER,
    community: 'San Miguel',
    address: 'San Miguel, Candelaria',
    verified: false,
    approvalStatus: UserApprovalStatus.PENDING
  }
];

export const SEED_MACHINERY = [
  {
    id: 'mac_seed_new_holland_7730',
    ownerId: 'usr_seed_baltazar_damian',
    ownerName: 'Baltazar Damian',
    title: 'Tractor New Holland 7730',
    category: MachineryCategory.TRACTOR,
    brand: 'New Holland',
    model: '7730',
    zone: 'San Miguel',
    specificLocation: 'San Miguel, Candelaria',
    status: MachineryStatus.PENDING_REVIEW,
    rateType: RateType.DAY,
    rentalRate: null,
    operatorAvailable: false,
    operatorRate: 0
  },
  {
    id: 'mac_seed_john_deere_jorge',
    ownerId: 'usr_seed_jorge_hernandez',
    ownerName: 'Jorge Hernandez',
    title: 'Tractor John Deere (modelo por confirmar)',
    category: MachineryCategory.TRACTOR,
    brand: 'John Deere',
    model: 'Por confirmar',
    zone: 'San Miguel',
    specificLocation: 'San Miguel, Candelaria',
    status: MachineryStatus.PENDING_REVIEW,
    rateType: RateType.DAY,
    rentalRate: null,
    operatorAvailable: false,
    operatorRate: 0
  }
];

// Sin reservaciones de ejemplo — se generan cuando productores rentan maquinaria real.
export const SEED_RESERVATIONS = [];
