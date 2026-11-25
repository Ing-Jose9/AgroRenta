/**
 * Servicio de Estadísticas y Reportería Municipal (Capa 2: Lógica de Negocio)
 * Análisis de impacto agropecuario en las comunidades de Candelaria
 */

import { machineryRepository } from '../core/repositories/MachineryRepository.js';
import { reservationRepository } from '../core/repositories/ReservationRepository.js';
import { userRepository } from '../core/repositories/UserRepository.js';
import { ReservationStatus } from '../core/models/Reservation.js';
import { MachineryStatus } from '../core/models/Machinery.js';

export class AnalyticsService {
  static getMetrics() {
    const machinery = machineryRepository.getAll();
    const reservations = reservationRepository.getAll();
    const users = userRepository.getAll();

    // Rentas aprobadas, activas y completadas
    const successfulReservations = reservations.filter(
      r => r.status === ReservationStatus.COMPLETED ||
           r.status === ReservationStatus.ACTIVE ||
           r.status === ReservationStatus.APPROVED
    );

    // Volumen económico total movilizado
    const totalRevenue = successfulReservations.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);

    // Maquinaria activa
    const activeMachineryCount = machinery.filter(m => m.status === MachineryStatus.ACTIVE).length;
    const pendingModerationCount = machinery.filter(m => m.status === MachineryStatus.PENDING_REVIEW).length;

    // Actividad por comunidad de Candelaria
    const communityActivity = {};
    machinery.forEach(m => {
      const zone = m.zone || 'Otras';
      if (!communityActivity[zone]) {
        communityActivity[zone] = { machineryCount: 0, reservationsCount: 0, revenue: 0 };
      }
      communityActivity[zone].machineryCount += 1;
    });

    reservations.forEach(r => {
      const mac = machinery.find(m => m.id === r.machineryId);
      const zone = mac ? mac.zone : 'Candelaria Cabecera';
      if (!communityActivity[zone]) {
        communityActivity[zone] = { machineryCount: 0, reservationsCount: 0, revenue: 0 };
      }
      communityActivity[zone].reservationsCount += 1;
      if (r.status === ReservationStatus.COMPLETED || r.status === ReservationStatus.ACTIVE) {
        communityActivity[zone].revenue += Number(r.totalCost) || 0;
      }
    });

    // Maquinaria más solicitada
    const demandByMachinery = {};
    reservations.forEach(r => {
      if (!demandByMachinery[r.machineryTitle]) {
        demandByMachinery[r.machineryTitle] = {
          title: r.machineryTitle,
          count: 0,
          category: r.machineryCategory
        };
      }
      demandByMachinery[r.machineryTitle].count += 1;
    });

    const topRequested = Object.values(demandByMachinery).sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      totalRevenue,
      formattedRevenue: new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0
      }).format(totalRevenue),
      totalReservations: reservations.length,
      successfulReservationsCount: successfulReservations.length,
      activeMachineryCount,
      pendingModerationCount,
      totalUsers: users.length,
      communityActivity,
      topRequested
    };
  }
}
