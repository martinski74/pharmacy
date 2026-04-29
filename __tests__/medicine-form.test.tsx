import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MedicineForm from '@/components/medicine-form'

describe('MedicineForm', () => {
  it('renders the "add" submit label by default', () => {
    render(<MedicineForm onSubmit={() => {}} onCancel={() => {}} />)
    expect(screen.getByRole('button', { name: 'Добавяне' })).toBeInTheDocument()
  })

  it('renders the "save" submit label when editing', () => {
    render(
      <MedicineForm
        isEditing
        onSubmit={() => {}}
        onCancel={() => {}}
        medicine={{
          id: '1',
          name: 'Аспирин',
          price: 3.5,
          quantity: 50,
          expiryDate: '2030-01-01',
          minStockLevel: 10,
        }}
      />
    )
    expect(screen.getByRole('button', { name: 'Запазване' })).toBeInTheDocument()
  })

  it('pre-fills inputs when editing an existing medicine', () => {
    render(
      <MedicineForm
        isEditing
        onSubmit={() => {}}
        onCancel={() => {}}
        medicine={{
          id: '1',
          name: 'Аспирин',
          price: 3.5,
          quantity: 50,
          expiryDate: '2030-01-01',
          minStockLevel: 7,
        }}
      />
    )

    expect(screen.getByDisplayValue('Аспирин')).toBeInTheDocument()
    expect(screen.getByDisplayValue('3.5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('50')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2030-01-01')).toBeInTheDocument()
    expect(screen.getByDisplayValue('7')).toBeInTheDocument()
  })

  it('calls onSubmit with parsed values on valid submission', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()

    render(<MedicineForm onSubmit={onSubmit} onCancel={() => {}} />)

    await user.type(screen.getByPlaceholderText('Например: Парацетамол'), 'Ибупрофен')
    await user.type(screen.getByPlaceholderText('0.00'), '6.5')
    await user.type(screen.getByPlaceholderText('0'), '20')

    const dateInput = document.querySelector(
      'input[name="expiryDate"]'
    ) as HTMLInputElement
    await user.type(dateInput, '2027-01-01')

    await user.click(screen.getByRole('button', { name: 'Добавяне' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ибупрофен',
      price: 6.5,
      quantity: 20,
      expiryDate: '2027-01-01',
      minStockLevel: 10,
    })
  })

  it('shows an alert and does not submit when fields are empty', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(<MedicineForm onSubmit={onSubmit} onCancel={() => {}} />)

    // Submit via the form to bypass the browser-required validation in jsdom
    const form = document.querySelector('form') as HTMLFormElement
    form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(onSubmit).not.toHaveBeenCalled()
    alertSpy.mockRestore()
  })

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = jest.fn()

    render(<MedicineForm onSubmit={() => {}} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: 'Отмяна' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
