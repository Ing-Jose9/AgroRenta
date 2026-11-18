/**
 * Servicio de Bitácora y Auditoría de Seguridad (Capa 2: Lógica de Negocio)
 * Registra todas las acciones administrativas en el municipio de Candelaria
 */

import { storage } from '../core/storage/StorageAdapter.js';

const AUDIT_STORAGE_KEY = 'agrorenta_audit_logs_v2';

const INITIAL_LOGS = [
  {
    id: 'log_01',
    timestamp: '2026-11-03T18:15:00.000Z',
    adminName: 'Administrador Municipal',
    action: 'REGISTRO_PROPIETARIO',
    category: 'PROPIETARIO',
    target: 'Jorge Hernandez (San Miguel)',
    details: 'Expediente de maquinaria verificado y activo en el catálogo de Candelaria.',
    status: 'SUCCESS'
  },
  {
    id: 'log_02',
    timestamp: '2026-11-02T16:20:00.000Z',
    adminName: 'Administrador Municipal',
    action: 'MODERACION_APROBADA',
    category: 'MAQUINARIA',
    target: 'Rastra Baldan 32 Discos (#mac_02)',
    details: 'Verificación técnica aprobada para labores en Ejido San Miguel.',
    status: 'SUCCESS'
  },
  {
    id: 'log_03',
    timestamp: '2026-11-01T12:00:00.000Z',
    adminName: 'Administrador Municipal',
    action: 'CERTIFICACION_IDENTIDAD',
    category: 'USUARIO',
    target: 'Baltazar Damian (San Miguel)',
    details: 'Credencial INE cotejada y validada con padrón de productores.',
    status: 'SUCCESS'
  },
  {
    id: 'log_04',
    timestamp: '2026-10-28T09:30:00.000Z',
    adminName: 'Administrador Municipal',
    action: 'SUPERVISION_PAGO',
    category: 'RENTA',
    target: 'Reserva #res_01 (Tractor John Deere 8R)',
    details: 'Validada transferencia SPEI-88231 por $14,400 MXN en Ejido San Miguel.',
    status: 'SUCCESS'
  }
];

export class AuditService {
  static getLogs() {
    return storage.get(AUDIT_STORAGE_KEY, INITIAL_LOGS);
  }

  static log({ action, category = 'SISTEMA', target, details, adminName = 'Administrador Municipal', status = 'INFO' }) {
    const logs = this.getLogs();
    const newEntry = {
      id: 'log_' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      adminName,
      action,
      category,
      target,
      details,
      status
    };
    logs.unshift(newEntry);
    storage.set(AUDIT_STORAGE_KEY, logs);
    return newEntry;
  }

  static clear() {
    storage.set(AUDIT_STORAGE_KEY, []);
  }
}
