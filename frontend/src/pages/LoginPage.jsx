import { useState } from 'react'

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await onLogin({ email, password })
    } catch (requestError) {
      setError(requestError.message || 'Nao foi possivel realizar o login.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitLabel = isSubmitting ? 'Entrando...' : 'Entrar'

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <p className="eyebrow">Sistema de Controle de Chamados Internos</p>
        <h1 id="login-title">Acesse sua central</h1>
        <p className="intro">
          Entre para acompanhar e organizar os chamados internos.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              minLength={5}
              maxLength={254}
              required
              autoComplete="email"
              data-cy="login-email"
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              maxLength={72}
              required
              autoComplete="current-password"
              data-cy="login-password"
            />
          </div>

          {error && (
            <p className="form-error" role="alert" data-cy="login-error">
              {error}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} data-cy="login-submit">
            {submitLabel}
          </button>
        </form>

        <p className="login-hint">
          Use as credenciais fornecidas pela administracao.
        </p>
      </section>
    </main>
  )
}

export default LoginPage
