import { useState } from 'react';
import { AlertCircle, FileText, Flag, UploadCloud, X } from 'lucide-react';
import { deleteDocument, saveDocument } from '../../../core/storage/DocumentStorage.js';
import { validateDocumentFile } from '../../../core/security/FileValidation.js';

export const ReportOwnerModal = ({
  machinery,
  currentUser,
  onClose,
  onSubmitReport
}) => {
  const [reporterName, setReporterName] = useState(currentUser?.name || '');
  const [reporterAddress, setReporterAddress] = useState(currentUser?.address || '');
  const [cause, setCause] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!machinery) return null;

  const handleEvidenceChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      await validateDocumentFile(file);
      setEvidenceFile(file);
      setError('');
    } catch (validationError) {
      setEvidenceFile(null);
      setError(validationError.message || 'El archivo de prueba no es válido.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!evidenceFile) {
      setError('Adjunta al menos una prueba para enviar el reporte.');
      return;
    }

    setIsSaving(true);
    let evidence;
    try {
      evidence = await saveDocument(evidenceFile);
      await onSubmitReport({
        reporterId: currentUser?.id || null,
        reporterName,
        reporterAddress,
        machineryId: machinery.id,
        cause,
        evidence
      });
      onClose();
    } catch (submitError) {
      let message = submitError.message || 'No se pudo enviar el reporte.';
      if (evidence?.id) {
        try {
          await deleteDocument(evidence.id);
        } catch (cleanupError) {
          message = `${message} No se pudo eliminar la prueba temporal: ${cleanupError.message}`;
        }
      }
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '620px' }} onClick={event => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Reportar propietario</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Maquinaria: {machinery.title} · Propietario: {machinery.ownerName}
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div role="alert" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                marginBottom: '1rem',
                borderRadius: 'var(--radius-md)',
                color: '#fca5a5',
                background: 'rgba(239, 68, 68, 0.15)'
              }}>
                <AlertCircle size={17} />
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="reporter-name">Tu nombre completo *</label>
              <input
                id="reporter-name"
                className="form-input"
                value={reporterName}
                onChange={event => setReporterName(event.target.value)}
                maxLength={120}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reporter-address">Tu dirección o comunidad *</label>
              <input
                id="reporter-address"
                className="form-input"
                value={reporterAddress}
                onChange={event => setReporterAddress(event.target.value)}
                maxLength={180}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Persona reportada</label>
              <input className="form-input" value={machinery.ownerName || ''} readOnly />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="report-cause">Causa del reporte *</label>
              <textarea
                id="report-cause"
                className="form-textarea"
                rows="4"
                value={cause}
                onChange={event => setCause(event.target.value)}
                maxLength={1000}
                placeholder="Describe qué ocurrió, cuándo y dónde."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="report-evidence">Pruebas adjuntas *</label>
              <input
                id="report-evidence"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                onChange={handleEvidenceChange}
                required={!evidenceFile}
              />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                PDF, JPG, PNG o WebP · máximo 5 MB
              </div>
              {evidenceFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#86efac', marginTop: '0.5rem' }}>
                  <FileText size={15} />
                  {evidenceFile.name}
                </div>
              )}
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Al recibir tres reportes, el propietario y su maquinaria serán suspendidos automáticamente.
            </p>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? <UploadCloud size={16} /> : <Flag size={16} />}
              {isSaving ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
