import { describe, it, expect } from 'vitest'
import {
  AMOUNT_DECIMALS,
  convertUsd,
  formatMoney,
  formatUsdAsPen,
  parseRate,
  rateRangeError,
} from '../currency'

describe('parseRate', () => {
  it('convierte el string de 4 decimales que emite el backend', () => {
    expect(parseRate('3.7500')).toBe(3.75)
    expect(parseRate('3.9000')).toBe(3.9)
  })

  it('acepta también un número ya parseado', () => {
    expect(parseRate(3.9)).toBe(3.9)
  })

  it('devuelve null ante ausencia de valor, en vez de un default', () => {
    // Un `?? 3.75` pintaría un precio inventado con total confianza.
    expect(parseRate(null)).toBeNull()
    expect(parseRate(undefined)).toBeNull()
    expect(parseRate('')).toBeNull()
  })

  it('devuelve null ante basura o valores no utilizables', () => {
    expect(parseRate('abc')).toBeNull()
    expect(parseRate('0')).toBeNull()
    expect(parseRate('-3.75')).toBeNull()
    expect(parseRate(NaN)).toBeNull()
  })
})

describe('rateRangeError', () => {
  it('acepta el rango válido, bordes incluidos', () => {
    expect(rateRangeError(3.75)).toBeNull()
    expect(rateRangeError(1)).toBeNull()
    expect(rateRangeError(20)).toBeNull()
  })

  it('rechaza el dedazo por orden de magnitud (375 en vez de 3.75)', () => {
    const error = rateRangeError(375)
    expect(error).toContain('fuera del rango')
    expect(error).toContain('céntimos')
  })

  it('rechaza una tasa por debajo del mínimo', () => {
    expect(rateRangeError(0.5)).toContain('fuera del rango')
  })

  it('rechaza un valor no numérico', () => {
    expect(rateRangeError(NaN)).toBe('Introduce un tipo de cambio válido.')
  })
})

describe('convertUsd', () => {
  it('multiplica por la tasa', () => {
    expect(convertUsd(79, 3.75)).toBe(296.25)
    expect(convertUsd(0, 3.75)).toBe(0)
  })

  it('devuelve null sin tasa', () => {
    expect(convertUsd(79, null)).toBeNull()
  })

  it('devuelve null con un importe no numérico (input vacío del formulario)', () => {
    expect(convertUsd(NaN, 3.75)).toBeNull()
  })
})

describe('formatMoney', () => {
  it('formatea soles sin decimales para precios de catálogo', () => {
    expect(formatMoney(296.25, 'PEN')).toBe('S/ 296')
    expect(formatMoney(3202.5, 'PEN')).toBe('S/ 3,203')
  })

  it('formatea soles con 2 decimales para importes a pagar', () => {
    expect(formatMoney(296.25, 'PEN', AMOUNT_DECIMALS)).toBe('S/ 296.25')
  })

  it('formatea dólares igual que PlanCard, para que la tabla no diverja', () => {
    expect(formatMoney(79, 'USD')).toBe('$79')
    expect(formatMoney(854, 'USD')).toBe('$854')
  })

  it('normaliza el espacio duro que mete Intl entre el símbolo y el número', () => {
    expect(formatMoney(296, 'PEN')).not.toContain('\u00A0')
  })

  it('redondea half-up', () => {
    expect(formatMoney(295.5, 'PEN')).toBe('S/ 296')
    expect(formatMoney(295.4, 'PEN')).toBe('S/ 295')
  })
})

describe('formatUsdAsPen', () => {
  it('convierte y formatea los precios reales del catálogo', () => {
    expect(formatUsdAsPen(79, 3.75)).toBe('S/ 296')
    expect(formatUsdAsPen(19, 3.75)).toBe('S/ 71')
    expect(formatUsdAsPen(199, 3.75)).toBe('S/ 746')
  })

  it('refleja un cambio de tasa (el ejemplo del modal de impacto)', () => {
    expect(formatUsdAsPen(79, 3.9)).toBe('S/ 308')
  })

  it('devuelve null sin tasa, para que el llamador omita la línea entera', () => {
    expect(formatUsdAsPen(79, null)).toBeNull()
  })
})
