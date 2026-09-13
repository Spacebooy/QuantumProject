import { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth-context';
import { apiGetUsage } from '../../api';

export default function UsageModal() {
  const { isUsageModalOpen, closeUsageModal, token, user } = useAuth();
  const [usageData, setUsageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isUsageModalOpen && token) {
      let cancelled = false;
      apiGetUsage(token)
        .then((data) => { if (!cancelled) setUsageData(data); })
        .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load usage history'); })
        .finally(() => { if (!cancelled) setIsLoading(false); });
      return () => { cancelled = true; };
    }
  }, [isUsageModalOpen, token]);

  if (!isUsageModalOpen) return null;

  return (
    <div className="modal-overlay auth-ui" onClick={closeUsageModal}>
      <div role="dialog" aria-modal="true" aria-label="Simulation history" className="modal-card usage-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeUsageModal} title="Close">
          ✕
        </button>

        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">📊</span>
            <div>
              <h2>Simulation History</h2>
              <p>Recent activity for {user?.full_name || 'Student'} ({user?.email})</p>
            </div>
          </div>
        </div>

        {error && <div className="auth-error-banner">⚠️ {error}</div>}

        {isLoading ? (
          <div className="modal-loading">Loading simulation history...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total Simulations</span>
                <span className="stat-value">{usageData?.total_simulations ?? 0}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Max Qubits Run</span>
                <span className="stat-value">{usageData?.max_qubits_used ?? 0}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Avg Qubits / Run</span>
                <span className="stat-value">{usageData?.avg_qubits_used ?? 0}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Plan Tier</span>
                <span className="stat-value tier-badge">Student (15 Qubits)</span>
              </div>
            </div>

            <div className="usage-table-wrapper">
              <h3>Recent Simulation Executions</h3>
              {!usageData?.simulations || usageData.simulations.length === 0 ? (
                <div className="empty-state">
                  No simulations recorded yet. Run a circuit to see your logs here!
                </div>
              ) : (
                <table className="usage-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Qubits</th>
                      <th>Gates</th>
                      <th>Mode</th>
                      <th>Exec Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageData.simulations.map((sim) => (
                      <tr key={sim.id}>
                        <td>{sim.created_at ? new Date(sim.created_at).toLocaleTimeString() : 'N/A'}</td>
                        <td>
                          <span className={`sim-type-badge ${sim.sim_type}`}>
                            {sim.sim_type.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <strong className="qubit-pill">{sim.num_qubits} Qubits</strong>
                        </td>
                        <td>{sim.gate_count}</td>
                        <td>{sim.mode}</td>
                        <td>{sim.execution_time_ms ? `${sim.execution_time_ms} ms` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

