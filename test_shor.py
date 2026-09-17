import numpy as np

from Main import (
    QuantumState,
    X,
    H
)


def states_equal_up_to_global_phase(actual, expected, tol=1e-9):
    actual = np.asarray(actual, dtype=complex)
    expected = np.asarray(expected, dtype=complex)

    nonzero = np.where(np.abs(expected) > tol)[0]

    if len(nonzero) == 0:
        return np.allclose(actual, expected, atol=tol)

    index = nonzero[0]

    phase = actual[index] / expected[index]

    if np.isclose(abs(phase), 0):
        return False

    phase /= abs(phase)

    return np.allclose(
        actual,
        phase * expected,
        atol=tol
    )


def test_CZ_on_11():
    q = QuantumState(2, "ideal")

    q.single_qubit_operator_calculator(X, 0)
    q.single_qubit_operator_calculator(X, 1)

    q.CZ(0, 1)

    expected = np.array([
        0,
        0,
        0,
        -1
    ], dtype=complex)

    assert np.allclose(q.state, expected)


def test_CP_pi_over_2():
    q = QuantumState(2, "ideal")

    q.single_qubit_operator_calculator(X, 0)
    q.single_qubit_operator_calculator(X, 1)

    q.CP(
        0,
        1,
        np.pi / 2
    )

    expected = np.array([
        0,
        0,
        0,
        1j
    ], dtype=complex)

    assert np.allclose(q.state, expected)


def test_SWAP():
    q = QuantumState(2, "ideal")

    # |10>
    q.single_qubit_operator_calculator(X, 0)

    q.SWAP(0, 1)

    # Should become |01>
    expected = np.array([
        0,
        1,
        0,
        0
    ], dtype=complex)

    assert np.allclose(q.state, expected)


def test_QFT_normalization():
    q = QuantumState(3, "ideal")

    q.single_qubit_operator_calculator(H, 0)
    q.single_qubit_operator_calculator(X, 2)

    q.QFT()

    total_probability = np.sum(
        np.abs(q.state) ** 2
    )

    assert np.isclose(
        total_probability,
        1
    )


def test_QFT_IQFT_returns_original():
    q = QuantumState(3, "ideal")

    q.single_qubit_operator_calculator(H, 0)
    q.single_qubit_operator_calculator(X, 1)

    original = q.state.copy()

    q.QFT()
    q.IQFT()

    assert states_equal_up_to_global_phase(
        q.state,
        original
    )


def test_QFT_IQFT_random_state():
    q = QuantumState(3, "ideal")

    rng = np.random.default_rng(123)

    state = (
        rng.normal(size=8)
        + 1j * rng.normal(size=8)
    )

    state /= np.linalg.norm(state)

    q.state = state.copy()

    q.QFT()
    q.IQFT()

    assert states_equal_up_to_global_phase(
        q.state,
        state
    )


def test_controlled_modular_multiply_1_to_2():
    q = QuantumState(5, "ideal")

    # q0 = control = 1
    q.single_qubit_operator_calculator(X, 0)

    # work register q1 q2 q3 q4 = 0001
    q.single_qubit_operator_calculator(X, 4)

    q.controlled_modular_multiply(
        control=0,
        work_qubits=[1, 2, 3, 4],
        multiplier=2,
        N=15
    )

    expected = np.zeros(
        32,
        dtype=complex
    )

    # control 1, work 0010
    expected[int("10010", 2)] = 1

    assert np.allclose(
        q.state,
        expected
    )


def test_controlled_modular_multiply_4_to_8():
    q = QuantumState(5, "ideal")

    q.single_qubit_operator_calculator(X, 0)

    # work = 0100
    q.single_qubit_operator_calculator(X, 2)

    q.controlled_modular_multiply(
        control=0,
        work_qubits=[1, 2, 3, 4],
        multiplier=2,
        N=15
    )

    expected = np.zeros(
        32,
        dtype=complex
    )

    # control 1, work 1000
    expected[int("11000", 2)] = 1

    assert np.allclose(
        q.state,
        expected
    )


def test_control_zero_does_nothing():
    q = QuantumState(5, "ideal")

    # control q0 stays 0

    # work = 0100
    q.single_qubit_operator_calculator(X, 2)

    original = q.state.copy()

    q.controlled_modular_multiply(
        control=0,
        work_qubits=[1, 2, 3, 4],
        multiplier=2,
        N=15
    )

    assert np.allclose(
        q.state,
        original
    )

def test_modular_multiply_inverse():
    q = QuantumState(5, "ideal")

    q.single_qubit_operator_calculator(X, 0)
    q.single_qubit_operator_calculator(X, 4)

    original = q.state.copy()

    q.controlled_modular_multiply(
        control=0,
        work_qubits=[1, 2, 3, 4],
        multiplier=2,
        N=15
    )

    q.controlled_modular_multiply(
        control=0,
        work_qubits=[1, 2, 3, 4],
        multiplier=8,
        N=15
    )

    assert np.allclose(q.state, original)


if __name__ == "__main__":

    tests = [
        test_CZ_on_11,
        test_CP_pi_over_2,
        test_SWAP,
        test_QFT_normalization,
        test_QFT_IQFT_returns_original,
        test_QFT_IQFT_random_state,
        test_controlled_modular_multiply_1_to_2,
        test_controlled_modular_multiply_4_to_8,
        test_control_zero_does_nothing,
        test_modular_multiply_inverse
    ]

    passed = 0

    for test in tests:
        try:
            test()

            print(
                f"PASS: {test.__name__}"
            )

            passed += 1

        except Exception as error:
            print(
                f"FAIL: {test.__name__}"
            )

            print(
                f"      {error}"
            )

    print()
    print(
        f"{passed}/{len(tests)} tests passed"
    )

def test_shor_trace_success_matches_executed_gates(monkeypatch):
    import json
    import Main

    monkeypatch.setattr(Main.random, "randint", lambda *_: 2)
    monkeypatch.setattr(Main.np.random, "choice", lambda *args, **kwargs: 4)
    result = Main.shor(15, num_counting_qubits=4)
    assert result["success"] and sorted(result["factors"]) == [3, 5]
    trace = result["trace"]
    stages = [event["stage"] for event in trace]
    assert stages == ["check", "base", "prepare", "superposition", "initialize",
                      "modular", "modular", "modular", "modular", "qft",
                      "measure", "fraction", "verify", "extract", "factors", "complete"]
    qft = next(event for event in trace if event["stage"] == "qft")
    assert len(qft["gates"]) == 12  # 2 swaps, 6 controlled phases, 4 Hadamards
    assert qft["gates"][0] == "SWAP q0, q3"
    measurement = next(event for event in trace if event["stage"] == "measure")
    assert measurement["measurement"] == result["measurement"] == "0100"
    assert "2^4 mod 15 = 1" in next(event for event in trace if event["stage"] == "verify")["gates"]
    json.dumps(result)  # The trace must be safe to return through the API.


def test_shor_trace_preserves_zero_attempt_before_shortcut(monkeypatch):
    import Main

    bases = iter([2, 3])
    monkeypatch.setattr(Main.random, "randint", lambda *_: next(bases))
    monkeypatch.setattr(Main.np.random, "choice", lambda *args, **kwargs: 0)
    result = Main.shor(15, num_counting_qubits=2)
    assert result["method"] == "gcd_shortcut" and result["attempts"] == 2
    assert any(event["stage"] == "retry" and event["attempt"] == 1 for event in result["trace"])
    assert not any(event["kind"] == "quantum" and event["attempt"] == 2 for event in result["trace"])
    assert result["trace"][-1]["stage"] == "complete"


def test_shor_trace_classical_shortcuts():
    import Main

    for number in (7, 12):
        result = Main.shor(number)
        assert all(event["kind"] == "classical" for event in result["trace"])
        assert result["trace"][-1]["stage"] == "complete"


def test_shor_trace_attempt_limit(monkeypatch):
    import Main

    monkeypatch.setattr(Main.random, "randint", lambda *_: 2)
    monkeypatch.setattr(Main.np.random, "choice", lambda *args, **kwargs: 0)
    result = Main.shor(15, num_counting_qubits=2, max_attempts=2)
    assert not result["success"]
    assert [event["attempt"] for event in result["trace"] if event["stage"] == "retry"] == [1, 2]
    assert result["trace"][-1]["title"] == "Attempt limit reached"


def test_shor_trace_odd_and_unhelpful_periods(monkeypatch):
    import Main

    monkeypatch.setattr(Main.random, "randint", lambda *_: 2)
    for period, title in [(3, "Odd period: choose another base"), (6, "Unhelpful half-period value")]:
        monkeypatch.setattr(Main, "quantum_find_period", lambda **kwargs: {"success": True, "period": period})
        result = Main.shor(9, num_counting_qubits=2, max_attempts=1)
        assert any(event["title"] == title for event in result["trace"])
