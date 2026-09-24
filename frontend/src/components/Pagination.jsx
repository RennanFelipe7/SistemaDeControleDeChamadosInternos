function Pagination({ currentPage, lastPage, onChange }) {
  if (lastPage <= 1) return null

  return (
    <nav className="ticket-pagination" aria-label="Paginação dos chamados">
      <button type="button" className="pagination-button" onClick={() => onChange(currentPage - 1)} disabled={currentPage === 1} data-cy="pagination-previous">Anterior</button>
      <div className="pagination-pages">
        {Array.from({ length: lastPage }, (_, index) => index + 1).map((page) => (
          <button type="button" className={`pagination-button ${page === currentPage ? 'pagination-button-active' : ''}`} onClick={() => onChange(page)} aria-current={page === currentPage ? 'page' : undefined} key={page} data-cy={`pagination-page-${page}`}>{page}</button>
        ))}
      </div>
      <button type="button" className="pagination-button" onClick={() => onChange(currentPage + 1)} disabled={currentPage === lastPage} data-cy="pagination-next">Próxima</button>
    </nav>
  )
}

export default Pagination
