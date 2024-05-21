import React from 'react';
import EcgChart from './EcgChart';
import './App.css';

const App = () => {
  return (
    <div className="app">
      <h1>ECG Chart</h1>
      <EcgChart />
    </div>
  );
};

export default App;