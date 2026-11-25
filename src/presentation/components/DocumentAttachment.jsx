import { useEffect, useState } from 'react';
import { getDocumentBlob } from '../../core/storage/DocumentStorage.js';

export const DocumentAttachment = ({ document: documentRef }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    setUrl('');
    setError('');

    if (!documentRef?.id) {
      setError('No hay archivo adjunto');
      return undefined;
    }

    getDocumentBlob(documentRef.id)
      .then(record => {
        if (!record) throw new Error('El archivo no está disponible en este dispositivo.');
        objectUrl = URL.createObjectURL(record.blob);
        if (active) setUrl(objectUrl);
      })
      .catch(() => {
        if (active) setError('Archivo no disponible en este dispositivo');
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentRef?.id]);

  if (!documentRef) return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No hay archivo adjunto</span>;
  if (error) return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{error}</span>;

  return (
    <a
      href={url || undefined}
      target="_blank"
      rel="noreferrer"
      className="document-attachment"
      aria-disabled={!url}
    >
      {documentRef.name}
    </a>
  );
};
