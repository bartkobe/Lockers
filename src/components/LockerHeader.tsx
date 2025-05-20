import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './LockerHeader.css';
import Tooltip from './Tooltip';

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

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: {
    street: string;
    number: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, address }) => {
  if (!isOpen) return null;

  const addressString = `${address.street} ${address.number}, ${address.city} ${address.postalCode}, ${address.country}`;
  const encodedAddress = encodeURIComponent(addressString);
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodedAddress}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content map-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Location Map</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <iframe
            width="100%"
            height="450"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={mapUrl}
          />
        </div>
      </div>
    </div>
  );
};

const LockerHeader: React.FC<{ lockerInfo: LockerInfo }> = ({ lockerInfo }) => {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  useEffect(() => {
    if (isMapModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isMapModalOpen]);

  const handleAddressClick = () => {
    setIsMapModalOpen(true);
  };

  return (
    <>
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
            <div className="detail-group location-group">
              <label>Location</label>
              <Tooltip text={lockerInfo.locationDescription} position="bottom">
                <div className="location-value">
                  <span className="location-icon">📍</span>
                  <span 
                    className="clickable-address"
                    onClick={handleAddressClick}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {lockerInfo.location.country}, {lockerInfo.location.region}, {lockerInfo.location.city}, {lockerInfo.location.postalCode}, {lockerInfo.location.street}, {lockerInfo.location.number}
                  </span>
                </div>
              </Tooltip>
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
      {isMapModalOpen && ReactDOM.createPortal(
        <MapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          address={lockerInfo.location}
        />, document.body
      )}
    </>
  );
};

export default LockerHeader; 