// const fs = require('fs');
// const path = require('path');
const express = require('express');
// const ReactDOMServer = require('react-dom/server');
const { initStore, store } = require('../../dist');

// Create an express app instance
const app = express();

// We'll serve our page to requests at '/'
app.get('/', async (req, res) => {
  // Fetch some data
  const tasks = [];

  // Populate the Recollect store (discarding any previous state)
  initStore({ tasks });

  // Render the app. Components will read from the Recollect store as usual
  // const appMarkup = ReactDOMServer.renderToString(<App />);
  const appMarkup = '<h1>hi</h1>';

  // Serialize the store (replacing left tags for security)
  const safeStoreString = JSON.stringify(store).replace(/</g, '\\u003c');

  const htmlWithBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Recollect test site</title>
    </head>
    <body>
        <div id="root">${appMarkup}</div>
          <script>window.__PRELOADED_STATE__ = ${safeStoreString};</script>
    </body>
    </html>
  `;

  // Return the rendered page to the user
  res.send(htmlWithBody);
});
