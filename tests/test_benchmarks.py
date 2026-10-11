import math
import time
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.quantum.engine import MAX_OPERATIONS, build_circuit

client = TestClient(app)


def test_benchmark_single_qubit_gates():
    gates = ["h", "x", "y", "z", "s", "t", "rx", "ry", "rz"]
    for gate in gates:
        params = [math.pi / 2] if gate in ["rx", "ry", "rz"] else []
        start = time.perf_counter()
        response = client.post(
            "/simulate",
            json={
                "n_qubits": 1,
                "operations": [{"name": gate, "qubits": [0], "params": params}],
                "shots": 512,
                "seed": 42,
            },
        )
        duration = time.perf_counter() - start
        assert response.status_code == 200
        assert sum(response.json()["counts"].values()) == 512
        assert duration < 1.0, f"Gate {gate} simulation was too slow: {duration}s"


def test_benchmark_scaling_qubit_counts():
    for n in [1, 2, 4, 8, 12, 16]:
        operations = [{"name": "h", "qubits": [0], "params": []}]
        for q in range(n - 1):
            operations.append({"name": "cx", "qubits": [q, q + 1], "params": []})

        start = time.perf_counter()
        response = client.post(
            "/simulate",
            json={
                "n_qubits": n,
                "operations": operations,
                "shots": 512,
                "seed": 42,
            },
        )
        duration = time.perf_counter() - start
        assert response.status_code == 200
        data = response.json()
        assert sum(data["counts"].values()) == 512
        assert data["resources"]["qubits"] == n
        assert duration < 3.0, f"{n}-qubit simulation was too slow: {duration}s"


def test_benchmark_shot_counts():
    for shots in [100, 1024, 4096, 10000, 50000]:
        start = time.perf_counter()
        response = client.post(
            "/simulate/bell",
            json={"shots": shots, "seed": 42},
        )
        duration = time.perf_counter() - start
        assert response.status_code == 200
        assert sum(response.json()["counts"].values()) == shots
        assert duration < 3.0, f"{shots} shots simulation was too slow: {duration}s"


def test_benchmark_deep_circuit():
    operations = []
    for _ in range(25):
        operations.append({"name": "h", "qubits": [0], "params": []})
        operations.append({"name": "rz", "qubits": [0], "params": [math.pi / 4]})

    start = time.perf_counter()
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": operations,
            "shots": 1024,
            "seed": 42,
        },
    )
    duration = time.perf_counter() - start
    assert response.status_code == 200
    assert response.json()["resources"]["gate_count"] == 51
    assert duration < 2.0


def test_concurrent_simulation_requests():
    def make_request(index):
        return client.post(
            "/simulate",
            json={
                "n_qubits": 2,
                "operations": [
                    {"name": "h", "qubits": [0], "params": []},
                    {"name": "cx", "qubits": [0, 1], "params": []},
                ],
                "shots": 256,
                "seed": index,
            },
        )

    with ThreadPoolExecutor(max_workers=8) as executor:
        responses = list(executor.map(make_request, range(16)))

    for resp in responses:
        assert resp.status_code == 200
        data = resp.json()
        assert sum(data["counts"].values()) == 256
        assert set(data["counts"].keys()).issubset({"00", "11"})


def test_sequential_repeated_requests():
    for seed in range(20):
        response = client.post(
            "/simulate/bell",
            json={"shots": 128, "seed": seed},
        )
        assert response.status_code == 200
        assert sum(response.json()["counts"].values()) == 128


def test_payload_too_large_rejected():
    response = client.post(
        "/simulate",
        content=b"{}",
        headers={"Content-Length": "2000000", "Content-Type": "application/json"},
    )
    assert response.status_code == 413
    assert "Payload exceeds maximum allowed size" in response.json()["detail"]


def test_operations_count_limit_rejected():
    oversized_ops = [
        {"name": "h", "qubits": [0], "params": []} for _ in range(MAX_OPERATIONS + 1)
    ]
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": oversized_ops,
            "shots": 100,
            "seed": 42,
        },
    )
    assert response.status_code == 422


def test_engine_operations_limit_rejected():
    import pytest

    oversized_ops = [
        {"name": "h", "qubits": [0], "params": []} for _ in range(MAX_OPERATIONS + 1)
    ]
    with pytest.raises(ValueError, match="exceeds maximum limit"):
        build_circuit(1, oversized_ops)


def test_security_headers_present():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "SAMEORIGIN"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "default-src 'self'" in response.headers.get("Content-Security-Policy", "")


def test_simulation_timeout_protection():
    with patch("app.main.SIMULATION_TIMEOUT_SECONDS", 0.00001):
        response = client.post(
            "/simulate/bell",
            json={"shots": 10000, "seed": 42},
        )
        assert response.status_code == 504
        assert "timed out" in response.json()["detail"].lower()
