import { fireEvent, render, screen } from '@testing-library/react'
import Pagination from './Pagination'

describe('Pagination', () => {
  test('does not render when there is only one page', () => {
    render(<Pagination currentPage={1} lastPage={1} onChange={() => {}} />)

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  test('disables previous on first page and next on last page', () => {
    const { rerender } = render(<Pagination currentPage={1} lastPage={3} onChange={() => {}} />)

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próxima' })).not.toBeDisabled()

    rerender(<Pagination currentPage={3} lastPage={3} onChange={() => {}} />)

    expect(screen.getByRole('button', { name: 'Anterior' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled()
  })

  test('changes page when a page button is clicked', () => {
    const onChange = vi.fn()
    render(<Pagination currentPage={1} lastPage={3} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '2' }))

    expect(onChange).toHaveBeenCalledWith(2)
  })
})
