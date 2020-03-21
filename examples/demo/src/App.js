import React from 'react';
import './App.css';
import TodoMvcPage from './todomvc/components/TodoMvcPage';

function App() {
  return (
    <div className="App">
      <header className="App-header">React Recollect demo site</header>
      <TodoMvcPage className="App__page-wrapper" />
    </div>
  );
}

export default App;
