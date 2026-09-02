import React, { useState } from 'react';
import Header from './components/Header';
import CircuitControls from './components/CircuitControls';
import GatePalette from './components/GatePalette';
import CircuitBuilder from './components/CircuitBuilder';
import NoiseSettings from './components/NoiseSettings';
import LearnPanel from './components/LearnPanel';
import ResultsPanel from './components/ResultsPanel';
import AlgorithmsPage from './components/algorithms/AlgorithmsPage';
import { runSimulation } from './api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('simulator'); // 'simulator' | 'algorithms'
  const [numQubits, setNumQubits] = useState(2);
  const [mode, setMode] = useState('ideal');
  const [selectedGate, setSelectedGate] = useState('H');
  const [activeTab, setActiveTab] = useState('settings');
  const [thetaValue, setThetaValue] = useState(1.5708);
  const [cnotTarget, setCnotTarget] = useState(1);

  const [grid, setGrid] = useState([
    { id: '1', step: 0, target: 0, gate: 'H' },
    { id: '2', step: 1, control: 0, target: 1, gate: 'CNOT' },
    { id: '3', step: 2, target: 0, gate: 'Measure' },
    { id: '4', step: 2, target: 1, gate: 'Measure' },
  ]);

  const [noiseSettings, setNoiseSettings] = useState({
    t1: 100,
    t2: 80,
    singleQubitError: 0.1,
    twoQubitError: 1.0,
    readoutError: 2.0,
  });

  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCellClick = (qubit, step) => {
    const activeGate = selectedGate || 'H';

    if (activeGate.toUpperCase() === 'CNOT') {
      if (numQubits < 2) {
        setError('CNOT gate requires at least 2 qubits.');
        return;
      }
      if (qubit === cnotTarget) {
        setError('CNOT control and target qubits must be different.');
        return;
      }
    }

    const updatedGrid = grid.filter(
      (item) => !(item.step === step && (item.target === qubit || item.control === qubit))
    );

    let newOp;
    if (activeGate.toUpperCase() === 'CNOT') {
      newOp = {
        id: Date.now().toString(),
        step,
        control: qubit,
        target: cnotTarget,
        gate: 'CNOT',
      };
    } else {
      const isRotation = ['RX', 'RY', 'RZ'].includes(activeGate.toUpperCase());
      newOp = {
        id: Date.now().toString(),
        step,
        target: qubit,
        gate: activeGate,
        ...(isRotation && { theta: thetaValue }),
      };
    }

    setGrid([...updatedGrid, newOp]);
  };

  const handleRemoveGate = (id) => {
    setGrid(grid.filter((item) => item.id !== id));
  };

  const handleClearCircuit = () => {
    setGrid([]);
    setResults(null);
    setError(null);
  };

  const handleRunSimulation = async () => {
    setIsLoading(true);
    setError(null);

    const sortedGrid = [...grid].sort((a, b) => a.step - b.step);

    const operations = sortedGrid.map((op) => {
      const gateUpper = op.gate.toUpperCase();
      if (gateUpper === 'CNOT') {
        return { gate: 'CNOT', control: op.control, target: op.target };
      }
      if (['RX', 'RY', 'RZ'].includes(gateUpper)) {
        return { gate: gateUpper, target: op.target, theta: op.theta ?? thetaValue };
      }
      return { gate: gateUpper, target: op.target };
    });

    try {
      const data = await runSimulation(numQubits, mode, operations);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Simulation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {currentPage === 'simulator' ? (
        <main className="dashboard-grid">
          <div className="col-left">
            <CircuitControls
              numQubits={numQubits}
              setNumQubits={setNumQubits}
              mode={mode}
              setMode={setMode}
              onRun={handleRunSimulation}
              onClear={handleClearCircuit}
              isLoading={isLoading}
            />
            <GatePalette
              selectedGate={selectedGate}
              setSelectedGate={setSelectedGate}
              thetaValue={thetaValue}
              setThetaValue={setThetaValue}
              cnotTarget={cnotTarget}
              setCnotTarget={setCnotTarget}
              numQubits={numQubits}
            />
          </div>

          <div className="col-center">
            <CircuitBuilder
              numQubits={numQubits}
              grid={grid}
              selectedGate={selectedGate}
              onCellClick={handleCellClick}
              onRemoveGate={handleRemoveGate}
            />
            <ResultsPanel results={results} error={error} />
          </div>

          <div className="col-right">
            <div className="tab-switcher card">
              <button
                className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙ Settings
              </button>
              <button
                className={`tab-btn ${activeTab === 'learn' ? 'active' : ''}`}
                onClick={() => setActiveTab('learn')}
              >
                📖 Learn
              </button>
            </div>

            {activeTab === 'settings' ? (
              <NoiseSettings
                settings={noiseSettings}
                setSettings={setNoiseSettings}
                isNoisy={mode === 'noisy'}
              />
            ) : (
              <LearnPanel />
            )}
          </div>
        </main>
      ) : (
        <main className="algorithms-wrapper">
          <AlgorithmsPage />
        </main>
      )}
    </div>
  );
}