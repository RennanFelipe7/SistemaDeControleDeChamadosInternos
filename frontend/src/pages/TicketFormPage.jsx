import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { api } from '../services/api'

const emptyForm = { title: '', description: '', priority: 'baixa', status: 'aberto', assignee_id: '' }

function TicketFormPage({ user, onLogout }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [attendants, setAttendants] = useState([])
  const [ticket, setTicket] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(Boolean(id))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.listAttendants().then((data) => setAttendants(data.data || [])).catch((requestError) => setError(requestError.message))
    if (!id) return
    api.getTicket(id).then((data) => {
      const loadedTicket = data.data
      setTicket(loadedTicket)
      setForm({ title: loadedTicket.title, description: loadedTicket.description, priority: loadedTicket.priority, status: loadedTicket.status, assignee_id: loadedTicket.assignee_id || loadedTicket.assignee?.id || '' })
    }).catch((requestError) => setError(requestError.message)).finally(() => setIsLoading(false))
  }, [id])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSaving(true)
    try {
      await api.saveTicket(id, { ...form, assignee_id: form.assignee_id || null })
      navigate('/chamados')
    } catch (requestError) {
      setError(requestError.message || 'Nao foi possivel salvar o chamado.')
    } finally {
      setIsSaving(false)
    }
  }

  let submitLabel = 'Criar chamado'
  if (ticket) submitLabel = 'Salvar alteracoes'
  if (isSaving) submitLabel = 'Salvando...'

  return (
    <main className="dashboard-page">
      <AppHeader user={user} onLogout={onLogout} />

      <section className="ticket-form-page" aria-labelledby="ticket-form-title">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate('/chamados')}
          data-cy="cancel-ticket-button"
        >
          Cancelar
        </button>

        <div className="form-heading">
          <p className="eyebrow">Solicitacao interna</p>
          <h2 id="ticket-form-title">
            {ticket ? 'Atualize os dados do chamado' : 'Abra uma nova solicitacao'}
          </h2>
          <p className="intro">
            Descreva o pedido com clareza para agilizar o atendimento.
          </p>
        </div>

        {isLoading ? (
          <p className="loading-state">Carregando chamado...</p>
        ) : (
          <form className="ticket-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group field-wide">
              <label htmlFor="ticket-title">Titulo</label>
              <input
                id="ticket-title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                minLength={5}
                maxLength={120}
                required
                data-cy="ticket-title-input"
              />
            </div>

            <div className="field-group field-wide">
              <label htmlFor="ticket-description">Descricao</label>
              <textarea
                id="ticket-description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                minLength={10}
                maxLength={5000}
                rows={7}
                required
                data-cy="ticket-description-input"
              />
            </div>

            <div className="form-grid-two">
              <div className="field-group">
                <label htmlFor="ticket-priority-input">Prioridade</label>
                <select
                  id="ticket-priority-input"
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value })}
                  required
                  data-cy="ticket-priority-input"
                >
                  <option value="baixa">Baixa</option>
                  <option value="média">Média</option>
                  <option value="alta">Alta</option>
                  <option value="crítica">Crítica</option>
                </select>
              </div>

              <div className="field-group">
                <label htmlFor="ticket-assignee-input">Responsavel</label>
                <select
                  id="ticket-assignee-input"
                  value={form.assignee_id}
                  onChange={(event) => setForm({ ...form, assignee_id: event.target.value })}
                  data-cy="ticket-assignee-input"
                >
                  <option value="">A definir automaticamente</option>
                  {attendants.map((attendant) => (
                    <option key={attendant.id} value={attendant.id}>
                      {attendant.name}
                    </option>
                  ))}
                </select>
              </div>

              {ticket && (
                <div className="field-group">
                  <label htmlFor="ticket-status-input">Status</label>
                  <select
                    id="ticket-status-input"
                    value={form.status}
                    onChange={(event) => setForm({ ...form, status: event.target.value })}
                    required
                    data-cy="ticket-status-input"
                  >
                    <option value="aberto">Aberto</option>
                    <option value="em andamento">Em andamento</option>
                    <option value="resolvido">Resolvido</option>
                    <option value="fechado">Fechado</option>
                  </select>
                </div>
              )}
            </div>

            {error && (
              <p className="form-error" role="alert" data-cy="ticket-form-error">
                {error}
              </p>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={() => navigate('/chamados')}
                data-cy="ticket-form-cancel"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="button-primary"
                disabled={isSaving}
                data-cy="ticket-form-submit"
              >
                {submitLabel}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}

export default TicketFormPage
