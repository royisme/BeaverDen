from pydantic import BaseModel, Field
from typing import Optional, TypeVar, Generic, List, Dict, Any
from datetime import datetime
from app.models.enums import (
    Language, Currency, Theme, FinanceBankName, 
    FinanceAccountType, FinanceAccountCardType, FinanceAccountStatus, 
    TransactionType, TransactionStatus, RecurringPeriod, 
    ImportSource, TransactionDirection, BankStatementFormat
)

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

class UserPreferencesResponse(BaseModel):
    language: str = Field(..., description="Language")
    currency: str = Field(..., description="Currency")
    theme: str = Field(..., description="Theme")
    login_expire_days: int = Field(..., description="Login expire days")
    require_password_on_launch: bool = Field(..., description="Require password on launch")
    notification_enabled: bool = Field(..., description="Notification enabled")

class UpdateUserPreferencesRequest(BaseModel):
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

class FinanceAccountCreate(BaseModel):
    account_name: str
    bank_name: FinanceBankName
    account_type: FinanceAccountType
    currency: Currency
    balance: float
    card_type: Optional[FinanceAccountCardType] = None
    account_number: Optional[str] = None
    status: Optional[FinanceAccountStatus] = FinanceAccountStatus.ACTIVE

class FinanceAccountUpdate(BaseModel):
    account_name: Optional[str] = None
    bank_name: Optional[FinanceBankName] = None
    account_type: Optional[FinanceAccountType] = None
    currency: Optional[Currency] = None
    balance: Optional[float] = None
    card_type: Optional[FinanceAccountCardType] = None
    account_number: Optional[str] = None
    status: Optional[FinanceAccountStatus] = None

# Transaction Models
class TransactionBase(BaseModel):
    transaction_date: datetime = Field(..., description="交易日期")
    posted_date: Optional[datetime] = Field(None, description="过账日期")
    amount: float = Field(..., description="交易金额")
    currency: Currency = Field(..., description="交易货币")
    type: TransactionType = Field(..., description="交易类型")
    category_id: Optional[str] = Field(None, description="交易类别ID")
    merchant: Optional[str] = Field(None, description="商家名称")
    description: str = Field(..., description="交易描述")
    notes: Optional[str] = Field(None, description="备注")
    tags: Optional[List[str]] = Field(None, description="标签")
    status: TransactionStatus = Field(TransactionStatus.PENDING, description="交易状态")

class TransactionCreate(TransactionBase):
    account_id: str = Field(..., description="账户ID")
    linked_account_id: Optional[str] = Field(None, description="关联账户ID（转账时使用）")
    metadata: Optional[Dict[str, Any]] = Field(None, description="元数据")

class TransactionUpdate(BaseModel):
    transaction_date: Optional[datetime] = None
    posted_date: Optional[datetime] = None
    amount: Optional[float] = None
    currency: Optional[Currency] = None
    type: Optional[TransactionType] = None
    category_id: Optional[str] = None
    merchant: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[TransactionStatus] = None
    linked_account_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class TransactionResponse(TransactionBase):
    id: str
    account_id: str
    linked_account_id: Optional[str] = None
    linked_transaction_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TransactionFilter(BaseModel):
    account_id: Optional[str] = Field(None, description="账户ID")
    linked_account_id: Optional[str] = Field(None, description="关联账户ID")
    category_id: Optional[str] = Field(None, description="交易类别ID")
    start_date: Optional[datetime] = Field(None, description="开始日期")
    end_date: Optional[datetime] = Field(None, description="结束日期")
    type: Optional[TransactionType] = Field(None, description="交易类型")
    status: Optional[TransactionStatus] = Field(None, description="交易状态")
    min_amount: Optional[float] = Field(None, description="最小金额")
    max_amount: Optional[float] = Field(None, description="最大金额")
    merchant: Optional[str] = Field(None, description="商家名称")
    tags: Optional[List[str]] = Field(None, description="标签")
    search_term: Optional[str] = Field(None, description="搜索关键词")
    skip: int = Field(0, description="跳过记录数")
    limit: int = Field(50, description="返回记录数")

# Category Models
class CategoryBase(BaseModel):
    name: str
    parent_id: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: str
    user_id: str
    is_system: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Recurring Rule Models
class RecurringRuleBase(BaseModel):
    name: str
    account_id: str
    amount: float
    type: TransactionType
    category_id: Optional[str] = None
    period: RecurringPeriod
    start_date: datetime
    end_date: Optional[datetime] = None
    merchant: Optional[str] = None
    description: Optional[str] = None

class RecurringRuleCreate(RecurringRuleBase):
    pass

class RecurringRuleUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[TransactionType] = None
    category_id: Optional[str] = None
    period: Optional[RecurringPeriod] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    merchant: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class RecurringRuleResponse(RecurringRuleBase):
    id: str
    last_generated: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Import Models
class ProcessedTransactionData(BaseModel):
    """处理后的交易数据"""
    transaction_date: datetime
    posted_date: Optional[datetime] = None
    amount: float
    currency: Currency
    type: TransactionType
    category_id: str
    merchant: Optional[str] = None
    description: str
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class RawTransactionResponse(BaseModel):
    """原始交易记录响应"""
    id: str
    row_number: int
    raw_data: Dict[str, Any]
    processed_data: Optional[ProcessedTransactionData] = None
    status: str  # pending, processed, error, skipped
    error_message: Optional[str] = None
    transaction_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ImportBatchResponse(BaseModel):
    """导入批次响应"""
    id: str
    user_id: str
    account_id: str
    statement_format: BankStatementFormat
    file_name: str
    file_content: str
    status: str  # pending, processing, completed, error
    error_message: Optional[str] = None
    processed_count: int
    created_at: datetime
    updated_at: datetime
    raw_transactions: Optional[List[RawTransactionResponse]] = None

    class Config:
        from_attributes = True

class ProcessImportBatchResponse(BaseModel):
    """处理导入批次响应"""
    batch: ImportBatchResponse
    results: List[Dict[str, Any]]

    class Config:
        from_attributes = True

class ImportBatchCreate(BaseModel):
    """创建导入批次请求"""
    account_id: str = Field(..., description="账户ID")
    file_name: str = Field(..., description="文件名")
    file_content: str = Field(..., description="文件内容")
    statement_format: BankStatementFormat = Field(..., description="对账单格式")
    import_source: ImportSource = Field(ImportSource.CSV, description="导入来源")
    mapping_config: Optional[Dict[str, str]] = Field(None, description="字段映射配置")

class ImportBatchFilter(BaseModel):
    """导入批次过滤条件"""
    account_id: Optional[str] = Field(None, description="账户ID")
    status: Optional[str] = Field(None, description="状态")
    start_date: Optional[datetime] = Field(None, description="开始日期")
    end_date: Optional[datetime] = Field(None, description="结束日期")
    skip: int = Field(0, description="跳过记录数")
    limit: int = Field(50, description="返回记录数")

class ImportBatchConfirm(BaseModel):
    """确认导入批次请求"""
    selected_rows: Optional[List[int]] = Field(None, description="选中的行号")
    skip_rows: Optional[List[int]] = Field(None, description="跳过的行号")
    mapping_config: Optional[Dict[str, str]] = Field(None, description="字段映射配置")