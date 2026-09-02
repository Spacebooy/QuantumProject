from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from Main import QuantumCircuit
from Main import QuantumCircuit, shor


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ShorRequest(BaseModel):
    N: int
    num_counting_qubits: int | None = None

class Operation(BaseModel):
    gate: str
    target: Optional[int] = None
    control: Optional[int] = None
    theta: Optional[float] = None


class CircuitRequest(BaseModel):
    num_qubits: int
    mode: str
    operations: List[Operation]


@app.post("/shor")
def run_shor(request: ShorRequest):
    try:
        return shor(
            N=request.N,
            num_counting_qubits=request.num_counting_qubits
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@app.get("/")
def root():
    return {
        "message": "Quantum simulator API is running"
    }


@app.post("/simulate")
def simulate_circuit(request: CircuitRequest):

    circuit = QuantumCircuit(
        request.num_qubits,
        request.mode
    )

    for operation in request.operations:

        gate = operation.gate.upper()

        if operation.target is not None:
            if operation.target < 0 or operation.target >= request.num_qubits:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid target qubit: {operation.target}"
                )

        if request.num_qubits < 1 or request.num_qubits > 15:
            raise HTTPException(
                status_code=400,
                detail="num_qubits must be between 1 and 15"
            )

        if request.mode not in ["ideal", "noisy"]:
            raise HTTPException(
                status_code=400,
                detail="mode must be 'ideal' or 'noisy'"
            )

        if gate == "H":
            circuit.h(operation.target)

        elif gate == "X":
            circuit.x(operation.target)

        elif gate == "Y":
            circuit.y(operation.target)

        elif gate == "Z":
            circuit.z(operation.target)

        elif gate == "S":
            circuit.s(operation.target)

        elif gate == "T":
            circuit.t(operation.target)

        elif gate == "CNOT":

            if operation.control is None:
                raise HTTPException(
                    status_code=400,
                    detail="CNOT requires a control qubit"
                )

            if operation.target is None:
                raise HTTPException(
                    status_code=400,
                    detail="CNOT requires a target qubit"
                )

            if operation.control == operation.target:
                raise HTTPException(
                    status_code=400,
                    detail="CNOT control and target must be different"
                )

            if operation.control < 0 or operation.control >= request.num_qubits:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid control qubit: {operation.control}"
                )

            circuit.cnot(
                operation.control,
                operation.target
            )

        elif gate == "RX":

            if operation.theta is None:
                raise HTTPException(
                    status_code=400,
                    detail="RX requires theta"
                )

            circuit.rx(
                operation.target,
                operation.theta
            )

        elif gate == "RY":

            if operation.theta is None:
                raise HTTPException(
                    status_code=400,
                    detail="RY requires theta"
                )

            circuit.ry(
                operation.target,
                operation.theta
            )

        elif gate == "RZ":

            if operation.theta is None:
                raise HTTPException(
                    status_code=400,
                    detail="RZ requires theta"
                )

            circuit.rz(
                operation.target,
                operation.theta
            )

        elif gate == "MEASURE":
            circuit.measure(operation.target)

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown gate: {operation.gate}"
            )

    state, measurements = circuit.action()

    probabilities = state.Pcalc()
    states = {}

    for i, probability in enumerate(probabilities):
        basis = format(i, f"0{request.num_qubits}b")
        states[basis] = float(probability)

    amplitudes = {}

    for i, amplitude in enumerate(state.state):
        basis = format(i, f"0{request.num_qubits}b")

        amplitudes[basis] = {
            "real": float(amplitude.real),
            "imag": float(amplitude.imag)
        }

    return {
        "num_qubits": request.num_qubits,
        "mode": request.mode,
        "probabilities": probabilities.tolist(),
        "states": states,
        "amplitudes": amplitudes,
        "measurements": measurements
    }

    return {
        "num_qubits": request.num_qubits,
        "mode": request.mode,
        "probabilities": probabilities.tolist(),
        "measurements": measurements
    }