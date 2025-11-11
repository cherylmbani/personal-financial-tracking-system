
import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Login.css';

const Login = ({ onLogin }) => { // ADD THIS PROP
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData, [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5555/login', {
        email: formData.email,
        password: formData.password
      })
      
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        onLogin(); // ADD THIS LINE - TELLS APP.JS YOU'RE LOGGED IN
        navigate('/dashboard')
      }
       
    } catch(err) {
      console.log("Login error:", err)
    }
  }

  return (
    <div className="login">
      <h1>Login</h1>
      <div className="login-section">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-input">
            <label htmlFor="email">Email address: </label>
            <input 
              type="email"
              name="email"
              placeholder="cheryl@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="password">Password: </label>
            <input 
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-btn">
            <button type="submit" className="login-btn">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;