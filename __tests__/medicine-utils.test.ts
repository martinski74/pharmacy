import {
  Medicine,
  getExpiringMedicines,
  getExpensiveMedicines,
  getLowStockMedicines,
  searchMedicines,
  sortMedicines,
  isLowStock,
  isExpiringSoon,
  isExpired,
} from '@/lib/medicine-utils'

const sample: Medicine[] = [
  {
    id: '1',
    name: 'Аспирин',
    price: 3.5,
    quantity: 50,
    expiryDate: '2027-06-30',
    minStockLevel: 10,
  },
  {
    id: '2',
    name: 'Парацетамол',
    price: 4.0,
    quantity: 5,
    expiryDate: '2026-04-15',
    minStockLevel: 15,
  },
  {
    id: '3',
    name: 'Ибупрофен',
    price: 6.5,
    quantity: 20,
    expiryDate: '2026-05-20',
    minStockLevel: 10,
  },
  {
    id: '4',
    name: 'Витамин C',
    price: 8.0,
    quantity: 100,
    expiryDate: '2028-01-01',
  },
]

describe('getExpiringMedicines', () => {
  it('returns medicines expiring on or before the target date', () => {
    const result = getExpiringMedicines(sample, '2026-05-20')
    expect(result.map((m) => m.name)).toEqual(['Парацетамол', 'Ибупрофен'])
  })

  it('returns empty array when target date is empty', () => {
    expect(getExpiringMedicines(sample, '')).toEqual([])
  })

  it('returns empty array when no medicines expire by the target date', () => {
    expect(getExpiringMedicines(sample, '2024-01-01')).toEqual([])
  })

  it('includes medicines whose expiry equals the target date', () => {
    const result = getExpiringMedicines(sample, '2026-04-15')
    expect(result.map((m) => m.name)).toEqual(['Парацетамол'])
  })
})

describe('getExpensiveMedicines', () => {
  it('returns medicines with price strictly greater than 5 by default', () => {
    const result = getExpensiveMedicines(sample)
    expect(result.map((m) => m.name)).toEqual(['Ибупрофен', 'Витамин C'])
  })

  it('respects a custom threshold', () => {
    const result = getExpensiveMedicines(sample, 7)
    expect(result.map((m) => m.name)).toEqual(['Витамин C'])
  })

  it('excludes medicines whose price equals the threshold', () => {
    const data: Medicine[] = [
      { id: 'a', name: 'A', price: 5, quantity: 1, expiryDate: '2030-01-01' },
    ]
    expect(getExpensiveMedicines(data, 5)).toEqual([])
  })
})

describe('getLowStockMedicines', () => {
  it('returns only medicines at or below their min stock level', () => {
    const result = getLowStockMedicines(sample)
    expect(result.map((m) => m.name)).toEqual(['Парацетамол'])
  })

  it('ignores medicines without minStockLevel', () => {
    const result = getLowStockMedicines([
      { id: 'a', name: 'A', price: 1, quantity: 0, expiryDate: '2030-01-01' },
    ])
    expect(result).toEqual([])
  })
})

describe('searchMedicines', () => {
  it('returns all medicines when query is empty', () => {
    expect(searchMedicines(sample, '')).toHaveLength(sample.length)
  })

  it('returns all medicines when query is whitespace only', () => {
    expect(searchMedicines(sample, '   ')).toHaveLength(sample.length)
  })

  it('matches case-insensitively', () => {
    const result = searchMedicines(sample, 'аспирин')
    expect(result.map((m) => m.name)).toEqual(['Аспирин'])
  })

  it('matches partial substrings', () => {
    const result = searchMedicines(sample, 'парацет')
    expect(result.map((m) => m.name)).toEqual(['Парацетамол'])
  })

  it('returns empty array when no match', () => {
    expect(searchMedicines(sample, 'qwerty')).toEqual([])
  })
})

describe('sortMedicines', () => {
  it('does not mutate the original array', () => {
    const copy = [...sample]
    sortMedicines(sample, 'price-asc')
    expect(sample).toEqual(copy)
  })

  it('sorts by name ascending', () => {
    const result = sortMedicines(sample, 'name-asc').map((m) => m.name)
    expect(result).toEqual(['Аспирин', 'Витамин C', 'Ибупрофен', 'Парацетамол'])
  })

  it('sorts by price ascending', () => {
    const result = sortMedicines(sample, 'price-asc').map((m) => m.price)
    expect(result).toEqual([3.5, 4.0, 6.5, 8.0])
  })

  it('sorts by price descending', () => {
    const result = sortMedicines(sample, 'price-desc').map((m) => m.price)
    expect(result).toEqual([8.0, 6.5, 4.0, 3.5])
  })

  it('sorts by expiry date ascending', () => {
    const result = sortMedicines(sample, 'expiry-asc').map((m) => m.name)
    expect(result).toEqual(['Парацетамол', 'Ибупрофен', 'Аспирин', 'Витамин C'])
  })

  it('sorts by quantity descending', () => {
    const result = sortMedicines(sample, 'quantity-desc').map((m) => m.quantity)
    expect(result).toEqual([100, 50, 20, 5])
  })
})

describe('isLowStock', () => {
  it('returns true when quantity is at or below the min stock level', () => {
    expect(
      isLowStock({
        id: '1',
        name: 'X',
        price: 1,
        quantity: 5,
        expiryDate: '2030-01-01',
        minStockLevel: 10,
      })
    ).toBe(true)
  })

  it('returns false when quantity exceeds the min stock level', () => {
    expect(
      isLowStock({
        id: '1',
        name: 'X',
        price: 1,
        quantity: 20,
        expiryDate: '2030-01-01',
        minStockLevel: 10,
      })
    ).toBe(false)
  })

  it('returns false when min stock level is undefined', () => {
    expect(
      isLowStock({
        id: '1',
        name: 'X',
        price: 1,
        quantity: 0,
        expiryDate: '2030-01-01',
      })
    ).toBe(false)
  })
})

describe('isExpiringSoon', () => {
  const now = new Date('2026-04-01T00:00:00Z')

  it('returns true when expiry is within the window', () => {
    expect(isExpiringSoon('2026-04-15', 30, now)).toBe(true)
  })

  it('returns false when expiry is past the window', () => {
    expect(isExpiringSoon('2026-06-01', 30, now)).toBe(false)
  })

  it('returns false when already expired', () => {
    expect(isExpiringSoon('2026-03-01', 30, now)).toBe(false)
  })
})

describe('isExpired', () => {
  const now = new Date('2026-04-01T00:00:00Z')

  it('returns true for past dates', () => {
    expect(isExpired('2024-01-01', now)).toBe(true)
  })

  it('returns false for future dates', () => {
    expect(isExpired('2030-01-01', now)).toBe(false)
  })
})
