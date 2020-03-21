import React from 'react';
import TodoMvcPage from './todomvc/components/TodoMvcPage';
import './App.css';

const App = () => (
  <div className="App">
    <header className="App-header">React Recollect demo site</header>
    <TodoMvcPage className="App__page-wrapper" />
  </div>
);

export default App;
