import React from 'react';

export default function NoiseSettings({ settings, setSettings, isNoisy }) {
  const handleChange = (key, val) => {
    setSettings((prev) => ({ ...prev, [key]: Number(val) }));
  };

  return (
    <div className={`card noise-settings ${!isNoisy ? 'disabled' : ''}`}>
      <div className="card-header">
        <h3>Noise Settings</h3>
        <span className="badge">{isNoisy ? 'Active' : 'Inactive'}</span>
      </div>

      <div className="form-group">
        <label>T1 (μs): <span>{settings.t1}</span></label>
        <input 
          type="range" 
          min="10" 
          max="500" 
          value={settings.t1} 
          disabled={!isNoisy}
          onChange={(e) => handleChange('t1', e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label>T2 (μs): <span>{settings.t2}</span></label>
        <input 
          type="range" 
          min="100" 
          max="5000" 
          value={settings.t2} 
          disabled={!isNoisy}
          onChange={(e) => handleChange('t2', e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label>Single Qubit Error Rate (%): <span>{settings.singleQubitError}%</span></label>
        <input 
          type="range" 
          min="0" 
          max="20" 
          value={settings.singleQubitError} 
          disabled={!isNoisy}
          onChange={(e) => handleChange('singleQubitError', e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label>Two Qubit Error Rate (%): <span>{settings.twoQubitError}%</span></label>
        <input 
          type="range" 
          min="0" 
          max="20" 
          value={settings.twoQubitError} 
          disabled={!isNoisy}
          onChange={(e) => handleChange('twoQubitError', e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label>Readout Error (%): <span>{settings.readoutError}%</span></label>
        <input 
          type="range" 
          min="0" 
          max="20" 
          value={settings.readoutError} 
          disabled={!isNoisy}
          onChange={(e) => handleChange('readoutError', e.target.value)} 
        />
      </div>
    </div>
  );
}