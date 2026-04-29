interface Medicine {
  id: string
  name: string
  price: number
  quantity: number
  expiryDate: string
  minStockLevel?: number
  isDeleting?: boolean
  isNew?: boolean
  isEditing?: boolean
}

export function exportToCSV(medicines: Medicine[]): void {
  // Filter out UI-only properties
  const cleanMedicines = medicines.map(({ isDeleting, isNew, isEditing, ...rest }) => rest)

  // Create CSV header
  const headers = ['Name', 'Price', 'Quantity', 'Expiry Date', 'Min Stock Level']
  
  // Create CSV rows
  const rows = cleanMedicines.map((medicine) => [
    `"${medicine.name.replace(/"/g, '""')}"`, // Escape quotes
    medicine.price,
    medicine.quantity,
    medicine.expiryDate,
    medicine.minStockLevel || 10,
  ])

  // Combine header and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `medicines-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote inside quoted value
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

export function importFromCSV(file: File): Promise<Medicine[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.trim().split('\n')

        // Skip header and parse data
        const medicines: Medicine[] = lines.slice(1).map((line, index) => {
          const values = parseCSVLine(line)

          if (values.length < 4) {
            throw new Error(`Invalid CSV format at line ${index + 2}`)
          }

          const [name, priceStr, quantityStr, expiryDate, minStockStr] = values

          // Validation
          const price = parseFloat(priceStr)
          const quantity = parseInt(quantityStr)
          const minStockLevel = minStockStr ? parseInt(minStockStr) : 10

          if (!name || isNaN(price) || isNaN(quantity) || !expiryDate) {
            throw new Error(`Invalid data at line ${index + 2}`)
          }

          return {
            id: Date.now().toString() + Math.random(),
            name: name.trim(),
            price: Math.max(0, price),
            quantity: Math.max(0, quantity),
            expiryDate,
            minStockLevel: Math.max(0, minStockLevel),
            isNew: true,
          }
        })

        resolve(medicines)
      } catch (error) {
        reject(new Error(`CSV Import Error: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}
