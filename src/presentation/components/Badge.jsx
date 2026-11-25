import React from 'react';
import { MachineryStatus } from '../../core/models/Machinery.js';
import { ReservationStatus } from '../../core/models/Reservation.js';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Wrench, PlayCircle } from 'lucide-react';

export const Badge = ({ status, type = 'machinery' }) => {
  if (type === 'machinery') {
    switch (status) {
      case MachineryStatus.ACTIVE:
        return (
          <span className="badge badge-active">
            <CheckCircle2 size={12} />
            Disponible
          </span>
        );
      case MachineryStatus.PENDING_REVIEW:
        return (
          <span className="badge badge-pending">
            <Clock size={12} />
            Revisión Admin
          </span>
        );
      case MachineryStatus.MAINTENANCE:
        return (
          <span className="badge badge-maintenance">
            <Wrench size={12} />
            Mantenimiento
          </span>
        );
      case MachineryStatus.REJECTED:
        return (
          <span className="badge badge-rejected">
            <XCircle size={12} />
            Rechazado
          </span>
        );
      default:
        return <span className="badge">{status}</span>;
    }
  }

  // Reservation Status
  switch (status) {
    case ReservationStatus.PENDING:
      return (
        <span className="badge badge-pending">
          <Clock size={12} />
          Pendiente de Aprobación
        </span>
      );
    case ReservationStatus.APPROVED:
      return (
        <span className="badge badge-approved">
          <CheckCircle2 size={12} />
          Aprobada
        </span>
      );
    case ReservationStatus.ACTIVE:
      return (
        <span className="badge badge-active">
          <PlayCircle size={12} />
          En Campo / Activa
        </span>
      );
    case ReservationStatus.COMPLETED:
      return (
        <span className="badge badge-completed">
          <CheckCircle2 size={12} />
          Finalizada
        </span>
      );
    case ReservationStatus.REJECTED:
      return (
        <span className="badge badge-rejected">
          <XCircle size={12} />
          Rechazada
        </span>
      );
    default:
      return <span className="badge">{status}</span>;
  }
};
