/**
 * Servicio de Moderación y Prevención de Fraudes (Capa 2: Lógica de Negocio)
 * Supervisión de anuncios y seguridad para los productores de Candelaria
 */

import { machineryRepository } from '../core/repositories/MachineryRepository.js';
import { MachineryStatus, CANDELARIA_ZONES } from '../core/models/Machinery.js';

export class ModerationService {
  /**
   * Valida los datos técnicos de un anuncio antes de registrarlo
   */
  static validateListing(data) {
    const errors = [];

    if (!data.title || data.title.trim().length < 5) {
      errors.push('El título debe tener al menos 5 caracteres.');
    }
    if (!data.brand || !data.model) {
      errors.push('La marca y el modelo son obligatorios.');
    }
    const currentYear = new Date().getFullYear();
    if (!data.year || data.year < 1980 || data.year > currentYear + 1) {
      errors.push(`El año de fabricación debe estar entre 1980 y ${currentYear + 1}.`);
    }
    if (!data.rentalRate || Number(data.rentalRate) <= 0) {
      errors.push('La tarifa de renta debe ser mayor a $0.');
    }
    if (!data.zone || !CANDELARIA_ZONES.includes(data.zone)) {
      errors.push('Debe especificar una comunidad o zona válida dentro del municipio de Candelaria.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Acción del administrador: Aprobar anuncio
   */
  static approveMachinery(id) {
    return machineryRepository.updateStatus(id, MachineryStatus.ACTIVE);
  }

  /**
   * Acción del administrador: Rechazar anuncio por inconsistencia o sospecha
   */
  static rejectMachinery(id, reason = 'No cumple con las normas de verificación técnica.') {
    return machineryRepository.update(id, {
      status: MachineryStatus.REJECTED,
      moderationNotes: reason
    });
  }

  /**
   * Acción del propietario o admin: Marcar en mantenimiento
   */
  static toggleMaintenance(id) {
    const item = machineryRepository.getById(id);
    if (!item) return null;
    const newStatus = item.status === MachineryStatus.MAINTENANCE
      ? MachineryStatus.ACTIVE
      : MachineryStatus.MAINTENANCE;
    return machineryRepository.updateStatus(id, newStatus);
  }
}
