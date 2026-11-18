/**
 * Servicio de Cálculo de Costos de Renta (Capa 2: Lógica de Negocio)
 * Reglas de cálculo según modalidad (Día/Jornada, Hora, Hectárea) y Operador
 */

import { RateType } from '../core/models/Machinery.js';

export class RentalCostService {
  /**
   * Calcula el desglose completo del costo de renta
   */
  static calculate({
    machinery,
    unitsQuantity = 1,
    withOperator = false,
    startDate,
    endDate
  }) {
    if (!machinery) {
      throw new Error('Se requiere información de la maquinaria.');
    }

    const qty = Math.max(1, Number(unitsQuantity) || 1);
    const unitRate = Number(machinery.rentalRate) || 0;
    const operatorUnitRate = machinery.operatorAvailable && withOperator
      ? Number(machinery.operatorRate) || 0
      : 0;

    let calculatedUnits = qty;

    // Si la tarifa es por DÍA y se proporcionaron fechas, calculamos los días calendario
    if (machinery.rateType === RateType.DAY && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      calculatedUnits = Math.max(1, diffDays);
    }

    const baseCost = unitRate * calculatedUnits;
    const operatorCost = operatorUnitRate * calculatedUnits;
    const totalCost = baseCost + operatorCost;

    let unitLabel = 'jornadas';
    if (machinery.rateType === RateType.HOUR) unitLabel = 'horas';
    if (machinery.rateType === RateType.HECTARE) unitLabel = 'hectáreas';

    return {
      rateType: machinery.rateType,
      unitRate,
      unitsQuantity: calculatedUnits,
      unitLabel,
      baseCost,
      withOperator: Boolean(withOperator),
      operatorUnitRate,
      operatorCost,
      totalCost,
      formattedTotal: new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(totalCost)
    };
  }

  /**
   * Etiquetas legibles para los tipos de cobro
   */
  static getRateTypeLabel(rateType) {
    switch (rateType) {
      case RateType.HOUR:
        return 'Por Hora';
      case RateType.DAY:
        return 'Por Jornada / Día';
      case RateType.HECTARE:
        return 'Por Hectárea';
      default:
        return 'Por Período';
    }
  }
}
