/**
 * Servicio de Autenticación y Gestión de Sesión (Capa 2: Lógica de Negocio)
 */

import { storage, STORAGE_KEYS } from '../core/storage/StorageAdapter.js';
import { userRepository } from '../core/repositories/UserRepository.js';
import { machineryRepository } from '../core/repositories/MachineryRepository.js';
import { UserRole, UserApprovalStatus } from '../core/models/User.js';
import { MachineryStatus } from '../core/models/Machinery.js';

export class AuthService {
  static getCurrentUser() {
    const currentId = storage.get(STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) return null;
    return userRepository.getById(currentId);
  }

  static switchUser(userId) {
    const user = userRepository.getById(userId);
    if (user) {
      storage.set(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    }
    return user;
  }

  /**
   * Registro de Productor (Los que van a rentar maquinaria)
   * Requiere: nombre, apellidos, dirección, credencial INE, correo y contraseña.
   */
  static registerProducer({
    name,
    lastName = '',
    address = '',
    community = 'San Miguel',
    phone = '',
    email,
    password,
    ineDocument = null,
    ineDocuments = [],
    avatar = null
  }) {
    if (!name || !email) {
      throw new Error('El nombre y el correo electrónico son obligatorios.');
    }

    const fullName = lastName ? `${name.trim()} ${lastName.trim()}` : name.trim();

    const newUser = userRepository.create({
      name: fullName,
      lastName,
      address,
      community,
      phone: phone || '982 000 0000',
      email: email.trim().toLowerCase(),
      password,
      role: UserRole.PRODUCER,
      verified: true, // Cuenta de productor verificada
      approvalStatus: UserApprovalStatus.APPROVED,
      ineDocument: ineDocument || 'INE_REGISTRADA_DIGITAL.PDF',
      ineDocuments,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    this.switchUser(newUser.id);
    return newUser;
  }

  /**
   * Registro de Propietario con Maquinaria (Los que ofrecen maquinaria en renta)
   * Requiere: nombre, apellidos, foto de perfil, credencial INE, fotos de maquinaria,
   * características, precios, etc.
   * Queda en estado PENDING hasta que el Administrador lo apruebe.
   */
  static registerOwnerWithMachinery({ ownerData, machineryData }) {
    if (!ownerData.name || !ownerData.email) {
      throw new Error('El nombre y correo del propietario son obligatorios.');
    }

    const fullName = ownerData.lastName
      ? `${ownerData.name.trim()} ${ownerData.lastName.trim()}`
      : ownerData.name.trim();

    // 1. Crear usuario propietario en estado PENDIENTE de aprobación
    const newOwner = userRepository.create({
      name: fullName,
      lastName: ownerData.lastName || '',
      email: ownerData.email.trim().toLowerCase(),
      phone: ownerData.phone || '982 000 0000',
      password: ownerData.password || '',
      role: UserRole.OWNER,
      community: ownerData.community || 'San Miguel',
      address: ownerData.address || '',
      verified: false,
      approvalStatus: UserApprovalStatus.PENDING,
      avatar: ownerData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      ineDocument: ownerData.ineDocument || 'INE_PROPIETARIO_VERIFICACION.PDF',
      ineDocuments: ownerData.ineDocuments || [],
      pendingMachinery: machineryData
    });

    // 2. Crear la maquinaria vinculada en estado PENDING_REVIEW
    let createdMachinery = null;
    if (machineryData && machineryData.title) {
      createdMachinery = machineryRepository.create({
        ...machineryData,
        ownerId: newOwner.id,
        ownerName: fullName,
        ownerPhone: newOwner.phone,
        status: MachineryStatus.PENDING_REVIEW
      });
    }

    return { user: newOwner, machinery: createdMachinery };
  }

  /**
   * Acción Administrativa: Aprobar solicitud de propietario y publicar su maquinaria
   */
  static approveOwner(userId) {
    const user = userRepository.update(userId, {
      approvalStatus: UserApprovalStatus.APPROVED,
      verified: true
    });

    // Activar todas sus maquinarias pendientes
    const userMachineries = machineryRepository.getByOwnerId(userId);
    userMachineries.forEach(m => {
      if (m.status === MachineryStatus.PENDING_REVIEW) {
        machineryRepository.updateStatus(m.id, MachineryStatus.ACTIVE);
      }
    });

    return user;
  }

  /**
   * Acción Administrativa: Rechazar solicitud de propietario
   */
  static rejectOwner(userId, reason = 'Documentación o datos inconsistentes.') {
    const user = userRepository.update(userId, {
      approvalStatus: UserApprovalStatus.REJECTED,
      rejectionReason: reason,
      verified: false
    });

    const userMachineries = machineryRepository.getByOwnerId(userId);
    userMachineries.forEach(m => {
      machineryRepository.update(m.id, {
        status: MachineryStatus.REJECTED,
        moderationNotes: reason
      });
    });

    return user;
  }
}
