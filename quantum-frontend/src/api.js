const API_URL = import.meta.env.VITE_API_URL || "/api";

const getHeaders = (token = null) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const runSimulation = async (numQubits, mode, operations, token = null) => {
  const payload = {
    num_qubits: numQubits,
    mode: mode,
    operations: operations,
  };

  const response = await fetch(`${API_URL}/simulate`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.detail || `Simulation error (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return await response.json();
};

export const runShor = async (N, numCountingQubits = null, token = null) => {
  const payload = {
    N: Number(N),
    num_counting_qubits: numCountingQubits !== null ? Number(numCountingQubits) : null,
  };

  const response = await fetch(`${API_URL}/shor`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.detail || `Shor execution failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  return await response.json();
};

// Auth API Calls (Email & Password)
export const apiRegister = async (email, password, fullName) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Registration failed");
  }

  return await response.json();
};

export const apiLogin = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Invalid email or password");
  }

  return await response.json();
};

export const apiGetMe = async (token) => {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Session expired or invalid token");
  }

  return await response.json();
};

export const apiGetUsage = async (token) => {
  const response = await fetch(`${API_URL}/auth/usage`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to load simulation usage");
  }

  return await response.json();
};