"""Quantum algorithm templates and industry benchmark circuits.

Provides pre-verified quantum circuits across Cryptography, Chemistry (VQE),
Finance (QAOA), Quantum Teleportation, and Quantum Fourier Transform.
"""

from typing import Any

ALGORITHM_CATALOG: dict[str, dict[str, Any]] = {
    "bell": {
        "id": "bell",
        "title": "Bell State (EPR Pair)",
        "category": "Foundations",
        "description": (
            "Maximally entangled two-qubit state (|00> + |11>)/sqrt(2). "
            "The cornerstone of quantum communication and teleportation."
        ),
        "n_qubits": 2,
        "recommended_shots": 4096,
        "operations": [
            {"name": "h", "qubits": [0], "params": []},
            {"name": "cx", "qubits": [0, 1], "params": []},
        ],
    },
    "ghz": {
        "id": "ghz",
        "title": "GHZ State (3-Qubit Entanglement)",
        "category": "Foundations",
        "description": (
            "Greenberger–Horne–Zeilinger tripartite entanglement "
            "(|000> + |111>)/sqrt(2), demonstrating macroscopic non-locality."
        ),
        "n_qubits": 3,
        "recommended_shots": 4096,
        "operations": [
            {"name": "h", "qubits": [0], "params": []},
            {"name": "cx", "qubits": [0, 1], "params": []},
            {"name": "cx", "qubits": [1, 2], "params": []},
        ],
    },
    "teleportation": {
        "id": "teleportation",
        "title": "Quantum Teleportation Protocol",
        "category": "Communication",
        "description": (
            "Transfers unknown quantum state of Q0 to Q2 using pre-shared "
            "entanglement (Q1-Q2 EPR pair) and Bell-state measurement."
        ),
        "n_qubits": 3,
        "recommended_shots": 4096,
        "operations": [
            {"name": "ry", "qubits": [0], "params": [1.04719755]},
            {"name": "h", "qubits": [1], "params": []},
            {"name": "cx", "qubits": [1, 2], "params": []},
            {"name": "cx", "qubits": [0, 1], "params": []},
            {"name": "h", "qubits": [0], "params": []},
            {"name": "cx", "qubits": [1, 2], "params": []},
            {"name": "cz", "qubits": [0, 2], "params": []},
        ],
    },
    "superdense": {
        "id": "superdense",
        "title": "Superdense Coding Protocol",
        "category": "Communication",
        "description": (
            "Transmits two classical bits (11) by physically "
            "transmitting only a single entangled qubit."
        ),
        "n_qubits": 2,
        "recommended_shots": 4096,
        "operations": [
            {"name": "h", "qubits": [0], "params": []},
            {"name": "cx", "qubits": [0, 1], "params": []},
            {"name": "x", "qubits": [0], "params": []},
            {"name": "z", "qubits": [0], "params": []},
            {"name": "cx", "qubits": [0, 1], "params": []},
            {"name": "h", "qubits": [0], "params": []},
        ],
    },
    "grover_2q": {
        "id": "grover_2q",
        "title": "Grover's Search Algorithm (2-Qubit)",
        "category": "Search & Cryptography",
        "description": (
            "Searches an unstructured 4-item database in a single query "
            "with 100% theoretical probability for target item |11>."
        ),
        "n_qubits": 2,
        "recommended_shots": 4096,
        "operations": [
            {"name": "h", "qubits": [0], "params": []},
            {"name": "h", "qubits": [1], "params": []},
            {"name": "cz", "qubits": [0, 1], "params": []},
            {"name": "h", "qubits": [0], "params": []},
            {"name": "h", "qubits": [1], "params": []},
            {"name": "x", "qubits": [0], "params": []},
            {"name": "x", "qubits": [1], "params": []},
            {"name": "cz", "qubits": [0, 1], "params": []},
            {"name": "x", "qubits": [0], "params": []},
            {"name": "x", "qubits": [1], "params": []},
            {"name": "h", "qubits": [0], "params": []},
            {"name": "h", "qubits": [1], "params": []},
        ],
    },
    "deutsch_jozsa": {
        "id": "deutsch_jozsa",
        "title": "Deutsch-Jozsa Algorithm (Balanced Oracle)",
        "category": "Foundations",
        "description": (
            "Determines whether a hidden oracle function is constant or "
            "balanced with a single quantum evaluation."
        ),
        "n_qubits": 2,
        "recommended_shots": 2048,
        "operations": [
            {"name": "x", "qubits": [1], "params": []},
            {"name": "h", "qubits": [0], "params": []},
            {"name": "h", "qubits": [1], "params": []},
            {"name": "cx", "qubits": [0, 1], "params": []},
            {"name": "h", "qubits": [0], "params": []},
        ],
    },
    "qft_3q": {
        "id": "qft_3q",
        "title": "Quantum Fourier Transform (3-Qubit)",
        "category": "Foundations",
        "description": (
            "Transforms quantum state from computational basis to frequency "
            "phase basis. Core building block of Shor's algorithm."
        ),
        "n_qubits": 3,
        "recommended_shots": 4096,
        "operations": [
            {"name": "x", "qubits": [0], "params": []},
            {"name": "h", "qubits": [1], "params": []},
            {"name": "h", "qubits": [0], "params": []},
            {"name": "rz", "qubits": [0], "params": [1.57079633]},
            {"name": "cx", "qubits": [1, 0], "params": []},
            {"name": "rz", "qubits": [0], "params": [-1.57079633]},
            {"name": "cx", "qubits": [1, 0], "params": []},
            {"name": "h", "qubits": [1], "params": []},
            {"name": "rz", "qubits": [1], "params": [1.57079633]},
            {"name": "cx", "qubits": [2, 1], "params": []},
            {"name": "rz", "qubits": [1], "params": [-1.57079633]},
            {"name": "cx", "qubits": [2, 1], "params": []},
            {"name": "h", "qubits": [2], "params": []},
            {"name": "swap", "qubits": [0, 2], "params": []},
        ],
    },
    "vqe_h2": {
        "id": "vqe_h2",
        "title": "VQE Molecular Hydrogen (H2) Ansatz",
        "category": "Chemistry & Pharma",
        "description": (
            "Variational Quantum Eigensolver parameterized circuit to estimate "
            "molecular ground state energy of H2 at equilibrium bond distance."
        ),
        "n_qubits": 2,
        "recommended_shots": 4096,
        "operations": [
            {"name": "x", "qubits": [0], "params": []},
            {"name": "rx", "qubits": [0], "params": [1.57079633]},
            {"name": "h", "qubits": [1], "params": []},
            {"name": "cx", "qubits": [0, 1], "params": []},
            {"name": "rz", "qubits": [1], "params": [0.384]},
            {"name": "cx", "qubits": [0, 1], "params": []},
            {"name": "rx", "qubits": [0], "params": [-1.57079633]},
            {"name": "h", "qubits": [1], "params": []},
        ],
    },
    "qaoa_maxcut": {
        "id": "qaoa_maxcut",
        "title": "QAOA Portfolio / Max-Cut Optimizer (p=1)",
        "category": "Finance & Optimization",
        "description": (
            "Quantum Approximate Optimization Algorithm layer for graph "
            "partitioning, asset correlation clustering, and portfolio optimization."
        ),
        "n_qubits": 3,
        "recommended_shots": 4096,
        "operations": [
            {"name": "h", "qubits": [0], "params": []},
            {"name": "h", "qubits": [1], "params": []},
            {"name": "h", "qubits": [2], "params": []},
            {"name": "cx", "qubits": [0, 1], "params": []},
            {"name": "rz", "qubits": [1], "params": [0.785398]},
            {"name": "cx", "qubits": [0, 1], "params": []},
            {"name": "cx", "qubits": [1, 2], "params": []},
            {"name": "rz", "qubits": [2], "params": [0.785398]},
            {"name": "cx", "qubits": [1, 2], "params": []},
            {"name": "rx", "qubits": [0], "params": [1.047197]},
            {"name": "rx", "qubits": [1], "params": [1.047197]},
            {"name": "rx", "qubits": [2], "params": [1.047197]},
        ],
    },
}


def list_algorithms() -> list[dict[str, Any]]:
    """Return catalog of available algorithms without circuit bodies."""
    return [
        {
            "id": algo["id"],
            "title": algo["title"],
            "category": algo["category"],
            "description": algo["description"],
            "n_qubits": algo["n_qubits"],
            "recommended_shots": algo["recommended_shots"],
            "gate_count": len(algo["operations"]),
        }
        for algo in ALGORITHM_CATALOG.values()
    ]


def get_algorithm(algorithm_id: str) -> dict[str, Any] | None:
    """Return full algorithm circuit definition by ID."""
    return ALGORITHM_CATALOG.get(algorithm_id)
