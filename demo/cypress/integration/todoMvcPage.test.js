it('Todo MVC page does the things it should do', () => {
  cy.visit('http://localhost:3000');

  // Go to the TodoMVC page
  cy.contains('Todo MVC').click();

  // Data from the API
  const task1Name = 'delectus aut autem';
  const task2Name = 'quis ut nam facilis et officia qui';
  const task3Name = 'fugiat veniam minus';
  const task4Name = 'et porro tempora';
  const task5Name =
    'laboriosam mollitia et enim quasi adipisci quia provident illum';

  cy.findByText(task1Name).should('exist');
  cy.findByText(task2Name).should('exist');
  cy.findByText(task3Name).should('exist');
  cy.findByText(task4Name).should('exist');
  cy.findByText(task5Name).should('exist');

  cy.contains('4 items left');

  cy.findByText('Active').click();
  cy.findByText(task1Name).should('exist');
  cy.findByText(task2Name).should('exist');
  cy.findByText(task3Name).should('exist');
  cy.findByText(task4Name).should('not.exist');
  cy.findByText(task5Name).should('exist');

  cy.findByText('Completed').click();
  cy.findByText(task1Name).should('not.exist');
  cy.findByText(task2Name).should('not.exist');
  cy.findByText(task3Name).should('not.exist');
  cy.findByText(task4Name).should('exist');
  cy.findByText(task5Name).should('not.exist');

  cy.findByText('All').click();
  cy.findByText(task1Name).should('exist');
  cy.findByText(task2Name).should('exist');
  cy.findByText(task3Name).should('exist');
  cy.findByText(task4Name).should('exist');
  cy.findByText(task5Name).should('exist');

  // Mark them all complete
  cy.findByTestId('toggle-all').click();
  cy.contains('No items left');

  // Mark them all incomplete
  cy.findByTestId('toggle-all').click();
  cy.contains('5 items left');

  // Mark them all complete again
  cy.findByTestId('toggle-all').click();

  cy.findByText('Clear completed').click();
  cy.findByText(task1Name).should('not.exist');
  cy.findByText(task2Name).should('not.exist');
  cy.findByText(task3Name).should('not.exist');
  cy.findByText(task4Name).should('not.exist');
  cy.findByText(task5Name).should('not.exist');

  // Enter some new tasks
  cy.findByPlaceholderText('What needs to be done?').type('Task one{enter}');
  // Auto focus seems not to work, so we select the input again
  cy.findByPlaceholderText('What needs to be done?').type('Task two{enter}');

  cy.contains('2 items left');

  // Enter nothing
  cy.findByPlaceholderText('What needs to be done?').type('{enter}');
  cy.contains('2 items left');

  // Finish task one
  cy.findByText('Task one').click();
  cy.contains('1 item left');

  // Edit task two
  cy.findByText('Task two').dblclick();
  cy.findByDisplayValue('Task two').type(
    '{selectall}A new name for task two{enter}'
  );

  // The delete button only shows on hover, so we need to force that
  cy.findByTitle(`Delete 'A new name for task two'`).invoke('show').click();
  cy.findByText('A new name for task two').should('not.exist');
  cy.findByTitle(`Delete 'Task one'`).invoke('show').click();
  cy.findByText('Task one').should('not.exist');
});
