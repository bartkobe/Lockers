import React from 'react';
import LockerGrid from './components/LockerGrid';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <div className="header-main">
          <h1>Parcel locker <span className="locker-id">WRO46N</span></h1>
          <div className="locker-attributes">
            <div className="attributes-group">
              <span className="attribute">
                <span className="attribute-label">Status:</span>
                <span className="attribute-value">Operating</span>
              </span>
              <span className="attribute">
                <span className="attribute-label">Series:</span>
                <span className="attribute-value">Modular (V series)</span>
              </span>
              <span className="attribute">
                <span className="attribute-label">Agency:</span>
                <span className="attribute-value">WR2</span>
              </span>
            </div>
            <div className="attributes-group">
              <span className="attribute">
                <span className="attribute-label">Location:</span>
                <span className="attribute-value">PL, dolnośląskie, Wrocław, 50-525, Sucha, 1</span>
              </span>
              <span className="attribute">
                <span className="attribute-label">Location description:</span>
                <span className="attribute-value">CH Wroclavia, niebieska strefa parkingu podziemnego, poziom -1</span>
              </span>
            </div>
          </div>
        </div>
      </header>
      <LockerGrid />
    </div>
  );
}

export default App; 