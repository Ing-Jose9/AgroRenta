/**
 * Servicio de Gestión de Disponibilidad y Calendario (Capa 2: Lógica de Negocio)
 * Verifica cruces con mantenimientos y reservas activas
 */

import { reservationRepository } from '../core/repositories/ReservationRepository.js';
import { ReservationStatus } from '../core/models/Reservation.js';

export class AvailabilityService {
  /**
   * Genera arreglo de fechas en formato YYYY-MM-DD entre dos fechas inclusive
   */
  static getDateRangeArray(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) return [];
    const dates = [];
    let current = new Date(startDateStr);
    const end = new Date(endDateStr);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  /**
   * Obtiene todas las fechas no disponibles para una máquina (bloqueos + reservas aprobadas)
   */
  static getUnavailableDates(machinery) {
    if (!machinery) return [];

    const unavailable = new Set(machinery.blockedDates || []);

    // Buscar reservas aprobadas o activas
    const allReservations = reservationRepository.getAll();
    const activeReservations = allReservations.filter(
      r => r.machineryId === machinery.id &&
      (r.status === ReservationStatus.APPROVED || r.status === ReservationStatus.ACTIVE)
    );

    activeReservations.forEach(r => {
      const dates = this.getDateRangeArray(r.startDate, r.endDate);
      dates.forEach(d => unavailable.add(d));
    });

    return Array.from(unavailable).sort();
  }

  /**
   * Comprueba si un rango de fechas solicitado está completamente libre
   */
  static isAvailable(machinery, startDateStr, endDateStr) {
    if (!machinery || !startDateStr || !endDateStr) return false;
    const requestedDates = this.getDateRangeArray(startDateStr, endDateStr);
    const unavailableDates = new Set(this.getUnavailableDates(machinery));

    for (const date of requestedDates) {
      if (unavailableDates.has(date)) {
        return false;
      }
    }
    return true;
  }
}
