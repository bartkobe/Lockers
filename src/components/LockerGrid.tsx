import React, { useState, useCallback, useEffect, useRef } from 'react';
import './LockerGrid.css';
import Legend from './Legend';
import Tooltip from './Tooltip';
import { CourierSearch, SearchTokenModal, OpenLockersModal } from './CourierSearch';
import GuidedParcelFlowModal from './GuidedParcelFlowModal';

type LockerSize = 'S' | 'M' | 'L';
type ColumnName = '1L' | '2L' | '3L' | '4L' | 'MID' | '1R' | '2R' | '3R' | '4R' | '5R' | '6R' | '7R' | '8R';

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
  hasMultipleParcels?: boolean;
  parcels?: string[];
  hasParcel?: boolean;
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
  hasMultipleParcels?: boolean;
  parcels?: string[];
  isInSearchMode?: boolean;
  isSearched?: boolean;
}

interface LockerDetails {
  label: string;
  value: string;
}

const statusColors: Record<LockerStatus, string> = {
  'empty': '#FFFFFF',
  'in use': '#7FB883',          // Softer green
  'expired parcels': '#E6C87D', // Softer gold
  'Claimed': '#8B7B9F',         // Softer indigo
  'soiled': '#B89F8E',          // Softer brown
  'damaged': '#E6A4A4',         // Softer red
  'Inspection': '#B8D8B8',      // Softer mint green
  'Unclosed': '#FFFFFF',        // Keep white for unclosed
  'Damaged and Inspection': '#E6B8A4', // Softer coral
  'Damaged and Soiled': '#A4D8D8',     // Softer turquoise
  'Soiled and Inspection': '#B88E8E',   // Softer maroon
  'Damaged, Soiled and Inspection': '#B8A4D8' // Softer purple
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

interface ParcelLifeModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcelNumber: string;
}

const ParcelLifeModal: React.FC<ParcelLifeModalProps> = ({ isOpen, onClose, parcelNumber }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Sample lifecycle events - in a real app, this would come from an API
  const lifecycleEvents = [
    { timestamp: '2024-03-15 10:30:00', status: 'Parcel created', location: 'Warsaw Hub' },
    { timestamp: '2024-03-15 14:45:00', status: 'In transit', location: 'Warsaw Hub' },
    { timestamp: '2024-03-16 09:15:00', status: 'Arrived at destination', location: 'Krakow Hub' },
    { timestamp: '2024-03-16 11:30:00', status: 'Out for delivery', location: 'Krakow Hub' },
    { timestamp: '2024-03-16 15:20:00', status: 'Delivered to locker', location: 'Krakow Locker 123' },
    { timestamp: '2024-03-17 08:45:00', status: 'Customer notification sent', location: 'System' },
    { timestamp: '2024-03-17 16:30:00', status: 'Parcel collected', location: 'Krakow Locker 123' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content parcel-life-modal">
        <h2>Parcel Lifecycle</h2>
        <div className="modal-body">
          <p className="parcel-number">Parcel {parcelNumber}</p>
          <div className="lifecycle-timeline">
            {lifecycleEvents.map((event, index) => (
              <div key={index} className="lifecycle-event">
                <div className="event-timestamp">{event.timestamp}</div>
                <div className="event-content">
                  <div className="event-status">{event.status}</div>
                  <div className="event-location">{event.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

interface ChangeParcelStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcelNumber: string;
}

const ChangeParcelStatusModal: React.FC<ChangeParcelStatusModalProps> = ({ isOpen, onClose, parcelNumber }) => {
  // Add effect to toggle body class when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup function to ensure class is removed
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Change Parcel Status</h2>
        <div className="modal-body">
          <p>Parcel {parcelNumber}</p>
          {/* Empty modal for now */}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
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
  onSeeParcelLife: () => void;
  searchModeActive: boolean;
  onOpenLocker: (lockerId: string) => void;
  onChangeParcelStatus: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ 
  x, 
  y, 
  onClose, 
  lockerId, 
  onChangeBox, 
  onRemoveParcel,
  onBlockWithClaim,
  onChangeExpiration,
  onSeeParcelLife,
  searchModeActive,
  onOpenLocker,
  onChangeParcelStatus
}) => {
  // menuStyle object removed - will be handled by .ContextMenu class in CSS
  const dynamicMenuStyle = {
    position: 'fixed' as const,
    top: y,
    left: x,
    zIndex: 1000, // Keep z-index inline or move to CSS if static
  };

  // menuItemStyle object removed - will be handled by .context-menu-item class in CSS

  const handleAction = (action: string) => {
    if (action === 'Open Locker') {
      onOpenLocker(lockerId);
    } else if (action === 'Change Box') {
      onChangeBox();
    } else if (action === 'Remove Parcel') {
      onRemoveParcel();
    } else if (action === 'Block Claim') {
      onBlockWithClaim();
    } else if (action === 'Change Expiration') {
      onChangeExpiration();
    } else if (action === 'See Parcel Life') {
      onSeeParcelLife();
    } else if (action === 'Change Parcel Status') {
      onChangeParcelStatus();
    }
    console.log(`${action} for locker ${lockerId}`);
    onClose();
  };

  return (
    <>
      <div style={dynamicMenuStyle} className="ContextMenu">
        {searchModeActive && (
          <button 
            className="context-menu-item" // Added class
            // onMouseEnter and onMouseLeave removed
            onClick={() => handleAction('Open Locker')}
          >
            Open this locker
          </button>
        )}
        <button 
          className="context-menu-item" // Added class
          onClick={() => handleAction('Inspection On')}
        >
          Inspection on
        </button>
        <button 
          className="context-menu-item" // Added class
          onClick={() => handleAction('Inspection Off')}
        >
          Inspection off
        </button>
        <button 
          className="context-menu-item" // Added class
          onClick={() => handleAction('Set Damaged')}
        >
          Set damaged
        </button>
        <button 
          className="context-menu-item" // Added class
          onClick={() => handleAction('Fix Damaged')}
        >
          Fix damaged
        </button>
        <button 
          className="context-menu-item" // Added class
          onClick={() => handleAction('Clean Soiled')}
        >
          Clean soiled
        </button>
        <button 
          className="context-menu-item" // Added class
          onClick={() => handleAction('Change Box')}
        >
          Change target box machine
        </button>
        <button 
          className="context-menu-item" // Added class
          onClick={() => handleAction('Remove Parcel')}
        >
          Remove selected parcel from machine for re-sending
        </button>
        <button 
          className="context-menu-item" // Added class
          onClick={() => handleAction('Block Claim')}
        >
          Block with claim
        </button>
        <button 
          className="context-menu-item" // Added class
          onClick={() => handleAction('Change Expiration')}
        >
          Change expiration time
        </button>
        <button 
          className="context-menu-item" // Added class
          onClick={() => handleAction('See Parcel Life')}
        >
          See parcel life
        </button>
        <button 
          className="context-menu-item" // Added class
          onClick={() => handleAction('Change Parcel Status')}
        >
          Change parcel status
        </button>
      </div>
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 500  // Ensure this is below the ContextMenu's z-index if moved to CSS
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

// Improve the TableHeader interface for grouped headers
interface TableHeader {
  lockerId: string;
  parcelCode: string;
  fullHeader: string;
  isMultiParcel?: boolean;
  parcelIndex?: number;
  lockerBaseId?: string; // Original locker ID for multi-parcel items
  parcelShortCode?: string; // Last few digits of parcel code for display
}

// Interface for grouped headers
interface HeaderGroup {
  baseId: string;
  headers: TableHeader[];
  colspan: number;
}

interface DetailsTableProps {
  detailsMap: Map<string, LockerDetails[]>;
  selectedLockers: string[];
}

// Update DetailsTable component to remove the extra row with parcel endings
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

  // Create an array of column headers that includes both locker ID and parcel number
  const tableHeaders: TableHeader[] = [];
  
  // Group the selected lockers by their base locker ID
  const lockerGroups: Record<string, string[]> = {};
  
  selectedLockers.forEach(lockerId => {
    // Check if this is a multi-parcel item
    if (lockerId.includes('-parcel-')) {
      const baseId = lockerId.split('-parcel-')[0];
      lockerGroups[baseId] = lockerGroups[baseId] || [];
      lockerGroups[baseId].push(lockerId);
    } else {
      lockerGroups[lockerId] = lockerGroups[lockerId] || [];
      lockerGroups[lockerId].push(lockerId);
    }
  });

  // Create headers for each locker/parcel and organize them into groups
  const headerGroups: HeaderGroup[] = [];
  
  Object.entries(lockerGroups).forEach(([baseId, lockerIds]) => {
    const isMultiParcel = lockerIds.length > 1 || lockerIds[0].includes('-parcel-');
    const groupHeaders: TableHeader[] = [];
    
    lockerIds.forEach((lockerId, index) => {
      const details = detailsMap.get(lockerId) || [];
      const parcelCodes = details.find(d => d.label === 'Pack Code')?.value || '';
      
      const header: TableHeader = { 
        lockerId, 
        parcelCode: parcelCodes,
        fullHeader: baseId,
        isMultiParcel,
        parcelIndex: index,
        lockerBaseId: baseId,
        parcelShortCode: parcelCodes ? parcelCodes.substring(parcelCodes.length - 8) : ''
      };
      
      groupHeaders.push(header);
      tableHeaders.push(header);
    });
    
    headerGroups.push({
      baseId,
      headers: groupHeaders,
      colspan: groupHeaders.length
    });
  });

  return (
    <div className="details-table-container">
      <table className="details-table">
        <thead>
          {/* Single row with merged headers */}
          <tr>
            <th className="attribute-header">Attribute</th>
            {headerGroups.map((group) => (
              group.headers.length > 1 ? (
                <th 
                  key={`group-${group.baseId}`} 
                  colSpan={group.colspan} 
                  className="merged-header merged-header-group"
                >
                  {group.baseId}
                </th>
              ) : (
                <th 
                  key={`single-${group.baseId}`} 
                  className="value-header"
                >
                  {group.baseId}
                </th>
              )
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedLabels.map((label) => (
            <tr key={label}>
              <td className="attribute-cell">{label}</td>
              {tableHeaders.map((header, idx) => {
                const details = detailsMap.get(header.lockerId) || [];
                const detail = details.find(d => d.label === label);
                const isFirstInGroup = header.isMultiParcel && header.parcelIndex === 0;
                const isLastInGroup = header.isMultiParcel && 
                  headerGroups.find(g => g.baseId === header.lockerBaseId)?.headers.length === (header.parcelIndex || 0) + 1;
                
                return (
                  <td 
                    key={`${header.lockerId}-${idx}`} 
                    className={`value-cell parcel-column ${isFirstInGroup ? 'group-start' : ''} ${isLastInGroup ? 'group-end' : ''}`}
                  >
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
  isSelected,
  hasMultipleParcels = false,
  parcels,
  isInSearchMode = false,
  isSearched = false
}) => {
  const lockerClassName = `locker size-${size.toLowerCase()} ${isSelected ? 'selected' : ''} ${
    isInSearchMode ? 'search-mode' : ''
  } ${isSearched ? 'searched' : ''}`;

  if (isComparison && comparisonState) {
    return (
      <Tooltip text={lockerCode} position="top">
        <div 
          className={lockerClassName}
          onContextMenu={(e) => onContextMenu(e, lockerCode)}
          onClick={(e) => onClick(e, lockerCode)}
        >
          <div className="locker-content">
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
        </div>
      </Tooltip>
    );
  } else {
    // Determine the appropriate status and color
    const status: LockerStatus = isEmpty ? 'empty' : 'in use';
    const color = statusColors[status];
    const statusClass = isEmpty ? 'empty' : 'occupied';
    
    return (
      <Tooltip text={lockerCode} position="top">
        <div 
          className={lockerClassName}
          onContextMenu={(e) => onContextMenu(e, lockerCode)}
          onClick={(e) => onClick(e, lockerCode)}
        >
          <div 
            className="locker-content"
            style={{ backgroundColor: color }}
          >
            {!isEmpty && (
              <>
                <span className="package">📦</span>
                {hasMultipleParcels && (
                  <span className="package" style={{ marginLeft: '-5px', marginTop: '3px' }}>📦</span>
                )}
              </>
            )}
          </div>
        </div>
      </Tooltip>
    );
  }
};

// Update generateRandomData to handle multiple parcels
const generateRandomData = (lockerId: string, parcelId?: string): LockerDetails[] => {
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
  const randomParcelCode = () => parcelId || `66340086858${Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0')}`;
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
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
  const [isParcelLifeModalOpen, setIsParcelLifeModalOpen] = useState(false);
  const [isGuidedFlowModalOpen, setIsGuidedFlowModalOpen] = useState(false);
  const [guidedFlowInitialStatus, setGuidedFlowInitialStatus] = useState<string>('');
  const [guidedFlowLockerId, setGuidedFlowLockerId] = useState<string>('');
  
  // Define columns
  const columns: ColumnName[] = ['4L', '3L', '2L', '1L', 'MID', '1R', '2R', '3R', '4R', '5R', '6R', '7R', '8R'];
  
  // Search mode states
  const [searchModeActive, setSearchModeActive] = useState(false);
  const [activeSearchColumn, setActiveSearchColumn] = useState<ColumnName | null>(null);
  const [searchedLockers, setSearchedLockers] = useState<Set<string>>(new Set());
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showOpenLockersModal, setShowOpenLockersModal] = useState(false);
  const [openLockers, setOpenLockers] = useState<string[]>([]);
  const [searchToken, setSearchToken] = useState('');
  
  // Create a ref to store the generated data for each locker
  const lockerDetailsRef = useRef<Map<string, LockerDetails[]>>(new Map());

  // Add state:
  const [openedSearchColumns, setOpenedSearchColumns] = useState<Set<ColumnName>>(new Set());

  // Define columnLayouts first before using it in getLockerDetails
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
      { 
        size: 'L', 
        hasMultipleParcels: true,
        parcels: ['6634008685863000131638', '6634008685863000265497'] 
      },
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
      { size: 'L' }, // MID1
      // Service and Steering are handled in the JSX directly
      { size: 'S' }, // MID4
      { size: 'S' }, // MID5
      { size: 'S' }, // MID6
      { size: 'S' }, // MID7
      { size: 'L' }  // MID8
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
    ],
    '6R': [
      { size: 'L', isEmpty: true },
      { size: 'M', hasParcel: true },
      { size: 'M', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'L', hasParcel: true }
    ],
    '7R': [
      { size: 'L', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'L', isEmpty: true }
    ],
    '8R': [
      { size: 'L', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'M', isEmpty: true },
      { size: 'L', isEmpty: true }
    ]
  };

  // Get or generate details for a locker
  const getLockerDetails = useCallback((lockerId: string) => {
    // Fix type error by checking if the locker ID is valid before indexing
    const colId = lockerId.slice(0, 2) as ColumnName;
    const rowIdx = parseInt(lockerId.slice(2)) - 1;
    
    // Check if this is a locker with multiple parcels
    const lockerConfig = columnLayouts[colId]?.[rowIdx]; 
    
    if (lockerConfig?.hasMultipleParcels && lockerConfig.parcels?.length) {
      // If we already have the details, return them
      if (lockerDetailsRef.current.has(lockerId)) {
        return lockerDetailsRef.current.get(lockerId) || [];
      }
      
      // For multiple parcels, we'll create a special merged view
      // That includes data from all parcels
      const allParcelDetails = [];
      
      // Generate details for the first parcel
      const firstParcelDetails = generateRandomData(lockerId, lockerConfig.parcels[0]);
      allParcelDetails.push(firstParcelDetails);
      
      // Store separate entries for each parcel in the locker
      for (let i = 0; i < lockerConfig.parcels.length; i++) {
        const parcelId = lockerConfig.parcels[i];
        const parcelKey = `${lockerId}-parcel-${i+1}`;
        const parcelDetails = generateRandomData(lockerId, parcelId);
        lockerDetailsRef.current.set(parcelKey, parcelDetails);
        
        // For the first parcel, we'll use it as the locker's main details
        if (i === 0) {
          lockerDetailsRef.current.set(lockerId, parcelDetails);
        } else {
          // For additional parcels, add them to the visible columns
          const parcelInfo = { 
            lockerId: parcelKey, 
            parcelCode: parcelId 
          };
          allParcelDetails.push(parcelDetails);
        }
      }
      
      return firstParcelDetails;
    }
    
    // Normal case for a single parcel
    if (!lockerDetailsRef.current.has(lockerId)) {
      lockerDetailsRef.current.set(lockerId, generateRandomData(lockerId));
    }
    return lockerDetailsRef.current.get(lockerId) || [];
  }, [columnLayouts]);

  const handleContextMenu = useCallback((event: React.MouseEvent, lockerId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, lockerId });
  }, []);

  // Functions for search mode
  const handleEnterSearchMode = useCallback(() => {
    setShowTokenModal(true);
  }, []);

  const handleTokenModalClose = useCallback(() => {
    setShowTokenModal(false);
  }, []);

  // Start search mode
  const startSearchMode = useCallback((token: string) => {
    setSearchToken(token);
    setSearchModeActive(true);
    setActiveSearchColumn(null);
    setSearchedLockers(new Set<string>());
    setOpenedSearchColumns(new Set());
    setShowTokenModal(false);
  }, []);
  
  // Complete search
  const completeSearch = useCallback(() => {
    setSearchModeActive(false);
    setSearchToken('');
    setActiveSearchColumn(null);
    setSearchedLockers(new Set<string>());
    setOpenedSearchColumns(new Set());
  }, []);

  // Function to open a locker (simulated for demo)
  const handleLockerOpen = useCallback((lockerId: string) => {
    console.log(`Opening locker: ${lockerId}`);
    // In a real application, this would trigger an API call to open the locker
    
    // Mark locker as searched
    const updatedSearched = new Set(searchedLockers);
    updatedSearched.add(lockerId);
    setSearchedLockers(updatedSearched);
    
    alert(`Locker ${lockerId} opened`);
  }, [searchedLockers]);

  // Function to get open lockers (simulated for demo)
  const getOpenLockers = useCallback(async (): Promise<string[]> => {
    // In a real application, this would be an API call to check which lockers are open
    // For demo purposes, we'll randomly select a few lockers as "open"
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo, randomly determine if lockers are open
        if (Math.random() > 0.5) {
          resolve([]);  // All lockers closed
        } else {
          // Random set of open lockers in the active column
          const randomLockers: string[] = [];
          if (activeSearchColumn) {
            const numOpen = Math.floor(Math.random() * 3) + 1;  // 1-3 open lockers
            for (let i = 0; i < numOpen; i++) {
              const randomIdx = Math.floor(Math.random() * columnLayouts[activeSearchColumn].length) + 1;
              randomLockers.push(`${activeSearchColumn}${randomIdx}`);
            }
          }
          resolve(randomLockers);
        }
      }, 1000);  // Simulate API delay
    });
  }, [activeSearchColumn, columnLayouts]);

  // Check for open lockers
  const checkOpenLockers = useCallback(async () => {
    try {
      const openLockersResult = await getOpenLockers();
      setOpenLockers(openLockersResult);
      setShowOpenLockersModal(true);
    } catch (error) {
      console.error('Failed to check open lockers:', error);
      alert('Failed to check open lockers. Please try again.');
    }
  }, [getOpenLockers]);
  
  // Proceed to next column
  const goToNextColumn = useCallback(async () => {
    // First check if there are any open lockers
    try {
      const openLockersResult = await getOpenLockers();
      
      if (openLockersResult.length > 0) {
        // There are open lockers, show modal
        setOpenLockers(openLockersResult);
        setShowOpenLockersModal(true);
        return;
      }
      
      // All lockers closed, proceed to next column
      if (activeSearchColumn) {
        // Use the same column order as defined in the columns array
        const currentIndex = columns.indexOf(activeSearchColumn);
        if (currentIndex < columns.length - 1) {
          const nextColumn = columns[currentIndex + 1];
          setActiveSearchColumn(nextColumn);
        }
      }
    } catch (error) {
      console.error('Failed to check open lockers:', error);
      alert('Failed to check open lockers before proceeding. Please try again.');
    }
  }, [activeSearchColumn, getOpenLockers, columns]);

  // Update handleLockerClick to switch to Parcel Details tab when selecting a locker
  const handleLockerClick = useCallback((event: React.MouseEvent, lockerId: string) => {
    event.preventDefault();
    
    // If in search mode, handle differently
    if (searchModeActive && activeSearchColumn) {
      // Check if locker belongs to active column
      const lockerColumn = lockerId.slice(0, lockerId.length > 3 ? 3 : 2) as ColumnName;
      
      if (lockerColumn === activeSearchColumn) {
        // Open the locker
        handleLockerOpen(lockerId);
        return;
      }
    }
    
    // Fix type error by checking if the locker ID is valid before indexing
    const colId = lockerId.slice(0, 2) as ColumnName;
    const rowIdx = parseInt(lockerId.slice(2)) - 1;
    
    // Check if this is a locker with multiple parcels
    const lockerConfig = columnLayouts[colId]?.[rowIdx];
    const hasMultipleParcels = lockerConfig?.hasMultipleParcels && lockerConfig.parcels?.length;
    
    // Helper function to clear all related parcels
    const clearRelatedParcels = (id: string) => {
      const baseId = id.includes('-parcel-') ? id.split('-parcel-')[0] : id;
      const newSelection = new Set<string>();
      
      // Keep any lockers that aren't part of the current selection
      selectedLockers.forEach(selectedId => {
        if (!selectedId.startsWith(baseId)) {
          newSelection.add(selectedId);
        }
      });
      
      return newSelection;
    };
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select behavior
      setSelectedLockers(prev => {
        const newSelection = new Set(prev);
        if (prev.has(lockerId)) {
          // Remove this locker and any of its parcels
          return clearRelatedParcels(lockerId);
        } else {
          // Add this locker
          newSelection.add(lockerId);
          // Generate data for the newly selected locker
          getLockerDetails(lockerId);
          
          // For multiple parcels, add entries for each parcel
          if (hasMultipleParcels) {
            for (let i = 1; i < (lockerConfig?.parcels?.length || 0); i++) {
              const parcelKey = `${lockerId}-parcel-${i+1}`;
              // Make sure we have details for this parcel
              if (!lockerDetailsRef.current.has(parcelKey)) {
                lockerDetailsRef.current.set(
                  parcelKey, 
                  generateRandomData(lockerId, lockerConfig?.parcels?.[i])
                );
              }
              newSelection.add(parcelKey);
            }
          }
        }
        return newSelection;
      });
      setShowDetailsTable(true);
      setActiveTab('parcel'); // Switch to Parcel Details tab
    } else {
      // Single select behavior
      // If this locker or any of its parcels is already selected, deselect it
      if (selectedLockers.has(lockerId) || 
          (hasMultipleParcels && Array.from(selectedLockers).some(id => id.startsWith(lockerId)))) {
        setSelectedLockers(new Set());
        setShowDetailsTable(false);
      } else {
        // Select only this locker (and its parcels if it has multiple)
        const newSelection = new Set([lockerId]);
        getLockerDetails(lockerId);
        
        // For multiple parcels, add entries for each parcel
        if (hasMultipleParcels) {
          for (let i = 1; i < (lockerConfig?.parcels?.length || 0); i++) {
            const parcelKey = `${lockerId}-parcel-${i+1}`;
            // Make sure we have details for this parcel
            if (!lockerDetailsRef.current.has(parcelKey)) {
              lockerDetailsRef.current.set(
                parcelKey, 
                generateRandomData(lockerId, lockerConfig?.parcels?.[i])
              );
            }
            newSelection.add(parcelKey);
          }
        }
        
        setSelectedLockers(newSelection);
        setShowDetailsTable(true);
        setActiveTab('parcel'); // Switch to Parcel Details tab
      }
    }
  }, [getLockerDetails, selectedLockers, columnLayouts, searchModeActive, activeSearchColumn, handleLockerOpen]);

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

  const handleSeeParcelLife = useCallback(() => {
    setIsParcelLifeModalOpen(true);
  }, []);

  const handleParcelLifeModalClose = useCallback(() => {
    setIsParcelLifeModalOpen(false);
  }, []);

  const handleChangeParcelStatus = useCallback(() => {
    // For demo, use the first selected locker or a default
    const lockerId = Array.from(selectedLockers)[0] || '';
    setGuidedFlowLockerId(lockerId);
    // For demo, use a stub to get the current status (should be replaced with real data)
    setGuidedFlowInitialStatus('Stored');
    setIsGuidedFlowModalOpen(true);
  }, [selectedLockers]);

  const handleGuidedFlowModalClose = useCallback(() => {
    setIsGuidedFlowModalOpen(false);
  }, []);

  // Stub for status change execution
  const handleExecuteStep = async (status: string, reason: string) => {
    // TODO: Replace with real API call
    await new Promise(res => setTimeout(res, 500));
    // Simulate random failure for demo
    if (Math.random() < 0.1) return { success: false, error: 'Simulated error' };
    return { success: true };
  };

  // Function to switch to a specific column in search mode and open all lockers in that column
  const switchToColumn = useCallback(async (targetColumn: ColumnName) => {
    if (!searchModeActive) return;
    setActiveSearchColumn(targetColumn);
    setOpenedSearchColumns(prev => new Set(prev).add(targetColumn));
    // Open all lockers in the selected column at once
    alert(`Opening all lockers in column ${targetColumn}`);
    const updatedSearched = new Set(searchedLockers);
    const columnLockers = document.querySelectorAll(`.column[data-column="${targetColumn}"] .locker`);
    columnLockers.forEach((locker: Element) => {
      const lockerId = locker.getAttribute('data-locker-id');
      if (lockerId) {
        updatedSearched.add(lockerId);
      }
    });
    setSearchedLockers(updatedSearched);
  }, [searchModeActive, searchedLockers]);
  
  const renderColumnHeaders = (columnName: ColumnName) => {
    const isActive = openedSearchColumns.has(columnName);
    const isClickable = searchModeActive && !isActive;
    
    return (
      <Tooltip text={searchModeActive ? `Click to select column ${columnName}` : columnName} position="top">
        <div 
          className={`column-header ${isClickable ? 'clickable-header' : ''} ${isActive ? 'active-search-column' : ''}`}
          onClick={() => isClickable && switchToColumn(columnName)}
        >
          {columnName}
        </div>
      </Tooltip>
    );
  };

  const [activeTab, setActiveTab] = useState<'usage' | 'parcel' | 'courier'>('usage');

  // Add function to calculate usage statistics
  const calculateUsageStats = useCallback(() => {
    const stats = {
      total: 0,
      bySize: {
        S: { total: 0, busy: 0, free: 0, soiled: 0, damaged: 0, unclosed: 0, inspection: 0, verified: 0 },
        M: { total: 0, busy: 0, free: 0, soiled: 0, damaged: 0, unclosed: 0, inspection: 0, verified: 0 },
        L: { total: 0, busy: 0, free: 0, soiled: 0, damaged: 0, unclosed: 0, inspection: 0, verified: 0 }
      }
    };

    // Calculate statistics from columnLayouts
    Object.entries(columnLayouts).forEach(([col, lockers]) => {
      lockers.forEach(locker => {
        stats.total++;
        stats.bySize[locker.size].total++;
        
        if (locker.isEmpty) {
          stats.bySize[locker.size].free++;
        } else if (locker.isComparison) {
          const { apmStatus } = locker.comparisonState || {};
          if (apmStatus?.toLowerCase().includes('soiled')) {
            stats.bySize[locker.size].soiled++;
          }
          if (apmStatus?.toLowerCase().includes('damaged')) {
            stats.bySize[locker.size].damaged++;
          }
          if (apmStatus?.toLowerCase().includes('unclosed')) {
            stats.bySize[locker.size].unclosed++;
          }
          if (apmStatus?.toLowerCase().includes('inspection')) {
            stats.bySize[locker.size].inspection++;
          }
          if (apmStatus?.toLowerCase().includes('verified')) {
            stats.bySize[locker.size].verified++;
          }
        } else {
          stats.bySize[locker.size].busy++;
        }
      });
    });

    return stats;
  }, [columnLayouts]);

  // Sample data for Courier Sessions
  const courierSessions = [
    {
      boxMachineName: 'WRO316M',
      countryCode: 'PL',
      documentNumber: '8390093997',
      loginTime: '19-05-2025 08:51:28',
      logoutTime: '19-05-2025 09:14:23',
      sessionId: '71850',
      comment: ''
    },
    {
      boxMachineName: 'WRO316M',
      countryCode: 'PL',
      documentNumber: '8390093997',
      loginTime: '19-05-2025 13:01:47',
      logoutTime: '19-05-2025 13:04:22',
      sessionId: '71882',
      comment: ''
    },
    {
      boxMachineName: 'WRO316M',
      countryCode: 'PL',
      documentNumber: '8390093997',
      loginTime: '19-05-2025 14:19:37',
      logoutTime: '19-05-2025 14:21:32',
      sessionId: '71889',
      comment: ''
    },
    {
      boxMachineName: 'WRO316M',
      countryCode: 'PL',
      documentNumber: '8390093997',
      loginTime: '19-05-2025 15:06:21',
      logoutTime: '19-05-2025 15:08:07',
      sessionId: '71904',
      comment: ''
    },
    {
      boxMachineName: 'WRO316M',
      countryCode: 'PL',
      documentNumber: '8390093997',
      loginTime: '20-05-2025 08:43:25',
      logoutTime: '20-05-2025 09:08:00',
      sessionId: '71968',
      comment: ''
    },
    {
      boxMachineName: 'WRO316M',
      countryCode: 'PL',
      documentNumber: '8390093997',
      loginTime: '20-05-2025 16:32:20',
      logoutTime: '20-05-2025 16:48:02',
      sessionId: '72027',
      comment: ''
    }
  ];

  return (
    <div className="locker-grid" onContextMenu={(e) => e.preventDefault()}>
      <div className="grid-layout">
        <Legend onEnterSearchMode={handleEnterSearchMode} />
        <div className="content-area">
          {searchModeActive ? (
            <div className="search-mode-frame">
              <div className="search-mode-tab">
                <span className="search-mode-label">🔍 Search Mode</span>
                <button className="search-mode-action" onClick={checkOpenLockers}>Check Open Lockers</button>
                <button className="search-mode-action" onClick={completeSearch}>Complete Search</button>
              </div>
              <div className="scrollable-wrapper">
                <div className="grid-main">
                  <div className="header-row">
                    {columns.map((col) => 
                      renderColumnHeaders(col)
                    )}
                  </div>
                  <div className="column-row">
                    {columns.map((col) => (
                      <div 
                        key={`column-${col}`} 
                        className={`column ${openedSearchColumns.has(col) ? 'active-search-column' : ''}`}
                        data-column={col}
                      >
                        {col === 'MID' ? (
                          <>
                            <Locker 
                              size="L" 
                              lockerCode="MID1" 
                              onContextMenu={handleContextMenu}
                              onClick={handleLockerClick}
                              isSelected={selectedLockers.has('MID1')}
                              isInSearchMode={searchModeActive && activeSearchColumn === 'MID'}
                              isSearched={searchedLockers.has('MID1')}
                              data-locker-id="MID1"
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
                                  isInSearchMode={searchModeActive && activeSearchColumn === 'MID'}
                                  isSearched={searchedLockers.has(lockerId)}
                                  data-locker-id={lockerId}
                                />
                              ))}
                            </div>
                            <Locker 
                              size="L" 
                              lockerCode="MID8" 
                              onContextMenu={handleContextMenu}
                              onClick={handleLockerClick}
                              isSelected={selectedLockers.has('MID8')}
                              isInSearchMode={searchModeActive && activeSearchColumn === 'MID'}
                              isSearched={searchedLockers.has('MID8')}
                              data-locker-id="MID8"
                            />
                          </>
                        ) : (
                          columnLayouts[col as ColumnName].map((config, index) => (
                            <Locker
                              key={`${col}-${index}`}
                              size={config.size}
                              lockerCode={`${col}${index + 1}`}
                              onContextMenu={handleContextMenu}
                              onClick={handleLockerClick}
                              isSelected={selectedLockers.has(`${col}${index + 1}`)}
                              isEmpty={config.isEmpty}
                              hasMultipleParcels={config.hasMultipleParcels}
                              parcels={config.parcels}
                              isComparison={config.isComparison}
                              comparisonState={config.comparisonState}
                              isInSearchMode={searchModeActive && activeSearchColumn === col}
                              isSearched={searchedLockers.has(`${col}${index + 1}`)}
                              data-locker-id={`${col}${index + 1}`}
                            />
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="scrollable-wrapper">
              <div className="grid-main">
                <div className="header-row">
                  {columns.map((col) => 
                    renderColumnHeaders(col)
                  )}
                </div>
                <div className="column-row">
                  {columns.map((col) => (
                    <div 
                      key={`column-${col}`} 
                      className={`column ${openedSearchColumns.has(col) ? 'active-search-column' : ''}`}
                      data-column={col}
                    >
                      {col === 'MID' ? (
                        <>
                          <Locker 
                            size="L" 
                            lockerCode="MID1" 
                            onContextMenu={handleContextMenu}
                            onClick={handleLockerClick}
                            isSelected={selectedLockers.has('MID1')}
                            isInSearchMode={searchModeActive && activeSearchColumn === 'MID'}
                            isSearched={searchedLockers.has('MID1')}
                            data-locker-id="MID1"
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
                                isInSearchMode={searchModeActive && activeSearchColumn === 'MID'}
                                isSearched={searchedLockers.has(lockerId)}
                                data-locker-id={lockerId}
                              />
                            ))}
                          </div>
                          <Locker 
                            size="L" 
                            lockerCode="MID8" 
                            onContextMenu={handleContextMenu}
                            onClick={handleLockerClick}
                            isSelected={selectedLockers.has('MID8')}
                            isInSearchMode={searchModeActive && activeSearchColumn === 'MID'}
                            isSearched={searchedLockers.has('MID8')}
                            data-locker-id="MID8"
                          />
                        </>
                      ) : (
                        columnLayouts[col as ColumnName].map((config, index) => (
                          <Locker
                            key={`${col}-${index}`}
                            size={config.size}
                            lockerCode={`${col}${index + 1}`}
                            onContextMenu={handleContextMenu}
                            onClick={handleLockerClick}
                            isSelected={selectedLockers.has(`${col}${index + 1}`)}
                            isEmpty={config.isEmpty}
                            hasMultipleParcels={config.hasMultipleParcels}
                            parcels={config.parcels}
                            isComparison={config.isComparison}
                            comparisonState={config.comparisonState}
                            isInSearchMode={searchModeActive && activeSearchColumn === col}
                            isSearched={searchedLockers.has(`${col}${index + 1}`)}
                            data-locker-id={`${col}${index + 1}`}
                          />
                        ))
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Tabbed Section */}
          <div className="tabbed-section">
            <div className="tab-navigation">
              <button 
                data-label="Usage Report"
                className={`tab-button ${activeTab === 'usage' ? 'active' : ''}`}
                onClick={() => setActiveTab('usage')}
              >
                Usage Report
              </button>
              <button 
                data-label="Parcel Details"
                className={`tab-button ${activeTab === 'parcel' ? 'active' : ''}`}
                onClick={() => setActiveTab('parcel')}
              >
                Parcel Details
              </button>
              <button 
                data-label="Courier Sessions"
                className={`tab-button ${activeTab === 'courier' ? 'active' : ''}`}
                onClick={() => setActiveTab('courier')}
              >
                Courier Sessions
              </button>
            </div>

            <div className="tab-content" style={{ display: activeTab === 'usage' ? 'block' : 'none' }}>
              <table className="usage-report-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Total</th>
                    <th>Busy</th>
                    <th>Free</th>
                    <th>Soiled</th>
                    <th>Damaged</th>
                    <th>Unclosed</th>
                    <th>Inspection</th>
                    <th>Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(calculateUsageStats().bySize).map(([size, stats]) => (
                    <tr key={size}>
                      <td>{size}</td>
                      <td>{stats.total}</td>
                      <td>{stats.busy}</td>
                      <td>{stats.free}</td>
                      <td>{stats.soiled}</td>
                      <td>{stats.damaged}</td>
                      <td>{stats.unclosed}</td>
                      <td>{stats.inspection}</td>
                      <td>{stats.verified}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td>Total</td>
                    <td>{calculateUsageStats().total}</td>
                    <td colSpan={7}></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="tab-content" style={{ display: activeTab === 'parcel' ? 'block' : 'none' }}>
              {selectedLockers.size > 0 ? (
                <div className="details-table-wrapper">
                  <DetailsTable detailsMap={lockerDetailsRef.current} selectedLockers={Array.from(selectedLockers)} />
                </div>
              ) : (
                <div className="zero-state">
                  <div className="zero-state-icon">📦</div>
                  <div className="zero-state-text">No Parcel Selected</div>
                  <div className="zero-state-subtext">Select a parcel to view its details</div>
                </div>
              )}
            </div>

            <div className="tab-content" style={{ display: activeTab === 'courier' ? 'block' : 'none' }}>
              <table className="courier-sessions-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th><b>Box machine name</b></th>
                    <th><b>Country code</b></th>
                    <th><b>Document number</b></th>
                    <th><b><u>↓ Login time</u></b></th>
                    <th><b>Logout time</b></th>
                    <th><b>Session ID</b></th>
                    <th><b>Comment</b></th>
                  </tr>
                </thead>
                <tbody>
                  {courierSessions.map((session, idx) => (
                    <tr key={session.sessionId}>
                      <td>{idx + 1}</td>
                      <td>{session.boxMachineName}</td>
                      <td>{session.countryCode}</td>
                      <td>{session.documentNumber}</td>
                      <td>{session.loginTime}</td>
                      <td>{session.logoutTime}</td>
                      <td>{session.sessionId}</td>
                      <td><a href="#" className="see-events-link">See events</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SearchTokenModal 
        isOpen={showTokenModal} 
        onClose={handleTokenModalClose} 
        onSubmit={startSearchMode}
      />

      {searchModeActive && (
        <OpenLockersModal 
          isOpen={showOpenLockersModal}
          openLockers={openLockers}
          onClose={() => setShowOpenLockersModal(false)}
        />
      )}
      
      {/* Existing Modals */}
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
          onSeeParcelLife={handleSeeParcelLife}
          searchModeActive={searchModeActive}
          onOpenLocker={handleLockerOpen}
          onChangeParcelStatus={handleChangeParcelStatus}
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
      <ParcelLifeModal
        isOpen={isParcelLifeModalOpen}
        onClose={handleParcelLifeModalClose}
        parcelNumber="663400868586300013163881"
      />
      <GuidedParcelFlowModal
        isOpen={isGuidedFlowModalOpen}
        onClose={handleGuidedFlowModalClose}
        onExecuteStep={handleExecuteStep}
        initialStatus={guidedFlowInitialStatus}
      />
    </div>
  );
};

export default LockerGrid; 