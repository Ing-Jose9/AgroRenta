import { UserRole } from '../core/models/User.js';
import { MachineryStatus } from '../core/models/Machinery.js';
import { machineryRepository } from '../core/repositories/MachineryRepository.js';
import { reportRepository } from '../core/repositories/ReportRepository.js';
import { userRepository } from '../core/repositories/UserRepository.js';

const MAX_REPORTS_BEFORE_SUSPENSION = 3;

export class ReportService {
  static submit(reportData) {
    const reporterName = String(reportData.reporterName || '').trim();
    const reporterAddress = String(reportData.reporterAddress || '').trim();
    const cause = String(reportData.cause || '').trim();
    const reporter = userRepository.getById(reportData.reporterId);
    const machinery = machineryRepository.getById(reportData.machineryId);
    const targetOwner = machinery && userRepository.getById(machinery.ownerId);

    if (!reporterName || !reporterAddress || !cause || !reportData.evidence?.id) {
      throw new Error('Completa tus datos, describe la causa y adjunta las pruebas.');
    }
    if (!machinery) throw new Error('No se encontró la maquinaria asociada al reporte.');
    if (!targetOwner || targetOwner.role !== UserRole.OWNER) {
      throw new Error('No se encontró al propietario que intentas reportar.');
    }
    if (!reporter) throw new Error('Inicia sesión para enviar un reporte.');
    if (targetOwner.suspended) {
      throw new Error('Este propietario ya está suspendido.');
    }
    if (reporter.id === targetOwner.id) {
      throw new Error('No puedes reportarte a ti mismo.');
    }
    if (reportRepository.getByReportedOwnerId(targetOwner.id).some(report => report.reporterId === reporter.id)) {
      throw new Error('Ya enviaste un reporte contra este propietario.');
    }

    const report = reportRepository.create({
      reporterId: reportData.reporterId,
      reporterName: reporterName.slice(0, 120),
      reporterAddress: reporterAddress.slice(0, 180),
      machineryId: machinery.id,
      reportedOwnerId: targetOwner.id,
      reportedOwnerName: targetOwner.name,
      machineryTitle: String(machinery.title || '').slice(0, 120),
      cause: cause.slice(0, 1000),
      evidence: reportData.evidence
    });

    const ownerReports = reportRepository.getByReportedOwnerId(targetOwner.id);
    if (ownerReports.length >= MAX_REPORTS_BEFORE_SUSPENSION) {
      userRepository.update(targetOwner.id, {
        suspended: true,
        suspensionReason: `Suspendido automáticamente al recibir ${MAX_REPORTS_BEFORE_SUSPENSION} reportes.`
      });
      machineryRepository.getByOwnerId(targetOwner.id).forEach(item => {
        machineryRepository.updateStatus(item.id, MachineryStatus.SUSPENDED);
      });
    }

    return { report, reportCount: ownerReports.length, suspended: ownerReports.length >= MAX_REPORTS_BEFORE_SUSPENSION };
  }
}
