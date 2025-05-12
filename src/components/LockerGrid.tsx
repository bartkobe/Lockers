import React from 'react';
import './LockerGrid.css';

type LockerSize = 'S' | 'M' | 'L';
type ColumnName = '4L' | '3L' | '2L' | '1L' | 'MID' | '1R' | '2R' | '3R' | '4R' | '5R';

interface LockerConfig {
  size: LockerSize;
  isEmpty?: boolean;
}

interface LockerProps {
  size: LockerSize;
  isEmpty?: boolean;
  hasPackage?: boolean;
}

const Locker: React.FC<LockerProps> = ({ size, isEmpty = false, hasPackage = false }) => (
  <div className={`locker size-${size.toLowerCase()} ${isEmpty ? 'empty' : 'occupied'}`}>
    {hasPackage && !isEmpty && (
      <span className="package">📦</span>
    )}
  </div>
);

const LockerGrid: React.FC = () => {
  const columnLayouts: Record<ColumnName, LockerConfig[]> = {
    '4L': [
      { size: 'L' }, 
      { size: 'M' }, 
      { size: 'M' }, 
      { size: 'M' }, 
      { size: 'M' }, 
      { size: 'M', isEmpty: true }, 
      { size: 'L' }
    ],
    '3L': [
      { size: 'L' }, 
      { size: 'M' }, 
      { size: 'M' }, 
      { size: 'M' }, 
      { size: 'M' }, 
      { size: 'M' }, 
      { size: 'L' }
    ],
    '2L': [
      { size: 'L' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S', isEmpty: true },
      { size: 'S' },
      { size: 'L' }
    ],
    '1L': [
      { size: 'L' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S', isEmpty: true },
      { size: 'L' }
    ],
    'MID': [
      { size: 'L' },
      { size: 'M', isEmpty: true }, // Service
      { size: 'L', isEmpty: true }, // Steering
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'L' }
    ],
    '1R': [
      { size: 'L', isEmpty: true },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'L' }
    ],
    '2R': [
      { size: 'L', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'M' },
      { size: 'M' },
      { size: 'M' },
      { size: 'L' }
    ],
    '3R': [
      { size: 'L', isEmpty: true },
      { size: 'M' },
      { size: 'M', isEmpty: true },
      { size: 'M' },
      { size: 'M' },
      { size: 'M' },
      { size: 'L' }
    ],
    '4R': [
      { size: 'L' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'M' },
      { size: 'L' }
    ],
    '5R': [
      { size: 'L', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'M' },
      { size: 'M' },
      { size: 'M' },
      { size: 'M' },
      { size: 'L' }
    ]
  };

  const columns: ColumnName[] = ['4L', '3L', '2L', '1L', 'MID', '1R', '2R', '3R', '4R', '5R'];
  
  return (
    <div className="locker-grid">
      <div className="column-headers">
        {columns.map((col) => (
          <div key={col} className="column-header">{col === 'MID' ? '' : col}</div>
        ))}
      </div>
      <div className="grid-container">
        {columns.map((col) => (
          <div key={col} className="column">
            {col === 'MID' ? (
              <>
                <Locker size="L" />
                <div className="service-section">
                  <div className="service">Service</div>
                  <div className="steering">Steering</div>
                </div>
                <div className="small-lockers">
                  <Locker size="S" />
                  <Locker size="S" />
                  <Locker size="S" />
                  <Locker size="S" />
                </div>
                <Locker size="L" />
              </>
            ) : (
              columnLayouts[col].map((locker: LockerConfig, index: number) => (
                <Locker
                  key={index}
                  size={locker.size}
                  isEmpty={locker.isEmpty}
                  hasPackage={!locker.isEmpty && Math.random() > 0.3}
                />
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LockerGrid; 