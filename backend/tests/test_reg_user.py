# tests/test_reg_user.py

# tests/test_users.py
import pytest
from httpx import AsyncClient
from fastapi import status
from app.main import app
from app.db.session import get_session
from sqlalchemy.orm import Session

@pytest.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture
def session():
    # Setup your test database session here
    return get_session()

@pytest.mark.asyncio
async def test_get_user_preferences(async_client: AsyncClient, session: Session):
    # Register and login to get an access token
    register_response = await async_client.post("/api/v1/auth/register", json={
        "username": "testuser",
        "password": "testpass",
        "email": "test@example.com"
    })
    access_token = register_response.json()["data"]["token"]["accessToken"]

    # Get user preferences
    response = await async_client.get("/api/v1/users/testuser/preferences/", headers={
        "Authorization": f"Bearer {access_token}"
    })
    assert response.status_code == status.HTTP_200_OK
    assert "data" in response.json()

@pytest.mark.asyncio
async def test_update_user_preferences(async_client: AsyncClient, session: Session):
    # Register and login to get an access token
    register_response = await async_client.post("/api/v1/auth/register", json={
        "username": "testuser",
        "password": "testpass",
        "email": "test@example.com"
    })
    access_token = register_response.json()["data"]["token"]["accessToken"]

    # Update user preferences
    response = await async_client.put("/api/v1/users/testuser/preferences/", json={
        "language": "en",
        "currency": "USD"
    }, headers={
        "Authorization": f"Bearer {access_token}"
    })
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "User settings updated successfully"