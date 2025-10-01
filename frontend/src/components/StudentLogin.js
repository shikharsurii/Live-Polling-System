import React, { useState } from 'react';
import './StudentLogin.css';

const StudentLogin = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Join as Student</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit">Join Class</button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;