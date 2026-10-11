from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

PRESETS = {
    "bell": {
        "n_qubits": 2,
        "operations": [
            {"name": "h", "qubits": [0], "params": []},
            {"name": "cx", "qubits": [0, 1], "params": []},
        ],
        "allowed": {"00", "11"},
    },
    "x": {
        "n_qubits": 1,
        "operations": [
            {"name": "x", "qubits": [0], "params": []},
        ],
        "allowed": {"1"},
    },
    "h": {
        "n_qubits": 1,
        "operations": [
            {"name": "h", "qubits": [0], "params": []},
        ],
        "allowed": {"0", "1"},
    },
    "ghz": {
        "n_qubits": 3,
        "operations": [
            {"name": "h", "qubits": [0], "params": []},
            {"name": "cx", "qubits": [0, 1], "params": []},
            {"name": "cx", "qubits": [1, 2], "params": []},
        ],
        "allowed": {"000", "111"},
    },
}


def test_dashboard_is_served():
    response = client.get("/dashboard")
    assert response.status_code == 200
    assert "QuantumForge" in response.text


def test_all_four_presets_simulate_correctly():
    for name, preset in PRESETS.items():
        response = client.post(
            "/simulate",
            json={
                "n_qubits": preset["n_qubits"],
                "operations": preset["operations"],
                "shots": 256,
                "seed": 42,
            },
        )

        assert response.status_code == 200, (
            f"{name}: {response.status_code} {response.text}"
        )

        data = response.json()
        assert data["shots"] == 256
        assert sum(data["counts"].values()) == 256
        assert set(data["counts"]).issubset(preset["allowed"])
        assert data["resources"]["qubits"] == preset["n_qubits"]
        assert data["resources"]["classical_bits"] == preset["n_qubits"]
        assert data["resources"]["depth"] >= 0
        assert data["resources"]["gate_count"] > 0
        assert abs(sum(data["probabilities"].values()) - 1.0) < 1e-9


def test_invalid_qubit_count_is_rejected():
    response = client.post(
        "/simulate",
        json={"n_qubits": 17, "operations": [], "shots": 10, "seed": 42},
    )
    assert response.status_code == 422


def test_invalid_gate_is_rejected():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": [
                {"name": "not_a_gate", "qubits": [0], "params": []}
            ],
            "shots": 10,
            "seed": 42,
        },
    )
    assert response.status_code == 400


def test_dashboard_contains_required_workspace_features():
    html = (
        Path(__file__).resolve().parents[1]
        / "app" / "static" / "index.html"
    ).read_text(encoding="utf-8")

    for expected in (
        'value="bell"',
        'value="x"',
        'value="h"',
        'value="ghz"',
        'id="circuitDiagram"',
        'id="histogram"',
        'id="downloadReportButton"',
        'id="copyResultButton"',
        'fetch("/simulate"',
        "quantumforge-report-",
        "definition.n_qubits > 16",
    ):
        assert expected in html, f"Dashboard feature missing: {expected}"


def test_health_endpoint_remains_available():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
