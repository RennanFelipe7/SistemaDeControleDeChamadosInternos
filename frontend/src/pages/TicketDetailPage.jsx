import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { api } from '../services/api'

function TicketDetailPage({ user, onLogout }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getTicket(id).then((data) => setTicket(data.data)).catch((requestError) => setError(requestError.message)).finally(() => setIsLoading(false))
  }, [id])

  return (
    <main className="dashboard-page">
      <AppHeader user={user} onLogout={onLogout} />

      <section className="ticket-detail-page" aria-labelledby="ticket-detail-title">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate('/chamados')}
          data-cy="back-tickets-button"
        >
          Voltar para chamados
        </button>

        {isLoading && (
          <p className="loading-state" data-cy="ticket-detail-loading">
            Carregando chamado...
          </p>
        )}

        {error && (
          <p className="form-error" role="alert" data-cy="ticket-detail-error">
            {error}
          </p>
        )}

        {ticket && (
          <>
            <div className="detail-heading">
              <div>
                <p className="eyebrow">Chamado #{ticket.id}</p>
                <h2 id="ticket-detail-title">{ticket.title}</h2>
              </div>
              <span className={`priority-badge priority-${ticket.priority}`}>
                {ticket.priority}
              </span>
            </div>

            <div className="ticket-detail-card">
              <div className="detail-meta-grid">
                <div>
                  <span>Status</span>
                  <strong className="status-badge">{ticket.status}</strong>
                </div>
                <div>
                  <span>Responsavel</span>
                  <strong>{ticket.assignee?.name || 'Nao atribuido'}</strong>
                </div>
                <div>
                  <span>Solicitante</span>
                  <strong>{ticket.requester?.name || 'Nao informado'}</strong>
                </div>
                <div>
                  <span>Data de abertura</span>
                  <strong>{new Date(ticket.opened_at).toLocaleString('pt-BR')}</strong>
                </div>
              </div>

              <div className="detail-description">
                <span>Descricao</span>
                <p>{ticket.description}</p>
              </div>

              {user.role === 'atendente' && (
                <div className="detail-actions">
                  <button
                    type="button"
                    className="button-primary"
                    onClick={() => navigate(`/chamados/${ticket.id}/editar`)}
                    data-cy="detail-edit-ticket-button"
                  >
                    Editar chamado
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default TicketDetailPage
