/**
 * Repositorio de Usuarios (Capa 3: Acceso a Datos)
 */

import { storage, STORAGE_KEYS } from '../storage/StorageAdapter.js';
import { User } from '../models/User.js';

export class UserRepository {
  getAll() {
    const list = storage.get(STORAGE_KEYS.USERS, []);
    return list.map(item => new User(item));
  }

  getById(id) {
    const list = this.getAll();
    return list.find(u => u.id === id) || null;
  }

  getByRole(role) {
    const list = this.getAll();
    return list.filter(u => u.role === role);
  }

  create(userData) {
    const list = storage.get(STORAGE_KEYS.USERS, []);
    const newUser = new User({
      id: 'usr_' + Date.now().toString(36),
      ...userData,
      createdAt: new Date().toISOString()
    });
    list.unshift(newUser);
    storage.set(STORAGE_KEYS.USERS, list);
    return newUser;
  }

  update(id, updates) {
    const list = storage.get(STORAGE_KEYS.USERS, []);
    const index = list.findIndex(u => u.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates };
    storage.set(STORAGE_KEYS.USERS, list);
    return new User(list[index]);
  }

  toggleVerify(id) {
    const user = this.getById(id);
    if (!user) return null;
    return this.update(id, { verified: !user.verified });
  }

  delete(id) {
    const list = storage.get(STORAGE_KEYS.USERS, []);
    const filtered = list.filter(u => u.id !== id);
    storage.set(STORAGE_KEYS.USERS, filtered);
    return true;
  }
}

export const userRepository = new UserRepository();
