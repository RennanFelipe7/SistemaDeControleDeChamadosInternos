describe('Testes do login', () => {
  it('Deverá realizar login com as credênciais corretas.', () => {
    cy.visit('/login')
    cy.get('[data-cy="login-email"]').should('be.visible').type('ana.souza@example.com')
    cy.get('[data-cy="login-password"]').should('be.visible').type('password')
    cy.get('[data-cy="login-submit"]').should('be.visible').click()
    cy.get('h2').contains('Olá, Ana').should('be.visible')  
  })

  it('Deverá exibir mensagem de erro ao tentar realizar login com credênciais incorretas.', () => {
    cy.visit('/login')
    cy.get('[data-cy="login-email"]').should('be.visible').type('ciclano.silva@example.com')
    cy.get('[data-cy="login-password"]').should('be.visible').type('wrongpassword')
    cy.get('[data-cy="login-submit"]').should('be.visible').click()
    cy.get('[data-cy="login-error"]', { timeout: 8000 }).should('be.visible').and('contain.text', 'As credenciais informadas sao invalidas.')
  })

  it('Deverá realizar logout com sucesso.', () => {
    cy.visit('/login')
    cy.get('[data-cy="login-email"]').should('be.visible').type('ana.souza@example.com')
    cy.get('[data-cy="login-password"]').should('be.visible').type('password')
    cy.get('[data-cy="login-submit"]').should('be.visible').click()
    cy.get('h2').contains('Olá, Ana').should('be.visible')  
    cy.get('[data-cy="logout-button"]').should('be.visible').click()
    cy.get('[data-cy="login-email"]').should('be.visible')
    cy.get('[data-cy="login-password"]').should('be.visible')
    cy.get('[data-cy="login-submit"]').should('be.visible')
  })
})