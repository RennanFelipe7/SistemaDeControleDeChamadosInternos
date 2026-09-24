import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from './DashboardPage'
import { api } from '../services/api'

vi.mock('../services/api', () => ({
  api: {
    getDashboard: vi.fn(),
  },
}))

describe('DashboardPage', () => {
  test('shows real counts and recent tickets', async () => {
    api.getDashboard.mockResolvedValue({
      data: {
        counts: { aberto: 2, em_andamento: 1, finalizado: 3 },
        recent_tickets: [{
          id: 7,
          title: 'Acesso ao sistema',
          priority: 'alta',
          status: 'aberto',
          opened_at: '2026-09-22T10:00:00.000000Z',
        }],
      },
    })

    render(
      <MemoryRouter>
        <DashboardPage user={{ name: 'Ana Souza', role: 'atendente' }} onLogout={() => {}} />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Acesso ao sistema')).toBeInTheDocument()
    expect(screen.getByText('Chamados em aberto').parentElement).toHaveTextContent('2')
    expect(screen.getByText('Em andamento').parentElement).toHaveTextContent('1')
    expect(screen.getByText('Finalizados').parentElement).toHaveTextContent('3')
    expect(api.getDashboard).toHaveBeenCalledOnce()
  })
})
