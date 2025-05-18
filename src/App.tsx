import React from 'react';
import LockerGrid from './components/LockerGrid';
import LockerHeader from './components/LockerHeader';
import './App.css';

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
    <div className="App">
      <LockerHeader lockerInfo={lockerInfo} />
      <LockerGrid />
    </div>
  );
}

export default App; 