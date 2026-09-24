import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { api } from '../services/api'

function DashboardPage({ user, onLogout }) {
  const navigate = useNavigate()
  const firstName = user.name.split(' ')[0]
  const [dashboard, setDashboard] = useState({
    counts: { aberto: 0, em_andamento: 0, finalizado: 0 },
    recent_tickets: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getDashboard()
      .then((data) => setDashboard(data.data))
      .catch((requestError) => setError(requestError.message || 'Não foi possível carregar o resumo.'))
      .finally(() => setIsLoading(false))
  }, [])

  let recentContent
  if (isLoading) {
    recentContent = (
      <p className="loading-state" data-cy="dashboard-loading">
        Carregando resumo...
      </p>
    )
  } else if (dashboard.recent_tickets.length === 0) {
    recentContent = (
      <div className="empty-state" data-cy="empty-tickets-state">
        <div className="empty-icon" aria-hidden="true">+</div>
        <h3>Nenhum chamado por aqui</h3>
        <p>Quando um chamado for criado, ele aparecera nesta area para acompanhamento.</p>
        <button
          type="button"
          className="button-secondary"
          onClick={() => navigate('/chamados/novo')}
          data-cy="empty-new-ticket-button"
        >
          Abrir primeiro chamado
        </button>
      </div>
    )
  } else {
    recentContent = (
      <div className="recent-tickets-list">
        {dashboard.recent_tickets.map((ticket) => (
          <button
            type="button"
            className="recent-ticket-item"
            key={ticket.id}
            onClick={() => navigate(`/chamados/${ticket.id}`)}
            data-cy={`recent-ticket-${ticket.id}`}
          >
            <span>
              <strong>{ticket.title}</strong>
              <small>
                {new Date(ticket.opened_at).toLocaleDateString('pt-BR')} · {ticket.status}
              </small>
            </span>
            <span className={`priority-badge priority-${ticket.priority}`}>
              {ticket.priority}
            </span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <main className="dashboard-page">
      <AppHeader user={user} onLogout={onLogout} />
      <section className="welcome-section" aria-labelledby="welcome-title">
        <div>
          <p className="eyebrow">Visao geral</p>
          <h2 id="welcome-title">Olá, {firstName}.</h2>
          <p className="intro">Acompanhe as solicitacoes e mantenha o atendimento organizado.</p>
        </div>
        <button type="button" className="button-primary" onClick={() => navigate('/chamados/novo')} data-cy="new-ticket-button">Novo chamado</button>
      </section>

      {error && <p className="form-error" role="alert" data-cy="dashboard-error">{error}</p>}

      <section className="metrics-grid" aria-label="Resumo dos chamados">
        <article className="metric-card"><span>Chamados em aberto</span><strong>{isLoading ? '...' : dashboard.counts.aberto}</strong><small>Aguardando atendimento</small></article>
        <article className="metric-card"><span>Em andamento</span><strong>{isLoading ? '...' : dashboard.counts.em_andamento}</strong><small>Em atendimento agora</small></article>
        <article className="metric-card"><span>Finalizados</span><strong>{isLoading ? '...' : dashboard.counts.finalizado}</strong><small>Resolvidos ou fechados</small></article>
      </section>

      <section className="dashboard-content" aria-labelledby="recent-tickets-title">
        <div className="section-heading"><div><p className="eyebrow">Acompanhamento</p><h2 id="recent-tickets-title">Chamados recentes</h2></div><button type="button" className="text-button" onClick={() => navigate('/chamados')} data-cy="view-all-tickets-button">Ver todos</button></div>
        {recentContent}
      </section>
    </main>
  )
}

export default DashboardPage
