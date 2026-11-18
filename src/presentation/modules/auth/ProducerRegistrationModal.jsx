import { useState, useRef } from 'react';
import {
  X,
  User,
  MapPin,
  Phone,
  Mail,
  Lock,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { CANDELARIA_ZONES } from '../../../core/models/Machinery.js';
import { saveDocument } from '../../../core/storage/DocumentStorage.js';

export const ProducerRegistrationModal = ({
  isOpen,
  onClose,
  onRegisterProducer,
  onSwitchToOwnerRegister
}) => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [community, setCommunity] = useState(CANDELARIA_ZONES[0] || 'San Miguel');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ineFiles, setIneFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [customAvatarName, setCustomAvatarName] = useState('');
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleIneUpload = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const isPdf = file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const validTypes = files.every(file => isPdf(file) || file.type.startsWith('image/'));
    if (!validTypes || files.some(file => file.size > 8 * 1024 * 1024)) {
      setErrorMsg('Adjunta un PDF o hasta dos imágenes (JPG, PNG o WebP) de máximo 8 MB cada una.');
      return;
    }
    if ((files.some(isPdf) && files.length !== 1) || (!files.some(isPdf) && files.length > 2)) {
      setErrorMsg('Selecciona un solo PDF o dos fotos: frente y reverso de la INE.');
      return;
    }
    setIneFiles(files);
    setErrorMsg('');
  };

  const handleDeviceAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona una imagen válida (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La imagen seleccionada no debe superar los 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAvatarPreview(uploadEvent.target.result);
      setCustomAvatarName(file.name);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg('Por favor introduce tu nombre.');
      return;
    }
    if (!lastName.trim()) {
      setErrorMsg('Por favor introduce tus apellidos.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Por favor introduce tu dirección o ubicación de parcela.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Por favor introduce tu correo electrónico.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!ineFiles.length || (ineFiles[0].type !== 'application/pdf' && !ineFiles[0].name.toLowerCase().endsWith('.pdf') && ineFiles.length !== 2)) {
      setErrorMsg('Adjunta un PDF o las dos fotos de tu INE (frente y reverso).');
      return;
    }

    setIsSaving(true);
    try {
      const ineDocuments = await Promise.all(ineFiles.map(saveDocument));
      const registered = onRegisterProducer({
        name: name.trim(),
        lastName: lastName.trim(),
        address: address.trim(),
        community,
        phone: phone.trim() || '982 100 0000',
        email: email.trim(),
        password,
        ineDocument: ineDocuments.map(document => document.name).join(', '),
        ineDocuments,
        avatar: avatarPreview
      });
      if (registered !== false) onClose();
    } catch (error) {
      setErrorMsg(error.message || 'No se pudieron guardar los documentos.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Portal de Registro de Productores</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Crea tu cuenta para rentar tractores, rastras y sembradoras en Candelaria
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#fca5a5',
                fontSize: '0.875rem'
              }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Foto de Perfil desde Dispositivo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.85rem 1rem',
              background: 'rgba(0,0,0,0.25)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem'
            }}>
              {/* Avatar Preview */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Foto de Perfil"
                    style={{ width: '62px', height: '62px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-500)' }}
                  />
                ) : (
                  <div style={{
                    width: '62px', height: '62px', borderRadius: '50%',
                    background: 'rgba(34,197,94,0.1)', border: '2px dashed var(--primary-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Camera size={22} color="var(--primary-400)" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  title="Cambiar foto de perfil"
                  style={{
                    position: 'absolute', bottom: '-2px', right: '-2px',
                    background: 'var(--primary-600)', color: '#fff',
                    borderRadius: '50%', width: '22px', height: '22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #0b130e', cursor: 'pointer'
                  }}
                >
                  <Camera size={11} />
                </button>
              </div>

              {/* Input oculto + Botón y texto */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Foto de Perfil</div>
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  onChange={handleDeviceAvatarUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => avatarInputRef.current?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                >
                  <Camera size={14} color="#fbbf24" />
                  Elegir Foto de mi Dispositivo
                </button>
                {customAvatarName ? (
                  <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={13} />
                    {customAvatarName}
                    <button
                      type="button"
                      onClick={() => { setAvatarPreview(null); setCustomAvatarName(''); }}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}
                      title="Quitar foto"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Opcional · JPG, PNG o WebP · máx. 5 MB
                  </div>
                )}
              </div>
            </div>

            {/* Name and Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Nombre(s) *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Baltazar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Apellidos *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Damian Gomez"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Ejido / Community & Address */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Ejido / Zona *
                </label>
                <select
                  className="form-select"
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  required
                >
                  {CANDELARIA_ZONES.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dirección / Parcela *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Calle Principal #14, Parcela Escolar"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Teléfono (WhatsApp)
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Ej. 982 105 4432"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="productor@candelaria.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">
                <Lock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Contraseña *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* INE Document Upload */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>
                  <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Credencial INE (Identificación Oficial) *
                </span>
                <span style={{ fontSize: '0.75rem', color: '#86efac' }}>Requerido para seguridad del arrendador</span>
              </label>

              <div style={{
                border: '2px dashed var(--border-accent)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                textAlign: 'center',
                background: 'rgba(34, 197, 94, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {ineFiles.length ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80' }}>
                    <CheckCircle2 size={20} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ineFiles.map(file => file.name).join(', ')}</span>
                    <button
                      type="button"
                      onClick={() => setIneFiles([])}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', marginLeft: '0.5rem' }}
                      title="Quitar"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={30} color="var(--primary-400)" />
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Selecciona un PDF o dos imágenes de tu INE (frente y reverso)
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,.pdf,application/pdf"
                      multiple
                      onChange={handleIneUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ marginTop: '0.25rem' }}
                    >
                      Seleccionar Archivo de Credencial INE
                    </button>
                  </>
                )}
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem' }}>
              <ShieldCheck size={14} color="#4ade80" />
              <span>En esta versión de prueba los archivos se guardan solo en este navegador; no los subas con datos reales.</span>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onClose();
                if (onSwitchToOwnerRegister) onSwitchToOwnerRegister();
              }}
            >
              ¿Tienes maquinaria? Regístrate aquí
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Crear Mi Cuenta de Productor'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
