import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import Pagination from '../components/Pagination'
import { api } from '../services/api'

const initialFilters = { search: '', status: '', priority: '', sort: 'opened_at', direction: 'desc' }

function TicketsPage({ user, onLogout }) {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.listTickets({ ...filters, page: currentPage }).then((data) => {
      setTickets(data.data?.data || [])
      setPagination({ currentPage: data.data?.current_page || currentPage, lastPage: data.data?.last_page || 1 })
    }).catch((requestError) => setError(requestError.message || 'Nao foi possivel carregar os chamados.')).finally(() => setIsLoading(false))
  }, [currentPage, filters])

  function updateFilters(nextFilters) {
    setError('')
    setIsLoading(true)
    setFilters(nextFilters)
    setCurrentPage(1)
  }

  function changePage(page) {
    setError('')
    setIsLoading(true)
    setCurrentPage(page)
  }

  return (
    <main className="dashboard-page">
      <AppHeader user={user} onLogout={onLogout} />

      <section className="ticket-list-page" aria-labelledby="ticket-list-title">
        <div className="section-heading">
          <div>
            <button
              type="button"
              className="back-button"
              onClick={() => navigate('/dashboard')}
              data-cy="back-dashboard-button"
            >
              Voltar ao painel
            </button>
            <h2 id="ticket-list-title">Todos os chamados</h2>
            <p className="intro">
              Consulte, filtre e acompanhe as solicitações registradas.
            </p>
          </div>
          <button
            type="button"
            className="button-primary"
            onClick={() => navigate('/chamados/novo')}
            data-cy="new-ticket-button"
          >
            Novo chamado
          </button>
        </div>

        <div className="ticket-filters" aria-label="Filtros de chamados">
          <div className="field-group filter-search">
            <label htmlFor="ticket-search">Buscar</label>
            <input
              id="ticket-search"
              type="search"
              value={filters.search}
              onChange={(event) => updateFilters({ ...filters, search: event.target.value })}
              minLength={1}
              maxLength={100}
              placeholder="Titulo ou descricao"
              data-cy="ticket-search"
            />
          </div>

          <div className="field-group">
            <label htmlFor="ticket-status">Status</label>
            <select
              id="ticket-status"
              value={filters.status}
              onChange={(event) => updateFilters({ ...filters, status: event.target.value })}
              data-cy="ticket-status-filter"
            >
              <option value="">Todos</option>
              <option value="aberto">Aberto</option>
              <option value="em andamento">Em andamento</option>
              <option value="resolvido">Resolvido</option>
              <option value="fechado">Fechado</option>
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="ticket-priority">Prioridade</label>
            <select
              id="ticket-priority"
              value={filters.priority}
              onChange={(event) => updateFilters({ ...filters, priority: event.target.value })}
              data-cy="ticket-priority-filter"
            >
              <option value="">Todas</option>
              <option value="baixa">Baixa</option>
              <option value="média">Média</option>
              <option value="alta">Alta</option>
              <option value="crítica">Crítica</option>
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="ticket-sort">Ordenar por</label>
            <select
              id="ticket-sort"
              value={filters.sort}
              onChange={(event) => updateFilters({ ...filters, sort: event.target.value })}
              data-cy="ticket-sort-filter"
            >
              <option value="opened_at">Mais recentes</option>
              <option value="priority">Prioridade</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="form-error" role="alert" data-cy="ticket-list-error">
            {error}
          </p>
        )}

        {isLoading && (
          <p className="loading-state" data-cy="ticket-list-loading">
            Carregando chamados...
          </p>
        )}

        {!isLoading && tickets.length === 0 && (
          <div className="empty-state" data-cy="ticket-list-empty">
            <div className="empty-icon" aria-hidden="true">+</div>
            <h3>Nenhum chamado encontrado</h3>
            <p>Não há chamados para os filtros selecionados.</p>
          </div>
        )}

        {!isLoading && tickets.length > 0 && (
          <>
            <div className="ticket-table-wrap">
              <table className="ticket-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Prioridade</th>
                    <th>Status</th>
                    <th>Responsável</th>
                    <th>Abertura</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} data-cy={`ticket-row-${ticket.id}`}>
                      <td>
                        <button
                          type="button"
                          className="ticket-title-button"
                          onClick={() => navigate(`/chamados/${ticket.id}`)}
                          data-cy={`view-ticket-${ticket.id}`}
                        >
                          <strong>{ticket.title}</strong>
                          <small>{ticket.description}</small>
                        </button>
                      </td>
                      <td>
                        <span className={`priority-badge priority-${ticket.priority}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge">{ticket.status}</span>
                      </td>
                      <td>{ticket.assignee?.name || 'Não atribuído'}</td>
                      <td>{new Date(ticket.opened_at).toLocaleDateString('pt-BR')}</td>
                      <td>
                        {user.role === 'atendente' && (
                          <button
                            type="button"
                            className="table-action"
                            onClick={() => navigate(`/chamados/${ticket.id}/editar`)}
                            data-cy={`edit-ticket-${ticket.id}`}
                          >
                            Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={pagination.currentPage}
              lastPage={pagination.lastPage}
              onChange={changePage}
            />
          </>
        )}
      </section>
    </main>
  )
}

export default TicketsPage
