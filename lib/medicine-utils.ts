export interface Medicine {
  id: string
  name: string
  price: number
  quantity: number
  expiryDate: string
  minStockLevel?: number
}

export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc'
  | 'expiry-asc'
  | 'expiry-desc'
  | 'quantity-asc'
  | 'quantity-desc'

/**
 * Returns medicines whose expiry date is on or before the given date.
 */
export function getExpiringMedicines(
  medicines: Medicine[],
  targetDate: string
): Medicine[] {
  if (!targetDate) return []
  const target = new Date(targetDate)
  return medicines.filter((m) => new Date(m.expiryDate) <= target)
}

/**
 * Returns medicines with a price strictly greater than the given threshold.
 */
export function getExpensiveMedicines(
  medicines: Medicine[],
  threshold = 5
): Medicine[] {
  return medicines.filter((m) => m.price > threshold)
}

/**
 * Returns medicines whose quantity is at or below the configured minimum stock level.
 */
export function getLowStockMedicines(medicines: Medicine[]): Medicine[] {
  return medicines.filter(
    (m) => m.minStockLevel !== undefined && m.quantity <= m.minStockLevel
  )
}

/**
 * Case-insensitive name search.
 */
export function searchMedicines(
  medicines: Medicine[],
  query: string
): Medicine[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return medicines
  return medicines.filter((m) => m.name.toLowerCase().includes(trimmed))
}

/**
 * Returns a new array sorted by the given option, without mutating the input.
 */
export function sortMedicines(
  medicines: Medicine[],
  option: SortOption
): Medicine[] {
  const copy = [...medicines]
  switch (option) {
    case 'name-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name, 'bg'))
    case 'name-desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name, 'bg'))
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price)
    case 'expiry-asc':
      return copy.sort(
        (a, b) =>
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      )
    case 'expiry-desc':
      return copy.sort(
        (a, b) =>
          new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime()
      )
    case 'quantity-asc':
      return copy.sort((a, b) => a.quantity - b.quantity)
    case 'quantity-desc':
      return copy.sort((a, b) => b.quantity - a.quantity)
    default:
      return copy
  }
}

/**
 * True when the medicine is at or below its configured min stock level.
 */
export function isLowStock(medicine: Medicine): boolean {
  return (
    medicine.minStockLevel !== undefined &&
    medicine.quantity <= medicine.minStockLevel
  )
}

/**
 * True when the expiry date is within the next `days` days from `now`.
 */
export function isExpiringSoon(
  expiryDate: string,
  days = 30,
  now: Date = new Date()
): boolean {
  const expiry = new Date(expiryDate)
  const diffMs = expiry.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= days
}

/**
 * True when the expiry date has already passed.
 */
export function isExpired(
  expiryDate: string,
  now: Date = new Date()
): boolean {
  return new Date(expiryDate).getTime() < now.getTime()
}
