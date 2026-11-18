import React, { useState, useMemo } from 'react';
import { X, Calendar as CalendarIcon, Wrench, Shield, Check, AlertTriangle, Info } from 'lucide-react';
import { AvailabilityService } from '../../../services/AvailabilityService.js';
import { reservationRepository } from '../../../core/repositories/ReservationRepository.js';
import { ReservationStatus } from '../../../core/models/Reservation.js';

export const AvailabilityCalendarModal = ({
  machinery,
  isOpen,
  onClose,
  onToggleBlockedDate
}) => {
  if (!isOpen || !machinery) return null;

  // Render a 30-day view from today
  const today = new Date();
  
  // Get all reserved dates for this machinery
  const reservations = reservationRepository.getAll().filter(
    r => r.machineryId === machinery.id &&
    (r.status === ReservationStatus.APPROVED || r.status === ReservationStatus.ACTIVE)
  );

  const reservedDatesSet = useMemo(() => {
    const set = new Set();
    reservations.forEach(r => {
      const dates = AvailabilityService.getDateRangeArray(r.startDate, r.endDate);
      dates.forEach(d => set.add(d));
    });
    return set;
  }, [reservations]);

  const blockedDatesSet = useMemo(() => {
    return new Set(machinery.blockedDates || []);
  }, [machinery.blockedDates]);

  // Generate 35 days grid
  const daysList = useMemo(() => {
    const days = [];
    const baseDate = new Date(today);
    baseDate.setDate(baseDate.getDate() - 2); // show from 2 days ago

    for (let i = 0; i < 28; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isPast = d < new Date().setHours(0, 0, 0, 0);
      const isReserved = reservedDatesSet.has(dateStr);
      const isBlocked = blockedDatesSet.has(dateStr);

      days.push({
        dateStr,
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('es-MX', { month: 'short' }),
        weekday: d.toLocaleDateString('es-MX', { weekday: 'narrow' }),
        isPast,
        isReserved,
        isBlocked
      });
    }
    return days;
  }, [reservedDatesSet, blockedDatesSet]);

  const handleDayClick = (day) => {
    if (day.isPast) return;
    if (day.isReserved) {
      alert('Esta fecha ya cuenta con una reserva activa aprobada con un productor.');
      return;
    }
    onToggleBlockedDate(machinery.id, day.dateStr, !day.isBlocked);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Gestión de Calendario y Disponibilidad</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {machinery.title}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.85rem',
            color: '#bfdbfe'
          }}>
            <Info size={18} />
            <span>
              Haz clic en cualquier día para <strong>bloquearlo por mantenimiento preventivo</strong> o desbloquearlo cuando esté listo.
            </span>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-subtle)', borderRadius: '3px' }}></div>
              <span>Disponible</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: '12px', height: '12px', background: 'rgba(239, 68, 68, 0.5)', border: '1px solid #ef4444', borderRadius: '3px' }}></div>
              <span>Mantenimiento (Bloqueado)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: '12px', height: '12px', background: 'rgba(59, 130, 246, 0.5)', border: '1px solid #3b82f6', borderRadius: '3px' }}></div>
              <span>Rentada en Campo</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {daysList.map((day) => {
              let cellClass = 'calendar-day-cell';
              if (day.isBlocked) cellClass += ' blocked';
              if (day.isReserved) cellClass += ' reserved';

              return (
                <div
                  key={day.dateStr}
                  className={cellClass}
                  style={{
                    opacity: day.isPast ? 0.35 : 1,
                    cursor: day.isPast ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => handleDayClick(day)}
                  title={`${day.dateStr} - ${day.isReserved ? 'Rentada' : day.isBlocked ? 'Mantenimiento' : 'Disponible'}`}
                >
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    {day.weekday}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                    {day.dayNum}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                    {day.monthName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
