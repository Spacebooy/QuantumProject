const API_URL = import.meta.env.VITE_API_URL || "/api";

export const runSimulation = async (numQubits, mode, operations) => {
  const payload = {
    num_qubits: numQubits,
    mode: mode,
    operations: operations,
  };

  const response = await fetch(`${API_URL}/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Simulation error (${response.status})`);
  }

  return await response.json();
};

export const runShor = async (N, numCountingQubits = null) => {
  const payload = {
    N: Number(N),
    num_counting_qubits: numCountingQubits !== null ? Number(numCountingQubits) : null,
  };

  const response = await fetch(`${API_URL}/shor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Shor execution failed (${response.status})`);
  }

  return await response.json();
};