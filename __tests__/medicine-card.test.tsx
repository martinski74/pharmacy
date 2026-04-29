import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MedicineCard from '@/components/medicine-card'

const baseMedicine = {
  id: '1',
  name: 'Аспирин',
  price: 3.5,
  quantity: 50,
  expiryDate: '2030-06-30',
  minStockLevel: 10,
}

describe('MedicineCard', () => {
  it('renders the name, price, quantity and min stock level', () => {
    render(
      <MedicineCard medicine={baseMedicine} onEdit={() => {}} onDelete={() => {}} />
    )

    expect(screen.getByText('Аспирин')).toBeInTheDocument()
    expect(screen.getByText(/3\.50 лв/)).toBeInTheDocument()
    expect(screen.getByText(/Количество:/).parentElement?.textContent).toContain('50')
    expect(screen.getByText(/Минимум:/).parentElement?.textContent).toContain('10')
  })

  it('formats the expiry date in bg-BG locale', () => {
    render(
      <MedicineCard medicine={baseMedicine} onEdit={() => {}} onDelete={() => {}} />
    )

    const expected = new Date('2030-06-30').toLocaleDateString('bg-BG')
    expect(screen.getByText(new RegExp(expected))).toBeInTheDocument()
  })

  it('shows the low-stock badge when quantity is below minimum', () => {
    render(
      <MedicineCard
        medicine={{ ...baseMedicine, quantity: 5, minStockLevel: 10 }}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    )
    expect(screen.getByText('Нисък запас')).toBeInTheDocument()
  })

  it('does not show the low-stock badge when quantity is above minimum', () => {
    render(
      <MedicineCard medicine={baseMedicine} onEdit={() => {}} onDelete={() => {}} />
    )
    expect(screen.queryByText('Нисък запас')).not.toBeInTheDocument()
  })

  it('shows the expiring-soon badge when expiry is within 30 days', () => {
    const soon = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    render(
      <MedicineCard
        medicine={{ ...baseMedicine, expiryDate: soon }}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    )
    expect(screen.getByText('Скоро изтича')).toBeInTheDocument()
  })

  it('calls onEdit with the medicine when the edit button is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = jest.fn()

    render(<MedicineCard medicine={baseMedicine} onEdit={onEdit} onDelete={() => {}} />)

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])

    expect(onEdit).toHaveBeenCalledWith(baseMedicine)
  })

  it('calls onDelete with the id when the delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = jest.fn()

    render(
      <MedicineCard medicine={baseMedicine} onEdit={() => {}} onDelete={onDelete} />
    )

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[1])

    expect(onDelete).toHaveBeenCalledWith('1')
  })
})
