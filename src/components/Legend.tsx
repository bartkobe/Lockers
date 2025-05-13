import React from 'react';
import './Legend.css';

const Legend: React.FC = () => {
  const statuses = [
    { name: 'empty', color: 'rgba(0, 0, 0, 0.05)' },
    { name: 'in use', color: '#4CAF50' },
    { name: 'expired parcels', color: '#FFD700' },
    { name: 'Claimed', color: '#4B0082' },
    { name: 'soiled', color: '#8B4513' },
    { name: 'damaged', color: '#FF0000' },
    { name: 'Inspection', color: '#98FF98' },
    { name: 'Unclosed', color: '#FFFFFF', hasBlackBorder: true },
    { name: 'Damaged and Inspection', color: '#FF7F50' },
    { name: 'Damaged and Soiled', color: '#40E0D0' },
    { name: 'Soiled and Inspection', color: '#8B0000' },
    { name: 'Damaged, Soiled and Inspection', color: '#8A2BE2' }
  ];

  return (
    <div className="legend" role="region" aria-label="Status Legend">
      <h3>Status Legend</h3>
      <div className="legend-items">
        {statuses.map((status) => (
          <div 
            key={status.name} 
            className="legend-item"
            role="listitem"
          >
            <div 
              className={`legend-color ${status.hasBlackBorder ? 'unclosed' : ''}`} 
              style={{ backgroundColor: status.color }}
              aria-hidden="true"
            />
            <span className="legend-text">{status.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend; 