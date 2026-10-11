
from app.quantum.engine import (
    create_bell_circuit,
    analyze_circuit,
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
