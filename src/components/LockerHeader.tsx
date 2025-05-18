import React, { useState } from 'react';
import './LockerHeader.css';

interface LockerInfo {
  id: string;
  status: string;
  series: string;
  agency: string;
  location: {
    country: string;
    region: string;
    city: string;
    postalCode: string;
    street: string;
    number: string;
  };
  locationDescription: string;
}

const LockerHeader: React.FC<{ lockerInfo: LockerInfo }> = ({ lockerInfo }) => {
  const [showLocationTooltip, setShowLocationTooltip] = useState(false);
  
  return (
    <header className="locker-header">
      <div className="header-main">
        <div className="header-title">
          <h1>Parcel locker {lockerInfo.id}</h1>
          <div className="status-badge">
            <span className="status-indicator"></span>
            {lockerInfo.status}
          </div>
        </div>
        <div className="header-details">
          <div 
            className="detail-group location-group"
            onMouseEnter={() => setShowLocationTooltip(true)}
            onMouseLeave={() => setShowLocationTooltip(false)}
          >
            <label>Location</label>
            <div className="location-value">
              <span className="location-icon">📍</span>
              <span>{lockerInfo.location.country}, {lockerInfo.location.region}, {lockerInfo.location.city}, {lockerInfo.location.postalCode}, {lockerInfo.location.street}, {lockerInfo.location.number}</span>
              {showLocationTooltip && (
                <div className="location-tooltip">{lockerInfo.locationDescription}</div>
              )}
            </div>
          </div>
          <div className="detail-group">
            <label>Series</label>
            <span>{lockerInfo.series}</span>
          </div>
          <div className="detail-group">
            <label>Agency</label>
            <span>{lockerInfo.agency}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LockerHeader; 