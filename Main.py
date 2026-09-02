import numpy as np
import time
from fractions import Fraction
import math
import random

GATE_TIMES = {
    "X": 0.05,
    "Y": 0.05,
    "Z": 0.05,
    "H": 0.05,
    "S": 0.05,
    "T": 0.05,
    "RX": 0.05,
    "RY": 0.05,
    "RZ": 0.05,
    "CNOT": 0.30
}

T1 = 100.0
T2 = 80.0
SINGLE_QUBIT_GATE_TIME = 0.05


class QuantumState:
    def __init__(self, num_qubits, mode):
        if num_qubits < 1:
            raise ValueError("num_qubits must be at least 1")
        if num_qubits > 20:
            raise ValueError("Over the qubit limit")
        if mode not in ["ideal", "noisy"]:
            raise ValueError("mode must be 'ideal' or 'noisy'")

        self.num_qubits = num_qubits
        self.mode = mode
        self.state = np.zeros(2**num_qubits, dtype=complex)
        self.state[0] = 1
        

    def Pcalc(self):
            return np.abs(self.state) ** 2
    

    # def single_qubit_operator_calculator(self, gate, target):
    #     if target < 0 or target >= self.num_qubits:
    #         raise IndexError("Invalid target qubit")
    #     operator = 1
    #     for q in range(self.num_qubits):
    #         if q == target:
    #             current = gate
    #         else:
    #             current = np.eye(2, dtype=complex)

    #         operator = np.kron(operator, current)
    #     self.state = operator @ self.state
    #     return operator

    def _apply_single_qubit_gate_ideal(self, gate, target):
        """Apply a 2x2 gate without adding any noise."""
        if target < 0 or target >= self.num_qubits:
            raise IndexError("Invalid target qubit")

        gate = np.asarray(gate, dtype=complex)
        if gate.shape != (2, 2):
            raise ValueError("Single-qubit gate must be a 2x2 matrix")

        mask = 1 << (self.num_qubits - 1 - target)

        for index in range(2 ** self.num_qubits):
            if index & mask == 0:
                partner = index | mask

                amp0 = self.state[index]
                amp1 = self.state[partner]

                self.state[index] = (
                    gate[0, 0] * amp0
                    + gate[0, 1] * amp1
                )

                self.state[partner] = (
                    gate[1, 0] * amp0
                    + gate[1, 1] * amp1
                )

    def single_qubit_operator_calculator(self, gate, target):
        self._apply_single_qubit_gate_ideal(gate, target)

        if self.mode == "noisy":
            self.depolarizing_noise(target, 0.001)

            apply_decoherence_trajectory(
                self,
                target,
                SINGLE_QUBIT_GATE_TIME,
                T1,
                T2
            )

    def print_state(self):
        for q in range(2**self.num_qubits):
            if not np.isclose(self.state[q], 0):
                #the 0 is fill in with zeros, str(self.num_qubits) is the num of bits, and b is binary. Format q, idk is taking q num and converting to binary
                idk = "0" + str(self.num_qubits) + "b"
                print(format(q, idk)+": "+str(self.state[q]))

        return 0


    # Simply if control bit is 1 then target bit is 0 and vice versa
    # def CNOT(self, control, target):
    #     if control == target:
    #         raise ValueError("Control and target qubits must be different")
    #     if control < 0 or control >= self.num_qubits:
    #         raise IndexError("Invalid control qubit")
    #     if target < 0 or target >= self.num_qubits:
    #         raise IndexError("Invalid target qubit")
    #     new_state = np.zeros_like(self.state)
    #     for q in range(2**self.num_qubits):
    #         idk = "0" + str(self.num_qubits) + "b"
    #         biform1 = format(q, idk)
    #         biform = list(biform1)
    #         if biform[control] == '1':
    #             if biform[target] == '1':
    #                 biform[target] ='0'
    #             else:
    #                 biform[target] = '1'
    #         bistr = ''.join(biform)
    #         new_index = int(bistr, 2)
    #         new_state[new_index] = self.state[q]

    #     self.state = new_state


    def CNOT(self, control, target):
        if control == target:
            raise ValueError("Control and target qubits must be different")

        if control < 0 or control >= self.num_qubits:
            raise IndexError("Invalid control qubit")

        if target < 0 or target >= self.num_qubits:
            raise IndexError("Invalid target qubit")

        control_mask = 1 << (self.num_qubits - 1 - control)
        target_mask = 1 << (self.num_qubits - 1 - target)

        for index in range(2 ** self.num_qubits):

            control_is_one = index & control_mask
            target_is_zero = not (index & target_mask)

            if control_is_one and target_is_zero:
                partner = index ^ target_mask

                self.state[index], self.state[partner] = (
                    self.state[partner],
                    self.state[index]
                )
        if self.mode == "noisy":
            self.depolarizing_noise(target, 0.01)
            self.depolarizing_noise(control, 0.01)
            gate_time = GATE_TIMES["CNOT"]

            apply_decoherence_trajectory(
                self,
                target,
                gate_time,
                T1,
                T2
            )

            apply_decoherence_trajectory(
                self,
                control,
                gate_time,
                T1,
                T2
            )


    #chooses the state using the probabilities
    def probchooser(self, probabilities):
        new_state = np.zeros_like(self.state)
        index = np.random.choice(2**self.num_qubits, p=probabilities)
        idk = "0" + str(self.num_qubits) + "b"
        new_state[index] = 1
        self.state = new_state
        return format(index, idk)


    #Does many tests and resets the probabilties to original after each test
    def shots(self, probabilities, shotnum):
        counts = {}
        original_state = self.state.copy()
        for i in range(shotnum):
            result = self.probchooser(probabilities)
            counts[result] = counts.get(result, 0) + 1
            self.state = original_state
        return counts

    #Measures a single qubit, then it should collapse and in entaglement then 1 qubit should correspond to the other one (I guess)
    def measure_qubit(self, target, probabilities):
        percentage = [0, 0]
        new_state = self.state.copy()
        for q in range(2**self.num_qubits):
            idk = "0" + str(self.num_qubits) + "b"
            biform1 = format(q, idk)
            biform = list(biform1)
            if biform[target] == '0':
                percentage[0] += probabilities[q]
            else:
                percentage[1] += probabilities[q]

        state = np.random.choice(2, p = percentage)
        for q in range(2**self.num_qubits):
            idk = "0" + str(self.num_qubits) + "b"
            biform1 = format(q, idk)
            biform = list(biform1)
            if biform[target] != str(state):
                new_state[q] = 0
        norm = np.linalg.norm(new_state)
        if np.isclose(norm, 0):
            raise ValueError("Invalid measurement collapse")
        new_state = new_state / norm
        self.state = new_state
        return state

    def normal_noise(self, target, error_prob):
        if not (0 <= error_prob <= 1):
            raise ValueError("error_prob must be between 0 and 1")

        if np.random.random() < error_prob:
            self._apply_single_qubit_gate_ideal(X, target)

    def phase_flip_noise(self, target, error_prob):
        if not (0 <= error_prob <= 1):
            raise ValueError("error_prob must be between 0 and 1")

        if np.random.random() < error_prob:
            self._apply_single_qubit_gate_ideal(Z, target)

    def depolarizing_noise(self, target, error_prob):
        if not (0 <= error_prob <= 1):
            raise ValueError("error_prob must be between 0 and 1")

        if np.random.random() < error_prob:
            random_num = np.random.choice(3)

            if random_num == 0:
                self._apply_single_qubit_gate_ideal(X, target)
            elif random_num == 1:
                self._apply_single_qubit_gate_ideal(Y, target)
            else:
                self._apply_single_qubit_gate_ideal(Z, target)


    #Rotations. Also a kind of gate to change the qubit state

    def Rx(self, theta):
        return np.array([
            [np.cos(theta / 2), -1j * np.sin(theta / 2)],
            [-1j * np.sin(theta / 2), np.cos(theta / 2)]
        ], dtype=complex)

    def Ry(self, theta):
        return np.array([
            [np.cos(theta / 2), -np.sin(theta / 2)],
            [np.sin(theta / 2), np.cos(theta / 2)]
        ], dtype=complex)

    def Rz(self, theta):
        return np.array([
            [np.exp(-1j * theta / 2), 0],
            [0, np.exp(1j * theta / 2)]
        ], dtype=complex)

    #Relean these 3 parts
    def density_matrix(self):
        state = np.asarray(self.state, dtype=complex)

        return np.outer(self.state, np.conjugate(state))

    def amplitude_damping(self, rho, gamma):
        E0 = np.array([
            [1, 0],
            [0, np.sqrt(1 - gamma)]
        ], dtype=complex)

        E1 = np.array([
            [0, np.sqrt(gamma)],
            [0, 0]
        ], dtype=complex)

        return (
            E0 @ rho @ E0.conj().T
            + E1 @ rho @ E1.conj().T
        )

    def phase_damping(self, rho, lam):
        E0 = np.array([
            [1, 0],
            [0, np.sqrt(1 - lam)]
        ], dtype=complex)

        E1 = np.array([
            [0, 0],
            [0, np.sqrt(lam)]
        ], dtype=complex)

        return (
            E0 @ rho @ E0.conj().T
            + E1 @ rho @ E1.conj().T
        )


    def amplitude_damping_trajectory(self, target, gamma):
        if not (0 <= gamma <= 1):
            raise ValueError("gamma must be between 0 and 1")

        if not (0 <= target < self.num_qubits):
            raise ValueError("Invalid target qubit")

        mask = 1 << (self.num_qubits - 1 - target)

        p_excited = 0.0

        for index in range(2 ** self.num_qubits):
            if index & mask:
                p_excited += abs(self.state[index]) ** 2

        jump_probability = gamma * p_excited

        if np.random.random() < jump_probability:
            new_state = np.zeros_like(self.state)

            for index in range(2 ** self.num_qubits):
                if index & mask:
                    target_zero_index = index ^ mask
                    new_state[target_zero_index] += self.state[index]

            norm = np.linalg.norm(new_state)

            if norm > 0:
                new_state /= norm

            self.state = new_state
            return "jump"

        else:
            new_state = self.state.copy()

            for index in range(2 ** self.num_qubits):
                if index & mask:
                    new_state[index] *= np.sqrt(1 - gamma)

            norm = np.linalg.norm(new_state)

            if norm > 0:
                new_state /= norm

            self.state = new_state
            return "no_jump"


    def phase_damping_trajectory(self, target, p):
        if not (0 <= p <= 0.5):
            raise ValueError("p must be between 0 and 0.5")

        if not (0 <= target < self.num_qubits):
            raise ValueError("Invalid target qubit")

        if np.random.random() < p:
            self._apply_single_qubit_gate_ideal(Z, target)
            return "phase_flip"

        return "no_phase_flip"

    def CZ(self, control, target):
        if control == target:
            raise ValueError("Control and target qubits must be different")

        if control < 0 or control >= self.num_qubits:
            raise IndexError("Invalid control qubit")

        if target < 0 or target >= self.num_qubits:
            raise IndexError("Invalid target qubit")

        control_mask = 1 << (self.num_qubits - 1 - control)
        target_mask = 1 << (self.num_qubits - 1 - target)

        for index in range(2 ** self.num_qubits):
            if (index & control_mask) and (index & target_mask):
                self.state[index] *= -1

    def SWAP(self, qubit1, qubit2):
        if qubit1 == qubit2:
            return

        self.CNOT(qubit1, qubit2)
        self.CNOT(qubit2, qubit1)
        self.CNOT(qubit1, qubit2)

    def CP(self, control, target, theta):
        if control == target:
            raise ValueError("Control and target qubits must be different")

        if control < 0 or control >= self.num_qubits:
            raise IndexError("Invalid control qubit")

        if target < 0 or target >= self.num_qubits:
            raise IndexError("Invalid target qubit")

        control_mask = 1 << (self.num_qubits - 1 - control)
        target_mask = 1 << (self.num_qubits - 1 - target)

        phase = np.exp(1j * theta)

        for index in range(2 ** self.num_qubits):
            if (index & control_mask) and (index & target_mask):
                self.state[index] *= phase


    def QFT(self):
        n = self.num_qubits

        for target in range(n):

            # Hadamard on current qubit
            self.single_qubit_operator_calculator(H, target)

            # Controlled phase rotations
            for control in range(target + 1, n):

                distance = control - target

                theta = np.pi / (2 ** distance)

                self.CP(
                    control,
                    target,
                    theta
                )

        # Reverse qubit order
        for i in range(n // 2):
            self.SWAP(
                i,
                n - 1 - i
            )

    def IQFT(self):
        n = self.num_qubits

        # Undo the final swaps from QFT
        for i in range(n // 2):
            self.SWAP(
                i,
                n - 1 - i
            )

        # Undo the controlled phases and H gates
        for target in reversed(range(n)):

            for control in reversed(range(target + 1, n)):
                distance = control - target

                theta = -np.pi / (2 ** distance)

                self.CP(
                    control,
                    target,
                    theta
                )

            self.single_qubit_operator_calculator(
                H,
                target
            )


    def controlled_modular_multiply(
        self,
        control,
        work_qubits,
        multiplier,
        N
    ):
        if control in work_qubits:
            raise ValueError("Control qubit cannot be inside work register")

        if len(set(work_qubits)) != len(work_qubits):
            raise ValueError("Duplicate work qubits")

        for q in work_qubits:
            if q < 0 or q >= self.num_qubits:
                raise IndexError("Invalid work qubit")

        if math.gcd(multiplier, N) != 1:
            raise ValueError("Multiplier must be coprime with N")
        if control in work_qubits:
            raise ValueError("Control qubit cannot be inside work register")

        if math.gcd(multiplier, N) != 1:
            raise ValueError("multiplier must be coprime with N")

        new_state = np.zeros_like(self.state)

        for index, amplitude in enumerate(self.state):

            bits = list(
                format(
                    index,
                    f"0{self.num_qubits}b"
                )
            )

            # If control is 0, leave state unchanged
            if bits[control] == "0":
                new_state[index] += amplitude
                continue

            # Read work register as an integer
            work_bits = "".join(
                bits[q]
                for q in work_qubits
            )

            y = int(work_bits, 2)

            # Only modular multiply values inside 0..N-1
            if y < N:
                new_y = (
                    multiplier * y
                ) % N
            else:
                new_y = y

            new_work_bits = format(
                new_y,
                f"0{len(work_qubits)}b"
            )

            # Replace work-register bits
            for i, q in enumerate(work_qubits):
                bits[q] = new_work_bits[i]

            new_index = int(
                "".join(bits),
                2
            )

            new_state[new_index] += amplitude

        self.state = new_state

    def IQFT_register(self, qubits):
        n = len(qubits)

        # Undo the swaps for only this register
        for i in range(n // 2):
            self.SWAP(
                qubits[i],
                qubits[n - 1 - i]
            )

        # Undo controlled phases and Hadamards
        for target_pos in reversed(range(n)):
            target = qubits[target_pos]

            for control_pos in reversed(range(target_pos + 1, n)):
                control = qubits[control_pos]

                distance = control_pos - target_pos

                theta = -np.pi / (2 ** distance)

                self.CP(
                    control,
                    target,
                    theta
                )

            self.single_qubit_operator_calculator(
                H,
                target
            )

    def register_probabilities(self, qubits):
        num_register_qubits = len(qubits)

        probabilities = np.zeros(
            2 ** num_register_qubits
        )

        for index, amplitude in enumerate(self.state):

            bits = format(
                index,
                f"0{self.num_qubits}b"
            )

            register_bits = "".join(
                bits[q]
                for q in qubits
            )

            register_index = int(
                register_bits,
                2
            )

            probabilities[register_index] += (
                abs(amplitude) ** 2
            )

        return probabilities

    def measure_register(self, qubits):
        probabilities = self.register_probabilities(qubits)

        measured_index = np.random.choice(
            2 ** len(qubits),
            p=probabilities
        )

        measured_bits = format(
            measured_index,
            f"0{len(qubits)}b"
        )

        return measured_index, measured_bits


class QuantumCircuit:
    def __init__(self, num_qubits, mode):
        if mode not in ["ideal", "noisy"]:
            raise ValueError("mode must be 'ideal' or 'noisy'")

        self.num_qubits = num_qubits
        self.operations = []
        self.mode = mode
        

    def h(self, target):
        operation = {
            "gate": "H",
            "target": target
        }

        self.operations.append(operation)

    def cnot(self, control, target):
        operation = {
            "gate": "CNOT",
            "control": control,
            "target": target
        }

        self.operations.append(operation)

    def x(self, target):
        operation = {
            "gate": "X",
            "target": target
        }

        self.operations.append(operation)

    def z(self, target):
        operation = {
            "gate": "Z",
            "target": target
        }

        self.operations.append(operation)

    def y(self, target):
        operation = {
            "gate": "Y",
            "target": target
        }

        self.operations.append(operation)

    def s(self, target):
        operation = {
            "gate": "S",
            "target": target
        }

        self.operations.append(operation)

    def t(self, target):
        operation = {
            "gate": "T",
            "target": target
        }

        self.operations.append(operation)

    def rx(self, target, theta):
        operation = {
            "gate": "Rx",
            "target": target,
            "theta": theta
        }

        self.operations.append(operation)

    def ry(self, target, theta):
        operation = {
            "gate": "Ry",
            "target": target,
            "theta": theta
        }

        self.operations.append(operation)

    def rz(self, target, theta):
        operation = {
            "gate": "Rz",
            "target": target,
            "theta": theta
        }

        self.operations.append(operation)

    def measure(self, target):
        operation = {
            "gate": "Measure",
            "target": target
        }

        self.operations.append(operation)

    def action(self):
        q = QuantumState(self.num_qubits, self.mode)
        measurement_results = []
        for operation in self.operations:
            if operation["gate"] == "H":
                q.single_qubit_operator_calculator(H, operation["target"])
            elif operation["gate"] == "X":
                q.single_qubit_operator_calculator(X, operation["target"])
            elif operation["gate"] == "CNOT":
                q.CNOT(operation["control"], operation["target"])
            elif operation["gate"] == "Y":
                q.single_qubit_operator_calculator(Y, operation["target"])
            elif operation["gate"] == "Z":
                q.single_qubit_operator_calculator(Z, operation["target"])
            elif operation["gate"] == "S":
                q.single_qubit_operator_calculator(S, operation["target"])
            elif operation["gate"] == "T":
                q.single_qubit_operator_calculator(T, operation["target"])
            elif operation["gate"] == "Rx":
                q.single_qubit_operator_calculator(q.Rx(operation["theta"]), operation["target"])
            elif operation["gate"] == "Ry":
                q.single_qubit_operator_calculator(q.Ry(operation["theta"]), operation["target"])
            elif operation["gate"] == "Rz":
                q.single_qubit_operator_calculator(q.Rz(operation["theta"]), operation["target"])
            elif operation["gate"] == "Measure":
                value = q.measure_qubit(
                    operation["target"],
                    q.Pcalc()
                )

                if q.mode == "noisy":
                    value = apply_readout_error(
                        value,
                        p01=0.02,
                        p10=0.02
                    )

                result = {
                    "qubit": operation["target"],
                    "value": value
                }
                measurement_results.append(result)
                
        q.print_state()
        return q, measurement_results



        
        

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

def gamma_from_T1(t, T1):
    if t < 0:
        raise ValueError("t must be non-negative")

    if T1 <= 0:
        raise ValueError("T1 must be positive")

    return 1 - np.exp(-t / T1)


def phase_flip_probability(t, T1, T2):
    if t < 0:
        raise ValueError("t must be non-negative")

    if T1 <= 0 or T2 <= 0:
        raise ValueError("T1 and T2 must be positive")

    if T2 > 2 * T1:
        raise ValueError("T2 must satisfy T2 <= 2*T1")

    pure_dephasing_rate = (1 / T2) - (1 / (2 * T1))

    if np.isclose(pure_dephasing_rate, 0):
        return 0.0

    Tphi = 1 / pure_dephasing_rate

    return (1 - np.exp(-t / Tphi)) / 2


def apply_decoherence_trajectory(state, target, t, T1, T2):
    gamma = gamma_from_T1(t, T1)

    p_phase = phase_flip_probability(t, T1, T2)

    t1_result = state.amplitude_damping_trajectory(target, gamma)

    t2_result = state.phase_damping_trajectory(target, p_phase)

    return {
        "T1": t1_result,
        "T2": t2_result
    }


def apply_readout_error(result, p01=0.02, p10=0.02):
    if result == 0:
        if np.random.random() < p01:
            return 1

    elif result == 1:
        if np.random.random() < p10:
            return 0

    return result



def modular_exponentiation(
    q,
    counting_qubits,
    work_qubits,
    a,
    N
):
    num_counting = len(counting_qubits)

    for position, control in enumerate(counting_qubits):

        bit_power = num_counting - 1 - position

        multiplier = pow(
            a,
            2 ** bit_power,
            N
        )

        q.controlled_modular_multiply(
            control=control,
            work_qubits=work_qubits,
            multiplier=multiplier,
            N=N
        )


def quantum_find_period(N, a, num_counting_qubits=3):
    num_work_qubits = int(np.ceil(np.log2(N)))

    total_qubits = num_counting_qubits + num_work_qubits

    q = QuantumState(total_qubits, "ideal")

    counting = list(range(num_counting_qubits))

    work = list(
        range(
            num_counting_qubits,
            total_qubits
        )
    )

    # Put counting register into superposition
    for qubit in counting:
        q.single_qubit_operator_calculator(
            H,
            qubit
        )

    # Initialize work register to |1>
    q.single_qubit_operator_calculator(
        X,
        work[-1]
    )

    # Compute a^x mod N
    modular_exponentiation(
        q,
        counting,
        work,
        a,
        N
    )

    # Apply inverse QFT to counting register
    q.IQFT_register(counting)

    counting_probs = q.register_probabilities(
        counting
    )

    # Measure counting register
    measured = np.random.choice(
        2 ** len(counting),
        p=counting_probs
    )

    bits = format(
        measured,
        f"0{len(counting)}b"
    )

    # Useless zero measurement
    if measured == 0:
        return {
            "success": False,
            "measurement": bits,
            "measurement_decimal": int(measured),
            "phase": 0.0,
            "fraction": "0",
            "candidate_period": None,
            "period": None
        }

    phase = measured / (
        2 ** len(counting)
    )

    fraction = Fraction(
        phase
    ).limit_denominator(N)

    candidate_r = fraction.denominator

    recovered_r = None

    for multiplier in range(1, N + 1):
        possible_r = candidate_r * multiplier

        if pow(a, possible_r, N) == 1:
            recovered_r = possible_r
            break

    return {
        "success": recovered_r is not None,
        "measurement": bits,
        "measurement_decimal": int(measured),
        "phase": float(phase),
        "fraction": str(fraction),
        "candidate_period": int(candidate_r),
        "period": int(recovered_r) if recovered_r is not None else None
    }

def is_prime(N):
    if N < 2:
        return False

    if N == 2:
        return True

    if N % 2 == 0:
        return False

    for i in range(
        3,
        int(np.sqrt(N)) + 1,
        2
    ):
        if N % i == 0:
            return False

    return True


def shor(
    N,
    num_counting_qubits=None,
    max_attempts=20
):
    if N <= 1:
        raise ValueError(
            "N must be greater than 1"
        )

    # Prime check
    if is_prime(N):
        return {
            "success": False,
            "N": N,
            "is_prime": True,
            "message": (
                f"{N} is prime. "
                "No nontrivial factors exist."
            )
        }

    # Easy even number shortcut
    if N % 2 == 0:
        return {
            "success": True,
            "N": N,
            "method": "even_number_shortcut",
            "factors": [
                2,
                N // 2
            ],
            "attempts": 0
        }

    # Automatic counting register size
    if num_counting_qubits is None:
        num_counting_qubits = (
            2 * int(
                np.ceil(
                    np.log2(N)
                )
            )
        )

    for attempt in range(
        1,
        max_attempts + 1
    ):
        a = random.randint(
            2,
            N - 1
        )

        common_factor = math.gcd(
            a,
            N
        )

        # classical shortcut
        if common_factor != 1:
            factor1 = common_factor
            factor2 = N // common_factor

            return {
                "success": True,
                "N": N,
                "a": a,
                "method": "gcd_shortcut",
                "attempts": attempt,
                "factors": [
                    factor1,
                    factor2
                ]
            }

        period_result = quantum_find_period(
            N=N,
            a=a,
            num_counting_qubits=
                num_counting_qubits
        )

        if not period_result["success"]:
            continue

        r = period_result["period"]

        if r % 2 != 0:
            continue

        x = pow(
            a,
            r // 2,
            N
        )

        # Bad Shor case
        if x == N - 1:
            continue

        factor1 = math.gcd(
            x - 1,
            N
        )

        factor2 = math.gcd(
            x + 1,
            N
        )

        if factor1 in [1, N]:
            continue

        if factor2 in [1, N]:
            continue

        return {
            "success": True,
            "N": N,
            "a": a,
            "method": "shor",
            "attempts": attempt,

            "measurement":
                period_result["measurement"],

            "measurement_decimal":
                period_result[
                    "measurement_decimal"
                ],

            "phase":
                period_result["phase"],

            "fraction":
                period_result["fraction"],

            "candidate_period":
                period_result[
                    "candidate_period"
                ],

            "period": r,

            "factors": [
                factor1,
                factor2
            ]
        }

    return {
        "success": False,
        "N": N,
        "is_prime": False,
        "attempts": max_attempts,
        "message": (
            "Could not find nontrivial "
            "factors within the maximum "
            "number of attempts."
        )
    }