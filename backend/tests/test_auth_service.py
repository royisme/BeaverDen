# tests/test_auth_service.py
import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import Session
from app.services.auth_service import AuthService
from app.models.user import User,UserSession
from app.api.v1.endpoints.api_models import RegisterRequest,LoginRequest,DeviceInfo
from app.core.auth_jwt import AuthJWT
from app.models.enums import Theme,Currency
@pytest.fixture
def mock_session():
    return MagicMock(spec=Session)

@pytest.fixture
def auth_service(mock_session):
    return AuthService(session=mock_session)

@pytest.fixture
def mock_authorize():
    mock = MagicMock(spec=AuthJWT)
    mock.create_access_token.return_value = "access_token"
    mock.create_refresh_token.return_value = "refresh_token"
    mock.get_access_token_expires.return_value = "expires_at"
    return mock

def test_register_user(auth_service, mock_session, mock_authorize):

    # Create mock user
    mock_user = MagicMock(spec=User)
    mock_user.username = "testuser"
    mock_user.id = 1
    mock_user.verify_password.return_value = True

    # Create mock user session
    mock_user_session = MagicMock(spec=UserSession)

    # Create separate query chains for User and UserSession
    user_query_chain = MagicMock()
    user_query_chain.filter_by.return_value.first.return_value = mock_user

    session_query_chain = MagicMock()
    session_query_chain.filter_by.return_value.first.return_value = mock_user_session

    # Configure mock_session to return different query chains based on the model
    def query_side_effect(model):
        if model == User:
            return user_query_chain
        if model == UserSession:
            return session_query_chain
        return None

    mock_session.query.side_effect = query_side_effect

    user_data = RegisterRequest(
        username="testuser",
        password="testpass",
        email="test@example.com",
        preferences= {
            "language": "en",
            "theme":Theme.FRESH,
            "currency":Currency.USD
        },
        deviceInfo=DeviceInfo(
            deviceId="device_id",
            deviceName="device_name",
            deviceType="device_type",
            os="os",
            model="model",
            manufacturer="manufacturer",
            ip="ip"
        )
    )
    auth_service  = AuthService(session=mock_session)
    user, access_token, refresh_token, expires_at = auth_service.register_user(user_data, mock_authorize)
    print("user: %s", user)
    print("access_token: %s", access_token)
    print("refresh_token: %s", refresh_token)
    print("expires_at: %s", expires_at)
    # Assertions
    assert user.username == "testuser"
    assert access_token is not None
    assert refresh_token is not None
    assert expires_at is not None
    mock_session.commit.assert_called_once()

def test_authenticate_user(auth_service, mock_session, mock_authorize):
    # Setup mock user
    mock_user = User(username="testuser")
    mock_user.verify_password = MagicMock(return_value=True)
    mock_session.query().filter_by().first.return_value = mock_user

    login_request = LoginRequest(
        username="testuser",
        password="testpass",
        deviceInfo= DeviceInfo(
            deviceId="device_id",
            deviceName="device_name",
            deviceType="device_type",
            os="os",
            model="model",
            manufacturer="manufacturer",
            ip="ip"
        )
    )
    auth_service  = AuthService(session=mock_session)
    user, token, expires_at = auth_service.authenticate_user(login_request, mock_authorize)

    # Assertions
    assert user.username == "testuser"
    assert token == "access_token"
    assert expires_at == "expires_at"
    mock_session.commit.assert_called_once()