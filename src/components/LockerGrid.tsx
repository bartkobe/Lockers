import React, { useState, useCallback, useEffect, useRef } from 'react';
import './LockerGrid.css';
import Legend from './Legend';

type LockerSize = 'S' | 'M' | 'L';
type ColumnName = '4L' | '3L' | '2L' | '1L' | 'MID' | '1R' | '2R' | '3R' | '4R' | '5R';

type LockerStatus = 
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
  size: LockerSize;
}

interface LockerConfig {
  size: LockerSize;
  isEmpty?: boolean;
  isComparison?: boolean;
  comparisonState?: {
    apmStatus: LockerStatus;
    dbStatus: LockerStatus;
    hasParcel: boolean;
  };
}

interface ComparisonState {
  apmStatus: LockerStatus;
  dbStatus: LockerStatus;
  hasParcel: boolean;
}

interface LockerProps {
  size: LockerSize;
  isEmpty?: boolean;
  isComparison?: boolean;
  comparisonState?: ComparisonState;
  lockerCode?: string;
  onContextMenu: (event: React.MouseEvent, lockerId: string) => void;
  onClick: (event: React.MouseEvent, lockerId: string) => void;
  isSelected: boolean;
}

interface LockerDetails {
  label: string;
  value: string;
}

const statusColors: Record<LockerStatus, string> = {
  'empty': '#FFFFFF',
  'in use': '#4CAF50',
  'expired parcels': '#FFD700',
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

// Sample data with discrepancies
const lockerData: Record<string, LockerData> = {
  '4L1': {
    apm: { status: 'in use', parcels: ['PKG123'] },
    db: { status: 'empty', parcels: [] },
    size: 'L'
  },
  '4L2': {
    apm: { status: 'damaged', parcels: ['PKG456'] },
    db: { status: 'damaged', parcels: ['PKG456'] },
    size: 'M'
  },
  '4L3': {
    apm: { status: 'Inspection', parcels: [] },
    db: { status: 'soiled', parcels: ['PKG789'] },
    size: 'M'
  },
  '4L4': {
    apm: { status: 'Unclosed', parcels: ['PKG101'] },
    db: { status: 'in use', parcels: ['PKG101'] },
    size: 'S'
  },
  '4L5': {
    apm: { status: 'expired parcels', parcels: ['PKG202', 'PKG203'] },
    db: { status: 'Claimed', parcels: ['PKG202', 'PKG203'] },
    size: 'S'
  }
};

interface RemoveParcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove: (reason: string) => void;
}

const RemoveParcelModal: React.FC<RemoveParcelModalProps> = ({ isOpen, onClose, onRemove }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onRemove(reason);
    setReason('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Remove selected parcel from machine for re-sending</h2>
        <div className="modal-body">
          <p>Do you really want to remove selected parcels from machine for re-sending? Enter the reason:</p>
          <div className="form-group">
            <textarea 
              className="form-control"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={!reason.trim()}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

interface BlockWithClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlock: () => void;
}

const BlockWithClaimModal: React.FC<BlockWithClaimModalProps> = ({ isOpen, onClose, onBlock }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Block with claim</h2>
        <div className="modal-body">
          <p>Block this parcel with a claim?</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onBlock}>Block</button>
        </div>
      </div>
    </div>
  );
};

interface ChangeExpirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (days: number) => void;
  parcelNumber: string;
}

const ChangeExpirationModal: React.FC<ChangeExpirationModalProps> = ({ isOpen, onClose, onSave, parcelNumber }) => {
  const [selectedDays, setSelectedDays] = useState(1);

  const handleSubmit = () => {
    onSave(selectedDays);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Change expiration time</h2>
        <div className="modal-body">
          <p>Parcel {parcelNumber}</p>
          <div className="form-group">
            <label htmlFor="expirationTime">Expiration time</label>
            <select 
              id="expirationTime" 
              className="form-control"
              value={selectedDays}
              onChange={(e) => setSelectedDays(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7].map(days => (
                <option key={days} value={days}>
                  {days} {days === 1 ? 'day' : 'days'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
};

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  lockerId: string;
  onChangeBox: () => void;
  onRemoveParcel: () => void;
  onBlockWithClaim: () => void;
  onChangeExpiration: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ 
  x, 
  y, 
  onClose, 
  lockerId, 
  onChangeBox, 
  onRemoveParcel,
  onBlockWithClaim,
  onChangeExpiration
}) => {
  const menuStyle = {
    position: 'fixed' as const,
    top: y,
    left: x,
    backgroundColor: 'white',
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    padding: '4px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    fontFamily: 'var(--font-primary)',
  };

  const menuItemStyle = {
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#212529',
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    border: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    fontWeight: 400,
    transition: 'all 0.2s',
  };

  const handleAction = (action: string) => {
    if (action === 'Change Box') {
      onChangeBox();
    } else if (action === 'Remove Parcel') {
      onRemoveParcel();
    } else if (action === 'Block Claim') {
      onBlockWithClaim();
    } else if (action === 'Change Expiration') {
      onChangeExpiration();
    }
    console.log(`${action} for locker ${lockerId}`);
    onClose();
  };

  return (
    <>
      <div style={menuStyle}>
        <button 
          style={menuItemStyle} 
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => handleAction('View Details')}
        >
          View Details
        </button>
        <button 
          style={menuItemStyle}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => handleAction('Reset Status')}
        >
          Reset Status
        </button>
        <button 
          style={menuItemStyle}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => handleAction('Force Sync')}
        >
          Force Sync
        </button>
        <button 
          style={menuItemStyle}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => handleAction('Change Box')}
        >
          Change target box machine
        </button>
        <button 
          style={menuItemStyle}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => handleAction('Remove Parcel')}
        >
          Remove selected parcel from machine for re-sending
        </button>
        <button 
          style={menuItemStyle}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => handleAction('Block Claim')}
        >
          Block with claim
        </button>
        <button 
          style={menuItemStyle}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => handleAction('Change Expiration')}
        >
          Change expiration time
        </button>
      </div>
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 999 
        }} 
        onClick={onClose}
      />
    </>
  );
};

const SAMPLE_DETAILS: LockerDetails[] = [
  { label: 'Automatic Return', value: 'No' },
  { label: 'AVIZO Time', value: '2160' },
  { label: 'Business Customer', value: 'No' },
  { label: 'Calculated Charge Amount', value: '1.00' },
  { label: 'Confirmation Printed', value: 'Yes' },
  { label: 'Creation Date', value: '12-05-2025 14:35:47' },
  { label: 'Customer Delivering Code', value: '410026' },
  { label: 'Direct Parcel', value: 'Yes' },
  { label: 'Expiration Time', value: '720' },
  { label: 'On Delivery Amount', value: '0.00' },
  { label: 'Pack Code', value: '663400868586300013163881' },
  { label: 'Pack Size', value: 'A' },
  { label: 'Prefered Box Machine Name', value: 'ADDRESS' },
  { label: 'Receiver E-mail', value: 'dummy@gmail.com' },
  { label: 'Receiver Phone', value: '+48987654321' },
  { label: 'Sender E-mail', value: 'inpost@inpost.pl' },
  { label: 'Sender Phone', value: '+485123456789' },
  { label: 'Status', value: 'CustomerStored' },
  { label: 'Status Change Date', value: '2025-05-12T17:12:42.547+02:00' },
  { label: 'Status Change Date (Parcel locker time)', value: '12-05-2025 17:12:42' }
];

interface DetailsTableProps {
  detailsMap: Map<string, LockerDetails[]>;
  selectedLockers: string[];
}

const DetailsTable: React.FC<DetailsTableProps> = ({ detailsMap, selectedLockers }) => {
  // Get all unique labels and ensure Pack Code is included
  const allLabels = new Set<string>();
  selectedLockers.forEach(lockerId => {
    const details = detailsMap.get(lockerId) || [];
    details.forEach(detail => allLabels.add(detail.label));
  });

  // Sort labels with Pack Code first, then alphabetically
  const sortedLabels = Array.from(allLabels).sort((a, b) => {
    if (a === 'Pack Code') return -1;
    if (b === 'Pack Code') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="details-table-container">
      <table className="details-table">
        <thead>
          <tr>
            <th className="attribute-header">Attribute</th>
            {selectedLockers.map(lockerId => (
              <th key={lockerId} className="value-header">{lockerId}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedLabels.map((label) => (
            <tr key={label}>
              <td className="attribute-cell">{label}</td>
              {selectedLockers.map(lockerId => {
                const details = detailsMap.get(lockerId) || [];
                const detail = details.find(d => d.label === label);
                return (
                  <td key={lockerId} className="value-cell">
                    {detail?.value || '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Locker: React.FC<LockerProps> = ({ 
  size, 
  isEmpty = false, 
  isComparison = false, 
  comparisonState, 
  lockerCode = '',
  onContextMenu,
  onClick,
  isSelected
}) => {
  if (isComparison && comparisonState) {
    return (
      <div 
        className={`locker size-${size.toLowerCase()} ${isSelected ? 'selected' : ''}`}
        onContextMenu={(e) => onContextMenu(e, lockerCode)}
        onClick={(e) => onClick(e, lockerCode)}
        data-tooltip={lockerCode}
      >
        <div className="status-split">
          <div 
            className={`status-half apm ${comparisonState.apmStatus === 'Unclosed' ? 'unclosed' : ''}`}
            style={{ backgroundColor: statusColors[comparisonState.apmStatus] }}
          >
            {comparisonState.hasParcel && <span className="package">📦</span>}
          </div>
          <div 
            className={`status-half db ${comparisonState.dbStatus === 'Unclosed' ? 'unclosed' : ''}`}
            style={{ backgroundColor: statusColors[comparisonState.dbStatus] }}
          >
          </div>
        </div>
      </div>
    );
  } else {
    const statusClass = isEmpty ? 'empty' : 'occupied';
    return (
      <div 
        className={`locker size-${size.toLowerCase()} ${statusClass} ${isSelected ? 'selected' : ''}`}
        onContextMenu={(e) => onContextMenu(e, lockerCode)}
        onClick={(e) => onClick(e, lockerCode)}
        data-tooltip={lockerCode}
      >
        {!isEmpty && (
          <span className="package">📦</span>
        )}
      </div>
    );
  }
};

// Helper function to generate random data
const generateRandomData = (lockerId: string): LockerDetails[] => {
  const randomDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 30));
    return date.toLocaleString('en-GB', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const randomPhone = () => `+48${Math.floor(Math.random() * 900000000 + 100000000)}`;
  const randomAmount = () => (Math.random() * 100).toFixed(2);
  const randomCode = () => Math.floor(Math.random() * 900000 + 100000).toString();
  const randomParcelCode = () => `66340086858${Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0')}`;
  const randomStatus = () => {
    const statuses = ['CustomerStored', 'ReadyToPickup', 'Delivered', 'InTransit', 'ReturnPending'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  return [
    { label: 'Automatic Return', value: Math.random() > 0.5 ? 'Yes' : 'No' },
    { label: 'AVIZO Time', value: (Math.floor(Math.random() * 48) * 60).toString() },
    { label: 'Business Customer', value: Math.random() > 0.5 ? 'Yes' : 'No' },
    { label: 'Calculated Charge Amount', value: randomAmount() },
    { label: 'Confirmation Printed', value: Math.random() > 0.5 ? 'Yes' : 'No' },
    { label: 'Creation Date', value: randomDate() },
    { label: 'Customer Delivering Code', value: randomCode() },
    { label: 'Direct Parcel', value: Math.random() > 0.5 ? 'Yes' : 'No' },
    { label: 'Expiration Time', value: (Math.floor(Math.random() * 72) * 10).toString() },
    { label: 'On Delivery Amount', value: randomAmount() },
    { label: 'Pack Code', value: randomParcelCode() },
    { label: 'Pack Size', value: ['A', 'B', 'C'][Math.floor(Math.random() * 3)] },
    { label: 'Prefered Box Machine Name', value: `ADDRESS-${lockerId}` },
    { label: 'Receiver E-mail', value: `customer${randomCode()}@gmail.com` },
    { label: 'Receiver Phone', value: randomPhone() },
    { label: 'Sender E-mail', value: `sender${randomCode()}@inpost.pl` },
    { label: 'Sender Phone', value: randomPhone() },
    { label: 'Status', value: randomStatus() },
    { label: 'Status Change Date', value: new Date().toISOString() },
    { label: 'Status Change Date (Parcel locker time)', value: randomDate() }
  ];
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  parcelNumber: string;
}

const ChangeBoxModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, parcelNumber }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Change target box machine</h2>
        <div className="modal-body">
          <p>Parcel {parcelNumber}</p>
          <div className="form-group">
            <label htmlFor="parcelLocker">Parcel locker</label>
            <select id="parcelLocker" className="form-control">
              {/* Options will be added later */}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

const LockerGrid: React.FC = () => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; lockerId: string } | null>(null);
  const [selectedLockers, setSelectedLockers] = useState<Set<string>>(new Set());
  const [showDetailsTable, setShowDetailsTable] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isBlockClaimModalOpen, setIsBlockClaimModalOpen] = useState(false);
  const [isExpirationModalOpen, setIsExpirationModalOpen] = useState(false);
  
  // Create a ref to store the generated data for each locker
  const lockerDetailsRef = useRef<Map<string, LockerDetails[]>>(new Map());

  // Get or generate details for a locker
  const getLockerDetails = useCallback((lockerId: string) => {
    if (!lockerDetailsRef.current.has(lockerId)) {
      lockerDetailsRef.current.set(lockerId, generateRandomData(lockerId));
    }
    return lockerDetailsRef.current.get(lockerId) || [];
  }, []);

  const handleContextMenu = useCallback((event: React.MouseEvent, lockerId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, lockerId });
  }, []);

  const handleLockerClick = useCallback((event: React.MouseEvent, lockerId: string) => {
    event.preventDefault();
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select behavior
      setSelectedLockers(prev => {
        const newSelection = new Set(prev);
        if (prev.has(lockerId)) {
          newSelection.delete(lockerId);
        } else {
          newSelection.add(lockerId);
          // Generate data for the newly selected locker
          getLockerDetails(lockerId);
        }
        return newSelection;
      });
      setShowDetailsTable(true);
    } else {
      // Single select behavior
      // If only one locker is selected and it's the same one being clicked, deselect it
      if (selectedLockers.size === 1 && selectedLockers.has(lockerId)) {
        setSelectedLockers(new Set());
        setShowDetailsTable(false);
      } else {
        setSelectedLockers(new Set([lockerId]));
        getLockerDetails(lockerId);
        setShowDetailsTable(true);
      }
    }
  }, [getLockerDetails, selectedLockers]);

  // Clear selection when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.locker') && !target.closest('.details-table-container')) {
        setSelectedLockers(new Set());
        setShowDetailsTable(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSave = () => {
    // Handle save logic here
    setIsModalOpen(false);
  };

  const handleChangeBox = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleRemoveParcel = useCallback(() => {
    setIsRemoveModalOpen(true);
  }, []);

  const handleRemoveModalClose = useCallback(() => {
    setIsRemoveModalOpen(false);
  }, []);

  const handleRemoveModalSubmit = useCallback((reason: string) => {
    console.log('Removing parcels with reason:', reason);
    setIsRemoveModalOpen(false);
  }, []);

  const handleBlockWithClaim = useCallback(() => {
    setIsBlockClaimModalOpen(true);
  }, []);

  const handleBlockClaimModalClose = useCallback(() => {
    setIsBlockClaimModalOpen(false);
  }, []);

  const handleBlockClaimSubmit = useCallback(() => {
    console.log('Blocking parcel with claim');
    setIsBlockClaimModalOpen(false);
  }, []);

  const handleChangeExpiration = useCallback(() => {
    setIsExpirationModalOpen(true);
  }, []);

  const handleExpirationModalClose = useCallback(() => {
    setIsExpirationModalOpen(false);
  }, []);

  const handleExpirationModalSave = useCallback((days: number) => {
    console.log('Changing expiration time to', days, 'days');
    setIsExpirationModalOpen(false);
  }, []);

  const columnLayouts: Record<ColumnName, LockerConfig[]> = {
    '4L': [
      { 
        size: 'L',
        isComparison: true,
        comparisonState: {
          apmStatus: 'Unclosed',
          dbStatus: 'in use',
          hasParcel: true
        }
      }, 
      { size: 'M' }, 
      { 
        size: 'M',
        isComparison: true,
        comparisonState: {
          apmStatus: 'damaged',
          dbStatus: 'Inspection',
          hasParcel: true
        }
      }, 
      { size: 'M' }, 
      { size: 'M' }, 
      { size: 'M', isEmpty: true }, 
      { size: 'L' }
    ],
    '3L': [
      { size: 'L' }, 
      { size: 'M' }, 
      { size: 'M' }, 
      { 
        size: 'M',
        isComparison: true,
        comparisonState: {
          apmStatus: 'expired parcels',
          dbStatus: 'Claimed',
          hasParcel: true
        }
      }, 
      { size: 'M' }, 
      { size: 'M' }, 
      { size: 'L' }
    ],
    '2L': [
      { size: 'L' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { 
        size: 'S',
        isComparison: true,
        comparisonState: {
          apmStatus: 'Damaged and Soiled',
          dbStatus: 'soiled',
          hasParcel: true
        }
      },
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
      { 
        size: 'S',
        isComparison: true,
        comparisonState: {
          apmStatus: 'Soiled and Inspection',
          dbStatus: 'Damaged and Inspection',
          hasParcel: false
        }
      },
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
      { 
        size: 'S',
        isComparison: true,
        comparisonState: {
          apmStatus: 'Damaged, Soiled and Inspection',
          dbStatus: 'damaged',
          hasParcel: true
        }
      },
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
      { 
        size: 'M',
        isComparison: true,
        comparisonState: {
          apmStatus: 'soiled',
          dbStatus: 'Damaged and Soiled',
          hasParcel: true
        }
      },
      { size: 'M' },
      { size: 'M' },
      { size: 'L' }
    ],
    '3R': [
      { size: 'L', isEmpty: true },
      { size: 'M' },
      { size: 'M', isEmpty: true },
      { size: 'M' },
      { 
        size: 'M',
        isComparison: true,
        comparisonState: {
          apmStatus: 'Inspection',
          dbStatus: 'Soiled and Inspection',
          hasParcel: false
        }
      },
      { size: 'M' },
      { size: 'L' }
    ],
    '4R': [
      { size: 'L' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { size: 'S' },
      { 
        size: 'S',
        isComparison: true,
        comparisonState: {
          apmStatus: 'Damaged and Inspection',
          dbStatus: 'expired parcels',
          hasParcel: true
        }
      },
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
      { 
        size: 'M',
        isComparison: true,
        comparisonState: {
          apmStatus: 'Unclosed',
          dbStatus: 'Damaged, Soiled and Inspection',
          hasParcel: true
        }
      },
      { size: 'M' },
      { size: 'M' },
      { size: 'L' }
    ]
  };

  const columns: ColumnName[] = ['4L', '3L', '2L', '1L', 'MID', '1R', '2R', '3R', '4R', '5R'];
  
  return (
    <div className="locker-grid" onContextMenu={(e) => e.preventDefault()}>
      <div className="grid-layout">
        <Legend />
        <div className="grid-main">
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
                    <Locker 
                      size="L" 
                      lockerCode="MID1" 
                      onContextMenu={handleContextMenu}
                      onClick={handleLockerClick}
                      isSelected={selectedLockers.has('MID1')}
                    />
                    <div className="service-section">
                      <div className="service">Service</div>
                      <div className="steering">Steering</div>
                    </div>
                    <div className="small-lockers">
                      {['MID4', 'MID5', 'MID6', 'MID7'].map(lockerId => (
                        <Locker 
                          key={lockerId}
                          size="S" 
                          lockerCode={lockerId} 
                          onContextMenu={handleContextMenu}
                          onClick={handleLockerClick}
                          isSelected={selectedLockers.has(lockerId)}
                        />
                      ))}
                    </div>
                    <Locker 
                      size="L" 
                      lockerCode="MID8" 
                      onContextMenu={handleContextMenu}
                      onClick={handleLockerClick}
                      isSelected={selectedLockers.has('MID8')}
                    />
                  </>
                ) : (
                  columnLayouts[col].map((locker: LockerConfig, index: number) => {
                    const lockerCode = `${col}${index + 1}`;
                    return (
                      <Locker
                        key={index}
                        size={locker.size}
                        isEmpty={locker.isEmpty}
                        isComparison={locker.isComparison}
                        comparisonState={locker.comparisonState}
                        lockerCode={lockerCode}
                        onContextMenu={handleContextMenu}
                        onClick={handleLockerClick}
                        isSelected={selectedLockers.has(lockerCode)}
                      />
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          lockerId={contextMenu.lockerId}
          onChangeBox={handleChangeBox}
          onRemoveParcel={handleRemoveParcel}
          onBlockWithClaim={handleBlockWithClaim}
          onChangeExpiration={handleChangeExpiration}
        />
      )}
      <ChangeBoxModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        parcelNumber="663400868586300013163881"
      />
      <RemoveParcelModal
        isOpen={isRemoveModalOpen}
        onClose={handleRemoveModalClose}
        onRemove={handleRemoveModalSubmit}
      />
      <BlockWithClaimModal
        isOpen={isBlockClaimModalOpen}
        onClose={handleBlockClaimModalClose}
        onBlock={handleBlockClaimSubmit}
      />
      <ChangeExpirationModal
        isOpen={isExpirationModalOpen}
        onClose={handleExpirationModalClose}
        onSave={handleExpirationModalSave}
        parcelNumber="663400868586300013163881"
      />
      {showDetailsTable && selectedLockers.size > 0 && (
        <DetailsTable detailsMap={lockerDetailsRef.current} selectedLockers={Array.from(selectedLockers)} />
      )}
    </div>
  );
};

export default LockerGrid; 