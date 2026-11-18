import { useRef, useState } from 'react';
import { X, Gauge, AlertCircle, Plus, Image } from 'lucide-react';
import { MachineryCategory, RateType, CANDELARIA_ZONES, MachineryStatus } from '../../../core/models/Machinery.js';
import { ModerationService } from '../../../services/ModerationService.js';
import { saveDocument } from '../../../core/storage/DocumentStorage.js';

export const AddMachineryModal = ({
  isOpen,
  onClose,
  currentUser,
  onSaveMachinery
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(MachineryCategory.TRACTOR);
  const [brand, setBrand] = useState('John Deere');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2022);
  const [hp, setHp] = useState(180);
  const [rentalRate, setRentalRate] = useState(3500);
  const [rateType, setRateType] = useState(RateType.DAY);
  const [operatorAvailable, setOperatorAvailable] = useState(true);
  const [operatorRate, setOperatorRate] = useState(500);
  const [zone, setZone] = useState(currentUser?.community || 'San Miguel');
  const [specificLocation, setSpecificLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState('/images/tractor-john-deere.jpg');
  const [ownershipFile, setOwnershipFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const ownershipFileInputRef = useRef(null);

  const photoOptions = [
    { label: 'Tractor John Deere 8R en Campo', path: '/images/tractor-john-deere.jpg' },
    { label: 'Rastra Hidráulica Pesada Baldan', path: '/images/rastra-discos.jpg' },
    { label: 'Sembradora Neumática de Precisión', path: '/images/sembradora.jpg' },
    { label: 'Tractor New Holland 4WD', path: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&auto=format&fit=crop&q=80' }
  ];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ownershipFile) {
      setErrorMsg('Adjunta un documento o foto que acredite que la maquinaria es de tu propiedad.');
      return;
    }

    setIsSaving(true);
    try {
      const ownershipDocument = await saveDocument(ownershipFile);
      const listingData = {
      title,
      category,
      brand,
      model,
      year: Number(year),
      hp: Number(hp),
      rentalRate: Number(rentalRate),
      rateType,
      operatorAvailable,
      operatorRate: operatorAvailable ? Number(operatorRate) : 0,
      zone,
      specificLocation,
      description,
      images: [selectedPhoto],
      ownershipDocument,
      ownerId: currentUser?.id || 'usr_owner_1',
      ownerName: currentUser?.name || 'Propietario de Candelaria',
      ownerPhone: currentUser?.phone || '982 112 8840',
      status: MachineryStatus.ACTIVE // Direct active for MVP or PENDING_REVIEW
    };

    // Capa 2: Validación de Lógica de Negocio
      const validation = ModerationService.validateListing(listingData);
      if (!validation.isValid) {
        setErrorMsg(validation.errors[0]);
        return;
      }

      onSaveMachinery(listingData);
      onClose();
    } catch (error) {
      setErrorMsg(error.message || 'No se pudo guardar el documento de propiedad.');
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
            <h3 className="modal-title">Dar de Alta Nueva Maquinaria Agrícola</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Módulo de Propietario • Flota de Candelaria, Campeche
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
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: '#fca5a5',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Título Publicitario del Equipo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Tractor John Deere 8R 340 HP con Cabina Climatizada"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrorMsg('');
                }}
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
                <Image size={14} />
                {ownershipFile?.name || 'Subir factura, tarjeta de circulación u otro comprobante'}
              </button>
            </div>

            {/* Category & Brand */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Tipo de Maquinaria</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value={MachineryCategory.TRACTOR}>Tractor Agrícola</option>
                  <option value={MachineryCategory.RASTRA}>Rastra de Discos</option>
                  <option value={MachineryCategory.SEMBRADORA}>Sembradora</option>
                  <option value={MachineryCategory.COSECHADORA}>Cosechadora</option>
                  <option value={MachineryCategory.ASPERSORA}>Aspersora</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Marca</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. John Deere, New Holland, Case IH, Baldan"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Model, Year, HP */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Modelo</label>
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
                <label className="form-label">Año</label>
                <input
                  type="number"
                  min="1990"
                  max="2027"
                  className="form-input"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Gauge size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Potencia (HP)
                </label>
                <input
                  type="number"
                  min="30"
                  max="700"
                  className="form-input"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Rental Rates & Rate Type */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-400)', marginBottom: '0.75rem' }}>
                Esquema de Cobro y Tarifas
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Modalidad de Cobro</label>
                  <select
                    className="form-select"
                    value={rateType}
                    onChange={(e) => setRateType(e.target.value)}
                  >
                    <option value={RateType.DAY}>Por Jornada / Día</option>
                    <option value={RateType.HOUR}>Por Hora de Trabajo</option>
                    <option value={RateType.HECTARE}>Por Hectárea Trabajada</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tarifa Base ($ MXN)</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    className="form-input"
                    value={rentalRate}
                    onChange={(e) => setRentalRate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Operator */}
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={operatorAvailable}
                    onChange={(e) => setOperatorAvailable(e.target.checked)}
                    style={{ accentColor: '#22c55e', width: '16px', height: '16px' }}
                  />
                  <span>Ofrecer operador capacitado con la máquina</span>
                </label>

                {operatorAvailable && (
                  <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Costo adicional del operador ($ MXN por jornada):</label>
                    <input
                      type="number"
                      min="100"
                      step="50"
                      className="form-input"
                      style={{ maxWidth: '140px' }}
                      value={operatorRate}
                      onChange={(e) => setOperatorRate(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Location in Candelaria */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Zona / Comunidad en Candelaria</label>
                <select
                  className="form-select"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                >
                  {CANDELARIA_ZONES.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Ubicación exacta / Rancho / Bodega</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Rancho San José, km 12 carretera estatal"
                  value={specificLocation}
                  onChange={(e) => setSpecificLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Photo Selection */}
            <div className="form-group">
              <label className="form-label">
                <Image size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Fotografía Real del Equipo
              </label>
              <select
                className="form-select"
                value={selectedPhoto}
                onChange={(e) => setSelectedPhoto(e.target.value)}
              >
                {photoOptions.map(p => (
                  <option key={p.path} value={p.path}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Descripción de características y condiciones de renta</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Indica implementos compatibles, consumo aproximado de combustible, condiciones del terreno..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              <Plus size={16} />
              {isSaving ? 'Guardando...' : 'Registrar Maquinaria en Flota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
