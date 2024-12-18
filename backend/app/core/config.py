from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Optional
from pathlib import Path
from functools import cached_property
from app.core.runtime_config import RuntimeConfigManager
import os
import sys
import secrets

class ConfigSettings(BaseSettings):
    # Basic config
    PROJECT_NAME: str = "Beaveden"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Environment config
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True") == "True"
    DB_ECHO: bool = DEBUG

    # Security config
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ADDITIONAL_CORS_ORIGINS: List[str] = []
    
    # Electron integration
    ELECTRON_USER_DATA_PATH: Optional[str] = Field(
        default=None,
        env='ELECTRON_USER_DATA_PATH'
    )

    # Runtime configuration
    _runtime_config: Optional[RuntimeConfigManager] = None

    @cached_property
    def USER_DATA_PATH(self) -> Path:
        """确定用户数据存储路径
        
        优先级：
        1. Electron 提供的路径
        2. 环境变量中的设置
        3. 开发环境下使用项目目录
        4. 生产环境使用系统用户目录
        """
        if self.ELECTRON_USER_DATA_PATH:
            return Path(self.ELECTRON_USER_DATA_PATH)
            
        if path := os.getenv("USER_DATA_PATH"):
            return Path(path)
            
        if self.ENV == "development":
            return Path(__file__).parent.parent.parent / "data"
        
        # 生产环境使用系统用户目录
        system_data_dir = {
            'darwin': Path.home() / 'Library' / 'Application Support' / 'Beaveden',
            'linux': Path.home() / '.local' / 'share' / 'beaveden',
            'windows': Path(os.getenv('APPDATA')) / 'Beaveden'
        }.get(sys.platform, Path.home() / '.beaveden')
        
        return system_data_dir
    
    @property
    def DATABASE_URL(self) -> str:
        if self.ENV == "testing":
            return "sqlite:///./test.db"
       
        if self.ENV == "development":
            db_path = self.USER_DATA_PATH / "dev.db"
        else:
            db_path = self.USER_DATA_PATH / "beaveden.db"
       
        db_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{db_path}"

    @property
    def SECRET_KEY(self) -> str:
        """动态获取密钥
        
        优先从运行时配置获取，如果未初始化则从环境变量或生成随机密钥
        """
        if self._runtime_config:
            return self._runtime_config.config.security["secretKey"]
        return os.getenv("SECRET_KEY", secrets.token_urlsafe(32))

    @property
    def ENCRYPTION_KEY(self) -> str:
        """获取加密密钥
        
        必须从运行时配置获取，否则抛出异常
        """
        if not self._runtime_config:
            raise RuntimeError("Runtime config not initialized")
        return self._runtime_config.config.security["encryptionKey"]

    def initialize_runtime_config(self, runtime_config: RuntimeConfigManager):
        """初始化运行时配置
        
        Args:
            runtime_config: RuntimeConfigManager 实例
        """
        self._runtime_config = runtime_config

    class Config:
        env_file = ".env"
        case_sensitive = True

# 创建全局配置实例
settings = ConfigSettings()

# 确保数据目录存在
settings.USER_DATA_PATH.mkdir(parents=True, exist_ok=True)