import React from 'react';
import './App.css';
// import './styles/theme.css'; // Keep this for global theme variables and utilities
import LockerHeader from './components/LockerHeader';
import LockerGrid from './components/LockerGrid';

function App() {
  const lockerInfo = {
    id: 'WRO46N',
    status: 'Operating',
    series: 'Modular (V series)',
    agency: 'WR2',
    location: {
      country: 'PL',
      region: 'dolnośląskie',
      city: 'Wrocław',
      postalCode: '50-525',
      street: 'Sucha',
      number: '1'
    },
    locationDescription: 'CH Wroclavia, niebieska strefa parkingu podziemnego, poziom -1'
  };

  return (
    <div className="app-container"> {/* Or simply <>
      if app-container is not providing value */}
      <LockerHeader lockerInfo={lockerInfo} />
      {/* Main content area for LockerGrid - apply padding if needed using theme.css classes */}
      <main className="main-content-area p-20">
        <LockerGrid />
      </main>
    </div>
  );
}

export default App; 