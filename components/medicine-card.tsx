'use client'

import { Button } from '@/components/ui/button'
import { Trash2, Edit2, AlertTriangle } from 'lucide-react'

interface Medicine {
  id: string
  name: string
  price: number
  quantity: number
  expiryDate: string
  minStockLevel?: number
  isDeleting?: boolean
  isNew?: boolean
}

interface MedicineCardProps {
  medicine: Medicine
  onEdit: (medicine: Medicine) => void
  onDelete: (id: string) => void
}

export default function MedicineCard({ medicine, onEdit, onDelete }: MedicineCardProps) {
  const isLowStock = medicine.quantity < (medicine.minStockLevel || 10)
  const isExpiringSoon = new Date(medicine.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-all duration-300 ${
        medicine.isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      } ${medicine.isNew ? 'animate-in fade-in slide-in-from-top-2' : ''} ${
        isLowStock ? 'border-yellow-400 bg-yellow-50' : ''
      } ${isExpiringSoon ? 'border-red-400' : ''}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">{medicine.name}</h3>
          {isLowStock && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-200 rounded-full text-xs font-medium text-yellow-800">
              <AlertTriangle size={14} />
              Нисък запас
            </div>
          )}
          {isExpiringSoon && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-200 rounded-full text-xs font-medium text-red-800">
              <AlertTriangle size={14} />
              Скоро изтича
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
          <div>
            <span className="font-medium">Цена:</span> {medicine.price.toFixed(2)} лв.
          </div>
          <div>
            <span className="font-medium">Количество:</span> {medicine.quantity}
          </div>
          <div>
            <span className="font-medium">Срок:</span> {new Date(medicine.expiryDate).toLocaleDateString('bg-BG')}
          </div>
          <div>
            <span className="font-medium">Минимум:</span> {medicine.minStockLevel || 10}
          </div>
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(medicine)}
          className="text-blue-600 hover:bg-blue-50"
        >
          <Edit2 size={16} />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(medicine.id)}
          className="text-red-600 hover:bg-red-50"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  )
}
