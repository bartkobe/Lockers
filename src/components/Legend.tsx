import React, { useState, useEffect } from 'react';
import './Legend.css';

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

const Legend: React.FC = () => {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [isReloadLockerHovered, setIsReloadLockerHovered] = useState(false);
  const [isChangeParcelLockerHovered, setIsChangeParcelLockerHovered] = useState(false);
  const [isChangeParcelLockerModalOpen, setIsChangeParcelLockerModalOpen] = useState(false);
  const [isChangeLockerHovered, setIsChangeLockerHovered] = useState(false);
  const [isChangeLockerModalOpen, setIsChangeLockerModalOpen] = useState(false);
  const [isRemoteControlHovered, setIsRemoteControlHovered] = useState(false);
  const [isProximityHovered, setIsProximityHovered] = useState(false);
  const [isResetHovered, setIsResetHovered] = useState(false);
  const [isMachineHovered, setIsMachineHovered] = useState(false);
  const [isRouterHovered, setIsRouterHovered] = useState(false);

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
    { name: 'empty', color: 'rgba(0, 0, 0, 0.05)' },
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
    <div className="menu-container">
      <div className="action-buttons">
        <button 
          className="reload-locker-button"
          onClick={() => console.log('Reload Locker')}
          onMouseEnter={() => setIsReloadLockerHovered(true)}
          onMouseLeave={() => setIsReloadLockerHovered(false)}
          title="Reload Locker"
        >
          <img src="/images/refresh-button.svg" alt="Reload Locker" />
          {isReloadLockerHovered && (
            <div className="refresh-tooltip">Reload Locker</div>
          )}
        </button>
        <button 
          className="change-parcel-locker-button"
          onClick={() => setIsChangeParcelLockerModalOpen(true)}
          onMouseEnter={() => setIsChangeParcelLockerHovered(true)}
          onMouseLeave={() => setIsChangeParcelLockerHovered(false)}
          title="Change Parcel Locker (Ctrl+Shift+L)"
        >
          <img src="/images/change-locker.svg" alt="Change Parcel Locker" />
          {isChangeParcelLockerHovered && (
            <div className="refresh-tooltip">Change Parcel Locker (Ctrl+Shift+L)</div>
          )}
        </button>
        <button 
          className="change-locker-button"
          onClick={() => setIsChangeLockerModalOpen(true)}
          onMouseEnter={() => setIsChangeLockerHovered(true)}
          onMouseLeave={() => setIsChangeLockerHovered(false)}
          title="Parcel Search (Ctrl+Shift+S)"
        >
          <img src="/images/parcel-search.svg" alt="Parcel Search" />
          {isChangeLockerHovered && (
            <div className="refresh-tooltip">Parcel Search (Ctrl+Shift+S)</div>
          )}
        </button>
        <button 
          className="components-remote-control-button"
          onClick={() => console.log('Components Remote Control')}
          onMouseEnter={() => setIsRemoteControlHovered(true)}
          onMouseLeave={() => setIsRemoteControlHovered(false)}
          title="Components Remote Control (Ctrl+Shift+R)"
        >
          <img src="/images/remote_control.svg" alt="Components Remote Control" />
          {isRemoteControlHovered && (
            <div className="refresh-tooltip">Components Remote Control (Ctrl+Shift+R)</div>
          )}
        </button>
        <button 
          className="check-proximity-code-button"
          onClick={() => console.log('Check Proximity Code')}
          onMouseEnter={() => setIsProximityHovered(true)}
          onMouseLeave={() => setIsProximityHovered(false)}
          title="Check Proximity Code (Ctrl+Shift+P)"
        >
          <img src="/images/128.svg" alt="Check Proximity Code" />
          {isProximityHovered && (
            <div className="refresh-tooltip">Check Proximity Code (Ctrl+Shift+P)</div>
          )}
        </button>
        <button 
          className="reset-button"
          onClick={() => console.log('Reset Machine')}
          onMouseEnter={() => setIsResetHovered(true)}
          onMouseLeave={() => setIsResetHovered(false)}
          title="Reset Machine (Ctrl+Shift+M)"
        >
          <img src="/images/reset_machine.svg" alt="Reset Machine" />
          {isResetHovered && (
            <div className="refresh-tooltip">Reset Machine (Ctrl+Shift+M)</div>
          )}
        </button>
        <button 
          className="check-connection-machine-button"
          onClick={() => console.log('Check Connection with Machine')}
          onMouseEnter={() => setIsMachineHovered(true)}
          onMouseLeave={() => setIsMachineHovered(false)}
          title="Check Connection with Machine (Ctrl+Shift+C)"
        >
          <img src="/images/machine-connection.svg" alt="Check Connection with Machine" />
          {isMachineHovered && (
            <div className="refresh-tooltip">Check Connection with Machine (Ctrl+Shift+C)</div>
          )}
        </button>
        <button 
          className="check-connection-router-button"
          onClick={() => console.log('Check Connection with Router')}
          onMouseEnter={() => setIsRouterHovered(true)}
          onMouseLeave={() => setIsRouterHovered(false)}
          title="Check Connection with Router (Ctrl+Shift+T)"
        >
          <img src="/images/router-connection.svg" alt="Check Connection with Router" />
          {isRouterHovered && (
            <div className="refresh-tooltip">Check Connection with Router (Ctrl+Shift+T)</div>
          )}
        </button>
        <div className="button-placeholder"></div>
      </div>

      <div className="empty-container">
        <div className="info-table">
          <div className="info-pair">
            <div className="info-header">Temperature</div>
            <div className="info-value status-ok">24°</div>
          </div>
          <div className="info-pair">
            <div className="info-header">Humidity</div>
            <div className="info-value">-</div>
          </div>
          <div className="info-pair">
            <div className="info-header">Card Ac.</div>
            <div className="info-value status-offline">Offline</div>
          </div>
          <div className="info-pair">
            <div className="info-header">R Printer</div>
            <div className="info-value status-error">Error</div>
          </div>
          <div className="info-pair">
            <div className="info-header">L Printer</div>
            <div className="info-value">-</div>
          </div>
        </div>
      </div>
      
      <div className="legend-container">
        <div className="legend" role="region" aria-label="Status Legend">
          <div className="legend-items">
            {statuses.map((status, index) => (
              <div 
                key={index}
                className="legend-item"
                onMouseEnter={() => setHoveredStatus(status.name)}
                onMouseLeave={() => setHoveredStatus(null)}
                role="listitem"
              >
                <div 
                  className={`legend-color ${status.hasBlackBorder ? 'unclosed' : ''}`}
                  style={{ backgroundColor: status.color }}
                  aria-hidden="true"
                />
                <span className="legend-text">{status.name}</span>
                {hoveredStatus === status.name && (
                  <div className="legend-tooltip">{status.name}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
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
    </div>
  );
};

export default Legend; 