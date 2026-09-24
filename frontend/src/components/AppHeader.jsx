function AppHeader({ user, onLogout }) {
  const roleLabel = user.role === 'atendente' ? 'Atendente' : 'Solicitante'

  return (
    <header className="dashboard-header">
      <div>
        <p className="eyebrow">Sistema de Controle de Chamados Internos</p>
        <h1>Painel de chamados</h1>
      </div>
      <div className="user-actions">
        <div className="user-summary"><strong>{user.name}</strong><span>{roleLabel}</span></div>
        <button type="button" className="button-secondary" onClick={onLogout} data-cy="logout-button">Sair</button>
      </div>
    </header>
  )
}

export default AppHeader
