import { describe, it, expect } from 'vitest'
import {
  annualDiscountPercent,
  annualSavings,
  exceedsTwelveMonths,
} from '../annual-pricing'

describe('annualSavings', () => {
  it('calcula el ahorro frente a 12 mensualidades', () => {
    expect(annualSavings(79, 854)).toBe(94) // 948 - 854
    expect(annualSavings(19, 205)).toBe(23) // 228 - 205
  })

  it('es negativo cuando el anual está mal configurado', () => {
    // Caso real: se editó el mensual y el anual quedó con el valor del catálogo.
    expect(annualSavings(19, 313)).toBe(-85)
  })
})

describe('annualDiscountPercent', () => {
  it('devuelve el descuento en % entero', () => {
    expect(annualDiscountPercent(79, 854)).toBe(10)
    expect(annualDiscountPercent(199, 2149)).toBe(10)
    expect(annualDiscountPercent(19, 205)).toBe(10)
  })

  it('devuelve null cuando el anual equivale exactamente a 12 meses', () => {
    expect(annualDiscountPercent(20, 240)).toBeNull()
  })

  it('devuelve null cuando el anual es MÁS caro que 12 meses', () => {
    expect(annualDiscountPercent(19, 313)).toBeNull()
  })

  it('devuelve null con precios en cero (plan Free)', () => {
    expect(annualDiscountPercent(0, 0)).toBeNull()
    expect(annualDiscountPercent(19, 0)).toBeNull()
    expect(annualDiscountPercent(0, 100)).toBeNull()
  })

  it('tolera NaN de un input vacío', () => {
    expect(annualDiscountPercent(NaN, 205)).toBeNull()
    expect(annualDiscountPercent(19, NaN)).toBeNull()
  })
})

describe('exceedsTwelveMonths', () => {
  it('rechaza un anual por encima de 12 mensualidades', () => {
    expect(exceedsTwelveMonths(19, 313)).toBe(true)
    expect(exceedsTwelveMonths(0, 1)).toBe(true) // Free no puede tener precio anual
  })

  it('acepta exactamente 12 mensualidades (sin descuento, pero coherente)', () => {
    expect(exceedsTwelveMonths(20, 240)).toBe(false)
  })

  it('acepta un anual con descuento', () => {
    expect(exceedsTwelveMonths(79, 854)).toBe(false)
    expect(exceedsTwelveMonths(0, 0)).toBe(false)
  })

  it('no bloquea el formulario mientras el input está vacío (NaN)', () => {
    expect(exceedsTwelveMonths(NaN, 313)).toBe(false)
    expect(exceedsTwelveMonths(19, NaN)).toBe(false)
  })
})
