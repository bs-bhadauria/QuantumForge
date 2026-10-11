import math

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.quantum.engine import build_circuit, analyze_circuit


client = TestClient(app)


@pytest.mark.parametrize(
    ("gate", "angle", "expected"),
    [
        ("rx", math.pi, "1"),
        ("ry", math.pi, "1"),
        ("rz", math.pi, "0"),
    ],
)
def test_rotation_gate_measurement(gate, angle, expected):
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": [
                {
                    "name": gate,
                    "qubits": [0],
                    "params": [angle],
                }
            ],
            "shots": 128,
            "seed": 42,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert sum(data["counts"].values()) == 128
    assert data["counts"] == {expected: 128}
    assert data["resources"]["qubits"] == 1
    assert data["resources"]["operations"][gate] == 1


@pytest.mark.parametrize("gate", ["rx", "ry"])
def test_half_turn_probability_distribution(gate):
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": [
                {
                    "name": gate,
                    "qubits": [0],
                    "params": [math.pi / 2],
                }
            ],
            "shots": 2048,
            "seed": 42,
        },
    )

    assert response.status_code == 200
    data = response.json()
    counts = data["counts"]

    assert sum(counts.values()) == 2048
    assert set(counts).issubset({"0", "1"})
    assert counts.get("0", 0) > 0
    assert counts.get("1", 0) > 0

    probability_one = data["probabilities"]["1"]
    assert abs(probability_one - 0.5) < 0.08


@pytest.mark.parametrize("gate", ["rx", "ry", "rz"])
@pytest.mark.parametrize("params", [[], [0.1, 0.2]])
def test_rotation_gate_rejects_invalid_parameter_count(gate, params):
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": [
                {
                    "name": gate,
                    "qubits": [0],
                    "params": params,
                }
            ],
            "shots": 128,
            "seed": 42,
        },
    )

    assert response.status_code == 400


@pytest.mark.parametrize(
    ("gate", "angle"),
    [
        ("rx", math.pi / 3),
        ("ry", math.pi / 4),
        ("rz", math.pi / 2),
    ],
)
def test_rotation_gate_circuit_resources(gate, angle):
    circuit = build_circuit(
        n_qubits=1,
        operations=[
            {
                "name": gate,
                "qubits": [0],
                "params": [angle],
            }
        ],
    )

    metrics = analyze_circuit(circuit)

    assert metrics["qubits"] == 1
    assert metrics["classical_bits"] == 1
    assert metrics["gate_count"] == 2
    assert metrics["depth"] >= 1
    assert metrics["operations"][gate] == 1
    assert metrics["operations"]["measure"] == 1
