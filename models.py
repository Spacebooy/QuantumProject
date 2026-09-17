from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)
    auth_provider = Column(String(50), default="local", nullable=False)
    provider_user_id = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    login_logs = relationship("LoginLog", back_populates="user", cascade="all, delete-orphan")
    simulation_usages = relationship("SimulationUsage", back_populates="user")


class LoginLog(Base):
    __tablename__ = "login_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    auth_provider = Column(String(50), nullable=False)
    ip_address = Column(String(100), nullable=True)
    user_agent = Column(String(500), nullable=True)
    status = Column(String(20), default="success", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="login_logs")


class SimulationUsage(Base):
    __tablename__ = "simulation_usage"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    sim_type = Column(String(50), default="circuit", nullable=False)
    num_qubits = Column(Integer, nullable=False)
    gate_count = Column(Integer, default=0, nullable=False)
    mode = Column(String(20), default="ideal", nullable=False)
    operations_summary = Column(JSON, nullable=True)
    execution_time_ms = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="simulation_usages")

