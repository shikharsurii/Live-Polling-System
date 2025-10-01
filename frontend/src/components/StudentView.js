import React, { useState, useEffect } from 'react';
import './StudentView.css';

const StudentView = ({ socket, studentName }) => {
  const [currentPoll, setCurrentPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [results, setResults] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [kickedOut, setKickedOut] = useState(false);

  useEffect(() => {
    socket.on('poll-created', (poll) => {
      setCurrentPoll(poll);
      setHasAnswered(false);
      setSelectedOption('');
      setResults({});
      setTimeLeft(poll.timer);
      setShowResults(false);
    });

    socket.on('live-results', (liveResults) => {
      setResults(liveResults);
      setShowResults(true);
    });

    socket.on('poll-ended', (data) => {
      setCurrentPoll(data.poll);
      setResults(data.results);
      setShowResults(true);
      setTimeLeft(0);
    });

    socket.on('poll-update', (poll) => {
      setCurrentPoll(poll);
    });

    socket.on('time-update', (time) => {
      setTimeLeft(time);
    });

    socket.on('kicked-out', () => {
      setKickedOut(true);
    });

    return () => {
      socket.off('poll-created');
      socket.off('live-results');
      socket.off('poll-ended');
      socket.off('poll-update');
      socket.off('time-update');
      socket.off('kicked-out');
    };
  }, [socket]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSubmitAnswer = () => {
    if (selectedOption && currentPoll) {
      socket.emit('submit-answer', selectedOption);
      setHasAnswered(true);
    }
  };

  const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);

  // Show kicked out screen
  if (kickedOut) {
    return (
      <div className="kicked-out-screen">
        <div className="kicked-out-content">
          <h1>You've been Kicked out!</h1>
          <p>Looks like the teacher had removed you from the poll system. Please try again sometime.</p>
        </div>
      </div>
    );
  }

  // Show waiting screen when no poll is active
  if (!currentPoll) {
    return (
      <div className="student-waiting">
        <div className="waiting-content">
          <h1>Wait for the teacher to ask questions...</h1>
          <div className="loading-spinner"></div>
          <p>You're logged in as: <strong>{studentName}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-view">
      <div className="student-header">
        <h1>Question</h1>
        <p>{currentPoll.question}</p>
        {currentPoll.isActive && (
          <div className="timer">Time left: {timeLeft}s</div>
        )}
      </div>

      {currentPoll.isActive && !hasAnswered && !showResults && (
        <div className="poll-options">
          {currentPoll.options.map((option, index) => (
            <label key={index} className="option-label">
              <input
                type="radio"
                name="poll-option"
                value={option}
                checked={selectedOption === option}
                onChange={(e) => setSelectedOption(e.target.value)}
              />
              <span className="option-text">{option}</span>
            </label>
          ))}
          <button 
            onClick={handleSubmitAnswer}
            disabled={!selectedOption}
            className="submit-btn"
          >
            Submit
          </button>
        </div>
      )}

      {hasAnswered && !showResults && (
        <div className="answered-message">
          <p>✅ Your answer has been submitted! Waiting for other students...</p>
        </div>
      )}

      {showResults && (
        <div className="results-section">
          <h3>Results</h3>
          <div className="results-list">
            {currentPoll.options.map((option, index) => {
              const votes = results[option] || 0;
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              
              return (
                <div key={index} className="result-item">
                  <div className="option-result">
                    <span className="option-text">{option}</span>
                    <span className="vote-percentage">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="vote-count">{votes} votes</div>
                </div>
              );
            })}
          </div>
          <div className="total-votes">Total Votes: {totalVotes}</div>
          
          {!currentPoll.isActive && (
            <div className="waiting-message">
              <p>Wait for the teacher to ask a new question...</p>
            </div>
          )}
        </div>
      )}

      {!currentPoll.isActive && !showResults && (
        <div className="poll-ended">
          <p>This poll has ended. Waiting for results...</p>
        </div>
      )}
    </div>
  );
};

export default StudentView;