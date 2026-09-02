import numpy as np

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit_aer.noise import (
    NoiseModel,
    amplitude_damping_error,
    phase_damping_error
)


T1 = 100.0
T2 = 80.0
t = 20.0
shots = 10000


# T1 amplitude damping parameter
gamma = 1 - np.exp(-t / T1)


# Pure dephasing time
pure_dephasing_rate = (1 / T2) - (1 / (2 * T1))

if np.isclose(pure_dephasing_rate, 0):
    Tphi = np.inf
    lam = 0.0
else:
    Tphi = 1 / pure_dephasing_rate
    lam = 1 - np.exp(-2 * t / Tphi)


print("gamma =", gamma)
print("Tphi =", Tphi)
print("lambda =", lam)


# Circuit
qc = QuantumCircuit(1, 1)

qc.h(0)

# identity gate used as the location
# where combined decoherence happens
qc.id(0)

qc.h(0)

qc.measure(0, 0)


# Build both noise channels
amp_error = amplitude_damping_error(gamma)
phase_error = phase_damping_error(lam)

# Apply amplitude damping, then phase damping
combined_error = amp_error.compose(phase_error)


noise_model = NoiseModel()

noise_model.add_all_qubit_quantum_error(
    combined_error,
    ["id"]
)


# Run
simulator = AerSimulator(
    noise_model=noise_model
)

result = simulator.run(
    qc,
    shots=shots
).result()

counts = result.get_counts()

zero_count = counts.get("0", 0)
one_count = counts.get("1", 0)

p0 = zero_count / shots
p1 = one_count / shots


print("\nQiskit counts:")
print(counts)

print("\nQiskit probabilities:")
print("P(0) =", p0)
print("P(1) =", p1)