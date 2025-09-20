import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../redux/authSlice';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? 'http://localhost:5000/signin' : 'http://localhost:5000/signup';
    
    try {
      const response = await axios.post(url, { email, password }, {
          withCredentials: true 
      });
      dispatch(setCredentials(response.data));
    } catch (error) {
      const action = isLogin ? 'Signin' : 'Signup';
      console.error(`${action} failed`, error);
      alert(`${action} failed. Please check your details or try again.`);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
        <div className="input-group">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="input-group">
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">{isLogin ? 'Sign In' : 'Sign Up'}</button>
        <button type="button" className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
        </button>
      </form>
    </div>
  );
};

export default AuthPage;