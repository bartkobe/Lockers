import React, { useState, useEffect } from 'react';
import './Legend.css';
import Tooltip from './Tooltip';

interface ChangeLockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (data: { phone: string; openCode: string; parcelCode: string }) => void;
}

interface ChangeParcelLockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lockerId: string) => void;
}

interface LegendProps {
  onEnterSearchMode?: () => void;
}

const ChangeParcelLockerModal: React.FC<ChangeParcelLockerModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [lockerId, setLockerId] = useState('');

  const handleSubmit = () => {
    onSelect(lockerId);
    setLockerId('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>
          Change Parcel Locker
          <span className="modal-shortcut">ESC to close</span>
        </h2>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="lockerId">Enter parcel locker ID</label>
            <input
              type="text"
              id="lockerId"
              className="form-control"
              value={lockerId}
              onChange={(e) => setLockerId(e.target.value)}
              placeholder="Enter locker ID"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
};

const ChangeLockerModal: React.FC<ChangeLockerModalProps> = ({ isOpen, onClose, onSearch }) => {
  const [phone, setPhone] = useState('');
  const [openCode, setOpenCode] = useState('');
  const [parcelCode, setParcelCode] = useState('');

  const handleSubmit = () => {
    onSearch({ phone, openCode, parcelCode });
    setPhone('');
    setOpenCode('');
    setParcelCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>
          Parcel Search
          <span className="modal-shortcut">ESC to close</span>
        </h2>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              id="phone"
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="form-group">
            <label htmlFor="openCode">Open code</label>
            <input
              type="text"
              id="openCode"
              className="form-control"
              value={openCode}
              onChange={(e) => setOpenCode(e.target.value)}
              placeholder="Enter open code"
            />
          </div>
          <div className="form-group">
            <label htmlFor="parcelCode">Parcel code</label>
            <input
              type="text"
              id="parcelCode"
              className="form-control"
              value={parcelCode}
              onChange={(e) => setParcelCode(e.target.value)}
              placeholder="Enter parcel code"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

const Legend: React.FC<LegendProps> = ({ onEnterSearchMode }) => {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [isChangeParcelLockerModalOpen, setIsChangeParcelLockerModalOpen] = useState(false);
  const [isChangeLockerModalOpen, setIsChangeLockerModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleChangeLockerSearch = (data: { phone: string; openCode: string; parcelCode: string }) => {
    console.log('Searching with data:', data);
    setIsChangeLockerModalOpen(false);
  };

  const handleParcelLockerSelect = (lockerId: string) => {
    console.log('Selected locker:', lockerId);
    setIsChangeParcelLockerModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle ESC key to close modals
      if (event.key === 'Escape') {
        setIsChangeParcelLockerModalOpen(false);
        setIsChangeLockerModalOpen(false);
        return;
      }

      // Handle Shift+Ctrl combinations (or Shift+Cmd on Mac)
      if (event.shiftKey && (event.ctrlKey || event.metaKey)) {
        switch (event.key.toLowerCase()) {
          case 'l':
            event.preventDefault();
            setIsChangeParcelLockerModalOpen(true);
            break;
          case 's':
            event.preventDefault();
            setIsChangeLockerModalOpen(true);
            break;
          case 'r':
            event.preventDefault();
            console.log('Components Remote Control');
            break;
          case 'p':
            event.preventDefault();
            console.log('Check Proximity Code');
            break;
          case 'm':
            event.preventDefault();
            console.log('Reset Machine');
            break;
          case 'c':
            event.preventDefault();
            console.log('Check Connection with Machine');
            break;
          case 't':
            event.preventDefault();
            console.log('Check Connection with Router');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const statuses = [
    { name: 'empty', color: '#FFFFFF', hasBorder: true },
    { name: 'in use', color: '#7FB883' },
    { name: 'expired parcels', color: '#E6C87D' },
    { name: 'Claimed', color: '#8B7B9F' },
    { name: 'soiled', color: '#B89F8E' },
    { name: 'damaged', color: '#E6A4A4' },
    { name: 'Inspection', color: '#B8D8B8' },
    { name: 'Unclosed', color: '#FFFFFF', hasBlackBorder: true },
    { name: 'Damaged and Inspection', color: '#E6B8A4' },
    { name: 'Damaged and Soiled', color: '#A4D8D8' },
    { name: 'Soiled and Inspection', color: '#B88E8E' },
    { name: 'Damaged, Soiled and Inspection', color: '#B8A4D8' }
  ];

  return (
    <nav className={`sidebar-menu ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="company-logo">
          <img src="/images/019.svg" alt="Company Logo" />
        </div>
        <span className="company-name">Company</span>
        <button className="dropdown-btn" aria-label="Open company menu">▼</button>
      </div>
      <div className="sidebar-section">
        <div className="section-title">{collapsed ? 'ACT' : 'ACTIONS'}</div>
        <ul>
          <li><Tooltip text="Reload Locker"><button className="sidebar-item" data-label="Reload Locker" onClick={() => console.log('Reload Locker')}><img src="/images/refresh-button.svg" alt="Reload Locker" className="sidebar-icon"/> <span className="sidebar-label">Reload Locker</span></button></Tooltip></li>
          <li><Tooltip text="Change Parcel Locker (Ctrl+Shift+L)"><button className="sidebar-item" data-label="Change Parcel Locker" onClick={() => setIsChangeParcelLockerModalOpen(true)}><img src="/images/change-locker.svg" alt="Change Parcel Locker" className="sidebar-icon"/> <span className="sidebar-label">Change Parcel Locker</span></button></Tooltip></li>
          <li><Tooltip text="Parcel Search (Ctrl+Shift+S)"><button className="sidebar-item" data-label="Parcel Search" onClick={() => setIsChangeLockerModalOpen(true)}><img src="/images/parcel-search.svg" alt="Parcel Search" className="sidebar-icon"/> <span className="sidebar-label">Parcel Search</span></button></Tooltip></li>
          <li><Tooltip text="Components Remote Control (Ctrl+Shift+R)"><button className="sidebar-item" data-label="Components Remote Control" onClick={() => console.log('Components Remote Control')}><img src="/images/remote_control.svg" alt="Components Remote Control" className="sidebar-icon"/> <span className="sidebar-label">Components Remote Control</span></button></Tooltip></li>
          <li><Tooltip text="Check Proximity Code (Ctrl+Shift+P)"><button className="sidebar-item" data-label="Check Proximity Code" onClick={() => console.log('Check Proximity Code')}><img src="/images/128.svg" alt="Check Proximity Code" className="sidebar-icon"/> <span className="sidebar-label">Check Proximity Code</span></button></Tooltip></li>
          <li><Tooltip text="Reset Machine (Ctrl+Shift+M)"><button className="sidebar-item" data-label="Reset Machine" onClick={() => console.log('Reset Machine')}><img src="/images/reset_machine.svg" alt="Reset Machine" className="sidebar-icon"/> <span className="sidebar-label">Reset Machine</span></button></Tooltip></li>
          <li><Tooltip text="Check Connection with Machine (Ctrl+Shift+C)"><button className="sidebar-item" data-label="Check Connection with Machine" onClick={() => console.log('Check Connection with Machine')}><img src="/images/machine-connection.svg" alt="Check Connection with Machine" className="sidebar-icon"/> <span className="sidebar-label">Check Connection with Machine</span></button></Tooltip></li>
          <li><Tooltip text="Check Connection with Router (Ctrl+Shift+T)"><button className="sidebar-item" data-label="Check Connection with Router" onClick={() => console.log('Check Connection with Router')}><img src="/images/router-connection.svg" alt="Check Connection with Router" className="sidebar-icon"/> <span className="sidebar-label">Check Connection with Router</span></button></Tooltip></li>
          <li><Tooltip text="Search Mode"><button className="sidebar-item" data-label="Search Mode" onClick={onEnterSearchMode}><img src="/images/search.svg" alt="Search Mode" className="sidebar-icon"/> <span className="sidebar-label">Search Mode</span></button></Tooltip></li>
        </ul>
      </div>
      <div className="sidebar-section">
        <div className="section-title">{collapsed ? 'LEG' : 'LEGEND'}</div>
        <div className="legend" role="region" aria-label="Status Legend">
          <div className="legend-items">
            {statuses.map((status) => (
              <Tooltip key={status.name} text={status.name}>
                <div className="legend-item" role="listitem">
                  <div
                    className={`legend-color ${status.hasBlackBorder ? 'unclosed' : ''} ${status.hasBorder ? 'empty' : ''}`}
                    style={{ backgroundColor: status.color }}
                    aria-hidden="true"
                  />
                  <span className="legend-text">{status.name}</span>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
      <button className="collapse-btn" onClick={()=>setCollapsed(!collapsed)}>{collapsed ? '➡ Expand' : '⟵ Collapse'}</button>
      <ChangeParcelLockerModal
        isOpen={isChangeParcelLockerModalOpen}
        onClose={() => setIsChangeParcelLockerModalOpen(false)}
        onSelect={handleParcelLockerSelect}
      />
      <ChangeLockerModal
        isOpen={isChangeLockerModalOpen}
        onClose={() => setIsChangeLockerModalOpen(false)}
        onSearch={handleChangeLockerSearch}
      />
    </nav>
  );
};

export default Legend; 