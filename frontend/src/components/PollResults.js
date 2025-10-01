import React from 'react';
import './PollResults.css';

const PollResults = ({ results, options }) => {
  const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);

  return (
    <div className="poll-results">
      {options.map((option, index) => {
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
          </div>
        );
      })}
    </div>
  );
};

export default PollResults;