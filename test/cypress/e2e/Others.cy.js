import { faker } from '@faker-js/faker';

describe('Outros', () => {

  it('Deverá criar um chamado com o usuário solicitante', () => {
    cy.visit('/login')
    cy.get('[data-cy="login-email"]').should('be.visible').type('joao.silva@example.com')
    cy.get('[data-cy="login-password"]').should('be.visible').type('password')
    cy.get('[data-cy="login-submit"]').should('be.visible').click()
    let ticketTitle = faker.lorem.words(3);
    let ticketDescription = faker.lorem.sentences(2);
    let now =new Date().toLocaleDateString('pt-BR');
    cy.get('[data-cy="new-ticket-button"]').should('be.visible').click()
    cy.get('[data-cy="ticket-title-input"]').should('be.visible').type(ticketTitle)
    cy.get('[data-cy="ticket-description-input"]').should('be.visible').type(ticketDescription)
    cy.get('[data-cy="ticket-priority-input"]').should('be.visible').select('Crítica')
    cy.get('[data-cy="ticket-assignee-input"]').should('be.visible').select('Bruno Lima')
    cy.get('[data-cy="ticket-form-submit"]').should('be.visible').click()
    cy.get('#ticket-list-title').should('be.visible').and('contain.text', 'Todos os chamados')
  })
  it('Deverá verificar se o usuário solicitante não tem permissão para editar um chamado.', () => {
    cy.visit('/login')
    cy.get('[data-cy="login-email"]').should('be.visible').type('joao.silva@example.com')
    cy.get('[data-cy="login-password"]').should('be.visible').type('password')
    cy.get('[data-cy="login-submit"]').should('be.visible').click()
    cy.get('h2').contains('Olá, Joao').should('be.visible') 
    cy.get('[data-cy*="recent-ticket-"]').should('be.visible').first().click({x: 40, y: 40}) 
    cy.get('.priority-badge').should('be.visible')
    cy.get('[data-cy="detail-edit-ticket-button"]').should('not.be.exist')
  })
})