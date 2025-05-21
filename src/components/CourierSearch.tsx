import React, { useState, useEffect } from 'react';
import './CourierSearch.css';

export type ColumnName = '1L' | '2L' | '3L' | '4L' | 'MID' | '1R' | '2R' | '3R' | '4R' | '5R' | '6R' | '7R' | '8R';

export interface SearchModeState {
  isActive: boolean;
  searchToken: string;
  activeColumn: ColumnName | null;
  searchedLockers: Set<string>;
}

interface SearchTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (token: string) => void;
}

interface SearchModeBannerProps {
  activeColumn: ColumnName | null;
  onCompleteSearch: () => void;
}

interface SearchModeControlsProps {
  activeColumn: ColumnName | null;
  onNextColumn: () => void;
  onCheckOpenLockers: () => void;
  onCompleteSearch: () => void;
}

// Column order for navigation
const COLUMN_ORDER: ColumnName[] = ['4L', '3L', '2L', '1L', 'MID', '1R', '2R', '3R', '4R', '5R', '6R', '7R', '8R'];

// Modal for entering search token
export const SearchTokenModal: React.FC<SearchTokenModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [token, setToken] = useState('');
  
  if (!isOpen) return null;
  
  return (
    <div className="search-modal-overlay">
      <div className="search-modal">
        <h2>
          Search Mode
          <span className="modal-shortcut">ESC to close</span>
        </h2>
        <div className="search-modal-content">
          <div className="form-group">
            <label htmlFor="search-token">Enter Search Token</label>
            <input 
              id="search-token"
              type="text" 
              className="form-control"
              value={token} 
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter token"
            />
          </div>
        </div>
        <div className="search-modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            disabled={!token.trim()}
            onClick={() => onSubmit(token.trim())}
          >
            Enter Search
          </button>
        </div>
      </div>
    </div>
  );
};

// Banner displayed when search mode is active
export const SearchModeBanner: React.FC<SearchModeBannerProps> = ({ activeColumn, onCompleteSearch }) => {
  return (
    <div className="search-mode-banner">
      <div className="search-info">
        <span className="search-icon">🔍</span>
        <span className="search-text">SEARCH MODE - Column: {activeColumn || 'None'}</span>
      </div>
      <button 
        className="btn-complete-search"
        onClick={onCompleteSearch}
      >
        Exit Search Mode
      </button>
    </div>
  );
};

// Controls for search mode navigation
export const SearchModeControlsProps = {
  activeColumn: null as ColumnName | null,
  onNextColumn: () => {},
  onCheckOpenLockers: () => {},
  onCompleteSearch: () => {}
};

export const SearchModeControls: React.FC<typeof SearchModeControlsProps> = ({ 
  activeColumn, 
  onNextColumn,
  onCheckOpenLockers,
  onCompleteSearch
}) => {
  return (
    <div className="search-mode-controls">
      <div className="search-mode-buttons">
        <button 
          className="btn-check-open" 
          onClick={onCheckOpenLockers}
        >
          Check Open Lockers
        </button>
        <button 
          className="btn-complete-search" 
          onClick={onCompleteSearch}
        >
          Complete Search
        </button>
      </div>
      <div className="column-navigation-hint">
        <span className="hint-text">
          Click on any column header to select it and open all lockers
        </span>
      </div>
    </div>
  );
};

// Modal to show open lockers results
interface OpenLockersModalProps {
  isOpen: boolean;
  openLockers: string[];
  onClose: () => void;
}

export const OpenLockersModal: React.FC<OpenLockersModalProps> = ({ isOpen, openLockers, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="open-lockers-modal-overlay">
      <div className="open-lockers-modal">
        <h2>
          Open Lockers
          <span className="modal-shortcut">ESC to close</span>
        </h2>
        <div className="open-lockers-content">
          {openLockers.length === 0 ? (
            <p>All lockers are closed.</p>
          ) : (
            <>
              <p>The following lockers are still open:</p>
              <ul className="open-lockers-list">
                {openLockers.map(locker => (
                  <li key={locker}>{locker}</li>
                ))}
              </ul>
              <p>Please close all lockers before selecting another column.</p>
            </>
          )}
        </div>
        <div className="open-lockers-modal-actions">
          <button className="btn btn-primary" onClick={onClose}>
            {openLockers.length === 0 ? 'Continue' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main search controller component
interface CourierSearchProps {
  onLockerOpenRequest: (lockerId: string) => void;
  getOpenLockers: () => Promise<string[]>;
  columns: ColumnName[];
}

export const CourierSearch: React.FC<CourierSearchProps> = ({ 
  onLockerOpenRequest,
  getOpenLockers,
  columns
}) => {
  const [searchState, setSearchState] = useState<SearchModeState>({
    isActive: false,
    searchToken: '',
    activeColumn: null,
    searchedLockers: new Set<string>()
  });
  
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showOpenLockersModal, setShowOpenLockersModal] = useState(false);
  const [openLockers, setOpenLockers] = useState<string[]>([]);
  
  // Start search mode
  const startSearchMode = (token: string) => {
    setSearchState({
      isActive: true,
      searchToken: token,
      activeColumn: columns[0] || null,
      searchedLockers: new Set<string>()
    });
    setShowTokenModal(false);
  };
  
  // Complete search
  const completeSearch = () => {
    setSearchState({
      isActive: false,
      searchToken: '',
      activeColumn: null,
      searchedLockers: new Set<string>()
    });
  };
  
  // Handle locker click in search mode
  const handleLockerClick = (lockerId: string) => {
    if (!searchState.isActive || !searchState.activeColumn) return;
    
    // Check if locker belongs to active column
    const lockerColumn = lockerId.slice(0, lockerId.length > 3 ? 3 : 2);
    if (lockerColumn !== searchState.activeColumn) return;
    
    // Request to open the locker
    onLockerOpenRequest(lockerId);
    
    // Mark locker as searched
    const updatedSearched = new Set(searchState.searchedLockers);
    updatedSearched.add(lockerId);
    
    setSearchState({
      ...searchState,
      searchedLockers: updatedSearched
    });
  };
  
  // Check for open lockers
  const checkOpenLockers = async () => {
    try {
      const openLockersResult = await getOpenLockers();
      setOpenLockers(openLockersResult);
      setShowOpenLockersModal(true);
    } catch (error) {
      console.error('Failed to check open lockers:', error);
      alert('Failed to check open lockers. Please try again.');
    }
  };
  
  // Proceed to next column
  const goToNextColumn = async () => {
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
      if (searchState.activeColumn) {
        const currentIndex = COLUMN_ORDER.indexOf(searchState.activeColumn);
        if (currentIndex < COLUMN_ORDER.length - 1) {
          const nextColumn = COLUMN_ORDER[currentIndex + 1];
          setSearchState({
            ...searchState,
            activeColumn: nextColumn
          });
        }
      }
    } catch (error) {
      console.error('Failed to check open lockers:', error);
      alert('Failed to check open lockers before proceeding. Please try again.');
    }
  };
  
  return (
    <>
      <button 
        className="btn-enter-search-mode"
        onClick={() => setShowTokenModal(true)}
      >
        Search Mode
      </button>
      
      {searchState.isActive && (
        <>
          <SearchModeBanner 
            activeColumn={searchState.activeColumn} 
            onCompleteSearch={completeSearch} 
          />
          <SearchModeControls 
            activeColumn={searchState.activeColumn}
            onNextColumn={goToNextColumn}
            onCheckOpenLockers={checkOpenLockers}
            onCompleteSearch={completeSearch}
          />
        </>
      )}
      
      <SearchTokenModal 
        isOpen={showTokenModal} 
        onClose={() => setShowTokenModal(false)} 
        onSubmit={startSearchMode}
      />
      
      <OpenLockersModal 
        isOpen={showOpenLockersModal}
        openLockers={openLockers}
        onClose={() => setShowOpenLockersModal(false)}
      />
    </>
  );
};

export default CourierSearch; 