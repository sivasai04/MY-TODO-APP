import React from 'react';
import { useSelector } from 'react-redux';

import AuthPage from './components/AuthPage'; 
import TodoList from './components/TodoList';
import './App.css'; 

function App() {
  const { token } = useSelector((state) => state.auth);

  return (
    <div className="App">

      {token ? <TodoList /> : <AuthPage />}
    </div>
  );
}

export default App;
