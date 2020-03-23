describe('Todo MVC page', () => {
  it('does the things it should do', () => {
    cy.visit('http://localhost:3000');

    // Go to the TodoMVC tab
    cy.contains('Todo MVC').click();

    cy.findByPlaceholderText('What needs to be done?').type('Task one{enter}');

    cy.contains('1 item left');

    // Auto focus seems not to work, so we select the input again
    cy.findByPlaceholderText('What needs to be done?').type('Task two{enter}');
    cy.contains('2 items left');

    // Enter nothing
    cy.findByPlaceholderText('What needs to be done?').type('{enter}');
    cy.contains('2 items left');

    cy.findByText('Task one').click();
    cy.contains('1 item left');

    // Show only completely tasks
    cy.findByText('Active').click();
    cy.findByText('Task one').should('not.exist');
    cy.findByText('Task two').should('exist');

    cy.findByText('Completed').click();
    cy.findByText('Task one').should('exist');
    cy.findByText('Task two').should('not.exist');

    cy.findByText('All').click();
    cy.findByText('Task one').should('exist');
    cy.findByText('Task two').should('exist');

    // Mark them all complete
    cy.findByTestId('toggle-all').click();
    cy.contains('No items left');

    // Mark them all incomplete
    cy.findByTestId('toggle-all').click();
    cy.contains('2 items left');

    // Mark them all complete again
    cy.findByTestId('toggle-all').click();

    cy.findByText('Clear completed').click();
    cy.findByText('Task one').should('not.exist');
    cy.findByText('Task two').should('not.exist');

    cy.findByPlaceholderText('What needs to be done?').type(
      'An unmodified task{enter}'
    );
    cy.findByText('An unmodified task').dblclick();
    cy.findByDisplayValue('An unmodified task').type(
      '{selectall}A modified task{enter}'
    );

    // The delete button only shows on hover, so we need to force that
    cy.findByTitle(`Delete 'A modified task'`).invoke('show').click();
    cy.findByText('A modified task').should('not.exist');
  });
});
