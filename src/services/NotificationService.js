const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const request = async (path, body) => {
  if (!API_BASE_URL) {
    throw new Error('Las notificaciones SMS requieren configurar VITE_API_BASE_URL y el servicio de backend.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error('No se pudo completar la solicitud de notificación. Inténtalo más tarde.');
  }
  return response.json();
};

export const NotificationService = {
  requestPasswordReset(phone) {
    return request('/auth/password-reset', { phone });
  },

  confirmPasswordReset({ phone, code, password }) {
    return request('/auth/password-reset/confirm', { phone, code, password });
  },

  sendCashEvidenceReminder({ phone, reservationId }) {
    return request('/notifications/cash-evidence', { phone, reservationId });
  }
};
