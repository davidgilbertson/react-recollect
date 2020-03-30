it('Product page should work', () => {
  cy.viewport(1000, 2000);

  cy.visit('http://localhost:3000');

  // Go to the Big tree page
  cy.contains('Big tree').click();

  // Names are in the format:
  // A [parent type] with [children type] [(id)] [[renderCount]]
  cy.findByText('An object prop with Array children (100) [1]');

  cy.findByTitle('Turn node 100 on').click();
  cy.findByTitle('Turn node 100 off');

  cy.findByText('An object prop with Array children (100) [2]');

  cy.findByTitle('Add Object child to node 100').click();
  cy.findByTitle('Add Array child to node 100').click();
  cy.findByTitle('Add Map child to node 100').click();
  cy.findByTitle('Add Set child to node 100').click();

  // Root level now rendered 6 times
  cy.findByText('An object prop with Array children (100) [6]');

  // Each item rendered once when added, then once as each new one was added
  cy.findByText('An array item with Object children (101) [4]');
  cy.findByText('An array item with Array children (102) [3]');
  cy.findByText('An array item with Map children (103) [2]');
  cy.findByText('An array item with Set children (104) [1]');

  // Add children to two siblings
  cy.findByTitle('Add Map child to node 101').click();
  cy.findByTitle('Add Map child to node 102').click();

  // Everyone renders twice more
  cy.findByText('An object prop with Array children (100) [8]');
  cy.findByText('An array item with Object children (101) [6]');
  cy.findByText('An object prop with Map children (105) [2]'); // New
  cy.findByText('An array item with Array children (102) [5]');
  cy.findByText('An array item with Map children (106) [1]'); // New
  cy.findByText('An array item with Map children (103) [4]');
  cy.findByText('An array item with Set children (104) [3]');

  cy.findByTitle('Turn node 105 on').click();

  // Re-rendered items will be all the ancestors of the changed item, plus
  // the immediate children of any changed item
  cy.findByText('An object prop with Array children (100) [9]');
  cy.findByText('An array item with Object children (101) [7]');
  cy.findByText('An object prop with Map children (105) [3]');
  cy.findByText('An array item with Array children (102) [6]');
  cy.findByText('An array item with Map children (106) [1]'); // No re-render
  cy.findByText('An array item with Map children (103) [5]');
  cy.findByText('An array item with Set children (104) [4]');

  cy.findByPlaceholderText('Notes for node 106').type('0123456789');

  cy.findByText('An object prop with Array children (100) [19]');
  cy.findByText('An array item with Object children (101) [17]');
  cy.findByText('An object prop with Map children (105) [3]'); // No re-render
  cy.findByText('An array item with Array children (102) [16]');
  cy.findByText('An array item with Map children (106) [11]');
  cy.findByText('An array item with Map children (103) [15]');
  cy.findByText('An array item with Set children (104) [14]');

  cy.findByTitle('Delete node 105').click();
  cy.findByTitle('Delete node 106').click();

  // Every type as a child of every other type
  cy.findByTitle('Add Object child to node 101').click();
  cy.findByTitle('Add Array child to node 101').click();
  cy.findByTitle('Add Map child to node 101').click();
  cy.findByTitle('Add Set child to node 101').click();
  cy.findByTitle('Add Object child to node 102').click();
  cy.findByTitle('Add Array child to node 102').click();
  cy.findByTitle('Add Map child to node 102').click();
  cy.findByTitle('Add Set child to node 102').click();
  cy.findByTitle('Add Object child to node 103').click();
  cy.findByTitle('Add Array child to node 103').click();
  cy.findByTitle('Add Map child to node 103').click();
  cy.findByTitle('Add Set child to node 103').click();
  cy.findByTitle('Add Object child to node 104').click();
  cy.findByTitle('Add Array child to node 104').click();
  cy.findByTitle('Add Map child to node 104').click();
  cy.findByTitle('Add Set child to node 104').click();

  // Sets can't be modified, so just the others
  cy.findByTitle('Turn node 101 on').click();
  cy.findByTitle('Turn node 102 on').click();
  cy.findByTitle('Turn node 103 on').click();
  cy.findByTitle('Turn node 104 on').click();
  cy.findByTitle('Turn node 107 on').click();
  cy.findByTitle('Turn node 108 on').click();
  cy.findByTitle('Turn node 109 on').click();
  cy.findByTitle('Turn node 110 on').click();
  cy.findByTitle('Turn node 111 on').click();
  cy.findByTitle('Turn node 112 on').click();
  cy.findByTitle('Turn node 113 on').click();
  cy.findByTitle('Turn node 114 on').click();
  cy.findByTitle('Turn node 115 on').click();
  cy.findByTitle('Turn node 116 on').click();
  cy.findByTitle('Turn node 117 on').click();
  cy.findByTitle('Turn node 118 on').click();

  cy.findByPlaceholderText('Notes for node 101').type('101!');
  cy.findByPlaceholderText('Notes for node 102').type('102!');
  cy.findByPlaceholderText('Notes for node 103').type('103!');
  cy.findByPlaceholderText('Notes for node 104').type('104!');
  cy.findByPlaceholderText('Notes for node 107').type('107!');
  cy.findByPlaceholderText('Notes for node 108').type('108!');
  cy.findByPlaceholderText('Notes for node 109').type('109!');
  cy.findByPlaceholderText('Notes for node 110').type('110!');
  cy.findByPlaceholderText('Notes for node 111').type('111!');
  cy.findByPlaceholderText('Notes for node 112').type('112!');
  cy.findByPlaceholderText('Notes for node 113').type('113!');
  cy.findByPlaceholderText('Notes for node 114').type('114!');
  cy.findByPlaceholderText('Notes for node 115').type('115!');
  cy.findByPlaceholderText('Notes for node 116').type('116!');
  cy.findByPlaceholderText('Notes for node 117').type('117!');
  cy.findByPlaceholderText('Notes for node 118').type('118!');

  cy.findByTitle('Delete node 107').click();
  cy.findByTitle('Delete node 108').click();
  cy.findByTitle('Delete node 109').click();
  cy.findByTitle('Delete node 110').click();
  cy.findByTitle('Delete node 111').click();
  cy.findByTitle('Delete node 112').click();
  cy.findByTitle('Delete node 113').click();
  cy.findByTitle('Delete node 114').click();
  cy.findByTitle('Delete node 115').click();
  cy.findByTitle('Delete node 116').click();
  cy.findByTitle('Delete node 117').click();
  cy.findByTitle('Delete node 118').click();

  // Delete the top 4 last
  cy.findByTitle('Delete node 101').click();
  cy.findByTitle('Delete node 102').click();
  cy.findByTitle('Delete node 103').click();
  cy.findByTitle('Delete node 104').click();

  cy.findByTitle('Turn node 100 off').click();
});
