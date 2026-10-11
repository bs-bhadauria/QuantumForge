from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["name"] == "QuantumForge"


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_dashboard_endpoint():
    response = client.get("/dashboard")

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "QuantumForge" in response.text
    assert "downloadReportButton" in response.text


def test_bell_circuit_endpoint():
    response = client.get("/circuits/bell")

    assert response.status_code == 200

    data = response.json()
    assert data["resources"]["qubits"] == 2
    assert data["resources"]["classical_bits"] == 2


def test_bell_simulation_endpoint():
    response = client.post(
        "/simulate/bell",
        json={"shots": 256, "seed": 42},
    )

    assert response.status_code == 200

    data = response.json()
    assert data["shots"] == 256
    assert sum(data["counts"].values()) == 256
    assert set(data["counts"]).issubset({"00", "11"})


def test_custom_x_gate_endpoint():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": [
                {"name": "x", "qubits": [0], "params": []}
            ],
            "shots": 256,
            "seed": 42,
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["counts"] == {"1": 256}
    assert data["probabilities"] == {"1": 1.0}
    assert data["resources"]["qubits"] == 1


def test_custom_bell_state_endpoint():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 2,
            "operations": [
                {"name": "h", "qubits": [0], "params": []},
                {"name": "cx", "qubits": [0, 1], "params": []},
            ],
            "shots": 1024,
            "seed": 42,
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert sum(data["counts"].values()) == 1024
    assert set(data["counts"]).issubset({"00", "11"})
    assert data["resources"]["qubits"] == 2


def test_custom_ghz_state_endpoint():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 3,
            "operations": [
                {"name": "h", "qubits": [0], "params": []},
                {"name": "cx", "qubits": [0, 1], "params": []},
                {"name": "cx", "qubits": [1, 2], "params": []},
            ],
            "shots": 1024,
            "seed": 42,
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert sum(data["counts"].values()) == 1024
    assert set(data["counts"]).issubset({"000", "111"})
    assert data["resources"]["qubits"] == 3


def test_empty_circuit_returns_zero_state():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": [],
            "shots": 128,
            "seed": 42,
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert data["counts"] == {"0": 128}
    assert data["probabilities"] == {"0": 1.0}


def test_invalid_gate_returns_error():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": [
                {"name": "unknown", "qubits": [0], "params": []}
            ],
            "shots": 100,
            "seed": 42,
        },
    )

    assert response.status_code == 400
    assert "unsupported gate" in response.json()["detail"].lower()


def test_invalid_qubit_returns_error():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 2,
            "operations": [
                {"name": "x", "qubits": [2], "params": []}
            ],
            "shots": 100,
            "seed": 42,
        },
    )

    assert response.status_code == 400


def test_invalid_shots_rejected():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": [],
            "shots": 0,
            "seed": 42,
        },
    )

    assert response.status_code == 422


def test_negative_seed_rejected():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": [],
            "shots": 100,
            "seed": -1,
        },
    )

    assert response.status_code == 422


def test_missing_required_qubit_count_rejected():
    response = client.post(
        "/simulate",
        json={
            "operations": [],
            "shots": 100,
            "seed": 42,
        },
    )

    assert response.status_code == 422
