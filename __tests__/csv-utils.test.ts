import { exportToCSV, importFromCSV } from '@/lib/csv-utils'

describe('exportToCSV', () => {
  let createObjectURLMock: jest.Mock
  let revokeObjectURLMock: jest.Mock
  let appendSpy: jest.SpyInstance
  let removeSpy: jest.SpyInstance
  let clickSpy: jest.SpyInstance

  beforeEach(() => {
    createObjectURLMock = jest.fn(() => 'blob:mock-url')
    revokeObjectURLMock = jest.fn()
    ;(global as any).URL.createObjectURL = createObjectURLMock
    ;(global as any).URL.revokeObjectURL = revokeObjectURLMock

    appendSpy = jest.spyOn(document.body, 'appendChild')
    removeSpy = jest.spyOn(document.body, 'removeChild')
    clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('creates a blob URL and triggers a download', () => {
    exportToCSV([
      {
        id: '1',
        name: 'Aspirin',
        price: 3.5,
        quantity: 50,
        expiryDate: '2027-06-30',
        minStockLevel: 10,
      },
    ])

    expect(createObjectURLMock).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(appendSpy).toHaveBeenCalledTimes(1)
    expect(removeSpy).toHaveBeenCalledTimes(1)
  })

  it('passes a CSV blob with headers and a row to URL.createObjectURL', () => {
    exportToCSV([
      {
        id: '1',
        name: 'Aspirin',
        price: 3.5,
        quantity: 50,
        expiryDate: '2027-06-30',
        minStockLevel: 10,
      },
    ])

    const blob: Blob = createObjectURLMock.mock.calls[0][0]
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toContain('text/csv')
  })

  it('handles empty medicine array (header-only)', () => {
    exportToCSV([])
    expect(createObjectURLMock).toHaveBeenCalledTimes(1)
  })
})

/**
 * Helper that builds a File-like object whose readAsText returns the given content.
 */
function makeCSVFile(content: string): File {
  // jsdom's File works, but we mock FileReader to control the result deterministically.
  const file = new File([content], 'medicines.csv', { type: 'text/csv' })
  return file
}

describe('importFromCSV', () => {
  let originalFileReader: typeof FileReader

  beforeEach(() => {
    originalFileReader = global.FileReader
  })

  afterEach(() => {
    global.FileReader = originalFileReader
  })

  function mockFileReaderWith(content: string | null, fail = false) {
    class MockFileReader {
      onload: ((e: any) => void) | null = null
      onerror: (() => void) | null = null
      readAsText() {
        setTimeout(() => {
          if (fail) {
            this.onerror?.()
          } else {
            this.onload?.({ target: { result: content } })
          }
        }, 0)
      }
    }
    ;(global as any).FileReader = MockFileReader
  }

  it('parses a valid CSV with header and rows', async () => {
    mockFileReaderWith(
      [
        'Name,Price,Quantity,Expiry Date,Min Stock Level',
        '"Aspirin",3.5,50,2027-06-30,10',
        '"Paracetamol",4,5,2026-04-15,15',
      ].join('\n')
    )

    const result = await importFromCSV(makeCSVFile('ignored'))

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      name: 'Aspirin',
      price: 3.5,
      quantity: 50,
      expiryDate: '2027-06-30',
      minStockLevel: 10,
    })
    expect(result[1]).toMatchObject({
      name: 'Paracetamol',
      price: 4,
      quantity: 5,
      expiryDate: '2026-04-15',
      minStockLevel: 15,
    })
  })

  it('defaults minStockLevel to 10 when missing', async () => {
    mockFileReaderWith(
      [
        'Name,Price,Quantity,Expiry Date',
        '"Aspirin",3.5,50,2027-06-30',
      ].join('\n')
    )

    const result = await importFromCSV(makeCSVFile('ignored'))
    expect(result[0].minStockLevel).toBe(10)
  })

  it('marks imported items as new', async () => {
    mockFileReaderWith(
      [
        'Name,Price,Quantity,Expiry Date,Min Stock Level',
        '"Aspirin",3.5,50,2027-06-30,10',
      ].join('\n')
    )

    const result = await importFromCSV(makeCSVFile('ignored'))
    expect(result[0].isNew).toBe(true)
  })

  it('clamps negative numbers to zero', async () => {
    mockFileReaderWith(
      [
        'Name,Price,Quantity,Expiry Date,Min Stock Level',
        '"Aspirin",-3.5,-50,2027-06-30,-10',
      ].join('\n')
    )

    const result = await importFromCSV(makeCSVFile('ignored'))
    expect(result[0].price).toBe(0)
    expect(result[0].quantity).toBe(0)
    expect(result[0].minStockLevel).toBe(0)
  })

  it('rejects when a row has invalid data', async () => {
    mockFileReaderWith(
      [
        'Name,Price,Quantity,Expiry Date,Min Stock Level',
        '"",abc,xyz,,10',
      ].join('\n')
    )

    await expect(importFromCSV(makeCSVFile('ignored'))).rejects.toThrow(
      /CSV Import Error/
    )
  })

  it('rejects when the file fails to read', async () => {
    mockFileReaderWith(null, true)
    await expect(importFromCSV(makeCSVFile('ignored'))).rejects.toThrow(
      /Failed to read file/
    )
  })
})
