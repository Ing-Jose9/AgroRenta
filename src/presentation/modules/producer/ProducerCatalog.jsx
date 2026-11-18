import { useState, useMemo } from 'react';
import { Search, MapPin, Calendar, Gauge, UserCheck, Sparkles, Tractor, CheckCircle2, Plus } from 'lucide-react';
import { MachineryCategory, CANDELARIA_ZONES, MachineryStatus } from '../../../core/models/Machinery.js';
import { AvailabilityService } from '../../../services/AvailabilityService.js';
import { RentalCostService } from '../../../services/RentalCostService.js';

export const ProducerCatalog = ({
  machineryList = [],
  onSelectMachinery,
  onOpenRentModal,
  onViewReservations,
  pendingReservationsCount = 0
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [selectedMachineryIds, setSelectedMachineryIds] = useState([]);

  // Filtering logic
  const filteredMachinery = useMemo(() => {
    return machineryList.filter(item => {
      // Solo mostrar activas en catálogo
      if (item.status !== MachineryStatus.ACTIVE) return false;

      // Text search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesBrand = item.brand?.toLowerCase().includes(query);
        const matchesModel = item.model?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesBrand && !matchesModel && !matchesDesc) return false;
      }

      // Zone filter
      if (selectedZone !== 'ALL' && item.zone !== selectedZone) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      // Date availability filter
      if (filterStartDate && filterEndDate) {
        const isFree = AvailabilityService.isAvailable(item, filterStartDate, filterEndDate);
        if (!isFree) return false;
      }

      return true;
    });
  }, [machineryList, searchTerm, selectedZone, selectedCategory, filterStartDate, filterEndDate]);
  const selectedMachinery = machineryList.filter(item => selectedMachineryIds.includes(item.id));

  const toggleMachinerySelection = (item) => {
    setSelectedMachineryIds(ids => ids.includes(item.id)
      ? ids.filter(id => id !== item.id)
      : [...ids, item.id]);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-tag">
          <Sparkles size={15} color="#4ade80" />
          <span>Red Municipal de Mecanización Agrícola</span>
        </div>
        <h1 className="hero-title">
          Renta de Maquinaria Agrícola en{' '}
          <span className="hero-title-highlight">Candelaria</span>
        </h1>
        <p className="hero-description">
          Conecta directamente con propietarios y operadores certificados de tractores, rastras y sembradoras en San Miguel, Tulipán, Miguel Hidalgo, Desengaño y toda la cuenca agropecuaria de Candelaria y Campeche.
        </p>
      </section>

      {/* Filters Bar */}
      <div className="filter-bar-container">
        {/* Search */}
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar tractor, rastra, marca (John Deere, Case IH)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Zone Selector */}
        <div className="filter-select-wrapper">
          <select
            className="form-select"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
          >
            <option value="ALL">📍 Todas las Zonas / Ejidos</option>
            {CANDELARIA_ZONES.map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div className="filter-select-wrapper">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">🚜 Toda la Maquinaria</option>
            <option value={MachineryCategory.TRACTOR}>Tractores Agrícolas</option>
            <option value={MachineryCategory.RASTRA}>Rastras de Discos</option>
            <option value={MachineryCategory.SEMBRADORA}>Sembradoras de Precisión</option>
            <option value={MachineryCategory.COSECHADORA}>Cosechadoras</option>
            <option value={MachineryCategory.ASPERSORA}>Aspersoras / Fumigadoras</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(searchTerm || selectedZone !== 'ALL' || selectedCategory !== 'ALL' || filterStartDate) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedZone('ALL');
              setSelectedCategory('ALL');
              setFilterStartDate('');
              setFilterEndDate('');
            }}
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Mostrando <strong style={{ color: '#ffffff' }}>{filteredMachinery.length}</strong> máquinas verificadas disponibles
        </div>

        <div className="catalog-actions">
          {selectedMachinery.length > 0 && (
            <button
              className="btn btn-accent btn-sm"
              onClick={() => {
                onOpenRentModal(selectedMachinery);
                setSelectedMachineryIds([]);
              }}
            >
              <Tractor size={15} />
              Rentar seleccionadas ({selectedMachinery.length})
            </button>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onViewReservations}
            style={{ position: 'relative' }}
          >
            <Calendar size={15} />
            <span>Ver Mis Reservas</span>
            {pendingReservationsCount > 0 && (
              <span className="reservation-count">{pendingReservationsCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="machinery-grid">
        {filteredMachinery.map(item => (
          <div key={item.id} className="glass-panel machinery-card">
            <div className="machinery-image-container" onClick={() => onSelectMachinery(item)} style={{ cursor: 'pointer' }}>
              <img
                src={item.images?.[0] || '/images/tractor-john-deere.jpg'}
                alt={item.title}
                className="machinery-image"
              />
              <span className="card-category-badge badge badge-active">
                {item.category}
              </span>
              <span className="card-zone-badge">
                <MapPin size={12} />
                {item.zone}
              </span>
            </div>

            <div className="machinery-content">
              <h3
                className="machinery-title"
                onClick={() => onSelectMachinery(item)}
                style={{ cursor: 'pointer' }}
                title={item.title}
              >
                {item.title}
              </h3>

              {/* Specs */}
              <div className="machinery-specs-row">
                <span className="spec-chip">
                  <Gauge size={13} color="#4ade80" />
                  {item.hp} HP
                </span>
                <span className="spec-chip">
                  <Calendar size={13} color="#fbbf24" />
                  Año {item.year}
                </span>
                <span className="spec-chip">
                  <UserCheck size={13} color={item.operatorAvailable ? '#38bdf8' : 'var(--text-muted)'} />
                  {item.operatorAvailable ? 'Operador opcional' : 'Solo máquina'}
                </span>
              </div>

              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {item.description}
              </p>

              <div className="machinery-footer">
                <div className="price-tag">
                  <span className="price-amount">
                    ${item.rentalRate?.toLocaleString()} MXN
                  </span>
                  <span className="price-unit">
                    {RentalCostService.getRateTypeLabel(item.rateType)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => toggleMachinerySelection(item)}
                    aria-pressed={selectedMachineryIds.includes(item.id)}
                  >
                    {selectedMachineryIds.includes(item.id) ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                    {selectedMachineryIds.includes(item.id) ? 'Agregada' : 'Agregar'}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onSelectMachinery(item)}
                  >
                    Detalles
                  </button>
                  <button
                    className="btn btn-accent btn-sm"
                    onClick={() => onOpenRentModal(item)}
                  >
                    Rentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
