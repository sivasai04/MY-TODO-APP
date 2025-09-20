import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setTodos, addTodo, removeTodo, editTodo } from '../redux/todoSlice';
import { clearCredentials } from '../redux/authSlice';
import './TodoList.css'; 

const TodoList = () => {
  const [inputValue, setInputValue] = useState('');
  const todos = useSelector((state) => state.todo.todos);
  const { token, user } = useSelector((state) => state.auth);
  const [refresh, setRefresh] = useState(true);
  const dispatch = useDispatch();

  const api = axios.create({
      baseURL: 'http://localhost:5000',
      withCredentials: true,
  });
  
  
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await api.get('/todos');
        dispatch(setTodos(response.data));
      } catch (error) {
        console.error('Failed to fetch todos', error);
      }
      console.log("sdfsdf");
    };
    if (token) {
      fetchTodos();

    }
  }, [token, dispatch, refresh]);

  const handleAddTask = async () => {
    if (inputValue.trim() === '') return;
    try {
      const response = await api.post('/todos', { title: inputValue });
      dispatch(addTodo(response.data));
      setInputValue('');
    } catch (error) {
      console.error('Failed to add todo', error);
    }
  };
  
  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      dispatch(removeTodo(id));
    } catch (error) {
      console.error('Failed to delete todo', error);
    }
  };

  const handleEditTask = async (id, currentTitle) => {
    const newTitle = prompt("Edit your task:", currentTitle);

    if (newTitle && newTitle.trim() !== '' && newTitle !== currentTitle) {
      try {
        const response = await api.put(`/todos/${id}`, { title: newTitle });
        dispatch(editTodo(response.data));
        setRefresh(!refresh);
      } catch (error) {
        console.error('Failed to edit todo', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
        await api.post('/logout');
        dispatch(clearCredentials());
    } catch (error) {
        console.error('Logout failed', error);
    }
  };

  return (
    <div className="todo-container">
      <button onClick={handleLogout} className="logout-btn">Logout</button>
      <h1 className="todo-header">{user?.email}'s To-Do List</h1>
      
      <div className="add-task-form">
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new task..."
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>

      <ul className="task-list">
        {todos.map(task => (
          <li className="task-item" key={task.id}>
            <span>{task.title}</span>
            <div className="task-actions">
              
              <button className="edit-btn" onClick={() => handleEditTask(task._id, task.title)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDeleteTask(task._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;

