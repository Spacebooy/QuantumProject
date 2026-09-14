import { useTutorial } from './tutorial/useTutorial';
import TutorialOverlay from './tutorial/TutorialOverlay';
import BlochSphere from './components/BlochSphere';
import { circuitKey } from './tutorial/tutorialUtils';
import './tutorial/tutorial.css';
import { useEffect, useRef, useState } from 'react';
import AuthModal from './components/auth/AuthModal';
import UsageModal from './components/auth/UsageModal';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/auth-context';
import Header from './components/Header';
import CircuitControls from './components/CircuitControls';
import GatePalette from './components/GatePalette';
import CircuitBuilder from './components/CircuitBuilder';
import NoiseSettings from './components/NoiseSettings';
import LearnPanel from './components/LearnPanel';
import ResultsPanel from './components/ResultsPanel';
import AlgorithmsPage from './components/algorithms/AlgorithmsPage';
import QubitVisualizer from './components/QubitVisualizer';
import { runSimulation } from './api';
import PathFinderGame from './games/PathFinder/PathFinderGame';

function MainApp() {
  const { token, isAuthenticated, openAuthModal, isAuthModalOpen, isUsageModalOpen } = useAuth();
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('quantum-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch { return 'light'; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('quantum-theme', theme); } catch { /* Theme still works when storage is unavailable. */ }
  }, [theme]);
  const [currentPage, setCurrentPage] = useState('simulator'); // 'simulator' | 'algorithms' | 'visualizer'
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

  const generation = useRef(0);
  const snapshot = {grid, numQubits, mode, selectedGate, thetaValue, cnotTarget, activeTab, noiseSettings, results, error};
  const latestSnapshot = useRef(snapshot);
  useEffect(() => { latestSnapshot.current = snapshot; });
  const restoreSimulator = saved => {
    generation.current += 1;
    setGrid(saved.grid); setNumQubits(saved.numQubits); setMode(saved.mode);
    setSelectedGate(saved.selectedGate); setThetaValue(saved.thetaValue); setCnotTarget(saved.cnotTarget);
    setActiveTab(saved.activeTab); setNoiseSettings(saved.noiseSettings); setResults(saved.results); setError(saved.error);
    setIsLoading(false);
  };
  const tutorial = useTutorial(snapshot, restoreSimulator, setCurrentPage);
  const navigate = page => { if(tutorial.active) tutorial.exit(); setCurrentPage(page); };

  const handleCellClick = (qubit, step) => {
    if (!isAuthenticated && (qubit >= 2 || (selectedGate === 'CNOT' && cnotTarget >= 2))) {
      openAuthModal('Sign in to create circuits with more than 2 qubits.');
      return;
    }
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
    if (!isAuthenticated && numQubits > 2) {
      openAuthModal('Sign in to simulate circuits with more than 2 qubits.');
      return;
    }
    const requestGeneration = ++generation.current;
    const submitted = snapshot;
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
      const data = await runSimulation(numQubits, mode, operations, token);
      if (requestGeneration !== generation.current || circuitKey(submitted) !== circuitKey(latestSnapshot.current)) return;
      setResults(data);
      tutorial.recordResult(data, submitted);
    } catch (err) {
      if (requestGeneration !== generation.current) return;
      if (err.status === 401 || err.status === 403) openAuthModal(err.message);
      setError(err.message || 'Simulation failed');
    } finally {
      if (requestGeneration === generation.current) setIsLoading(false);
    }
  };

  return (
    <div className={`app-container ${tutorial.active ? 'tutorial-active' : ''}`}>
      <Header currentPage={currentPage} setCurrentPage={navigate} theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />

      {currentPage === 'simulator' && <div className="tutorial-entry"><button onClick={tutorial.active ? tutorial.exit : tutorial.open} disabled={!tutorial.active && isLoading}>{tutorial.active ? 'Exit Tutorial Mode' : 'Guided Tutorial'}</button></div>}
      {currentPage === 'simulator' && (
        <main className="dashboard-grid">
          <div className="col-left">
            <GatePalette
              tutorialActive={tutorial.active}
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
            <CircuitControls
              key={numQubits}
              numQubits={numQubits}
              setNumQubits={setNumQubits}
              mode={mode}
              setMode={setMode}
              onRun={handleRunSimulation}
              onClear={handleClearCircuit}
              isLoading={isLoading}
            />

            <CircuitBuilder
              numQubits={numQubits}
              grid={grid}
              selectedGate={selectedGate}
              onCellClick={handleCellClick}
              onRemoveGate={handleRemoveGate}
            />
            <ResultsPanel results={results} error={error} />
            {tutorial.running && numQubits === 1 && results?.num_qubits === 1 && results.amplitudes && <section className="card tutorial-bloch" data-tutorial-id="bloch" aria-label="Single qubit state on the Bloch sphere">
              <h3>Current single-qubit state</h3>
              <div><BlochSphere alpha={results.amplitudes['0']} beta={results.amplitudes['1']} /></div>
              <p>A mathematical representation of the last API result{mode === 'noisy' ? ' (one noisy trajectory)' : ''}. Re-run after circuit changes.</p>
            </section>}
          </div>

          <div className="col-right">
            {/* Tab Switcher */}
            <div className="tab-switcher card">
              <button
                className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
              <button
                className={`tab-btn ${activeTab === 'learn' ? 'active' : ''}`}
                onClick={() => setActiveTab('learn')}
              >
                Learn
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'settings' && (
              <NoiseSettings
                settings={noiseSettings}
                setSettings={setNoiseSettings}
                isNoisy={mode === 'noisy'}
              />
            )}
            {activeTab === 'learn' && <LearnPanel />}
          </div>
        </main>
      )}

      {currentPage === 'algorithms' && (
        <main className="algorithms-wrapper">
          <AlgorithmsPage />
        </main>
      )}


      <div hidden={currentPage !== 'missions'}><PathFinderGame /></div>

      {currentPage === 'visualizer' && (
        <main className="visualizer-wrapper">
          <QubitVisualizer />
        </main>
      )}
      {tutorial.active && <TutorialOverlay tutorial={tutorial} snapshot={snapshot} busy={isLoading} />}
      {isAuthModalOpen && <AuthModal />}
      {isUsageModalOpen && <UsageModal />}
    </div>
  );
}
export default function App() {
  return <AuthProvider><MainApp /></AuthProvider>;
}
