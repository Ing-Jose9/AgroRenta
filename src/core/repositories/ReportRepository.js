import { storage, STORAGE_KEYS } from '../storage/StorageAdapter.js';

export class ReportRepository {
  getAll() {
    return storage.get(STORAGE_KEYS.REPORTS, []);
  }

  getByReportedOwnerId(ownerId) {
    return this.getAll().filter(report => report.reportedOwnerId === ownerId);
  }

  create(reportData) {
    const reports = this.getAll();
    const report = {
      id: `rep_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      ...reportData,
      createdAt: new Date().toISOString()
    };
    reports.unshift(report);
    storage.set(STORAGE_KEYS.REPORTS, reports);
    return report;
  }
}

export const reportRepository = new ReportRepository();
