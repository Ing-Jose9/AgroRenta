/**
 * Repositorio de Reservas y Solicitudes de Renta (Capa 3: Acceso a Datos)
 */

import { storage, STORAGE_KEYS } from '../storage/StorageAdapter.js';
import { Reservation, ReservationStatus } from '../models/Reservation.js';

export class ReservationRepository {
  getAll() {
    const list = storage.get(STORAGE_KEYS.RESERVATIONS, []);
    return list.map(item => new Reservation(item));
  }

  getById(id) {
    const list = this.getAll();
    return list.find(r => r.id === id) || null;
  }

  getByProducerId(producerId) {
    const list = this.getAll();
    return list.filter(r => r.producerId === producerId);
  }

  getByOwnerId(ownerId) {
    const list = this.getAll();
    return list.filter(r => r.ownerId === ownerId);
  }

  create(reservationData) {
    const list = storage.get(STORAGE_KEYS.RESERVATIONS, []);
    const newReservation = new Reservation({
      id: 'res_' + Date.now().toString(36),
      ...reservationData,
      status: ReservationStatus.PENDING,
      createdAt: new Date().toISOString()
    });
    list.unshift(newReservation);
    storage.set(STORAGE_KEYS.RESERVATIONS, list);
    return newReservation;
  }

  updateStatus(id, newStatus, rejectionReason = '') {
    const list = storage.get(STORAGE_KEYS.RESERVATIONS, []);
    const index = list.findIndex(r => r.id === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      status: newStatus,
      rejectionReason: rejectionReason || list[index].rejectionReason
    };
    storage.set(STORAGE_KEYS.RESERVATIONS, list);
    return new Reservation(list[index]);
  }

  updatePaymentEvidence(id, paymentEvidence) {
    const list = storage.get(STORAGE_KEYS.RESERVATIONS, []);
    const index = list.findIndex(reservation => reservation.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], paymentEvidence };
    storage.set(STORAGE_KEYS.RESERVATIONS, list);
    return new Reservation(list[index]);
  }
}

export const reservationRepository = new ReservationRepository();
