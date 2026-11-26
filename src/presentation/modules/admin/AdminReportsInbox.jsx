import { AlertTriangle, FileWarning } from 'lucide-react';
import { DocumentAttachment } from '../../components/DocumentAttachment.jsx';

export const AdminReportsInbox = ({ reports = [], users = [] }) => {
  const reportCounts = reports.reduce((counts, report) => {
    counts[report.reportedOwnerId] = (counts[report.reportedOwnerId] || 0) + 1;
    return counts;
  }, {});

  return (
    <section className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Reportes de usuarios</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Evidencias recibidas y acumulado por propietario. Al tercer reporte se suspende la cuenta y su flota.
        </p>
      </div>

      {reports.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No hay reportes recibidos.</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.8rem' }}>
          {reports.map(report => {
            const reportedUser = users.find(user => user.id === report.reportedOwnerId);
            const count = reportCounts[report.reportedOwnerId] || 0;
            return (
              <article key={report.id} style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: '1rem',
                padding: '1rem',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.18)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <strong>{report.reportedOwnerName}</strong>
                    <span className="badge badge-pending">Reportes: {count}/3</span>
                    {reportedUser?.suspended && (
                      <span className="badge badge-rejected">
                        <AlertTriangle size={12} /> Suspendido
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Reportó {report.reporterName} · {report.reporterAddress} · {new Date(report.createdAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                    Maquinaria: {report.machineryTitle}
                  </div>
                  <p style={{ margin: '0.65rem 0', whiteSpace: 'pre-wrap' }}>{report.cause}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                    <FileWarning size={14} />
                    Prueba: <DocumentAttachment document={report.evidence} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
