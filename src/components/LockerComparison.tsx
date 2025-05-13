import React from 'react';
import './LockerComparison.css';

export type LockerStatus = 
  | 'empty' 
  | 'in use'
  | 'expired parcels'
  | 'Claimed'
  | 'soiled'
  | 'damaged'
  | 'Inspection'
  | 'Unclosed'
  | 'Damaged and Inspection'
  | 'Damaged and Soiled'
  | 'Soiled and Inspection'
  | 'Damaged, Soiled and Inspection';

interface LockerState {
  status: LockerStatus;
  parcels: string[];
}

interface LockerData {
  apm: LockerState;
  db: LockerState;
}

// Sample data with discrepancies
const sampleLockerData: Record<string, LockerData> = {
  '4L1': {
    apm: { status: 'in use', parcels: ['PKG123'] },
    db: { status: 'empty', parcels: [] }
  },
  '4L2': {
    apm: { status: 'damaged', parcels: ['PKG456'] },
    db: { status: 'damaged', parcels: ['PKG456'] }
  },
  '4L3': {
    apm: { status: 'Inspection', parcels: [] },
    db: { status: 'soiled', parcels: ['PKG789'] }
  },
  '4L4': {
    apm: { status: 'Unclosed', parcels: ['PKG101'] },
    db: { status: 'in use', parcels: ['PKG101'] }
  },
  '4L5': {
    apm: { status: 'expired parcels', parcels: ['PKG202', 'PKG203'] },
    db: { status: 'Claimed', parcels: ['PKG202', 'PKG203'] }
  }
};

const statusColors: Record<LockerStatus, string> = {
  'empty': '#FFFFFF',
  'in use': '#00A000',
  'expired parcels': '#00BFFF',
  'Claimed': '#4B0082',
  'soiled': '#8B4513',
  'damaged': '#FF0000',
  'Inspection': '#98FF98',
  'Unclosed': '#FFFFFF',
  'Damaged and Inspection': '#FF7F50',
  'Damaged and Soiled': '#40E0D0',
  'Soiled and Inspection': '#8B0000',
  'Damaged, Soiled and Inspection': '#8A2BE2'
};

const LockerComparison: React.FC = () => {
  return (
    <div className="locker-comparison">
      <h2>Status Comparison View</h2>
      <div className="comparison-grid">
        <div className="header-row">
          <div className="header-cell">Locker ID</div>
          <div className="header-cell">APM Status</div>
          <div className="header-cell">APM Parcels</div>
          <div className="header-cell">DB Status</div>
          <div className="header-cell">DB Parcels</div>
          <div className="header-cell">Discrepancy</div>
        </div>
        {Object.entries(sampleLockerData).map(([lockerId, data]) => {
          const hasDiscrepancy = 
            data.apm.status !== data.db.status || 
            JSON.stringify(data.apm.parcels) !== JSON.stringify(data.db.parcels);

          return (
            <div key={lockerId} className={`comparison-row ${hasDiscrepancy ? 'has-discrepancy' : ''}`}>
              <div className="cell">{lockerId}</div>
              <div className="cell status-cell" style={{ backgroundColor: statusColors[data.apm.status] }}>
                {data.apm.status}
                {data.apm.status === 'Unclosed' && <span className="door-icon">⊃</span>}
              </div>
              <div className="cell">
                {data.apm.parcels.length > 0 ? data.apm.parcels.join(', ') : '-'}
              </div>
              <div className="cell status-cell" style={{ backgroundColor: statusColors[data.db.status] }}>
                {data.db.status}
                {data.db.status === 'Unclosed' && <span className="door-icon">⊃</span>}
              </div>
              <div className="cell">
                {data.db.parcels.length > 0 ? data.db.parcels.join(', ') : '-'}
              </div>
              <div className="cell discrepancy-cell">
                {hasDiscrepancy ? '⚠️ Mismatch' : '✓ Match'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LockerComparison; 