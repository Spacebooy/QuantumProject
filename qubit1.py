import numpy as np

class Qubit:
    def __init__(self, alpha, beta):
        self.state = np.array([alpha, beta], dtype=complex)

        if not np.isclose(np.sum(np.abs(self.state) ** 2), 1):
            raise ValueError("Quantum state is not normalized")

    def Pcalc(self):
        return np.abs(self.state) ** 2

    def apply_gate(self, gate):
        self.state = gate @ self.state


#These are gates (transformations)
X = np.array([
    [0, 1],
    [1, 0]
], dtype=complex)

H = (1 / np.sqrt(2)) * np.array([
    [1, 1],
    [1, -1]
], dtype=complex)

Z = np.array([
    [1, 0],
    [0, -1]
], dtype=complex)

Y = np.array([
    [0, -1j],
    [1j, 0]
], dtype=complex)

S = np.array([
    [1, 0],
    [0, 1j]
], dtype=complex)

T = np.array([
    [1, 0],
    [0, np.exp(1j * np.pi / 4)]
], dtype=complex)

#Rotations. Also a kind of gate to change the qubit state

def Rx(theta):
    return np.array([
        [np.cos(theta / 2), -1j * np.sin(theta / 2)],
        [-1j * np.sin(theta / 2), np.cos(theta / 2)]
    ], dtype=complex)

def Ry(theta):
    return np.array([
        [np.cos(theta / 2), -np.sin(theta / 2)],
        [np.sin(theta / 2), np.cos(theta / 2)]
    ], dtype=complex)

def Rz(theta):
    return np.array([
        [np.exp(-1j * theta / 2), 0],
        [0, np.exp(1j * theta / 2)]
    ], dtype=complex)

q0 = np.array([1, 0], dtype=complex)
q1 = np.array([0, 1], dtype=complex)

state = np.kron(q0, q1)


############################################################################################################################################


#tensor product used here to apply gates to qubits and also to find the corresponding state of the qubit if you have n qubits. (np.kron is the tensor product)
#Thing function takes in the gate(transformation), the target qubit, and the total number of qubits. It then takes applies I to every non-transformed qubit and G to the transformed qubit and makes a operator
#Ex: 4 qubits and apply to qubit 3 we have IxIxGxI. It returns this operator
def single_qubit_operator(gate, target, num_qubits):
    operator = 1
    for q in range(num_qubits):
        if q == target:
            current = gate
        else:
            current = np.eye(2, dtype=complex)

        operator = np.kron(operator, current)

    return operator


print(state)

CNOT = np.array([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 0]
], dtype=complex)


