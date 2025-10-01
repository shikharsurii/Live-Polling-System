import React, { useState } from 'react';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        {/* Logo */}
        <div className="logo">
          <span className="logo-text">Intervue poll</span>
        </div>

        {/* Welcome Header */}
        <div className="welcome-header">
          <h1>Welcome to the Live Polling System</h1>
          <p>Please select the role that best describes you to begin using the live polling system</p>
        </div>

        {/* Role Cards */}
        <div className="role-cards">
          {/* Student Card */}
          <div 
            className={`role-card student-card ${selectedRole === 'student' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('student')}
          >
            <div className="card-content">
              <h3>I'm a Student</h3>
              <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
              
            </div>
          </div>

          {/* Teacher Card */}
          <div 
            className={`role-card teacher-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('teacher')}
          >
            <div className="card-content">
              <h3>I'm a Teacher</h3>
              <p>Submit answers and view live poll results in real-time.</p>
              
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="continue-section">
          <button 
            className={`continue-btn ${selectedRole ? 'active' : ''}`}
            onClick={handleContinue}
            disabled={!selectedRole}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;