from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import List, Optional
from pathlib import Path
from functools import cached_property
from app.core.runtime_config import RuntimeConfig

import secrets

class ConfigSettings(BaseSettings):
    # 基础配置
    PROJECT_NAME: str = "Beaveden"
    PROJECT_ROOT: Path = Path(__file__).resolve().parents[2]
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    IS_PACKAGED: bool = False
    BUILD_ID: str = "unknown"
    APP_MODE: str = "production"
    # JWT 配置
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    JWT_REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days 
    # 环境配置
    ENV: str = Field(
        default="development",
        validation_alias="ENV",
        description="Runtime environment (development|production)"
    )
    DEBUG: bool = Field(
        default=True,
        description="Enable debug mode"
    )
    DB_ECHO: bool = Field(
        default=False,
        description="Echo SQL queries"
    )
    ELECTRON_USER_DATA_PATH: Optional[str] = Field(
        default=None,
        env='ELECTRON_USER_DATA_PATH'
    )
    # 网络配置
    BACKEND_PORT: int = Field(
        default=8486,
        description="Default backend port"
    )
    ADDITIONAL_CORS_ORIGINS: List[str] = Field(
        default_factory=list,
        description="Additional CORS origins"
    )

    # 安全配置
    SECRET_KEY: str = Field(
        default_factory=lambda: secrets.token_urlsafe(32),
        description="Application secret key"
    )
    ENCRYPTION_KEY: Optional[str] = Field(
        default=None,
        description="Encryption key (must be set via runtime config)"
    )

    @field_validator('ELECTRON_USER_DATA_PATH', mode='before')
    @classmethod
    def validate_electron_path(cls, value: str | None) -> str | None:
        """处理路径输入并验证存在性"""
        if not value:
            return None
            
        path = Path(value).expanduser().resolve()
        if not path.exists():
            raise ValueError(f"Electron user data path not found: {path}")
        return str(path)
    # 路径配置
    @cached_property
    def DATABASE_URL(self) -> str:
        """动态生成数据库连接URL"""
        db_path = self.USER_DATA_PATH / "data" / "beaveden.db"
        db_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{db_path}"
    
    def _get_system_data_path(self) -> Path:
        """获取系统级数据目录"""
        return {
            'darwin': Path.home() / 'Library' / 'Application Support' / 'Beaveden',
            'linux': Path.home() / '.local' / 'share' / 'beaveden',
            'win32': Path(os.getenv('APPDATA', '')) / 'Beaveden'
        }.get(sys.platform, Path.home() / '.beaveden')
    
    def apply_runtime_config(self, runtime_config: RuntimeConfig):
        """应用运行时配置"""
        self.BACKEND_PORT = runtime_config.backend_port
        self.APP_MODE = runtime_config.app_mode
        self.SECRET_KEY = runtime_config.security_keys.secret_key
        self.ENCRYPTION_KEY = runtime_config.security_keys.encryption_key
        self.IS_PACKAGED = runtime_config.is_packaged
        self.VERSION = runtime_config.version
        self.BUILD_ID = runtime_config.build_id
    
    @cached_property
    def USER_DATA_PATH(self) -> Path:
        """动态确定用户数据存储路径（完整逻辑）"""
        # 优先级 1: Electron 路径
        if self.ELECTRON_USER_DATA_PATH:
            path = Path(self.ELECTRON_USER_DATA_PATH)
            path.mkdir(parents=True, exist_ok=True)
            return path

        # 优先级 2: 环境变量路径
        if env_path := os.getenv("USER_DATA_PATH"):
            path = Path(env_path).resolve()
            path.mkdir(parents=True, exist_ok=True)
            return path

        # 优先级 3: 开发环境路径
        if self.ENV == "development":
            dev_path = self.PROJECT_ROOT / "backend" / "data"
            dev_path.mkdir(parents=True, exist_ok=True)
            return dev_path

        # 优先级 4: 生产环境系统路径
        system_path = self._get_system_data_path()
        system_path.mkdir(parents=True, exist_ok=True)
        return system_path

    # @cached_property
    # def DATABASE_URL(self) -> str:
    #     """动态生成数据库连接URL"""
    #     self._ensured_dirs  # 触发目录创建
    #     db_path = self.USER_DATA_PATH / "data" / "beaveden.db"
    #     return f"sqlite:///{db_path}"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"

# 初始化配置实例
settings = ConfigSettings()

