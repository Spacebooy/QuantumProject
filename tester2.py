import numpy as np

from Main import (
    QuantumState,
    gamma_from_T1,
    phase_flip_probability,
    apply_readout_error,
    X,
    Y,
    Z,
    H,
    S,
    T
)


# --------------------------------------------------
# 1. Noisy QuantumState can be created
# --------------------------------------------------

def test_noisy_state_creation():
    q = QuantumState(1, "noisy")

    assert q.mode == "noisy"
    assert np.allclose(
        q.state,
        np.array([1, 0], dtype=complex)
    )


# --------------------------------------------------
# 2. T1 amplitude damping statistical test
# --------------------------------------------------

def test_T1_amplitude_damping():
    trials = 10000

    T1 = 100.0
    t = 20.0

    gamma = gamma_from_T1(t, T1)

    jumps = 0

    for _ in range(trials):
        q = QuantumState(1, "noisy")

        # Prepare |1>
        q.single_qubit_operator_calculator(X, 0)

        result = q.amplitude_damping_trajectory(
            target=0,
            gamma=gamma
        )

        if result == "jump":
            jumps += 1

    observed = jumps / trials

    print()
    print("T1 test")
    print("Expected:", gamma)
    print("Observed:", observed)

    # Monte Carlo tolerance
    assert abs(observed - gamma) < 0.03


# --------------------------------------------------
# 3. T2 pure dephasing statistical test
# --------------------------------------------------

def test_T2_phase_damping():
    trials = 10000

    T1 = 100.0
    T2 = 80.0
    t = 20.0

    p_phase = phase_flip_probability(
        t,
        T1,
        T2
    )

    flips = 0

    for _ in range(trials):
        q = QuantumState(1, "noisy")

        # Prepare |+>
        q.single_qubit_operator_calculator(H, 0)

        result = q.phase_damping_trajectory(
            target=0,
            p=p_phase
        )

        if result == "phase_flip":
            flips += 1

    observed = flips / trials

    print()
    print("T2 test")
    print("Expected:", p_phase)
    print("Observed:", observed)

    assert abs(observed - p_phase) < 0.03


# --------------------------------------------------
# 4. Readout error statistical test
# --------------------------------------------------

def test_readout_error():
    trials = 10000

    p01 = 0.10
    p10 = 0.10

    errors = 0

    for _ in range(trials):

        true_result = 0

        measured_result = apply_readout_error(
            true_result,
            p01=p01,
            p10=p10
        )

        if measured_result != true_result:
            errors += 1

    observed = errors / trials

    print()
    print("Readout test")
    print("Expected:", p01)
    print("Observed:", observed)

    assert abs(observed - p01) < 0.03


# --------------------------------------------------
# 5. Ideal mode should stay ideal
# --------------------------------------------------

def test_ideal_mode_has_no_noise():
    for _ in range(1000):

        q = QuantumState(1, "ideal")

        q.single_qubit_operator_calculator(X, 0)

        # |0> -> |1> exactly
        expected = np.array(
            [0, 1],
            dtype=complex
        )

        assert np.allclose(
            q.state,
            expected
        )


# --------------------------------------------------
# 6. Invalid mode should fail
# --------------------------------------------------

def test_invalid_mode():
    try:
        QuantumState(1, "banana")

    except ValueError:
        return

    raise AssertionError(
        "QuantumState should reject invalid modes"
    )


# --------------------------------------------------
# Run all tests
# --------------------------------------------------

if __name__ == "__main__":

    tests = [
        test_noisy_state_creation,
        test_T1_amplitude_damping,
        test_T2_phase_damping,
        test_readout_error,
        test_ideal_mode_has_no_noise,
        test_invalid_mode
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