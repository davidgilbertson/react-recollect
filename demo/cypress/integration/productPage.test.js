it('Product page should work', () => {
  cy.visit('http://localhost:3000');

  // Go to the Products page
  cy.contains('Products').click();
});
