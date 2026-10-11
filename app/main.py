
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.quantum.engine import (
    MAX_QUBITS,
    build_circuit,
    create_bell_circuit,
    analyze_circuit,
    simulate_circuit,
)


app = FastAPI(
    title="QuantumForge API",
    description=(
        "Quantum circuit simulation, visualization, "
        "testing, and resource analysis."
    ),
    version="0.3.0",
)

DASHBOARD_FILE = (
    Path(__file__).resolve().parent
    / "static"
    / "index.html"
)


# --------------------------------------------------
# Request Models
# --------------------------------------------------

class SimulationRequest(BaseModel):
    shots: int = Field(default=1024, ge=1, le=100000)
    seed: int = Field(default=42, ge=0)


class GateOperation(BaseModel):
    name: str
    qubits: list[int]
    params: list[float] = Field(default_factory=list)


class CircuitSimulationRequest(BaseModel):
    n_qubits: int = Field(ge=1, le=MAX_QUBITS)
    operations: list[GateOperation] = Field(default_factory=list)
    shots: int = Field(default=1024, ge=1, le=100000)
    seed: int = Field(default=42, ge=0)


# --------------------------------------------------
# Dashboard
# --------------------------------------------------

@app.get("/dashboard", include_in_schema=False)
def dashboard():
    if not DASHBOARD_FILE.is_file():
        raise HTTPException(
            status_code=500,
            detail="Dashboard file not found.",
        )

    return FileResponse(
        DASHBOARD_FILE,
        media_type="text/html",
    )


# --------------------------------------------------
# Root and Health
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "name": "QuantumForge",
        "description": "Quantum Software Engineering Platform",
        "version": "0.3.0",
        "status": "running",
        "dashboard": "/dashboard",
        "docs": "/docs",
        "endpoints": [
            "/",
            "/health",
            "/circuits/bell",
            "/simulate/bell",
            "/simulate",
        ],
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "QuantumForge",
    }


# --------------------------------------------------
# Bell Circuit
# --------------------------------------------------

@app.get("/circuits/bell")
def bell_circuit():
    circuit = create_bell_circuit()

    return {
        "name": "Bell State",
        "circuit": circuit.draw(output="text").single_string(),
        "resources": analyze_circuit(circuit),
    }


@app.post("/simulate/bell")
def simulate_bell(request: SimulationRequest):
    try:
        return {
            "name": "Bell State",
            **simulate_circuit(
                create_bell_circuit(),
                shots=request.shots,
                seed=request.seed,
            ),
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc


# --------------------------------------------------
# General-Purpose Circuit Simulation
# --------------------------------------------------

@app.post("/simulate")
def simulate_general_circuit(
    request: CircuitSimulationRequest,
):
    try:
        circuit = build_circuit(
            n_qubits=request.n_qubits,
            operations=[
                operation.model_dump()
                for operation in request.operations
            ],
        )

        return {
            "name": "Custom Quantum Circuit",
            **simulate_circuit(
                circuit,
                shots=request.shots,
                seed=request.seed,
            ),
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
