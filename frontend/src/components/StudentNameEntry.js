import React, { useState } from 'react';
import './StudentNameEntry.css';

const StudentNameEntry = ({ onNameSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div className="name-entry-container">
      <div className="name-entry-card">
        <div className="card-header">
          <h1>Let's Get Started</h1>
          <p>If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates.</p>
        </div>
        
        <div className="divider"></div>
        
        <div className="name-form-section">
          <div className="form-label">Enter your Name</div>
          <form onSubmit={handleSubmit} className="name-form">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Bajaj"
              required
              className="name-input"
            />
            <button type="submit" className="continue-btn">
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentNameEntry;