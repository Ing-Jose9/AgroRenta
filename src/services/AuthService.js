/**
 * Servicio de Autenticación y Gestión de Sesión (Capa 2: Lógica de Negocio)
 */

import { storage, STORAGE_KEYS } from '../core/storage/StorageAdapter.js';
import { userRepository } from '../core/repositories/UserRepository.js';
import { machineryRepository } from '../core/repositories/MachineryRepository.js';
import { UserRole, UserApprovalStatus } from '../core/models/User.js';
import { MachineryStatus } from '../core/models/Machinery.js';
import { cleanText, normalizeEmail, normalizePhone, isValidEmail, validatePassword } from '../core/security/InputValidation.js';
import { hashPassword } from '../core/security/PasswordSecurity.js';

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
  static async registerProducer({
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
    const safeName = cleanText(name, 80);
    const safeLastName = cleanText(lastName, 100);
    const safeEmail = normalizeEmail(email);
    const passwordError = validatePassword(password);
    if (!safeName || !safeEmail) throw new Error('El nombre y el correo electrónico son obligatorios.');
    if (!isValidEmail(safeEmail)) throw new Error('Introduce un correo electrónico válido.');
    if (passwordError) throw new Error(passwordError);

    const fullName = safeLastName ? `${safeName} ${safeLastName}` : safeName;
    const passwordCredentials = await hashPassword(password);

    const newUser = userRepository.create({
      name: fullName,
      lastName: safeLastName,
      address: cleanText(address, 180),
      community: cleanText(community, 80),
      phone: normalizePhone(phone || '982 000 0000'),
      email: safeEmail,
      ...passwordCredentials,
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
  static async registerOwnerWithMachinery({ ownerData, machineryData }) {
    const ownerName = cleanText(ownerData.name, 80);
    const ownerLastName = cleanText(ownerData.lastName, 100);
    const ownerEmail = normalizeEmail(ownerData.email);
    const passwordError = validatePassword(ownerData.password);
    if (!ownerName || !ownerEmail) throw new Error('El nombre y correo del propietario son obligatorios.');
    if (!isValidEmail(ownerEmail)) throw new Error('Introduce un correo electrónico válido.');
    if (passwordError) throw new Error(passwordError);

    const fullName = ownerLastName ? `${ownerName} ${ownerLastName}` : ownerName;
    const passwordCredentials = await hashPassword(ownerData.password);

    // 1. Crear usuario propietario en estado PENDIENTE de aprobación
    const newOwner = userRepository.create({
      name: fullName,
      lastName: ownerLastName,
      email: ownerEmail,
      phone: normalizePhone(ownerData.phone || '982 000 0000'),
      ...passwordCredentials,
      role: UserRole.OWNER,
      community: cleanText(ownerData.community || 'San Miguel', 80),
      address: cleanText(ownerData.address || '', 180),
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
