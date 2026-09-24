import { faker } from '@faker-js/faker';

describe('Testes de edição de chamados', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('[data-cy="login-email"]').should('be.visible').type('ana.souza@example.com')
    cy.get('[data-cy="login-password"]').should('be.visible').type('password')
    cy.get('[data-cy="login-submit"]').should('be.visible').click()
  })

  it('Deverá editar um chamado existente.', () => {
    cy.intercept('GET', '**/api/v1/tickets/**').as('updateTicket')
    let newTicketTitle = faker.lorem.words(3);
    let newTicketDescription = faker.lorem.sentences(2);
    cy.get('[data-cy="view-all-tickets-button"]').should('be.visible').click()
    cy.get('[data-cy*="ticket-row-"] > :nth-child(1)').first().should('be.visible').click({x: 40, y: 40})
    cy.get('[data-cy="detail-edit-ticket-button"]').should('be.visible').click()   
    cy.wait('@updateTicket')
    cy.wait(5000)
    cy.get('[data-cy="ticket-status-input"]').should('be.visible').invoke('val').then((currentValueStatuses) => {
      let allStatuses = ['aberto', 'em andamento', 'resolvido', 'fechado'];
      let newValueStatuses = allStatuses.find((status) => status !== currentValueStatuses);
      cy.get('[data-cy="ticket-status-input"]').should('be.visible').select(newValueStatuses);
      cy.get('[data-cy="ticket-assignee-input"]').should('be.visible').invoke('val').then((currentValuePeople) => {
        let AllPeople = {'Ana Souza': '2', 'Bruno Lima': '3', 'Carla Mendes': '4'};
        let newValuePeople = Object.values(AllPeople).find((person) => person !== currentValuePeople && person !== '');
        cy.get('[data-cy="ticket-assignee-input"]').should('be.visible').select(newValuePeople);
        cy.get('[data-cy="ticket-priority-input"]').should('be.visible').invoke('val').then((currentValuePriority) => {
          cy.log('Current Priority Value:', currentValuePriority);
          let allPriorities = ['baixa', 'média', 'alta', 'crítica'];
          let newValuePriority = allPriorities.find((priority) => priority !== currentValuePriority);
          cy.get('[data-cy="ticket-priority-input"]').should('be.visible').select(newValuePriority);
          cy.get('[data-cy="ticket-title-input"]').should('be.visible').clear().type(newTicketTitle)
          cy.get('[data-cy="ticket-description-input"]').should('be.visible').clear().type(newTicketDescription)
          cy.get('[data-cy="ticket-form-submit"]').should('be.visible').click()    
          cy.get('[data-cy*="view-ticket-"] > strong', { timeout: 80000 }).contains(newTicketTitle).should('be.visible')
          cy.get('[data-cy*="view-ticket-"] > small', { timeout: 80000 }).contains(newTicketDescription).should('be.visible')
          cy.get('[data-cy*="ticket-row-"] > :nth-child(3)').first().should('be.visible').and('not.have.text', currentValueStatuses)
          const newPersonName = Object.keys(AllPeople).find((person) => AllPeople[person] === newValuePeople)
          cy.get('[data-cy*="ticket-row-"] > :nth-child(4)').first().should('be.visible').and('have.text', newPersonName)
          cy.get('[data-cy*="ticket-row-"] > :nth-child(2)').first().should('be.visible').and('not.have.text', currentValuePriority)
        })
      })
    })
  })

  it('Deverá verificar se não é possível acessar um chamado que não pertence ao usuário logado.', () => {
    cy.get('[data-cy="view-all-tickets-button"]').should('be.visible').click()
    cy.get('[data-cy*="ticket-row-"] > :nth-child(1)').eq(0).should('be.visible').click({x: 40, y: 40}) 
    cy.url().then((currentUrl) => {
      let ticketId = currentUrl.split('/')[4];
      let ticketIdDoesNotExist = Number(ticketId) + 1;
      cy.visit('/chamados/' + ticketIdDoesNotExist + '/editar')
      cy.get('[data-cy="ticket-form-error"]').should('be.visible').and('have.text', 'Chamado não encontrado.')
    })
  })

  it('Deverá verificar se não é possível editar um chamado que não pertence ao usuário logado.', () => {
    cy.get('[data-cy="view-all-tickets-button"]').should('be.visible').click()
    cy.get('[data-cy*="ticket-row-"] > :nth-child(1)').eq(0).should('be.visible').click({x: 40, y: 40})
    cy.get('[data-cy="detail-edit-ticket-button"]').should('be.visible').click()   
    cy.url().then((currentUrl) => {
      let ticketId = currentUrl.split('/')[4];
      let ticketIdDoesNotExist = Number(ticketId) + 1;
      cy.visit('/chamados/' + ticketIdDoesNotExist)
      cy.get('[data-cy="ticket-detail-error"]').should('be.visible').and('have.text', 'Chamado não encontrado.')
    })

  })
})