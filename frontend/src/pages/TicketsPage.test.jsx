import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TicketsPage from './TicketsPage'
import { api } from '../services/api'

vi.mock('../services/api', () => ({
  api: {
    listTickets: vi.fn(),
  },
}))

const ticket = {
  id: 1,
  title: 'Computador com problema',
  description: 'O computador não inicia.',
  priority: 'crítica',
  status: 'aberto',
  opened_at: '2026-09-22T10:00:00.000000Z',
  assignee: { name: 'Ana Souza' },
}

function renderPage(user = { name: 'Ana Souza', role: 'atendente' }) {
  return render(
    <MemoryRouter>
      <TicketsPage user={user} onLogout={() => {}} />
    </MemoryRouter>,
  )
}

describe('TicketsPage', () => {
  beforeEach(() => {
    api.listTickets.mockResolvedValue({
      data: { data: [ticket], current_page: 1, last_page: 2 },
    })
  })

  test('loads tickets and shows pagination', async () => {
    renderPage()

    expect(await screen.findByText('Computador com problema')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(api.listTickets).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }))
  })

  test('reloads the first page when a filter changes', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Computador com problema')

    await user.selectOptions(screen.getByLabelText('Prioridade'), 'crítica')

    await waitFor(() => expect(api.listTickets).toHaveBeenLastCalledWith(expect.objectContaining({ priority: 'crítica', page: 1 })))
  })

  test('does not show edit action to requesters', async () => {
    renderPage({ name: 'Joao Silva', role: 'solicitante' })

    await screen.findByText('Computador com problema')

    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })
})
