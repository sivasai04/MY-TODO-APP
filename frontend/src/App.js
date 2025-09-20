// import React, { useState, useEffect } from 'react';
// import './App.css';

// function App() {

//   const [tasks, setTasks] = useState(() => {
//     const savedTasks = localStorage.getItem('tasks');
//     return savedTasks ? JSON.parse(savedTasks) : [];
//   });
  
//   const [inputValue, setInputValue] = useState('');

//   useEffect(() => {
//     localStorage.setItem('tasks', JSON.stringify(tasks));
//   }, [tasks]); 

//   const handleAddTask = () => {
//     if (inputValue.trim() === '') return;
//     const newTask = {
//       id: Date.now(),
//       text: inputValue,
//     };
//     setTasks([...tasks, newTask]);
//     setInputValue('');
//   };
    
//   const handleDeleteTask = (idToDelete) => {
//     const updatedTasks = tasks.filter(task => task.id !== idToDelete);
//     setTasks(updatedTasks);
//   };

//   const handleEditTask = (idToEdit) => {
//     const taskToEdit = tasks.find(task => task.id === idToEdit);
//     const newText = prompt("Edit your task:", taskToEdit.text);

//     if (newText !== null && newText.trim() !== '') {
//       const updatedTasks = tasks.map(task => 
//         task.id === idToEdit ? { ...task, text: newText } : task
//       );
//       setTasks(updatedTasks);
//     }
//   };

//   const handleKeyPress = (event) => {
//     if (event.key === 'Enter') {
//       handleAddTask();
//     }
//   };

//   return (
//     <>
//       <div id="heading">
//         <h1>My Personalized To-Do List</h1>
//       </div>

//       <div>
//         <input id="task-input" type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Add a new task..." />
        
//         <button id="add-task-btn" onClick={handleAddTask}> Add Task </button>
//       </div>

//       <ul id="task-list">
//         {tasks.map(task => (
//           <li key={task.id}>
//             <span>{task.text}</span>
//             <div className="task-actions">

//               <button className="edit-btn" onClick={() => handleEditTask(task.id)}> Edit </button>
             
//               <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}> Delete </button>
            
//             </div>
//           </li>
//         ))}
//       </ul>
//     </>
//   );
// }

// export default App;   


import React from 'react';
import { useSelector } from 'react-redux';

import AuthPage from './components/AuthPage'; 
import TodoList from './components/TodoList';
import './App.css'; 

function App() {
  const { token } = useSelector((state) => state.auth);

  return (
    <div className="App">
      {/* 2. Use the new AuthPage component here */}
      {token ? <TodoList /> : <AuthPage />}
    </div>
  );
}

export default App;
