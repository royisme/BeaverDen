from pydantic import BaseModel, Field
from typing import Optional, TypeVar, Generic
from datetime import datetime
from app.models.enums import Language, Currency, Theme



DataT = TypeVar('DataT')

class BaseResponse(BaseModel, Generic[DataT]):
    status: int = 200
    message: str = "OK"
    data: Optional[DataT] = None
class UserPreferences(BaseModel):
    language: Language
    currency: Currency
    theme: Theme



class DeviceInfo(BaseModel):
    deviceId: str = Field(..., description="Unique identifier for the device")
    deviceName: str = Field(..., description="Name of the device")
    os: str = Field(..., description="Operating system of the device")
    model: Optional[str] = Field(None, description="Device model")
    deviceType: Optional[str] = Field(None, description="Device type")
    manufacturer: Optional[str] = Field(None, description="Device manufacturer")
    ip: Optional[str] = Field(None, description="IP address of the device")

    class Config:
        # This allows converting from snake_case to camelCase
        alias_generator = None
        populate_by_name = True
class RegisterRequest(BaseModel):
    username: str = Field(..., description="Username for registration")
    password: str = Field(..., description="Password for registration")
    email: str = Field(..., description="Email address for registration")
    preferences: UserPreferences = Field(..., description="User preferences")
    deviceInfo: DeviceInfo = Field(..., description="Device information")
class LoginRequest(BaseModel):
    username: str = Field(..., description="Username for login")
    password: str = Field(..., description="Password for login")
    deviceInfo: DeviceInfo = Field(..., description="Device information")

class TokenResponse(BaseModel):
    accessToken: str = Field(..., description="Access token")
    refreshToken: str = Field(..., description="Refresh token")
    expiresAt: datetime = Field(..., description="Access token expiration time")

class UserResponse(BaseModel):
    id: str = Field(..., description="User ID")
    username: str = Field(..., description="Username")
    email: Optional[str] = Field(None, description="User's email address")
    # 其它根据实际情况补充

class LoginResponse(BaseModel):
    user: UserResponse = Field(..., description="User information")
    token: TokenResponse = Field(..., description="Authentication token")


class UserSettingsResponse(BaseModel):
    language: str = Field(..., description="Language")
    currency: str = Field(..., description="Currency")
    theme: str = Field(..., description="Theme")
    login_expire_days: int = Field(..., description="Login expire days")
    require_password_on_launch: bool = Field(..., description="Require password on launch")
    notification_enabled: bool = Field(..., description="Notification enabled")

class UpdateUserSettingsRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    language: str = Field(..., description="Language")
    currency: str = Field(..., description="Currency")
    theme: str = Field(..., description="Theme")
    login_expire_days: int = Field(..., description="Login expire days")
    require_password_on_launch: bool = Field(..., description="Require password on launch")
    notification_enabled: bool = Field(..., description="Notification enabled")

class InitializeUserRequest(BaseModel):
    deviceInfo: DeviceInfo
    preferences: UserPreferences

    class Config:
        alias_generator = None
        populate_by_name = True

class SessionVerification(BaseModel):
    userId: str
    deviceId: str
    token: str

    class Config:
        alias_generator = None
        populate_by_name = True

class SystemHealthStatus(BaseModel):
    """system health status"""
    status: str = Field(..., description="system health status", example="healthy")
    version: str = Field(..., description="system version", example="1.0.0")
    mode: str = Field(..., description="system mode", example="production")
    timestamp: datetime = Field(default_factory=datetime.now, description="check time")

class DatabaseStatus(BaseModel):
    """database status"""
    isConnected: bool = Field(..., description="database connection status")
    isInitialized: bool = Field(..., description="database initialization status")
    migrationCompleted: bool = Field(..., description="database migration status")
    version: Optional[str] = Field(None, description="database version")

class SystemInitStatus(BaseModel):
    """system initialization status"""
    isSystemReady: bool = Field(..., description="system ready status")
    backendStatus: SystemHealthStatus
    databaseStatus: DatabaseStatus
    error: Optional[str] = Field(None, description="error message")