// components/StageBlock.jsx
import React from 'react';
import { FaCog, FaUserCog, FaClipboardCheck, FaPercent } from 'react-icons/fa';

const StageBlock = ({ stage, index, quantity }) => {
  const calculateProgress = () => {
    if (!quantity) return 0;
    return Math.min(100, Math.round((stage.completed / quantity) * 100));
  };

  const progress = calculateProgress();

  return (
    <div className="stage-block">
      <div className="stage-header">
        <h5 className="stage-title">
          <div className="stage-icon">{index + 1}</div>
          {stage.name}
        </h5>
      </div>
      
      <div className="stage-details">
        <div className="stage-detail">
          <FaClipboardCheck className="detail-icon" />
          <span className="detail-label">Completed:</span>
          <span className="detail-value">{stage.completed} / {quantity}</span>
        </div>
        
        <div className="stage-detail">
          <FaUserCog className="detail-icon" />
          <span className="detail-label">Employee:</span>
          <span className="detail-value">{stage.employee_name || "Unassigned"}</span>
        </div>
      </div>
      
      <div className="stage-progress">
        <div className="progress-label">
          <span className="progress-text">Progress</span>
          <span className="progress-percentage">{progress}%</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StageBlock;
