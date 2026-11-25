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
  Tractor,
  DollarSign,
  Gauge,
  Calendar,
  Image as ImageIcon,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Camera,
  FolderOpen
} from 'lucide-react';
import { CANDELARIA_ZONES, MachineryCategory, RateType } from '../../../core/models/Machinery.js';
import { saveDocument } from '../../../core/storage/DocumentStorage.js';

export const OwnerRegistrationModal = ({
  isOpen,
  onClose,
  onRegisterOwnerWithMachinery,
  onSwitchToProducerRegister
}) => {
  const [step, setStep] = useState(1); // 1: Datos Propietario & INE, 2: Datos Maquinaria, 3: Confirmación

  // Step 1: Owner Profile & INE
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [community, setCommunity] = useState(CANDELARIA_ZONES[0] || 'San Miguel');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80');
  const [customAvatarName, setCustomAvatarName] = useState('');
  const avatarFileInputRef = useRef(null);
  const [ineFiles, setIneFiles] = useState([]);
  const [ineFileName, setIneFileName] = useState('');
  const ineFileInputRef = useRef(null);
  const [ownershipFile, setOwnershipFile] = useState(null);
  const ownershipFileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  // Step 2: Machinery Details & Photos
  const [machineryTitle, setMachineryTitle] = useState('');
  const [category, setCategory] = useState(MachineryCategory.TRACTOR);
  const [brand, setBrand] = useState('John Deere');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2023);
  const [hp, setHp] = useState(180);
  const [rentalRate, setRentalRate] = useState(4000);
  const [rateType, setRateType] = useState(RateType.DAY);
  const [operatorAvailable, setOperatorAvailable] = useState(true);
  const [operatorRate, setOperatorRate] = useState(600);
  const [machineryLocation, setMachineryLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState('/images/tractor-john-deere.jpg');
  const [customMachineryPhotoName, setCustomMachineryPhotoName] = useState('');
  const machineryFileInputRef = useRef(null);

  const [errorMsg, setErrorMsg] = useState('');

  const photoOptions = [
    { label: 'Tractor John Deere 8R / Campo', path: '/images/tractor-john-deere.jpg' },
    { label: 'Rastra Hidráulica Baldan 32 Discos', path: '/images/rastra-discos.jpg' },
    { label: 'Sembradora Neumática Case IH', path: '/images/sembradora.jpg' },
    { label: 'Tractor New Holland 4WD', path: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&auto=format&fit=crop&q=80' },
    { label: 'Aspersora Autopropulsada Jacto', path: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80' }
  ];

  const handleIneUpload = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    const isPdf = file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (files.some(file => (!isPdf(file) && !file.type.startsWith('image/')) || file.size > 8 * 1024 * 1024)) {
      setErrorMsg('Adjunta un PDF o hasta dos imágenes (JPG, PNG o WebP) de máximo 8 MB cada una.');
      return;
    }
    if ((files.some(isPdf) && files.length !== 1) || (!files.some(isPdf) && files.length > 2)) {
      setErrorMsg('Selecciona un solo PDF o dos fotos: frente y reverso de la INE.');
      return;
    }
    setIneFiles(files);
    setIneFileName(files.map(file => file.name).join(', '));
    setErrorMsg('');
  };

  const handleOwnershipUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if ((!isPdf && !file.type.startsWith('image/')) || file.size > 8 * 1024 * 1024) {
      setErrorMsg('Adjunta una foto o PDF de máximo 8 MB que acredite la propiedad del equipo.');
      return;
    }
    setOwnershipFile(file);
    setErrorMsg('');
  };

  const handleDeviceAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La imagen seleccionada no debe superar los 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAvatar(uploadEvent.target.result);
      setCustomAvatarName(file.name);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleDeviceMachineryUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido para la maquinaria.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('La foto de la máquina no debe superar los 8 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSelectedPhoto(uploadEvent.target.result);
      setCustomMachineryPhotoName(file.name);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim() || !lastName.trim()) {
        setErrorMsg('Por favor introduce tu nombre y apellidos completos.');
        return;
      }
      if (!email.trim()) {
        setErrorMsg('Por favor introduce tu correo electrónico.');
        return;
      }
      if (!ineFiles.length || (ineFiles[0].type !== 'application/pdf' && !ineFiles[0].name.toLowerCase().endsWith('.pdf') && ineFiles.length !== 2)) {
        setErrorMsg('Adjunta un PDF o las dos fotos de tu INE (frente y reverso).');
        return;
      }
      setErrorMsg('');
      setStep(2);
    } else if (step === 2) {
      if (!machineryTitle.trim()) {
        setErrorMsg('Por favor indica un título para tu maquinaria.');
        return;
      }
      if (!ownershipFile) {
        setErrorMsg('Adjunta un documento o foto que acredite que la maquinaria es de tu propiedad.');
        return;
      }
      if (!model.trim()) {
        setErrorMsg('Por favor introduce el modelo de la maquinaria.');
        return;
      }
      if (!rentalRate || Number(rentalRate) <= 0) {
        setErrorMsg('Indica una tarifa de renta válida mayor a $0.');
        return;
      }
      setErrorMsg('');
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 3) return;

    setIsSaving(true);
    try {
      const [ineDocuments, ownershipDocument] = await Promise.all([
        Promise.all(ineFiles.map(saveDocument)),
        saveDocument(ownershipFile)
      ]);
      const ownerPayload = {
        name: name.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || '982 100 0000',
        email: email.trim(),
        password,
        community,
        address: address.trim(),
        avatar,
        ineDocument: ineDocuments.map(document => document.name).join(', '),
        ineDocuments
      };

      const machineryPayload = {
        title: machineryTitle.trim(),
        category,
        brand,
        model: model.trim(),
        year: Number(year),
        hp: Number(hp),
        rentalRate: Number(rentalRate),
        rateType,
        operatorAvailable,
        operatorRate: operatorAvailable ? Number(operatorRate) : 0,
        zone: community,
        specificLocation: machineryLocation.trim() || `Ejido ${community}`,
        description: description.trim(),
        images: [selectedPhoto],
        ownershipDocument
      };

      const registered = await onRegisterOwnerWithMachinery({
        ownerData: ownerPayload,
        machineryData: machineryPayload
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
      <div className="modal-container" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Portal de Registro de Propietario y Maquinaria</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Paso {step} de 3 • Publica tus tractores e implementos para rentar en Candelaria
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Stepper Wizard Indicator */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.75rem 1.5rem',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: step === 1 ? '#4ade80' : 'var(--text-muted)',
            fontWeight: step === 1 ? 700 : 500,
            fontSize: '0.85rem'
          }}>
            <span style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: step === 1 ? '#22c55e' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem'
            }}>1</span>
            <span>Tus Datos e INE</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: step === 2 ? '#4ade80' : 'var(--text-muted)',
            fontWeight: step === 2 ? 700 : 500,
            fontSize: '0.85rem'
          }}>
            <span style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: step === 2 ? '#22c55e' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem'
            }}>2</span>
            <span>Tu Maquinaria</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: step === 3 ? '#4ade80' : 'var(--text-muted)',
            fontWeight: step === 3 ? 700 : 500,
            fontSize: '0.85rem'
          }}>
            <span style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: step === 3 ? '#22c55e' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem'
            }}>3</span>
            <span>Aprobación</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
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

            {/* STEP 1: PROPIETARIO Y SU INE */}
            {step === 1 && (
              <div>
                {/* Selector de Foto de Perfil desde Dispositivo */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1rem 1.25rem',
                  background: 'rgba(0,0,0,0.35)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-accent)',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={avatar}
                      alt="Foto de perfil del propietario"
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid var(--accent-500)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
                      }}
                    />
                    {customAvatarName && (
                      <span style={{
                        position: 'absolute',
                        bottom: '0px',
                        right: '0px',
                        background: '#22c55e',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        border: '2px solid #0f172a'
                      }} title="Foto cargada desde tu dispositivo">
                        ✓
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Foto de Perfil del Propietario
                      </span>
                      {customAvatarName && (
                        <span style={{
                          background: 'rgba(34, 197, 94, 0.2)',
                          color: '#4ade80',
                          fontSize: '0.72rem',
                          padding: '0.1rem 0.5rem',
                          borderRadius: '999px',
                          border: '1px solid rgba(74, 222, 128, 0.4)',
                          fontWeight: 600
                        }}>
                          Desde dispositivo
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', marginBottom: '0.65rem' }}>
                      {customAvatarName
                        ? `Archivo cargado: ${customAvatarName}`
                        : 'Elige una foto de perfil desde tu dispositivo (celular o computadora) para mostrar en tu cuenta de propietario.'}
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="file"
                        ref={avatarFileInputRef}
                        accept="image/*"
                        onChange={handleDeviceAvatarUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{
                          padding: '0.45rem 0.95rem',
                          fontSize: '0.825rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem'
                        }}
                        onClick={() => avatarFileInputRef.current?.click()}
                      >
                        <Camera size={15} />
                        <span>Elegir Foto de mi Dispositivo</span>
                      </button>

                      {customAvatarName && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.45rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => {
                            setAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80');
                            setCustomAvatarName('');
                            if (avatarFileInputRef.current) avatarFileInputRef.current.value = '';
                          }}
                        >
                          Restaurar predeterminada
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Nombre(s) *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej. Jorge"
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
                      placeholder="Ej. Hernandez"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Teléfono de Contacto (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Ej. 982 114 9920"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
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
                      placeholder="propietario@candelaria.mx"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Ejido / Comunidad de Residencia *
                    </label>
                    <select
                      className="form-select"
                      value={community}
                      onChange={(e) => setCommunity(e.target.value)}
                      required
                    >
                      {CANDELARIA_ZONES.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dirección o Nombre de Rancho / Bodega</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej. Rancho San Jorge, Sector 2, Parcela 8"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Contraseña de Acceso *
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Subir Credencial INE */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>
                      <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Credencial INE del Propietario (Frente y Reverso) *
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#fde047' }}>Será verificada por el Administrador</span>
                  </label>

                  <div style={{
                    border: '2px dashed var(--border-accent)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: 'rgba(234, 179, 8, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {ineFileName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80' }}>
                        <CheckCircle2 size={20} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ineFileName}</span>
                        <button
                          type="button"
                          onClick={() => { setIneFileName(''); setIneFiles([]); }}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', marginLeft: '0.5rem' }}
                          title="Quitar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={30} color="var(--accent-400)" />
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Sube un PDF o dos imágenes legibles de tu INE (frente y reverso)
                        </div>
                        <input
                          type="file"
                          ref={ineFileInputRef}
                          accept="image/*,.pdf,application/pdf"
                          multiple
                          onChange={handleIneUpload}
                          style={{ display: 'none' }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => ineFileInputRef.current?.click()}
                          style={{ marginTop: '0.25rem' }}
                        >
                          Subir Credencial INE (Archivo)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: MAQUINARIA, FOTOS, CARACTERÍSTICAS Y PRECIOS */}
            {step === 2 && (
              <div>
                <div className="form-group">
                  <label className="form-label">
                    <Tractor size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Título del Anuncio de la Maquinaria *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Tractor John Deere 8R 340 HP (Doble Rodado)"
                    value={machineryTitle}
                    onChange={(e) => setMachineryTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Documento que acredita la propiedad de la maquinaria *</label>
                  <input
                    type="file"
                    ref={ownershipFileInputRef}
                    accept="image/*,.pdf,application/pdf"
                    onChange={handleOwnershipUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => ownershipFileInputRef.current?.click()}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <FolderOpen size={14} />
                    {ownershipFile?.name || 'Subir factura, tarjeta de circulación u otro comprobante'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Categoría *</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value={MachineryCategory.TRACTOR}>Tractor Agrícola</option>
                      <option value={MachineryCategory.RASTRA}>Rastra de Discos</option>
                      <option value={MachineryCategory.SEMBRADORA}>Sembradora de Precisión</option>
                      <option value={MachineryCategory.ASPERSORA}>Aspersora / Fumigadora</option>
                      <option value={MachineryCategory.COSECHADORA}>Cosechadora / Trilladora</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Marca *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej. John Deere, Case IH, New Holland, Baldan"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Modelo *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej. 8R 340 / CRI 32"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Año *
                    </label>
                    <input
                      type="number"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      className="form-input"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Gauge size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Potencia (HP)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="600"
                      className="form-input"
                      value={hp}
                      onChange={(e) => setHp(e.target.value)}
                    />
                  </div>
                </div>

                {/* Precios y Tarifas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">
                      <DollarSign size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Tarifa de Renta ($ MXN) *
                    </label>
                    <input
                      type="number"
                      min="100"
                      step="50"
                      className="form-input"
                      placeholder="Ej. 4200"
                      value={rentalRate}
                      onChange={(e) => setRentalRate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Modalidad de Cobro *</label>
                    <select
                      className="form-select"
                      value={rateType}
                      onChange={(e) => setRateType(e.target.value)}
                    >
                      <option value={RateType.DAY}>Por Día / Jornada</option>
                      <option value={RateType.HECTARE}>Por Hectárea Trabajada</option>
                      <option value={RateType.HOUR}>Por Hora</option>
                    </select>
                  </div>
                </div>

                {/* Operator Toggle */}
                <div style={{
                  padding: '0.85rem 1rem',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={operatorAvailable}
                      onChange={(e) => setOperatorAvailable(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#22c55e' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>¿Incluye operador calificado?</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Operador disponible para viajar a ejidos de Candelaria</div>
                    </div>
                  </label>

                  {operatorAvailable && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Costo operador:</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        className="form-input"
                        style={{ width: '110px', padding: '0.35rem 0.6rem' }}
                        value={operatorRate}
                        onChange={(e) => setOperatorRate(e.target.value)}
                      />
                      <span style={{ fontSize: '0.8rem' }}>MXN</span>
                    </div>
                  )}
                </div>

                {/* Location of machinery */}
                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Ubicación donde se resguarda la máquina
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Bodega Ejido San Miguel, frente al campo"
                    value={machineryLocation}
                    onChange={(e) => setMachineryLocation(e.target.value)}
                  />
                </div>

                {/* Machinery Photo Selection */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      <ImageIcon size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Fotos de la Maquinaria *
                    </label>

                    <div>
                      <input
                        type="file"
                        ref={machineryFileInputRef}
                        accept="image/*"
                        onChange={handleDeviceMachineryUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        onClick={() => machineryFileInputRef.current?.click()}
                      >
                        <FolderOpen size={14} color="#fbbf24" />
                        <span>{customMachineryPhotoName ? 'Cambiar foto de dispositivo' : 'Subir foto desde mi dispositivo'}</span>
                      </button>
                    </div>
                  </div>

                  {customMachineryPhotoName && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(74, 222, 128, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '0.75rem'
                    }}>
                      <img
                        src={selectedPhoto}
                        alt="Foto cargada"
                        style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div style={{ flex: 1, fontSize: '0.78rem' }}>
                        <strong style={{ color: '#4ade80' }}>✓ Foto cargada desde tu dispositivo:</strong> {customMachineryPhotoName}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
                    {photoOptions.map((opt, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedPhoto(opt.path);
                          setCustomMachineryPhotoName('');
                        }}
                        style={{
                          border: `2px solid ${selectedPhoto === opt.path ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          background: 'rgba(0,0,0,0.3)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <img src={opt.path} alt={opt.label} style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
                        <div style={{ fontSize: '0.7rem', padding: '0.3rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {opt.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Descripción y Detalles de Trabajo</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    placeholder="Ej. Tractor en óptimas condiciones mecánicas, aire acondicionado, listo para subsoleo y siembra en terrenos de Candelaria."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: RESUMEN Y ENVÍO A ADMINISTRACIÓN */}
            {step === 3 && (
              <div>
                <div style={{
                  background: 'linear-gradient(145deg, rgba(16, 44, 30, 0.8), rgba(15, 23, 42, 0.9))',
                  border: '1px solid rgba(74, 222, 128, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#86efac', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
                    <ShieldCheck size={20} />
                    <span>Resumen de Solicitud de Registro de Propietario</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Propietario Solicitante:</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                        <img
                          src={avatar}
                          alt="Foto del Propietario"
                          style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-500)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{name} {lastName}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{phone} • {email}</div>
                        </div>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>Ejido: <strong>{community}</strong></div>
                      <div style={{ marginTop: '0.35rem', color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                        <FileText size={13} />
                        INE Adjunta: {ineFileName}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Maquinaria a Publicar:</div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{machineryTitle}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{brand} {model} ({year}) • {hp} HP</div>
                      <div style={{ color: 'var(--accent-400)', fontWeight: 700, marginTop: '0.35rem' }}>
                        ${Number(rentalRate).toLocaleString()} MXN / {rateType === 'DAY' ? 'Día' : rateType === 'HECTARE' ? 'Hectárea' : 'Hora'}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        {operatorAvailable ? `Incluye operador (+ $${operatorRate})` : 'Sin operador'}
                      </div>
                      <div style={{ color: '#86efac', fontSize: '0.78rem', marginTop: '0.35rem' }}>
                        Documento de propiedad: {ownershipFile?.name}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <img
                      src={selectedPhoto}
                      alt="Maquinaria a registrar"
                      style={{ width: '100px', height: '65px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {description || 'Sin notas adicionales.'}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '0.85rem 1rem',
                  background: 'rgba(234, 179, 8, 0.12)',
                  border: '1px solid rgba(234, 179, 8, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem'
                }}>
                  <AlertCircle size={20} color="#fde047" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.825rem', color: '#fef08a' }}>
                    <strong>Flujo de Aprobación de Candelaria:</strong> Tu cuenta y tu maquinaria quedarán en estado <strong>Pendiente de Revisión</strong>. El Administrador verificará tu INE, el comprobante de propiedad y las fotos del equipo.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {step > 1 ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setStep(step - 1)}
              >
                <ChevronLeft size={16} />
                Regresar
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onClose();
                  if (onSwitchToProducerRegister) onSwitchToProducerRegister();
                }}
              >
                ¿Quieres solo rentar? Crea cuenta aquí
              </button>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>

              {step < 3 ? (
                <button type="button" className="btn btn-accent" onClick={handleNextStep}>
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button type="submit" className="btn btn-accent" disabled={isSaving}>
                  <CheckCircle2 size={18} />
                  {isSaving ? 'Guardando...' : 'Enviar Solicitud a Aprobación'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
