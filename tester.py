import numpy as np

from Main import (
    QuantumState,
    QuantumCircuit,
    X,
    Y,
    Z,
    H,
    S,
    T
)


TOLERANCE = 1e-9


def states_equal_up_to_global_phase(actual, expected):
    """
    Checks whether two quantum states are physically equivalent,
    allowing them to differ by a global phase.
    """

    actual = np.asarray(actual, dtype=complex)
    expected = np.asarray(expected, dtype=complex)

    if actual.shape != expected.shape:
        return False

    if not np.isclose(np.linalg.norm(actual), np.linalg.norm(expected)):
        return False

    nonzero = np.where(np.abs(expected) > TOLERANCE)[0]

    if len(nonzero) == 0:
        return np.allclose(actual, expected)

    index = nonzero[0]

    phase = actual[index] / expected[index]

    if np.isclose(abs(phase), 0):
        return False

    phase = phase / abs(phase)

    return np.allclose(actual, phase * expected, atol=TOLERANCE)


def test_initial_state():
    q = QuantumState(3, "ideal")

    expected = np.array([
        1, 0, 0, 0,
        0, 0, 0, 0
    ], dtype=complex)

    assert np.allclose(q.state, expected)


def test_initial_state_normalization():
    q = QuantumState(5, "ideal")

    total_probability = np.sum(np.abs(q.state) ** 2)

    assert np.isclose(total_probability, 1)


def test_x_on_zero():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(X, 0)

    expected = np.array([0, 1], dtype=complex)

    assert np.allclose(q.state, expected)


def test_x_on_one():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(X, 0)
    q.single_qubit_operator_calculator(X, 0)

    expected = np.array([1, 0], dtype=complex)

    assert np.allclose(q.state, expected)


def test_y_on_zero():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(Y, 0)

    expected = np.array([0, 1j], dtype=complex)

    assert np.allclose(q.state, expected)


def test_z_on_zero():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(Z, 0)

    expected = np.array([1, 0], dtype=complex)

    assert np.allclose(q.state, expected)


def test_z_on_one():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(X, 0)
    q.single_qubit_operator_calculator(Z, 0)

    expected = np.array([0, -1], dtype=complex)

    assert np.allclose(q.state, expected)


def test_h_on_zero():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(H, 0)

    expected = np.array([
        1 / np.sqrt(2),
        1 / np.sqrt(2)
    ], dtype=complex)

    assert np.allclose(q.state, expected)


def test_h_on_one():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(X, 0)
    q.single_qubit_operator_calculator(H, 0)

    expected = np.array([
        1 / np.sqrt(2),
        -1 / np.sqrt(2)
    ], dtype=complex)

    assert np.allclose(q.state, expected)


def test_h_squared_identity():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(H, 0)
    q.single_qubit_operator_calculator(H, 0)

    expected = np.array([1, 0], dtype=complex)

    assert np.allclose(q.state, expected)


def test_x_squared_identity():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(X, 0)
    q.single_qubit_operator_calculator(X, 0)

    expected = np.array([1, 0], dtype=complex)

    assert np.allclose(q.state, expected)


def test_y_squared_identity():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(Y, 0)
    q.single_qubit_operator_calculator(Y, 0)

    expected = np.array([1, 0], dtype=complex)

    assert np.allclose(q.state, expected)


def test_z_squared_identity():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(Z, 0)
    q.single_qubit_operator_calculator(Z, 0)

    expected = np.array([1, 0], dtype=complex)

    assert np.allclose(q.state, expected)


def test_hzh_equals_x():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(H, 0)
    q.single_qubit_operator_calculator(Z, 0)
    q.single_qubit_operator_calculator(H, 0)

    expected = np.array([0, 1], dtype=complex)

    assert np.allclose(q.state, expected)


def test_s_squared_equals_z():
    q1 = QuantumState(1, "ideal")
    q2 = QuantumState(1, "ideal")

    q1.single_qubit_operator_calculator(S, 0)
    q1.single_qubit_operator_calculator(S, 0)

    q2.single_qubit_operator_calculator(Z, 0)

    assert np.allclose(q1.state, q2.state)


def test_t_squared_equals_s():
    q1 = QuantumState(1, "ideal")
    q2 = QuantumState(1, "ideal")

    q1.single_qubit_operator_calculator(T, 0)
    q1.single_qubit_operator_calculator(T, 0)

    q2.single_qubit_operator_calculator(S, 0)

    assert np.allclose(q1.state, q2.state)


def test_t_fourth_equals_z():
    q1 = QuantumState(1, "ideal")
    q2 = QuantumState(1, "ideal")

    for _ in range(4):
        q1.single_qubit_operator_calculator(T, 0)

    q2.single_qubit_operator_calculator(Z, 0)

    assert np.allclose(q1.state, q2.state)


def test_rx_zero():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(q.Rx(0), 0)

    expected = np.array([1, 0], dtype=complex)

    assert np.allclose(q.state, expected)


def test_rx_pi():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(q.Rx(np.pi), 0)

    expected = np.array([0, 1], dtype=complex)

    assert states_equal_up_to_global_phase(q.state, expected)


def test_ry_pi_over_two():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(q.Ry(np.pi / 2), 0)

    expected = np.array([
        1 / np.sqrt(2),
        1 / np.sqrt(2)
    ], dtype=complex)

    assert np.allclose(q.state, expected)


def test_ry_pi():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(q.Ry(np.pi), 0)

    expected = np.array([0, 1], dtype=complex)

    assert states_equal_up_to_global_phase(q.state, expected)


def test_rz_preserves_zero_probability():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(q.Rz(np.pi / 3), 0)

    probabilities = q.Pcalc()

    assert np.allclose(probabilities, [1, 0])


def test_gate_preserves_normalization():
    q = QuantumState(1, "ideal")

    q.single_qubit_operator_calculator(H, 0)
    q.single_qubit_operator_calculator(T, 0)
    q.single_qubit_operator_calculator(q.Rx(0.31), 0)
    q.single_qubit_operator_calculator(q.Ry(1.17), 0)
    q.single_qubit_operator_calculator(q.Rz(2.2), 0)

    total_probability = np.sum(np.abs(q.state) ** 2)

    assert np.isclose(total_probability, 1)


def test_h_on_middle_qubit():
    q = QuantumState(3, "ideal")

    q.single_qubit_operator_calculator(H, 1)

    expected = np.zeros(8, dtype=complex)

    expected[0] = 1 / np.sqrt(2)   # |000>
    expected[2] = 1 / np.sqrt(2)   # |010>

    assert np.allclose(q.state, expected)


def test_x_on_last_qubit():
    q = QuantumState(3, "ideal")

    q.single_qubit_operator_calculator(X, 2)

    expected = np.zeros(8, dtype=complex)
    expected[1] = 1                # |001>

    assert np.allclose(q.state, expected)


def test_cnot_control_zero_does_nothing():
    q = QuantumState(2, "ideal")

    q.CNOT(0, 1)

    expected = np.array([1, 0, 0, 0], dtype=complex)

    assert np.allclose(q.state, expected)


def test_cnot_10_to_11():
    q = QuantumState(2, "ideal")

    q.single_qubit_operator_calculator(X, 0)

    q.CNOT(0, 1)

    expected = np.array([0, 0, 0, 1], dtype=complex)

    assert np.allclose(q.state, expected)


def test_cnot_11_to_10():
    q = QuantumState(2, "ideal")

    q.single_qubit_operator_calculator(X, 0)
    q.single_qubit_operator_calculator(X, 1)

    q.CNOT(0, 1)

    expected = np.array([0, 0, 1, 0], dtype=complex)

    assert np.allclose(q.state, expected)


def test_cnot_reversed_control_target():
    q = QuantumState(2, "ideal")

    q.single_qubit_operator_calculator(X, 1)

    q.CNOT(1, 0)

    expected = np.array([0, 0, 0, 1], dtype=complex)

    assert np.allclose(q.state, expected)


def test_bell_state():
    q = QuantumState(2, "ideal")

    q.single_qubit_operator_calculator(H, 0)
    q.CNOT(0, 1)

    expected = np.array([
        1 / np.sqrt(2),
        0,
        0,
        1 / np.sqrt(2)
    ], dtype=complex)

    assert np.allclose(q.state, expected)


def test_bell_probabilities():
    q = QuantumState(2, "ideal")

    q.single_qubit_operator_calculator(H, 0)
    q.CNOT(0, 1)

    expected = np.array([
        0.5,
        0,
        0,
        0.5
    ])

    assert np.allclose(q.Pcalc(), expected)


def test_ghz_state():
    q = QuantumState(3, "ideal")

    q.single_qubit_operator_calculator(H, 0)

    q.CNOT(0, 1)
    q.CNOT(0, 2)

    expected = np.zeros(8, dtype=complex)

    expected[0] = 1 / np.sqrt(2)   # |000>
    expected[7] = 1 / np.sqrt(2)   # |111>

    assert np.allclose(q.state, expected)


def test_full_measurement_collapse():
    q = QuantumState(2, "ideal")

    q.single_qubit_operator_calculator(H, 0)
    q.CNOT(0, 1)

    probabilities = q.Pcalc()

    result = q.probchooser(probabilities)

    assert result in ["00", "11"]

    total_probability = np.sum(np.abs(q.state) ** 2)

    assert np.isclose(total_probability, 1)

    nonzero = np.count_nonzero(np.abs(q.state) > TOLERANCE)

    assert nonzero == 1


def test_second_measurement_same_after_collapse():
    q = QuantumState(2, "ideal")

    q.single_qubit_operator_calculator(H, 0)
    q.CNOT(0, 1)

    first = q.probchooser(q.Pcalc())
    second = q.probchooser(q.Pcalc())

    assert first == second


def test_partial_measurement_normalization():
    q = QuantumState(2, "ideal")

    q.single_qubit_operator_calculator(H, 0)
    q.CNOT(0, 1)

    q.measure_qubit(0, q.Pcalc())

    total_probability = np.sum(np.abs(q.state) ** 2)

    assert np.isclose(total_probability, 1)


def test_bell_partial_measurement_correlation():
    for _ in range(100):

        q = QuantumState(2, "ideal")

        q.single_qubit_operator_calculator(H, 0)
        q.CNOT(0, 1)

        result0 = q.measure_qubit(0, q.Pcalc())
        result1 = q.measure_qubit(1, q.Pcalc())

        assert result0 == result1


def test_bell_shots_only_valid_results():
    q = QuantumState(2, "ideal")

    q.single_qubit_operator_calculator(H, 0)
    q.CNOT(0, 1)

    counts = q.shots(q.Pcalc(), 1000)

    assert "01" not in counts
    assert "10" not in counts

    assert set(counts.keys()).issubset({"00", "11"})


def test_bell_shots_rough_distribution():
    q = QuantumState(2, "ideal")

    q.single_qubit_operator_calculator(H, 0)
    q.CNOT(0, 1)

    counts = q.shots(q.Pcalc(), 5000)

    count_00 = counts.get("00", 0)
    count_11 = counts.get("11", 0)

    fraction_00 = count_00 / 5000
    fraction_11 = count_11 / 5000

    assert abs(fraction_00 - 0.5) < 0.05
    assert abs(fraction_11 - 0.5) < 0.05


def test_probabilities_sum_to_one_after_circuit():
    q = QuantumState(3, "ideal")

    q.single_qubit_operator_calculator(H, 0)
    q.single_qubit_operator_calculator(T, 1)
    q.single_qubit_operator_calculator(q.Ry(0.7), 2)

    q.CNOT(0, 1)
    q.CNOT(1, 2)

    probabilities = q.Pcalc()

    assert np.isclose(np.sum(probabilities), 1)


def test_invalid_control_target_same_qubit():
    q = QuantumState(2, "ideal")

    try:
        q.CNOT(0, 0)

    except ValueError:
        return

    raise AssertionError(
        "CNOT should reject using the same qubit as control and target"
    )


def test_invalid_target_index():
    q = QuantumState(2, "ideal")

    try:
        q.single_qubit_operator_calculator(H, 5)

    except (ValueError, IndexError):
        return

    raise AssertionError(
        "Simulator should reject an invalid target qubit"
    )


if __name__ == "__main__":

    tests = [
        test_initial_state,
        test_initial_state_normalization,
        test_x_on_zero,
        test_x_on_one,
        test_y_on_zero,
        test_z_on_zero,
        test_z_on_one,
        test_h_on_zero,
        test_h_on_one,
        test_h_squared_identity,
        test_x_squared_identity,
        test_y_squared_identity,
        test_z_squared_identity,
        test_hzh_equals_x,
        test_s_squared_equals_z,
        test_t_squared_equals_s,
        test_t_fourth_equals_z,
        test_rx_zero,
        test_rx_pi,
        test_ry_pi_over_two,
        test_ry_pi,
        test_rz_preserves_zero_probability,
        test_gate_preserves_normalization,
        test_h_on_middle_qubit,
        test_x_on_last_qubit,
        test_cnot_control_zero_does_nothing,
        test_cnot_10_to_11,
        test_cnot_11_to_10,
        test_cnot_reversed_control_target,
        test_bell_state,
        test_bell_probabilities,
        test_ghz_state,
        test_full_measurement_collapse,
        test_second_measurement_same_after_collapse,
        test_partial_measurement_normalization,
        test_bell_partial_measurement_correlation,
        test_bell_shots_only_valid_results,
        test_bell_shots_rough_distribution,
        test_probabilities_sum_to_one_after_circuit,
        test_invalid_control_target_same_qubit,
        test_invalid_target_index
    ]

    passed = 0

    for test in tests:
        try:
            test()
            print(f"PASS: {test.__name__}")
            passed += 1

        except Exception as error:
            print(f"FAIL: {test.__name__}")
            print(f"      {error}")

    print()
    print(f"{passed}/{len(tests)} tests passed")