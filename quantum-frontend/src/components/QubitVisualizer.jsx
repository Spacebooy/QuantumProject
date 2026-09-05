import React, { useState } from 'react';
import BlochSphere from './BlochSphere';
import GatePalette from './GatePalette';
import CircuitBuilder from './CircuitBuilder';
import { runSimulation } from '../api';

export default function QubitVisualizer() {
  const [selectedGate, setSelectedGate] = useState('H');
  const [thetaValue, setThetaValue] = useState(1.5708);
  const [grid, setGrid] = useState([
    { id: '1', step: 0, target: 0, gate: 'H' },
    { id: '2', step: 1, target: 0, gate: 'T' },
  ]);

  const [alpha, setAlpha] = useState({ real: 0.707, imag: 0 });
  const [beta, setBeta] = useState({ real: 0.5, imag: 0.5 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCellClick = (_, step) => {
    const activeGate = selectedGate || 'H';
    const updatedGrid = grid.filter((item) => !(item.step === step && item.target === 0));

    const isRotation = ['RX', 'RY', 'RZ'].includes(activeGate.toUpperCase());
    const newOp = {
      id: Date.now().toString(),
      step,
      target: 0,
      gate: activeGate,
      ...(isRotation && { theta: thetaValue }),
    };

    const newGrid = [...updatedGrid, newOp];
    setGrid(newGrid);
    simulateCircuit(newGrid);
  };

  const handleRemoveGate = (id) => {
    const newGrid = grid.filter((item) => item.id !== id);
    setGrid(newGrid);
    simulateCircuit(newGrid);
  };

  const handleClearCircuit = () => {
    setGrid([]);
    setAlpha({ real: 1, imag: 0 });
    setBeta({ real: 0, imag: 0 });
    setError('');
  };

  const simulateCircuit = async (currentGrid) => {
    setLoading(true);
    setError('');

    const sortedGrid = [...currentGrid].sort((a, b) => a.step - b.step);
    const operations = sortedGrid.map((op) => {
      const gateUpper = op.gate.toUpperCase();
      if (['RX', 'RY', 'RZ'].includes(gateUpper)) {
        return { gate: gateUpper, target: 0, theta: op.theta ?? thetaValue };
      }
      return { gate: gateUpper, target: 0 };
    });

    try {
      let data;
      try {
        data = await runSimulation(1, 'ideal', operations);
      } catch (err) {
        const res = await fetch('http://127.0.0.1:8000/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            num_qubits: 1,
            mode: 'ideal',
            operations,
          }),
        });
        if (!res.ok) throw new Error('Simulation failed');
        data = await res.json();
      }

      if (data.amplitudes) {
        setAlpha(data.amplitudes['0'] || { real: 1, imag: 0 });
        setBeta(data.amplitudes['1'] || { real: 0, imag: 0 });
      }
    } catch (err) {
      setError(err.message || 'Failed to update Bloch Sphere');
    } finally {
      setLoading(false);
    }
  };

  const p0 = alpha.real ** 2 + alpha.imag ** 2;
  const p1 = beta.real ** 2 + beta.imag ** 2;

  function formatComplex(value) {
    const real = value.real.toFixed(3);
    const imag = Math.abs(value.imag).toFixed(3);
    const sign = value.imag >= 0 ? '+' : '-';
    return `${real} ${sign} ${imag}i`;
  }

  return (
    <div className="visualizer-page-grid">
      {/* LEFT COLUMN: Controls & Gate Wire */}
      <div className="visualizer-sidebar">
        <div className="card sidebar-card">
          <div className="card-header">
            <h3>⚡ Controls & Circuit</h3>
            <button className="icon-btn-sm" onClick={handleClearCircuit} title="Reset Circuit">
              ↺ Reset Wire
            </button>
          </div>

          <p className="sidebar-hint">
            Select a gate and click grid cells to apply operations to the qubit wire:
          </p>

          {/* Gate Palette (Rendered once) */}
          <div className="compact-palette-wrapper">
            <GatePalette
              selectedGate={selectedGate}
              setSelectedGate={setSelectedGate}
              thetaValue={thetaValue}
              setThetaValue={setThetaValue}
              numQubits={1}
            />
          </div>

          {/* Circuit Builder Wire */}
          <div className="compact-circuit-wrapper">
            <CircuitBuilder
              numQubits={1}
              grid={grid}
              selectedGate={selectedGate}
              onCellClick={handleCellClick}
              onRemoveGate={handleRemoveGate}
            />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Hero Bloch Sphere & State Display */}
      <div className="visualizer-main-hero">
        <div className="card bloch-sphere-card hero-bloch-card">
          <div className="card-header">
            <div>
              <h2 className="hero-title">🌐 Visual Qubit (3D Bloch Sphere)</h2>
              <p className="hero-subtitle">
                Interactive geometric representation of pure qubit state transformations
              </p>
            </div>
            {loading && <span className="status-badge badge-active">⚡ Updating State</span>}
          </div>

          {/* Large 3D Viewport */}
          <div className="svg-container hero-svg-container">
            <BlochSphere alpha={alpha} beta={beta} />
          </div>

          {/* Quantum State Vector Readouts */}
          <div className="hero-state-panel">
            <div className="state-equation-box">
              <span className="metric-label">CURRENT QUANTUM STATE |ψ⟩</span>
              <div className="state-equation-text">
                |ψ⟩ = ({formatComplex(alpha)}) |0⟩ + ({formatComplex(beta)}) |1⟩
              </div>
            </div>

            <div className="probability-grid">
              <div className="prob-box">
                <span className="metric-label">Probability P(|0⟩)</span>
                <span className="prob-value green-text">{(p0 * 100).toFixed(1)}%</span>
                <div className="prob-bar-track">
                  <div className="prob-bar-fill green-fill" style={{ width: `${p0 * 100}%` }}></div>
                </div>
              </div>

              <div className="prob-box">
                <span className="metric-label">Probability P(|1⟩)</span>
                <span className="prob-value blue-text">{(p1 * 100).toFixed(1)}%</span>
                <div className="prob-bar-track">
                  <div className="prob-bar-fill blue-fill" style={{ width: `${p1 * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="error-banner" style={{ marginTop: '12px' }}>⚠️ {error}</div>}
        </div>
      </div>
    </div>
  );
}