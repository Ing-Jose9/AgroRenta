import React from 'react';
import { AnalyticsService } from '../../../services/AnalyticsService.js';
import { DollarSign, CheckCircle2, Tractor, Users, MapPin, TrendingUp, BarChart3 } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const metrics = AnalyticsService.getMetrics();

  // Find max community volume for relative progress bar calculation
  const communityEntries = Object.entries(metrics.communityActivity || {});
  const maxCommunityRentals = Math.max(...communityEntries.map(([_, data]) => data.reservationsCount), 1);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          Reportes y Estadísticas del Municipio de Candelaria
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Métricas de impacto productivo, mecanización agrícola y distribución económica en el municipio.
        </p>
      </div>

      {/* Top 4 Global KPI Cards */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--accent-400)' }}>
              {metrics.formattedRevenue}
            </div>
            <div className="stat-label">Derrama Económica Movilizada</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">{metrics.successfulReservationsCount}</div>
            <div className="stat-label">Rentas Efectivas en Campo</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd' }}>
            <Tractor size={24} />
          </div>
          <div>
            <div className="stat-value">{metrics.activeMachineryCount}</div>
            <div className="stat-label">Equipos Verificados Activos</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{metrics.totalUsers}</div>
            <div className="stat-label">Productores y Dueños Registrados</div>
          </div>
        </div>
      </div>

      {/* Two Columns: Community Activity + Top Requested Machinery */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        {/* Community Activity Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <MapPin size={20} color="#4ade80" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Actividad Agrícola por Comunidades
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {communityEntries.map(([community, data]) => {
              const percentage = Math.round((data.reservationsCount / maxCommunityRentals) * 100);
              return (
                <div key={community}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600 }}>{community}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {data.reservationsCount} rentas • {data.machineryCount} equipos disponibles
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.max(percentage, 8)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #16a34a 0%, #4ade80 100%)',
                      borderRadius: '4px',
                      transition: 'width 800ms ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Demanded Machinery */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <TrendingUp size={20} color="#fbbf24" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Maquinaria con Mayor Demanda en Candelaria
            </h4>
          </div>

          {metrics.topRequested?.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Aún no hay suficientes datos registrados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {metrics.topRequested.map((item, index) => (
                <div
                  key={item.title}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: index === 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.06)',
                      color: index === 0 ? '#fbbf24' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8rem'
                    }}>
                      #{index + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-approved" style={{ fontSize: '0.75rem' }}>
                      {item.count} {item.count === 1 ? 'renta' : 'rentas'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
