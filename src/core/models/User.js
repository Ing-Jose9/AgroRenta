/**
 * Modelo de Usuario / Productor / Propietario / Administrador
 * Capa 3: Gestión de Información y Modelos de Dominio
 */

export const UserRole = {
  PRODUCER: 'PRODUCER',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN'
};

export const UserApprovalStatus = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED'
};

export class User {
  constructor({
    id,
    name,
    lastName = '',
    email,
    phone = '',
    password = '',
    role = UserRole.PRODUCER,
    community = 'Candelaria Cabecera',
    address = '',
    verified = false,
    approvalStatus = UserApprovalStatus.APPROVED,
    avatar = null,
    ineDocument = null,
    ineDocuments = [],
    rejectionReason = '',
    pendingMachinery = null,
    createdAt = new Date().toISOString()
  }) {
    this.id = id;
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.role = role;
    this.community = community;
    this.address = address;
    this.verified = verified;
    this.approvalStatus = approvalStatus;
    this.avatar = avatar;
    this.ineDocument = ineDocument;
    this.ineDocuments = ineDocuments;
    this.rejectionReason = rejectionReason;
    this.pendingMachinery = pendingMachinery;
    this.createdAt = createdAt;
  }
}
