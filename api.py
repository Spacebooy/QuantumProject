import time
import math
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from Main import QuantumCircuit, shor
from database import init_db, get_db
from models import User, SimulationUsage
from auth import router as auth_router, get_current_user_optional


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    try:
        init_db()
        print("Database initialized successfully.")
    except Exception as e:
        raise RuntimeError("Database initialization failed") from e
    yield


app = FastAPI(lifespan=lifespan)

# Allow requests from Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Authentication Routes
app.include_router(auth_router)


class ShorRequest(BaseModel):
    N: int
    num_counting_qubits: Optional[int] = None


class Operation(BaseModel):
    gate: str
    target: Optional[int] = None
    control: Optional[int] = None
    theta: Optional[float] = None


class CircuitRequest(BaseModel):
    num_qubits: int
    mode: str
    operations: List[Operation]


@app.get("/")
def root():
    return {
        "message": "Quantum simulator API is running",
        "features": {
            "user_auth": True,
            "max_guest_qubits": 2,
            "max_student_qubits": 15,
            "auth_methods": ["email_password"]
        }
    }


@app.post("/simulate")
def simulate_circuit(
    request: CircuitRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    # Enforce access control: only registered users can create/simulate circuits with > 2 qubits
    if request.num_qubits > 2 and current_user is None:
        raise HTTPException(
            status_code=403,
            detail="Creating or simulating circuits with more than 2 qubits is restricted to registered students. Please sign in or register to unlock up to 15 qubits."
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

    start_time = time.perf_counter()

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
    exec_time_ms = (time.perf_counter() - start_time) * 1000.0

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

    # Record simulation usage in Postgres
    try:
        usage = SimulationUsage(
            user_id=current_user.id if current_user else None,
            sim_type="circuit",
            num_qubits=request.num_qubits,
            gate_count=len(request.operations),
            mode=request.mode,
            operations_summary=[op.model_dump() for op in request.operations],
            execution_time_ms=round(exec_time_ms, 2)
        )
        db.add(usage)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Warning: Failed to log simulation usage: {e}")

    return {
        "num_qubits": request.num_qubits,
        "mode": request.mode,
        "probabilities": probabilities.tolist(),
        "states": states,
        "amplitudes": amplitudes,
        "measurements": measurements,
        "execution_time_ms": round(exec_time_ms, 2)
    }


@app.post("/shor")
def run_shor(
    request: ShorRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if request.N <= 1:
        raise HTTPException(status_code=400, detail="N must be greater than 1")
    num_counting = request.num_counting_qubits if request.num_counting_qubits is not None else 2 * math.ceil(math.log2(request.N))
    if num_counting < 1 or num_counting + math.ceil(math.log2(request.N)) > 20:
        raise HTTPException(status_code=400, detail="Counting qubits must be positive and total qubits cannot exceed 20")
    if num_counting > 2 and current_user is None:
        raise HTTPException(
            status_code=403,
            detail="Running Shor's algorithm with more than 2 counting qubits is restricted to registered students. Please sign in or register."
        )

    start_time = time.perf_counter()
    try:
        result = shor(
            N=request.N,
            num_counting_qubits=request.num_counting_qubits
        )
        exec_time_ms = (time.perf_counter() - start_time) * 1000.0

        # Record simulation usage
        try:
            usage = SimulationUsage(
                user_id=current_user.id if current_user else None,
                sim_type="shor",
                num_qubits=num_counting,
                gate_count=0,
                mode="ideal",
                operations_summary={"N": request.N, "num_counting_qubits": request.num_counting_qubits},
                execution_time_ms=round(exec_time_ms, 2)
            )
            db.add(usage)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Warning: Failed to log shor simulation usage: {e}")

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )