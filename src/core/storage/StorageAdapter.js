/**
 * Adaptador de Almacenamiento Reactivo (Capa 3: Gestión de Información)
 * Utiliza LocalStorage con emisión de eventos en tiempo real para sincronización reactiva.
 */

import { SEED_USERS, SEED_MACHINERY, SEED_RESERVATIONS } from './seedData.js';

const STORAGE_KEYS = {
  USERS: 'agrorenta_users_v4',
  MACHINERY: 'agrorenta_machinery_v4',
  RESERVATIONS: 'agrorenta_reservations_v4',
  CURRENT_USER_ID: 'agrorenta_current_user_id_v4',
  INITIAL_OWNERS_MIGRATED: 'agrorenta_initial_owners_migrated_v2'
};

class StorageAdapter {
  constructor() {
    this.init();
  }

  init() {
    // Limpieza de versiones previas para reflejar la depuración estricta de usuarios y auditoría
    [
      'agrorenta_users_v1', 'agrorenta_machinery_v1', 'agrorenta_reservations_v1', 'agrorenta_current_user_id_v1',
      'agrorenta_users_v2', 'agrorenta_machinery_v2', 'agrorenta_reservations_v2', 'agrorenta_current_user_id_v2',
      'agrorenta_users_v3', 'agrorenta_machinery_v3', 'agrorenta_reservations_v3', 'agrorenta_current_user_id_v3',
      'agrorenta_audit_logs_v1'
    ].forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch (e) {
        // Ignorar si no está disponible
      }
    });

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.set(STORAGE_KEYS.USERS, SEED_USERS, false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MACHINERY)) {
      this.set(STORAGE_KEYS.MACHINERY, SEED_MACHINERY, false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESERVATIONS)) {
      this.set(STORAGE_KEYS.RESERVATIONS, SEED_RESERVATIONS, false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INITIAL_OWNERS_MIGRATED)) {
      const users = this.get(STORAGE_KEYS.USERS, []);
      const machinery = this.get(STORAGE_KEYS.MACHINERY, []);
      const existingUserIds = new Set(users.map(user => user.id));
      const existingMachineryIds = new Set(machinery.map(item => item.id));
      const seededUserIds = new Set(SEED_USERS.map(user => user.id));

      this.set(STORAGE_KEYS.USERS, [
        ...users,
        ...SEED_USERS.filter(user => !existingUserIds.has(user.id))
      ], false);
      this.set(STORAGE_KEYS.MACHINERY, [
        ...machinery,
        ...SEED_MACHINERY.filter(item => !existingMachineryIds.has(item.id))
      ], false);
      if (seededUserIds.has(this.get(STORAGE_KEYS.CURRENT_USER_ID))) {
        this.set(STORAGE_KEYS.CURRENT_USER_ID, null, false);
      }
      localStorage.setItem(STORAGE_KEYS.INITIAL_OWNERS_MIGRATED, 'true');
    }
  }

  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (err) {
      console.error(`Error reading ${key} from storage:`, err);
      return defaultValue;
    }
  }

  set(key, value, dispatch = true) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      if (dispatch && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('agrorenta_storage_sync', {
          detail: { key, value }
        }));
      }
    } catch (err) {
      console.error(`Error saving ${key} to storage:`, err);
    }
  }

  // Reset al estado inicial con datos de Candelaria
  resetToDefaults() {
    this.set(STORAGE_KEYS.USERS, SEED_USERS);
    this.set(STORAGE_KEYS.MACHINERY, SEED_MACHINERY);
    this.set(STORAGE_KEYS.RESERVATIONS, SEED_RESERVATIONS);
    this.set(STORAGE_KEYS.CURRENT_USER_ID, null);
  }
}

export const storage = new StorageAdapter();
export { STORAGE_KEYS };
