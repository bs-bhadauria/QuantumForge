from app.quantum.engine import (
    analyze_circuit,
    create_bell_circuit,
    simulate_circuit,
)


def test_bell_circuit_resources():
    circuit = create_bell_circuit()
    metrics = analyze_circuit(circuit)

    assert metrics["qubits"] == 2
    assert metrics["classical_bits"] == 2
    assert metrics["gate_count"] == 4
    assert metrics["depth"] >= 1


def test_bell_state_measurements():
    result = simulate_circuit(
        create_bell_circuit(),
        shots=4096,
    )

    counts = result["counts"]

    assert sum(counts.values()) == 4096
    assert set(counts).issubset({"00", "11"})
    assert "00" in counts
    assert "11" in counts

    probability_00 = counts["00"] / 4096
    probability_11 = counts["11"] / 4096

    assert abs(probability_00 - 0.5) < 0.08
    assert abs(probability_11 - 0.5) < 0.08


def test_build_circuit_rejects_invalid_qubit_count():
    import pytest

    from app.quantum.engine import build_circuit

    for invalid_n in [0, 17, -1, "2", True, False, None]:
        with pytest.raises(ValueError, match="n_qubits must be between 1 and"):
            build_circuit(invalid_n, [])


def test_build_circuit_rejects_non_list_operations():
    import pytest

    from app.quantum.engine import build_circuit

    for invalid_ops in ["ops", 123, {"name": "h"}, None]:
        with pytest.raises(ValueError, match="operations must be a list"):
            build_circuit(1, invalid_ops)


def test_build_circuit_rejects_non_dict_operation():
    import pytest

    from app.quantum.engine import build_circuit

    with pytest.raises(ValueError, match="Operation 0 must be an object"):
        build_circuit(1, ["not_a_dict"])


def test_build_circuit_rejects_invalid_gate_name():
    import pytest

    from app.quantum.engine import build_circuit

    with pytest.raises(ValueError, match="name must be a string"):
        build_circuit(1, [{"name": 123, "qubits": [0]}])

    with pytest.raises(ValueError, match="unsupported gate 'invalid_gate'"):
        build_circuit(1, [{"name": "invalid_gate", "qubits": [0]}])


def test_build_circuit_rejects_invalid_qubits_format_and_count():
    import pytest

    from app.quantum.engine import build_circuit

    with pytest.raises(ValueError, match="qubits must be a list"):
        build_circuit(1, [{"name": "h", "qubits": "0"}])

    with pytest.raises(ValueError, match="gate 'h' requires 1 qubit"):
        build_circuit(2, [{"name": "h", "qubits": [0, 1]}])

    with pytest.raises(ValueError, match="gate 'cx' requires 2 qubit"):
        build_circuit(2, [{"name": "cx", "qubits": [0]}])


def test_build_circuit_rejects_qubits_out_of_range():
    import pytest

    from app.quantum.engine import build_circuit

    for bad_qubit in [-1, 2, 5, True, "0"]:
        with pytest.raises(ValueError, match="qubit indices must be between 0 and 1"):
            build_circuit(2, [{"name": "h", "qubits": [bad_qubit]}])


def test_build_circuit_rejects_duplicate_qubits():
    import pytest

    from app.quantum.engine import build_circuit

    for gate in ["cx", "cz", "swap"]:
        with pytest.raises(ValueError, match="duplicate qubit indices are not allowed"):
            build_circuit(2, [{"name": gate, "qubits": [0, 0]}])


def test_build_circuit_rejects_invalid_params():
    import math

    import pytest

    from app.quantum.engine import build_circuit

    with pytest.raises(ValueError, match="params must be a list"):
        build_circuit(1, [{"name": "rx", "qubits": [0], "params": "0.5"}])

    with pytest.raises(ValueError, match="does not accept parameters"):
        build_circuit(1, [{"name": "h", "qubits": [0], "params": [1.0]}])

    with pytest.raises(ValueError, match="requires exactly one angle"):
        build_circuit(1, [{"name": "rx", "qubits": [0], "params": []}])

    with pytest.raises(ValueError, match="requires exactly one angle"):
        build_circuit(1, [{"name": "rx", "qubits": [0], "params": [0.1, 0.2]}])

    for non_finite in [math.inf, -math.inf, math.nan, True, "1.57", None]:
        with pytest.raises(ValueError, match="angle must be a finite number"):
            build_circuit(1, [{"name": "rx", "qubits": [0], "params": [non_finite]}])


def test_simulate_circuit_rejects_invalid_inputs():
    import pytest

    from app.quantum.engine import create_bell_circuit, simulate_circuit

    circuit = create_bell_circuit()

    for invalid_shots in [0, -1, "100", True, 1.5, None]:
        with pytest.raises(ValueError, match="shots must be a positive integer"):
            simulate_circuit(circuit, shots=invalid_shots)

    for invalid_seed in [-1, "42", True, 1.5, None]:
        with pytest.raises(ValueError, match="seed must be a non-negative integer"):
            simulate_circuit(circuit, seed=invalid_seed)
