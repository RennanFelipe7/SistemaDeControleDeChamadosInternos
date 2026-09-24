import { faker } from '@faker-js/faker';

describe('Testes de criação de chamados', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('[data-cy="login-email"]').should('be.visible').type('ana.souza@example.com')
    cy.get('[data-cy="login-password"]').should('be.visible').type('password')
    cy.get('[data-cy="login-submit"]').should('be.visible').click()
  })

  it('Deverá criar um chamado com sucesso atribuindo um atendente.', () => {
    let ticketTitle = faker.lorem.words(3);
    let ticketDescription = faker.lorem.sentences(2);
    let now =new Date().toLocaleDateString('pt-BR');
    cy.get('[data-cy="new-ticket-button"]').should('be.visible').click()
    cy.get('[data-cy="ticket-title-input"]').should('be.visible').type(ticketTitle)
    cy.get('[data-cy="ticket-description-input"]').should('be.visible').type(ticketDescription)
    cy.get('[data-cy="ticket-priority-input"]').should('be.visible').select('Crítica')
    cy.get('[data-cy="ticket-assignee-input"]').should('be.visible').select('Bruno Lima')
    cy.get('[data-cy="ticket-form-submit"]').should('be.visible').click()
    cy.get('[data-cy*="view-ticket-"] > strong', { timeout: 80000 }).contains(ticketTitle).should('be.visible')
    cy.get('[data-cy*="view-ticket-"] > small', { timeout: 80000 }).contains(ticketDescription).should('be.visible')
    cy.get('[data-cy*="ticket-row-"] > :nth-child(5)').first().should('be.visible').and('have.text', now)
    cy.get('[data-cy*="ticket-row-"] > :nth-child(4)').first().should('be.visible').and('have.text', 'Bruno Lima')
    cy.get('[data-cy*="ticket-row-"] > :nth-child(3)').first().should('be.visible').and('have.text', 'aberto')
    cy.get('[data-cy*="ticket-row-"] > :nth-child(2)').first().should('be.visible').and('have.text', 'crítica')
  })

  it('Deverá verificar se não é possível criar um chamado sem preencher os campos obrigatórios.', () => {
    cy.get('[data-cy="new-ticket-button"]').should('be.visible').click()
    cy.get('[data-cy="ticket-form-submit"]').should('be.visible').click()
    cy.get('[data-cy="ticket-form-error"]').should('be.visible').and('contain.text', 'O campo título é obrigatório.')
    cy.get('[data-cy="ticket-title-input"]').should('be.visible').type('teste')
    cy.get('[data-cy="ticket-form-submit"]').should('be.visible').click()
    cy.get('[data-cy="ticket-form-error"]').should('be.visible').and('contain.text', 'O campo descrição é obrigatório.')
  })

  it('Deverá verificar se não é possível criar um chamado com título e descrição muito curtos.', () => {
    cy.get('[data-cy="new-ticket-button"]').should('be.visible').click()
    cy.get('[data-cy="ticket-title-input"]').should('be.visible').type('tes')
    cy.get('[data-cy="ticket-form-submit"]').should('be.visible').click()
    cy.get('[data-cy="ticket-form-error"]').should('be.visible').and('contain.text', 'O campo título deve ter no mínimo 5 caracteres.')
    cy.get('[data-cy="ticket-title-input"]').should('be.visible').type('teste')
    cy.get('[data-cy="ticket-description-input"]').should('be.visible').type('teste')
    cy.get('[data-cy="ticket-form-submit"]').should('be.visible').click()
    cy.get('[data-cy="ticket-form-error"]').should('be.visible').and('contain.text', 'O campo descrição deve ter no mínimo 10 caracteres.')
  })

  it('Deverá verificar se não é possível criar um chamado com título e descrição muito longos.', () => {
    let longTitle = faker.lorem.words(120);
    let longDescription = 'a'.repeat(5000);
    cy.get('[data-cy="new-ticket-button"]').should('be.visible').click()
    cy.get('[data-cy="ticket-title-input"]').should('be.visible').type(longTitle)
    cy.get('[data-cy="ticket-title-input"]').should('be.visible').type('Esse texto não deve está presente no campo de título')
    cy.get('[data-cy="ticket-title-input"]').should('be.visible').and('not.contain.value', 'Esse texto não deve está presente no campo de título')
    cy.get('[data-cy="ticket-description-input"]').should('be.visible').invoke('val', longDescription)
    cy.get('[data-cy="ticket-description-input"]').should('be.visible').type('Esse texto não deve está presente no campo de descrição')
    cy.get('[data-cy="ticket-description-input"]').should('be.visible').and('not.contain.value', 'Esse texto não deve está presente no campo de descrição')
  })
})