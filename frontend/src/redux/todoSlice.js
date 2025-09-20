import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  todos: [],
};

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    setTodos(state, action) {
      state.todos = action.payload;
    },
    addTodo(state, action) {
      state.todos.push(action.payload);
    },
    removeTodo(state, action) {
      state.todos = state.todos.filter(todo => todo.id !== action.payload);
    },

    editTodo(state, action) {
      const { id, title } = action.payload;
      const existingTodo = state.todos.find(todo => todo.id === id);
      if (existingTodo) {
        existingTodo.title = title;
      }
    },
  },
});


export const { setTodos, addTodo, removeTodo, editTodo } = todoSlice.actions;
export default todoSlice.reducer;