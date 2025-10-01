import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import WelcomeScreen from './components/WelcomeScreen';
import StudentNameEntry from './components/StudentNameEntry';
import TeacherView from './components/TeacherView';
import StudentView from './components/StudentView';
import './App.css';

const getSocketUrl = () => {
  return process.env.NODE_ENV === 'development' 
    ? process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'
    : window.location.origin;
};

function App() {
  const [socket, setSocket] = useState(null);
  const [appState, setAppState] = useState('welcome'); // welcome, student-name, teacher, student
  const [studentName, setStudentName] = useState('');
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    const socketUrl = getSocketUrl();
    const newSocket = io(socketUrl);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnectionError(false);
    });

    newSocket.on('connect_error', () => {
      setConnectionError(true);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  const handleRoleSelect = (role) => {
    if (role === 'teacher') {
      setAppState('teacher');
    } else {
      setAppState('student-name');
    }
  };

  const handleStudentNameSubmit = (name) => {
    setStudentName(name);
    setAppState('student');
    socket.emit('join-as-student', name);
  };

  if (connectionError) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h1>Connection Error</h1>
          <p>Unable to connect to the server. Please make sure the backend is running.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!socket) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Connecting to server...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {appState === 'welcome' && <WelcomeScreen onRoleSelect={handleRoleSelect} />}
      {appState === 'student-name' && <StudentNameEntry onNameSubmit={handleStudentNameSubmit} />}
      {appState === 'teacher' && <TeacherView socket={socket} />}
      {appState === 'student' && <StudentView socket={socket} studentName={studentName} />}
    </div>
  );
}

export default App;