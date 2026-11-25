import { useState, useEffect, useCallback } from 'react';
import { UserRole } from './core/models/User.js';
import { userRepository } from './core/repositories/UserRepository.js';
import { machineryRepository } from './core/repositories/MachineryRepository.js';
import { reservationRepository } from './core/repositories/ReservationRepository.js';
import { AuthService } from './services/AuthService.js';
import { ModerationService } from './services/ModerationService.js';
import { AuditService } from './services/AuditService.js';
import { ReservationStatus } from './core/models/Reservation.js';
import { saveDocument } from './core/storage/DocumentStorage.js';
import { NotificationService } from './services/NotificationService.js';
import { hashPassword } from './core/security/PasswordSecurity.js';

// Presentation Layer - Public / Field Modules (Productor & Propietario)
import { Navbar } from './presentation/components/Navbar.jsx';
import { ProducerCatalog } from './presentation/modules/producer/ProducerCatalog.jsx';
import { MachineryDetailModal } from './presentation/modules/producer/MachineryDetailModal.jsx';
import { RentalRequestModal } from './presentation/modules/producer/RentalRequestModal.jsx';
import { ReservationHistory } from './presentation/modules/producer/ReservationHistory.jsx';
import { OwnerFleetManager } from './presentation/modules/owner/OwnerFleetManager.jsx';
import { AddMachineryModal } from './presentation/modules/owner/AddMachineryModal.jsx';
import { AuthModal } from './presentation/modules/auth/AuthModal.jsx';
import { ProducerRegistrationModal } from './presentation/modules/auth/ProducerRegistrationModal.jsx';
import { OwnerRegistrationModal } from './presentation/modules/auth/OwnerRegistrationModal.jsx';

// Presentation Layer - Dedicated Separate Administrator Module
import { AdminPortalLayout } from './presentation/modules/admin/AdminPortalLayout.jsx';

// Styles
import './presentation/styles/global.css';
import './presentation/styles/components.css';
import './presentation/styles/modules.css';

export default function App() {
  // Portal View Separation: 'public' (Productor / Propietario) vs 'admin' (Portal de Administración)
  const [currentPortal, setCurrentPortal] = useState(() => (
    window.location.pathname === '/admin' ? 'admin' : 'public'
  ));

  // Reactive state synced with Data Layer
  const [currentUser, setCurrentUser] = useState(() => AuthService.getCurrentUser());
  const [activeRole, setActiveRole] = useState(UserRole.PRODUCER);
  const [producerView, setProducerView] = useState('catalog'); // 'catalog' | 'reservations'
  
  const [allUsers, setAllUsers] = useState(() => userRepository.getAll());
  const [machineryList, setMachineryList] = useState(() => machineryRepository.getAll());
  const [reservations, setReservations] = useState(() => reservationRepository.getAll());

  // Modals state
  const [selectedMachineryForDetail, setSelectedMachineryForDetail] = useState(null);
  const [selectedMachineryForRent, setSelectedMachineryForRent] = useState(null);
  const [isAddMachineryOpen, setIsAddMachineryOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProducerRegisterOpen, setIsProducerRegisterOpen] = useState(false);
  const [isOwnerRegisterOpen, setIsOwnerRegisterOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Sync state when StorageAdapter dispatches events
  const refreshData = useCallback(() => {
    setAllUsers(userRepository.getAll());
    setMachineryList(machineryRepository.getAll());
    setReservations(reservationRepository.getAll());
    setCurrentUser(AuthService.getCurrentUser());
  }, []);

  useEffect(() => {
    const handleSync = () => refreshData();
    window.addEventListener('agrorenta_storage_sync', handleSync);
    return () => window.removeEventListener('agrorenta_storage_sync', handleSync);
  }, [refreshData]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPortal(window.location.pathname === '/admin' ? 'admin' : 'public');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle Public Role Switch (Productor vs Propietario)
  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
    if (currentUser?.role !== newRole) {
      const match = allUsers.find(u => u.role === newRole) || allUsers[0];
      if (match) {
        AuthService.switchUser(match.id);
        setCurrentUser(match);
      }
    }
    showToast(`Perspectiva cambiada a: ${newRole === UserRole.OWNER ? 'Propietario (Mi Flota)' : 'Productor Agrícola (Rentas)'}`);
  };

  // --- BUSINESS LOGIC HANDLERS ---

  // 1. Submit Rental Request (Productor)
  const handleSubmitReservation = (reservationPayloads) => {
    const requests = Array.isArray(reservationPayloads) ? reservationPayloads : [reservationPayloads];
    const created = requests.map(payload => reservationRepository.create(payload));
    created.forEach(reservation => AuditService.log({
      action: 'SOLICITUD_RENTA',
      category: 'RENTA',
      target: reservation.machineryTitle,
      details: `Productor: ${reservation.producerName}, Monto: $${reservation.totalCost?.toLocaleString()} MXN (${reservation.paymentMethod})`,
      status: 'INFO'
    }));
    showToast(`Se enviaron ${created.length} solicitud(es) de renta.`);
    setProducerView('reservations');

    created.filter(reservation => reservation.paymentMethod === 'EFECTIVO').forEach(reservation => {
      NotificationService.sendCashEvidenceReminder({
        phone: reservation.producerPhone,
        reservationId: reservation.id
      }).catch(error => {
        showToast(`Solicitud guardada; SMS no enviado. ${error.message}`);
      });
    });
  };

  const handleUploadPaymentEvidence = async (reservationId, file) => {
    if (!file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) {
      showToast('Selecciona una foto de máximo 8 MB.');
      return;
    }
    try {
      const document = await saveDocument(file);
      const updated = reservationRepository.updatePaymentEvidence(reservationId, document);
      if (!updated) throw new Error('No se encontró la solicitud de renta.');
      showToast('Evidencia guardada en este dispositivo.');
    } catch (error) {
      showToast(error.message || 'No se pudo guardar la evidencia.');
    }
  };

  // 2. Cancel Reservation (Productor)
  const handleCancelReservation = (reservationId) => {
    if (window.confirm('¿Deseas cancelar esta solicitud de renta?')) {
      reservationRepository.updateStatus(reservationId, ReservationStatus.CANCELLED);
      AuditService.log({
        action: 'CANCELACION_RENTA',
        category: 'RENTA',
        target: `Reserva #${reservationId}`,
        details: 'Cancelada directamente por el productor.',
        status: 'WARNING'
      });
      showToast('Solicitud de renta cancelada.');
    }
  };

  // 3. Owner Actions
  const handleSaveMachinery = (machineryData) => {
    const created = machineryRepository.create(machineryData);
    AuditService.log({
      action: 'ALTA_MAQUINARIA',
      category: 'MAQUINARIA',
      target: created.title,
      details: `Propietario: ${created.ownerName}, Tarifa: $${created.rentalRate} / ${created.rateType}`,
      status: 'INFO'
    });
    showToast(`Maquinaria "${created.title}" registrada exitosamente.`);
  };

  const handleToggleMaintenance = (machineryId) => {
    const updated = ModerationService.toggleMaintenance(machineryId);
    if (updated) {
      showToast(`Estado de mantenimiento actualizado.`);
    }
  };

  const handleToggleBlockedDate = (machineryId, dateStr, shouldBlock) => {
    if (shouldBlock) {
      machineryRepository.addBlockedDate(machineryId, dateStr);
      showToast(`Fecha ${dateStr} bloqueada por mantenimiento.`);
    } else {
      machineryRepository.removeBlockedDate(machineryId, dateStr);
      showToast(`Fecha ${dateStr} desbloqueada.`);
    }
  };

  const handleDeleteMachinery = (machineryId) => {
    machineryRepository.delete(machineryId);
    showToast('Maquinaria eliminada de la flota.');
  };

  const handleApproveRequest = (reservationId) => {
    reservationRepository.updateStatus(reservationId, ReservationStatus.APPROVED);
    showToast('¡Solicitud aprobada! El productor ha sido notificado.');
  };

  const handleRejectRequest = (reservationId, reason) => {
    reservationRepository.updateStatus(reservationId, ReservationStatus.REJECTED, reason);
    showToast('Solicitud rechazada con motivo registrado.');
  };

  const handleSetActiveRequest = (reservationId) => {
    reservationRepository.updateStatus(reservationId, ReservationStatus.ACTIVE);
    showToast('Maquinaria marcada como "En Campo / Activa".');
  };

  const handleCompleteRequest = (reservationId) => {
    reservationRepository.updateStatus(reservationId, ReservationStatus.COMPLETED);
    showToast('¡Renta completada exitosamente!');
  };

  // 4. Admin Actions
  const handleApproveMachineryAdmin = (machineryId) => {
    const mac = machineryList.find(m => m.id === machineryId);
    ModerationService.approveMachinery(machineryId);
    AuditService.log({
      action: 'MODERACION_APROBADA',
      category: 'MAQUINARIA',
      target: mac ? mac.title : machineryId,
      details: 'Anuncio verificado y activado para el catálogo general.',
      status: 'SUCCESS'
    });
    refreshData();
    showToast('Anuncio verificado y aprobado para el catálogo general.');
  };

  const handleRejectMachineryAdmin = (machineryId, reason) => {
    const mac = machineryList.find(m => m.id === machineryId);
    ModerationService.rejectMachinery(machineryId, reason);
    AuditService.log({
      action: 'MODERACION_RECHAZADA',
      category: 'MAQUINARIA',
      target: mac ? mac.title : machineryId,
      details: reason,
      status: 'WARNING'
    });
    refreshData();
    showToast('Anuncio rechazado por moderación de seguridad.');
  };

  const handleToggleVerifyUser = (userId) => {
    const updated = userRepository.toggleVerify(userId);
    AuditService.log({
      action: 'CERTIFICACION_IDENTIDAD',
      category: 'USUARIO',
      target: updated.name,
      details: updated.verified ? 'Certificación de identidad activada.' : 'Certificación de identidad revocada.',
      status: 'INFO'
    });
    refreshData();
    showToast(`Usuario ${updated.name} ahora está ${updated.verified ? 'Verificado' : 'Sin Verificar'}.`);
  };

  const handleApproveOwnerAdmin = (ownerId) => {
    const owner = allUsers.find(u => u.id === ownerId);
    AuthService.approveOwner(ownerId);
    AuditService.log({
      action: 'APROBACION_PROPIETARIO',
      category: 'PROPIETARIO',
      target: owner ? owner.name : ownerId,
      details: 'Identificación INE cotejada y maquinaria autorizada en el catálogo oficial.',
      status: 'SUCCESS'
    });
    refreshData();
    showToast('¡Propietario aprobado! Su cuenta está verificada y su maquinaria publicada.');
  };

  const handleRejectOwnerAdmin = (ownerId, reason) => {
    const owner = allUsers.find(u => u.id === ownerId);
    AuthService.rejectOwner(ownerId, reason);
    AuditService.log({
      action: 'RECHAZO_PROPIETARIO',
      category: 'PROPIETARIO',
      target: owner ? owner.name : ownerId,
      details: reason,
      status: 'WARNING'
    });
    refreshData();
    showToast('Solicitud de propietario rechazada con motivo registrado.');
  };

  const handleCreateUserAdmin = (userData) => {
    const newUser = userRepository.create(userData);
    AuditService.log({
      action: 'ALTA_USUARIO',
      category: 'USUARIO',
      target: newUser.name,
      details: `Rol: ${newUser.role}, Comunidad: ${newUser.community}`,
      status: 'SUCCESS'
    });
    refreshData();
    showToast(`Usuario ${newUser.name} registrado en el padrón oficial.`);
  };

  const handleUpdateReservationStatusAdmin = (reservationId, newStatus, reason = '') => {
    reservationRepository.updateStatus(reservationId, newStatus, reason);
    AuditService.log({
      action: 'INTERVENCION_RENTA',
      category: 'RENTA',
      target: `Reserva #${reservationId}`,
      details: `Estado actualizado a ${newStatus}. ${reason ? 'Motivo: ' + reason : ''}`,
      status: 'INFO'
    });
    refreshData();
    showToast(`Renta #${reservationId} actualizada a ${newStatus}.`);
  };

  // 5. User / Auth Actions
  const handleSwitchUser = (userId) => {
    const user = AuthService.switchUser(userId);
    if (user) {
      setCurrentUser(user);
      setActiveRole(user.role);
      showToast(`Sesión iniciada como ${user.name}`);
    }
  };

  const handleUpdateLocalPassword = async (phone, password) => {
    const normalizePhone = value => String(value || '').replace(/\D/g, '');
    const user = allUsers.find(account => normalizePhone(account.phone) === normalizePhone(phone));
    if (!user) throw new Error('El teléfono no coincide con una cuenta guardada en esta demostración.');
    const credentials = await hashPassword(password);
    userRepository.update(user.id, credentials);
    refreshData();
  };

  const handleRegisterProducer = async (producerData) => {
    try {
      const newUser = await AuthService.registerProducer(producerData);
      setCurrentUser(newUser);
      setActiveRole(UserRole.PRODUCER);
      setProducerView('catalog');
      showToast(`¡Bienvenido a AgroRenta Candelaria, ${newUser.name}! Tu cuenta está verificada con INE.`);
      return true;
    } catch (err) {
      showToast(err.message || 'Error al registrar la cuenta de productor.');
      return false;
    }
  };

  const handleRegisterOwnerWithMachinery = async ({ ownerData, machineryData }) => {
    try {
      const { machinery } = await AuthService.registerOwnerWithMachinery({ ownerData, machineryData });
      AuditService.log({
        action: 'REGISTRO_PROPIETARIO_SOLICITADO',
        category: 'PROPIETARIO',
        target: `${ownerData.name} ${ownerData.lastName || ''}`,
        details: `Maquinaria adjunta: ${machineryData.title}. Esperando cotejo de INE.`,
        status: 'INFO'
      });
      refreshData();
      showToast(`¡Solicitud enviada! Tu cuenta y "${machinery?.title || 'tu maquinaria'}" están en revisión administrativa.`);
      return true;
    } catch (err) {
      showToast(err.message || 'Error al registrar propietario.');
      return false;
    }
  };

  // Filtered collections for current owner
  const currentOwnerFleet = machineryList.filter(m => m.ownerId === currentUser?.id);
  const currentOwnerRequests = reservations.filter(r => r.ownerId === currentUser?.id);
  const currentProducerReservations = reservations.filter(r => r.producerId === currentUser?.id);

  // ==========================================
  // VIEW MODE 1: SEPARATED ADMINISTRATOR PORTAL
  // ==========================================
  if (currentPortal === 'admin') {
    return (
      <div className="app-container">
        {toastMessage && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
            color: '#ffffff',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg), var(--shadow-glow-green)',
            border: '1px solid rgba(74, 222, 128, 0.4)',
            zIndex: 9999,
            fontWeight: 600,
            fontSize: '0.9rem',
            animation: 'slideUp 250ms ease'
          }}>
            {toastMessage}
          </div>
        )}

        <AdminPortalLayout
          users={allUsers}
          machineryList={machineryList}
          reservations={reservations}
          currentUser={currentUser}
          onExitAdmin={() => {
            window.history.pushState({}, '', '/');
            setCurrentPortal('public');
            showToast('Has regresado al portal de productores y propietarios.');
          }}
          onApproveMachinery={handleApproveMachineryAdmin}
          onRejectMachinery={handleRejectMachineryAdmin}
          onToggleVerifyUser={handleToggleVerifyUser}
          onApproveOwner={handleApproveOwnerAdmin}
          onRejectOwner={handleRejectOwnerAdmin}
          onCreateUser={handleCreateUserAdmin}
          onUpdateReservationStatus={handleUpdateReservationStatusAdmin}
        />
      </div>
    );
  }

  // ==========================================
  // VIEW MODE 2: PUBLIC / FIELD PORTALS (PRODUCTOR Y PROPIETARIO)
  // ==========================================
  return (
    <div className="app-container">
      {/* Toast Feedback */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow-green)',
          border: '1px solid rgba(74, 222, 128, 0.4)',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.9rem',
          animation: 'slideUp 250ms ease'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Navigation for Field Portals */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        onTabChange={(tab) => setProducerView(tab)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProducerRegister={() => setIsProducerRegisterOpen(true)}
        onOpenOwnerRegister={() => setIsOwnerRegisterOpen(true)}
      />

      {/* Main Body depending on Active Role */}
      <main className="main-content">
        {/* ROLE A: PRODUCTOR / CLIENTE (Los que rentan) */}
        {activeRole === UserRole.PRODUCER && (
          producerView === 'catalog' ? (
            <ProducerCatalog
              machineryList={machineryList}
              onSelectMachinery={(mac) => setSelectedMachineryForDetail(mac)}
              onOpenRentModal={(mac) => setSelectedMachineryForRent(mac)}
              onViewReservations={() => setProducerView('reservations')}
              pendingReservationsCount={currentProducerReservations.filter(r => r.status === 'PENDING').length}
            />
          ) : (
            <div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setProducerView('catalog')}
                style={{ marginBottom: '1.25rem' }}
              >
                ← Volver al Catálogo de Maquinaria
              </button>
              <ReservationHistory
                reservations={currentProducerReservations}
                onCancelReservation={handleCancelReservation}
                onUploadPaymentEvidence={handleUploadPaymentEvidence}
              />
            </div>
          )
        )}

        {/* ROLE B: PROPIETARIO / PROVEEDOR (Los que ponen en renta) */}
        {activeRole === UserRole.OWNER && (
          <OwnerFleetManager
            currentUser={currentUser}
            fleet={currentOwnerFleet}
            requests={currentOwnerRequests}
            onSaveMachinery={handleSaveMachinery}
            onToggleMaintenance={handleToggleMaintenance}
            onToggleBlockedDate={handleToggleBlockedDate}
            onDeleteMachinery={handleDeleteMachinery}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onSetActiveRequest={handleSetActiveRequest}
            onCompleteRequest={handleCompleteRequest}
          />
        )}
      </main>

      {/* Detail Modal */}
      <MachineryDetailModal
        machinery={selectedMachineryForDetail}
        isOpen={Boolean(selectedMachineryForDetail)}
        onClose={() => setSelectedMachineryForDetail(null)}
        onOpenRentModal={(mac) => setSelectedMachineryForRent(mac)}
      />

      {/* Rental Request Modal */}
      <RentalRequestModal
        machinery={selectedMachineryForRent}
        currentUser={currentUser}
        isOpen={Boolean(selectedMachineryForRent)}
        onClose={() => setSelectedMachineryForRent(null)}
        onSubmitReservation={handleSubmitReservation}
      />

      {/* Add Machinery Modal (for already approved owners) */}
      <AddMachineryModal
        isOpen={isAddMachineryOpen}
        onClose={() => setIsAddMachineryOpen(false)}
        currentUser={currentUser}
        onSaveMachinery={handleSaveMachinery}
      />

      {/* Auth / Account Switch Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        onPasswordReset={handleUpdateLocalPassword}
        onOpenProducerRegister={() => {
          setIsAuthModalOpen(false);
          setIsProducerRegisterOpen(true);
        }}
        onOpenOwnerRegister={() => {
          setIsAuthModalOpen(false);
          setIsOwnerRegisterOpen(true);
        }}
      />

      {/* 1. Portal de Registro de Productores (Los que van a rentar) */}
      <ProducerRegistrationModal
        isOpen={isProducerRegisterOpen}
        onClose={() => setIsProducerRegisterOpen(false)}
        onRegisterProducer={handleRegisterProducer}
        onSwitchToOwnerRegister={() => {
          setIsProducerRegisterOpen(false);
          setIsOwnerRegisterOpen(true);
        }}
      />

      {/* 2. Portal de Registro de Propietarios y Maquinaria (Con fotos e INE) */}
      <OwnerRegistrationModal
        isOpen={isOwnerRegisterOpen}
        onClose={() => setIsOwnerRegisterOpen(false)}
        onRegisterOwnerWithMachinery={handleRegisterOwnerWithMachinery}
        onSwitchToProducerRegister={() => {
          setIsOwnerRegisterOpen(false);
          setIsProducerRegisterOpen(true);
        }}
      />
    </div>
  );
}
