'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Download, Upload, Search } from 'lucide-react'
import MedicineForm from '@/components/medicine-form'
import MedicineCard from '@/components/medicine-card'
import { exportToCSV, importFromCSV } from '@/lib/csv-utils'
import { useToast } from '@/hooks/use-toast'
import router from 'next/router'
import { useRouter } from 'next/navigation';

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

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'expiry-asc' | 'expiry-desc' | 'quantity-asc' | 'quantity-desc'

export default function PharmacyApp() {
  const API_URL = 'api/products'
  const { toast } = useToast()
  const [medicines, setMedicines] = useState<Medicine[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [filterLowStock, setFilterLowStock] = useState(false)
  const router = useRouter();

  const fetchMedicines = async () => {
      try {
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error('Failed to load medicines')
        const data = (await response.json()) as Medicine[]
        setMedicines(data)
      } catch {
        toast({
          title: 'Грешка при зареждане',
          description: 'Неуспешно зареждане на лекарства от json-server.',
          variant: 'destructive',
        })
      }
    }
  useEffect(() => {
    fetchMedicines()
  }, [toast])

  // Search and filter medicines
  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch = m.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStockFilter = !filterLowStock || m.quantity < (m.minStockLevel || 10)
    return matchesSearch && matchesStockFilter
  })

  // Sort medicines
  const sortedMedicines = [...filteredMedicines].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'name-desc':
        return b.name.localeCompare(a.name)
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'expiry-asc':
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      case 'expiry-desc':
        return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime()
      case 'quantity-asc':
        return a.quantity - b.quantity
      case 'quantity-desc':
        return b.quantity - a.quantity
      default:
        return 0
    }
  })

  const handleAddMedicine = async (formData: Omit<Medicine, 'id'>) => {
    const newMedicine: Medicine = {
      ...formData,
      id: Date.now().toString(),
      isNew: true,
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedicine),
      })
      if (!response.ok) throw new Error('Failed to add medicine')
      const savedMedicine = (await response.json()) as Medicine
      setMedicines((prev) => [...prev, { ...savedMedicine, isNew: true }])
    
    } catch {
      toast({
        title: 'Грешка',
        description: 'Лекарството не можа да бъде добавено.',
        variant: 'destructive',
      })
      return
    }

    setIsAddingNew(false)

    toast({
      title: 'Лекарството е добавено',
      description: `„${formData.name}" беше успешно добавено в списъка.`,
      variant: 'success',
    })

    setTimeout(() => {
      setMedicines((prev) => prev.map((m) => (m.id === newMedicine.id ? { ...m, isNew: false } : m)))
    }, 500)
  }

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingId(medicine.id)
  }

  const handleSaveEdit = async (formData: Omit<Medicine, 'id'>) => {
    if (!editingId) return

    try {
      const response = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingId }),
      })
      if (!response.ok) throw new Error('Failed to update medicine')
      const updatedMedicine = (await response.json()) as Medicine
      setMedicines((prev) => prev.map((m) => (m.id === editingId ? { ...updatedMedicine, isEditing: false } : m)))
    } catch {
      toast({
        title: 'Грешка',
        description: 'Редакцията не можа да бъде запазена.',
        variant: 'destructive',
      })
      return
    }

    setEditingId(null)

    toast({
      title: 'Промените са запазени',
      description: `„${formData.name}" беше успешно редактирано.`,
      variant: 'success',
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const handleDeleteMedicine = async (id: string) => {
    const medicine = medicines.find((m) => m.id === id)
    setMedicines(medicines.map((m) => (m.id === id ? { ...m, isDeleting: true } : m)))

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete medicine')
      setTimeout(() => {
        setMedicines((prev) => prev.filter((m) => m.id !== id))
      }, 300)
    } catch {
      setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, isDeleting: false } : m)))
      toast({
        title: 'Грешка',
        description: 'Лекарството не можа да бъде изтрито.',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Лекарството е изтрито',
      description: `„${medicine?.name}" беше премахнато от списъка.`,
      variant: 'destructive',
    })
  }

  const handleExportCSV = () => {
    exportToCSV(medicines)
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const importedMedicines = await importFromCSV(file)
      const createdMedicines = await Promise.all(
        importedMedicines.map(async (medicine) => {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(medicine),
          })
          if (!response.ok) throw new Error('Import failed')
          return (await response.json()) as Medicine
        })
      )
      setMedicines((prev) => [...prev, ...createdMedicines])
    } catch (error) {
      alert(`Грешка при импорт: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Reset input
    e.target.value = ''
  }

  const lowStockCount = medicines.filter((m) => m.quantity < (m.minStockLevel || 10)).length
  const expensiveCount = medicines.filter((m) => m.price > 5).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Аптечно управление</h1>
          <p className="text-gray-600">Управление на лекарства, запас и цени</p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setIsAddingNew(true)} className="gap-2">
                <Plus size={18} />
                Добави лекарство
              </Button>
              <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                <Download size={18} />
                Експорт (CSV)
              </Button>
              <Button variant="outline" className="gap-2" asChild>
                <label className="cursor-pointer">
                  <Upload size={18} />
                  Импорт (CSV)
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search and Sort */}
        <Card className="mb-8 bg-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <Input
                    placeholder="Търсене по название..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border rounded-lg bg-white"
              >
                <optgroup label="Име">
                  <option value="name-asc">А - Я (Възходящо)</option>
                  <option value="name-desc">Я - А (Низходящо)</option>
                </optgroup>
                <optgroup label="Цена">
                  <option value="price-asc">Цена: Ниска - Висока</option>
                  <option value="price-desc">Цена: Висока - Ниска</option>
                </optgroup>
                <optgroup label="Срок на годност">
                  <option value="expiry-asc">Изтича: Скоро - По-късно</option>
                  <option value="expiry-desc">Изтича: По-късно - Скоро</option>
                </optgroup>
                <optgroup label="Количество">
                  <option value="quantity-asc">Количество: Малко - Много</option>
                  <option value="quantity-desc">Количество: Много - Малко</option>
                </optgroup>
              </select>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="lowStock"
                checked={filterLowStock}
                onChange={(e) => setFilterLowStock(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="lowStock" className="text-sm text-gray-700">
                Покажи само нисък запас ({lowStockCount})
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add/Edit Form */}
          {(isAddingNew || editingId) && (
            <Card className="lg:col-span-1 sticky top-8 h-fit">
              <CardHeader>
                <CardTitle className="text-lg">
                  {isAddingNew ? 'Добави лекарство' : 'Редактирай лекарство'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MedicineForm
                  medicine={editingId ? medicines.find((m) => m.id === editingId) : undefined}
                  onSubmit={editingId ? handleSaveEdit : handleAddMedicine}
                  onCancel={editingId ? handleCancelEdit : () => setIsAddingNew(false)}
                  isEditing={!!editingId}
                />
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div className={isAddingNew || editingId ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {/* Statistics */}
            {!searchTerm && !filterLowStock && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-blue-600">{medicines.length}</p>
                    <p className="text-sm text-gray-600">Всички лекарства</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-yellow-600">{lowStockCount}</p>
                    <p className="text-sm text-gray-600">Нисък запас</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100">
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-red-600">{expensiveCount}</p>
                    <p className="text-sm text-gray-600">Над 5 лв.</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {medicines.reduce((sum, m) => sum + m.quantity, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Обща наличност</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Medicines List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {searchTerm
                    ? `Резултати за "${searchTerm}" (${sortedMedicines.length})`
                    : filterLowStock
                      ? `Лекарства с нисък запас (${sortedMedicines.length})`
                      : `Всички лекарства (${sortedMedicines.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sortedMedicines.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Няма лекарства за показване</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedMedicines.map((medicine) => (
                      <MedicineCard
                        key={medicine.id}
                        medicine={medicine}
                        onEdit={handleEditMedicine}
                        onDelete={handleDeleteMedicine}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
