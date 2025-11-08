
import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Signup.css';

const Signup = () => {
    const [formData, setFormData]=useState({
        first_name:'',
        last_name:'',
        email:'',
        phone_number:'',
        password:'',
        confirmPassword:''
    })
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange=(e)=>{
        setFormData({
            ...formData, [e.target.name]: e.target.value
        });
    }

    const handleSubmit=async(e)=>{
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword){
            setError("Password don't match");
            setLoading(false);
            return;
        }
        if (formData.password.length < 6){
            setError("Password must be atleast 6 charcaters");
            setLoading(false);
            return;
        }
    
        try {
            const response = await axios.post('http://127.0.0.1:5555/signup', {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone_number: formData.phone_number,
                password: formData.password
            });

      // Success - redirect to login
            navigate('/login');
        } catch (err) {
            console.log("Full error:", err);
            console.log("Error response:", err.response)
            setError(err.response?.data?.error || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };
    return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Your Account</h2>
        <p>Join M-Pesa Tracker to manage your finances</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="0712345678"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="signup-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;

    