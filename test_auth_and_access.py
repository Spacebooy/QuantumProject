"""Integration coverage uses isolated SQLite databases, never development accounts."""
import os
os.environ.setdefault('JWT_SECRET', 'integration-tests-only-secret-at-least-32-characters')

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from api import app
from database import Base, get_db
from models import User, LoginLog

@pytest.fixture
def client():
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine)
    def session():
        with factory() as db:
            yield db
    app.dependency_overrides[get_db] = session
    # Tables are created above; avoid invoking the real database lifespan.
    with TestClient(app) as c:
        yield c, factory
    app.dependency_overrides.clear()
    engine.dispose()

@pytest.fixture(autouse=True)
def isolated_startup(monkeypatch):
    monkeypatch.setattr('api.init_db', lambda: None)

def register(c, email='student@example.com'):
    result = c.post('/auth/register', json={'email':email,'password':'valid-password','full_name':'Test Student'})
    assert result.status_code == 200, result.text
    return {'Authorization': 'Bearer '+result.json()['access_token']}

def test_accounts_access_and_history(client):
    c, factory = client
    headers = register(c)
    assert c.post('/auth/register', json={'email':'student@example.com','password':'valid-password','full_name':'Duplicate'}).status_code == 400
    assert c.post('/auth/login', json={'email':'student@example.com','password':'wrong'}).status_code == 401
    login = c.post('/auth/login', json={'email':'student@example.com','password':'valid-password'})
    assert login.status_code == 200
    assert c.get('/auth/me', headers=headers).json()['email'] == 'student@example.com'
    assert c.get('/auth/me', headers={'Authorization':'Bearer invalid'}).status_code == 401
    for qubits in [1,2,3,4]:
        payload = {'num_qubits':qubits,'mode':'ideal','operations':[{'gate':'H','target':0}]}
        assert c.post('/simulate', json=payload).status_code == (200 if qubits <= 2 else 403)
        result = c.post('/simulate', json=payload, headers=headers)
        assert result.status_code == 200, result.text
        assert sum(result.json()['probabilities']) == pytest.approx(1)
    for count in [None,3]:
        payload = {'N':15,'num_counting_qubits':count}
        assert c.post('/shor',json=payload).status_code == 403
        assert c.post('/shor',json=payload,headers=headers).status_code == 200
    usage = c.get('/auth/usage',headers=headers).json()
    assert usage['total_simulations'] == 6
    assert any(x['sim_type']=='shor' and x['num_qubits']==8 for x in usage['simulations'])
    other = register(c, 'other@example.com')
    assert c.get('/auth/usage',headers=other).json()['total_simulations'] == 0
    assert c.get('/auth/usage').status_code == 401
    with factory() as db:
        assert len(db.scalars(select(LoginLog)).all()) == 4
        user = db.scalar(select(User).where(User.email=='student@example.com'))
        user.is_active = False
        db.commit()
    assert c.get('/auth/me',headers=headers).status_code == 401
    assert c.post('/auth/login',json={'email':'student@example.com','password':'valid-password'}).status_code == 401

@pytest.mark.parametrize('qubits,mode', [(0,'ideal'),(16,'ideal'),(2,'bad')])
def test_empty_circuit_validation(client, qubits, mode):
    c, _ = client
    headers = register(c)
    assert c.post('/simulate',headers=headers,json={'num_qubits':qubits,'mode':mode,'operations':[]}).status_code == 400

@pytest.mark.parametrize('n,count', [(1,None),(15,0),(15,-1),(15,30)])
def test_shor_bounds(client,n,count):
    c, _ = client
    assert c.post('/shor',json={'N':n,'num_counting_qubits':count}).status_code == 400

def test_password_byte_limit(client):
    c, _ = client
    assert c.post('/auth/register',json={'email':'long@example.com','password':'é'*37,'full_name':'Test'}).status_code == 400
