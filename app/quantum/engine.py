
import math

from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator


MAX_QUBITS = 16

SINGLE_QUBIT_GATES = {
    "h", "x", "y", "z", "s", "t", "rx", "ry", "rz"
}

TWO_QUBIT_GATES = {"cx", "cz", "swap"}
ROTATION_GATES = {"rx", "ry", "rz"}


def create_bell_circuit() -> QuantumCircuit:
    """Create a two-qubit Bell-state circuit."""
    circuit = QuantumCircuit(2, 2)
    circuit.h(0)
    circuit.cx(0, 1)
    circuit.measure([0, 1], [0, 1])
    return circuit


def build_circuit(
    n_qubits: int,
    operations: list[dict],
) -> QuantumCircuit:
    """Build a measured circuit from supported gate definitions."""
    if (
        isinstance(n_qubits, bool)
        or not isinstance(n_qubits, int)
        or not 1 <= n_qubits <= MAX_QUBITS
    ):
        raise ValueError(
            f"n_qubits must be between 1 and {MAX_QUBITS}"
        )

    if not isinstance(operations, list):
        raise ValueError("operations must be a list")

    circuit = QuantumCircuit(n_qubits, n_qubits)

    for index, operation in enumerate(operations):
        if not isinstance(operation, dict):
            raise ValueError(f"Operation {index} must be an object")

        name = operation.get("name")
        qubits = operation.get("qubits")
        params = operation.get("params", [])

        if not isinstance(name, str):
            raise ValueError(f"Operation {index}: name must be a string")

        name = name.lower()

        if name not in SINGLE_QUBIT_GATES | TWO_QUBIT_GATES:
            raise ValueError(
                f"Operation {index}: unsupported gate '{name}'"
            )

        if not isinstance(qubits, list):
            raise ValueError(f"Operation {index}: qubits must be a list")

        expected = 1 if name in SINGLE_QUBIT_GATES else 2

        if len(qubits) != expected:
            raise ValueError(
                f"Operation {index}: gate '{name}' requires "
                f"{expected} qubit(s)"
            )

        for qubit in qubits:
            if (
                isinstance(qubit, bool)
                or not isinstance(qubit, int)
                or not 0 <= qubit < n_qubits
            ):
                raise ValueError(
                    f"Operation {index}: qubit indices must be "
                    f"between 0 and {n_qubits - 1}"
                )

        if len(set(qubits)) != len(qubits):
            raise ValueError(
                f"Operation {index}: duplicate qubit indices are not allowed"
            )

        if not isinstance(params, list):
            raise ValueError(f"Operation {index}: params must be a list")

        if name in ROTATION_GATES:
            if len(params) != 1:
                raise ValueError(
                    f"Operation {index}: gate '{name}' requires "
                    "exactly one angle"
                )

            angle = params[0]

            if (
                isinstance(angle, bool)
                or not isinstance(angle, (int, float))
                or not math.isfinite(angle)
            ):
                raise ValueError(
                    f"Operation {index}: angle must be a finite number"
                )
        elif params:
            raise ValueError(
                f"Operation {index}: gate '{name}' does not accept parameters"
            )

        if name in SINGLE_QUBIT_GATES:
            gate = getattr(circuit, name)

            if name in ROTATION_GATES:
                gate(float(params[0]), qubits[0])
            else:
                gate(qubits[0])
        else:
            gate = getattr(circuit, name)
            gate(qubits[0], qubits[1])

    circuit.measure(range(n_qubits), range(n_qubits))
    return circuit


def analyze_circuit(circuit: QuantumCircuit) -> dict:
    """Return circuit resource metrics."""
    return {
        "qubits": circuit.num_qubits,
        "classical_bits": circuit.num_clbits,
        "gate_count": circuit.size(),
        "depth": circuit.depth(),
        "operations": {
            name: int(count)
            for name, count in circuit.count_ops().items()
        },
    }


def simulate_circuit(
    circuit: QuantumCircuit,
    shots: int = 1024,
    seed: int = 42,
) -> dict:
    """Run a circuit using the local Aer simulator."""
    if (
        isinstance(shots, bool)
        or not isinstance(shots, int)
        or shots < 1
    ):
        raise ValueError("shots must be a positive integer")

    if (
        isinstance(seed, bool)
        or not isinstance(seed, int)
        or seed < 0
    ):
        raise ValueError("seed must be a non-negative integer")

    simulator = AerSimulator(seed_simulator=seed)

    compiled = transpile(
        circuit,
        simulator,
        seed_transpiler=seed,
    )

    result = simulator.run(
        compiled,
        shots=shots,
        seed_simulator=seed,
    ).result()

    counts = result.get_counts()

    return {
        "shots": shots,
        "counts": dict(counts),
        "probabilities": {
            state: count / shots
            for state, count in counts.items()
        },
        "resources": analyze_circuit(circuit),
    }
