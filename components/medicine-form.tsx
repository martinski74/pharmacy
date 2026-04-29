'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, FieldLabel } from '@/components/ui/field'

interface Medicine {
  id: string
  name: string
  price: number
  quantity: number
  expiryDate: string
  minStockLevel?: number
}

interface MedicineFormProps {
  medicine?: Medicine
  onSubmit: (medicine: Omit<Medicine, 'id'>) => void
  onCancel: () => void
  isEditing?: boolean
}

export default function MedicineForm({
  medicine,
  onSubmit,
  onCancel,
  isEditing = false,
}: MedicineFormProps) {
  const [formData, setFormData] = React.useState({
    name: medicine?.name || '',
    price: medicine?.price.toString() || '',
    quantity: medicine?.quantity.toString() || '',
    expiryDate: medicine?.expiryDate || '',
    minStockLevel: medicine?.minStockLevel?.toString() || '10',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.quantity || !formData.expiryDate) {
      alert('Моля, попълнете всички полета!')
      return
    }

    onSubmit({
      name: formData.name,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      expiryDate: formData.expiryDate,
      minStockLevel: parseInt(formData.minStockLevel) || 10,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup>
        <FieldLabel>Наименование</FieldLabel>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Например: Парацетамол"
          required
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Цена (лв.)</FieldLabel>
        <Input
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Количество</FieldLabel>
        <Input
          name="quantity"
          type="number"
          min="0"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="0"
          required
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Срок на годност</FieldLabel>
        <Input
          name="expiryDate"
          type="date"
          value={formData.expiryDate}
          onChange={handleChange}
          required
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Минимален запас</FieldLabel>
        <Input
          name="minStockLevel"
          type="number"
          min="0"
          value={formData.minStockLevel}
          onChange={handleChange}
          placeholder="10"
        />
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {isEditing ? 'Запазване' : 'Добавяне'}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Отмяна
        </Button>
      </div>
    </form>
  )
}
