import React, { useState, useEffect } from 'react';
import './TeacherView.css';

const TeacherView = ({ socket }) => {
  const [currentPoll, setCurrentPoll] = useState(null);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({});
  const [newQuestion, setNewQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timer, setTimer] = useState(60);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [pollHistory, setPollHistory] = useState([]);
  const [showPollHistory, setShowPollHistory] = useState(false);
  const [hasActivePoll, setHasActivePoll] = useState(false);

  useEffect(() => {
    socket.emit('join-as-teacher');

    socket.on('poll-update', (poll) => {
      setCurrentPoll(poll);
    });

    socket.on('students-update', (studentsList) => {
      setStudents(studentsList);
    });

    socket.on('live-results', (liveResults) => {
      setResults(liveResults);
    });

    socket.on('poll-created', (poll) => {
      setCurrentPoll(poll);
      setHasActivePoll(true);
    });

    socket.on('poll-ended', (data) => {
      setCurrentPoll(data.poll);
      setResults(data.results);
      setHasActivePoll(false);
      // Add to poll history
      setPollHistory(prev => [{
        poll: data.poll,
        results: data.results,
        totalVotes: Object.values(data.results).reduce((sum, count) => sum + count, 0)
      }, ...prev]);
    });

    socket.on('chat-message', (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('poll-update');
      socket.off('students-update');
      socket.off('live-results');
      socket.off('poll-created');
      socket.off('poll-ended');
      socket.off('chat-message');
    };
  }, [socket]);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const canCreateNewPoll = () => {
    return !hasActivePoll;
  };

  const createPoll = () => {
    if (newQuestion.trim() && options.every(opt => opt.trim()) && canCreateNewPoll()) {
      const pollData = {
        question: newQuestion,
        options: options.filter(opt => opt.trim()),
        timer: timer
      };
      
      socket.emit('create-poll', pollData);
      setNewQuestion('');
      setOptions(['', '']);
      setTimer(60);
    }
  };

  const endPoll = () => {
    socket.emit('end-poll');
  };

  const removeStudent = (studentId) => {
    socket.emit('remove-student', studentId);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: 'Teacher',
        text: newMessage.trim(),
        timestamp: new Date()
      };
      socket.emit('send-chat-message', message);
      setNewMessage('');
    }
  };

  const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);

  // Show create poll form if no active poll
  if (!hasActivePoll) {
    return (
      <div className="teacher-view">
        <div className="create-poll-container">
          <div className="create-poll-section">
            <div className="form-group">
              <label>Enter your question</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter your question here..."
                className="question-input"
              />
            </div>

            <div className="timer-section">
              <div className="timer-dropdown">
                <span className="timer-label">{timer} seconds</span>
                <select
                  value={timer}
                  onChange={(e) => setTimer(parseInt(e.target.value))}
                  className="timer-select"
                >
                  <option value="10">10 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                  <option value="90">90 seconds</option>
                  <option value="120">120 seconds</option>
                  <option value="180">180 seconds</option>
                  <option value="300">300 seconds</option>
                </select>
                <div className="dropdown-arrow">▼</div>
              </div>
            </div>

            <div className="options-section">
              <label>Edit Options</label>
              {options.map((option, index) => (
                <div key={index} className="option-row">
                  <div className="option-header">
                    <strong>Is it Correct?</strong>
                  </div>
                  <div className="option-input-group">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    <div className="yes-no-options">
                      <label className="checkbox-option">
                        <input type="radio" name={`correct-${index}`} />
                        <span>Yes</span>
                      </label>
                      <label className="checkbox-option">
                        <input type="radio" name={`correct-${index}`} />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addOption} className="add-option-btn">
                + Add More option
              </button>
            </div>

            <div className="action-buttons">
              <button 
                onClick={createPoll}
                disabled={!canCreateNewPoll()}
                className="create-poll-btn"
              >
                Create Poll
              </button>
            </div>
          </div>
        </div>

        {/* Poll History Button */}
        {pollHistory.length > 0 && (
          <div 
            className="poll-history-button"
            onClick={() => setShowPollHistory(true)}
          >
            <span>Poll History</span>
            <span className="history-count">{pollHistory.length}</span>
          </div>
        )}

        {/* Poll History Modal */}
        {showPollHistory && (
          <div className="poll-history-modal">
            <div className="poll-history-content">
              <div className="history-header">
                <h2>Poll History</h2>
                <button 
                  className="close-button"
                  onClick={() => setShowPollHistory(false)}
                >
                  ×
                </button>
              </div>
              <div className="history-list">
                {pollHistory.map((historyItem, index) => (
                  <div key={index} className="history-item">
                    <h3>Question {index + 1}</h3>
                    <p className="question-text">{historyItem.poll.question}</p>
                    <div className="history-results">
                      {historyItem.poll.options.map((option, idx) => {
                        const votes = historyItem.results[option] || 0;
                        const percentage = historyItem.totalVotes > 0 ? (votes / historyItem.totalVotes) * 100 : 0;
                        
                        return (
                          <div key={idx} className="history-result-item">
                            <label className="result-option">
                              <input type="checkbox" checked={votes > 0} readOnly />
                              <span className="option-text">{option}</span>
                              <span className="percentage">{percentage.toFixed(0)}%</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    {index < pollHistory.length - 1 && <div className="divider"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show live results when poll is active
  return (
    <div className="teacher-view">
      <div className="live-results-container">
        <div className="results-header">
          <h1>Live Results</h1>
          <button onClick={endPoll} className="end-poll-btn">
            End Poll
          </button>
        </div>

        <div className="current-question">
          <h2>{currentPoll?.question}</h2>
        </div>

        <div className="live-results">
          {currentPoll?.options.map((option, index) => {
            const votes = results[option] || 0;
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            
            return (
              <div key={index} className="result-item">
                <label className="result-option">
                  <input type="checkbox" checked={votes > 0} readOnly />
                  <span className="option-text">{option}</span>
                  <span className="percentage">{percentage.toFixed(0)}%</span>
                </label>
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
      </div>

      {/* Chat Button */}
      <div 
        className="chat-button"
        onClick={() => setShowChat(!showChat)}
      >
        💬
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3>Classroom Chat</h3>
            <button 
              className="close-chat"
              onClick={() => setShowChat(false)}
            >
              ×
            </button>
          </div>

          <div className="chat-content">
            <div className="participants-section">
              <h4>Participants ({students.length})</h4>
              <div className="students-list">
                {students.map(student => (
                  <div key={student.id} className="student-row">
                    <span className="student-name">{student.name}</span>
                    <span className={`student-status ${student.hasAnswered ? 'answered' : 'pending'}`}>
                      {student.hasAnswered ? '✅' : '⏳'}
                    </span>
                    <button 
                      onClick={() => removeStudent(student.id)}
                      className="kick-out-btn"
                    >
                      Kick out
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="chat-section">
              <div className="chat-messages">
                {chatMessages.map(message => (
                  <div key={message.id} className="chat-message">
                    <strong>{message.user}:</strong> {message.text}
                  </div>
                ))}
                {chatMessages.length === 0 && (
                  <div className="no-messages">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Poll History Button */}
      {pollHistory.length > 0 && (
        <div 
          className="poll-history-button"
          onClick={() => setShowPollHistory(true)}
        >
          <span>Poll History</span>
          <span className="history-count">{pollHistory.length}</span>
        </div>
      )}

      {/* Poll History Modal */}
      {showPollHistory && (
        <div className="poll-history-modal">
          <div className="poll-history-content">
            <div className="history-header">
              <h2>Poll History</h2>
              <button 
                className="close-button"
                onClick={() => setShowPollHistory(false)}
              >
                ×
              </button>
            </div>
            <div className="history-list">
              {pollHistory.map((historyItem, index) => (
                <div key={index} className="history-item">
                  <h3>Question {index + 1}</h3>
                  <p className="question-text">{historyItem.poll.question}</p>
                  <div className="history-results">
                    {historyItem.poll.options.map((option, idx) => {
                      const votes = historyItem.results[option] || 0;
                      const percentage = historyItem.totalVotes > 0 ? (votes / historyItem.totalVotes) * 100 : 0;
                      
                      return (
                        <div key={idx} className="history-result-item">
                          <label className="result-option">
                            <input type="checkbox" checked={votes > 0} readOnly />
                            <span className="option-text">{option}</span>
                            <span className="percentage">{percentage.toFixed(0)}%</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  {index < pollHistory.length - 1 && <div className="divider"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherView; 