import React from 'react';
import { X, Calendar, MapPin, Gauge, ShieldCheck, UserCheck, Wrench, Phone, MessageSquare } from 'lucide-react';
import { RentalCostService } from '../../../services/RentalCostService.js';
import { Badge } from '../../components/Badge.jsx';

export const MachineryDetailModal = ({
  machinery,
  isOpen,
  onClose,
  onOpenRentModal
}) => {
  if (!isOpen || !machinery) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Badge status={machinery.status} type="machinery" />
              <span className="badge badge-community">
                <MapPin size={12} />
                {machinery.zone}
              </span>
            </div>
            <h3 className="modal-title">{machinery.title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Main Photo Banner */}
          <div style={{
            height: '320px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            position: 'relative'
          }}>
            <img
              src={machinery.images?.[0] || '/images/tractor-john-deere.jpg'}
              alt={machinery.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              background: 'rgba(11, 19, 14, 0.85)',
              backdropFilter: 'blur(10px)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tarifa Oficial:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-400)' }}>
                ${machinery.rentalRate?.toLocaleString()} MXN{' '}
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  / {RentalCostService.getRateTypeLabel(machinery.rateType)}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div className="glass-panel" style={{ padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Gauge size={14} color="#4ade80" />
                Potencia del Motor
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.2rem' }}>
                {machinery.hp} HP
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} color="#fbbf24" />
                Año / Modelo
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.2rem' }}>
                {machinery.year} • {machinery.brand}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserCheck size={14} color="#38bdf8" />
                Disponibilidad de Operador
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.3rem', color: machinery.operatorAvailable ? '#4ade80' : 'var(--text-muted)' }}>
                {machinery.operatorAvailable ? `Sí (+$${machinery.operatorRate})` : 'Sin Operador'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Descripción Técnica y Estado
            </h4>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {machinery.description || 'Maquinaria en excelente estado mecánico, lista para labores agrícolas en el municipio de Candelaria.'}
            </p>
          </div>

          {/* Location & Owner info */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Propietario de la maquinaria:</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{machinery.ownerName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Ubicación base: {machinery.specificLocation || machinery.zone}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a
                href={`https://wa.me/52${machinery.ownerPhone?.replace(/\s+/g, '')}?text=Hola,%20me%20interesa%20rentar%20su%20maquinaria%20${encodeURIComponent(machinery.title)}%20en%20Candelaria`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <MessageSquare size={14} color="#22c55e" />
                WhatsApp
              </a>
              <a href={`tel:${machinery.ownerPhone}`} className="btn btn-secondary btn-sm">
                <Phone size={14} />
                Llamar
              </a>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onOpenRentModal(machinery);
            }}
          >
            <Calendar size={16} />
            Solicitar Renta Ahora
          </button>
        </div>
      </div>
    </div>
  );
};
