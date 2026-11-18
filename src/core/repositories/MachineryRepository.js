/**
 * Repositorio de Maquinaria Agrícola (Capa 3: Acceso a Datos)
 */

import { storage, STORAGE_KEYS } from '../storage/StorageAdapter.js';
import { Machinery, MachineryStatus } from '../models/Machinery.js';

export class MachineryRepository {
  getAll() {
    const list = storage.get(STORAGE_KEYS.MACHINERY, []);
    return list.map(item => new Machinery(item));
  }

  getById(id) {
    const list = this.getAll();
    return list.find(m => m.id === id) || null;
  }

  getByOwnerId(ownerId) {
    const list = this.getAll();
    return list.filter(m => m.ownerId === ownerId);
  }

  getActiveApproved() {
    const list = this.getAll();
    return list.filter(m => m.status === MachineryStatus.ACTIVE);
  }

  create(machineryData) {
    const list = storage.get(STORAGE_KEYS.MACHINERY, []);
    const newMachinery = new Machinery({
      id: 'mac_' + Date.now().toString(36),
      ...machineryData,
      status: machineryData.status || MachineryStatus.PENDING_REVIEW,
      createdAt: new Date().toISOString()
    });
    list.unshift(newMachinery);
    storage.set(STORAGE_KEYS.MACHINERY, list);
    return newMachinery;
  }

  update(id, updates) {
    const list = storage.get(STORAGE_KEYS.MACHINERY, []);
    const index = list.findIndex(m => m.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    storage.set(STORAGE_KEYS.MACHINERY, list);
    return new Machinery(list[index]);
  }

  updateStatus(id, newStatus) {
    return this.update(id, { status: newStatus });
  }

  addBlockedDate(id, dateStr) {
    const item = this.getById(id);
    if (!item) return null;
    const dates = new Set(item.blockedDates || []);
    dates.add(dateStr);
    return this.update(id, { blockedDates: Array.from(dates) });
  }

  removeBlockedDate(id, dateStr) {
    const item = this.getById(id);
    if (!item) return null;
    const dates = (item.blockedDates || []).filter(d => d !== dateStr);
    return this.update(id, { blockedDates: dates });
  }

  delete(id) {
    const list = storage.get(STORAGE_KEYS.MACHINERY, []);
    const filtered = list.filter(m => m.id !== id);
    storage.set(STORAGE_KEYS.MACHINERY, filtered);
    return true;
  }
}

export const machineryRepository = new MachineryRepository();
