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
            "operations": [{"name": "x", "qubits": [0], "params": []}],
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
            "operations": [{"name": "unknown", "qubits": [0], "params": []}],
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
            "operations": [{"name": "x", "qubits": [2], "params": []}],
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


def test_duplicate_qubit_in_multi_qubit_gate_rejected():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 2,
            "operations": [{"name": "cx", "qubits": [0, 0], "params": []}],
            "shots": 100,
            "seed": 42,
        },
    )

    assert response.status_code == 400
    assert "duplicate qubit" in response.json()["detail"].lower()


def test_multi_qubit_gate_wrong_qubit_count_rejected():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 3,
            "operations": [{"name": "cx", "qubits": [0], "params": []}],
            "shots": 100,
            "seed": 42,
        },
    )

    assert response.status_code == 400
    assert "requires 2 qubit(s)" in response.json()["detail"]


def test_single_qubit_gate_wrong_qubit_count_rejected():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 2,
            "operations": [{"name": "h", "qubits": [0, 1], "params": []}],
            "shots": 100,
            "seed": 42,
        },
    )

    assert response.status_code == 400
    assert "requires 1 qubit(s)" in response.json()["detail"]


def test_non_rotation_gate_with_parameters_rejected():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": [{"name": "h", "qubits": [0], "params": [1.57]}],
            "shots": 100,
            "seed": 42,
        },
    )

    assert response.status_code == 400
    assert "does not accept parameters" in response.json()["detail"]


def test_rotation_gate_with_non_finite_parameter_rejected():
    response = client.post(
        "/simulate",
        content=(
            b'{"n_qubits": 1, "operations": [{"name": "rx", "qubits": [0], '
            b'"params": [1e999]}], "shots": 100, "seed": 42}'
        ),
        headers={"Content-Type": "application/json"},
    )

    assert response.status_code == 422 or response.status_code == 400


def test_out_of_bounds_qubit_index_rejected():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 2,
            "operations": [{"name": "h", "qubits": [2], "params": []}],
            "shots": 100,
            "seed": 42,
        },
    )
    assert response.status_code == 400
    assert "qubit indices must be between 0 and 1" in response.json()["detail"]


def test_rotation_gate_missing_parameters_rejected():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": [{"name": "rx", "qubits": [0], "params": []}],
            "shots": 100,
            "seed": 42,
        },
    )
    assert response.status_code == 400
    assert "requires exactly one angle" in response.json()["detail"]


def test_rotation_gate_multiple_parameters_rejected():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": [{"name": "rx", "qubits": [0], "params": [1.0, 2.0]}],
            "shots": 100,
            "seed": 42,
        },
    )
    assert response.status_code == 400
    assert "requires exactly one angle" in response.json()["detail"]


def test_rotation_gate_non_numeric_parameter_rejected():
    response = client.post(
        "/simulate",
        json={
            "n_qubits": 1,
            "operations": [{"name": "rx", "qubits": [0], "params": ["invalid"]}],
            "shots": 100,
            "seed": 42,
        },
    )
    assert response.status_code == 422


def test_multi_qubit_gates_duplicate_qubits_rejected():
    for gate in ["cz", "swap"]:
        response = client.post(
            "/simulate",
            json={
                "n_qubits": 2,
                "operations": [{"name": gate, "qubits": [1, 1], "params": []}],
                "shots": 100,
                "seed": 42,
            },
        )
        assert response.status_code == 400
        assert "duplicate qubit" in response.json()["detail"].lower()


def test_openapi_schema_synchronized_with_models():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()

    assert schema["info"]["title"] == "QuantumForge API"
    assert "/simulate" in schema["paths"]
    assert "/simulate/bell" in schema["paths"]
    assert "/circuits/bell" in schema["paths"]
    assert "/health" in schema["paths"]

    components = schema["components"]["schemas"]
    for expected_schema in [
        "CircuitResourcesResponse",
        "SimulationResultResponse",
        "BellCircuitResponse",
        "HealthResponse",
        "RootResponse",
        "CircuitSimulationRequest",
        "SimulationRequest",
        "GateOperation",
    ]:
        assert expected_schema in components


def test_docs_page_is_available():
    response = client.get("/docs")
    assert response.status_code == 200
    assert "swagger" in response.text.lower()


def test_list_algorithms_endpoint():
    response = client.get("/algorithms")
    assert response.status_code == 200
    data = response.json()
    assert "algorithms" in data
    assert len(data["algorithms"]) >= 5
    ids = [a["id"] for a in data["algorithms"]]
    assert "bell" in ids
    assert "teleportation" in ids
    assert "grover_2q" in ids
    assert "vqe_h2" in ids
    assert "qaoa_maxcut" in ids


def test_get_algorithm_by_id_endpoint():
    response = client.get("/algorithms/grover_2q")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "grover_2q"
    assert data["n_qubits"] == 2
    assert len(data["operations"]) > 0

    # 404 for unknown algorithm
    resp_404 = client.get("/algorithms/unknown_algorithm_xyz")
    assert resp_404.status_code == 404
    assert "not found" in resp_404.json()["detail"].lower()
