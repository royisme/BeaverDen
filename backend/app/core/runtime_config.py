# backend/app/core/runtime_config.py
import json
import logging
from pathlib import Path
from typing import Optional, Tuple
from pydantic import BaseModel, Field, ValidationError, field_validator
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

class SecurityKeys(BaseModel):
    """安全密钥配置模型"""
    secret_key: str = Field(
        ..., 
        alias="secretKey",
        min_length=32,
        description="HMAC签名密钥（最少32字符）"
    )
    encryption_key: str = Field(
        ..., 
        alias="encryptionKey",
        min_length=32,
        description="数据加密密钥（最少32字符）"
    )

    @field_validator('secret_key', 'encryption_key', mode='after')
    @classmethod
    def validate_key_length(cls, v: str) -> str:
        """验证密钥长度"""
        if len(v) < 32:
            raise ValueError("密钥长度必须至少32个字符")
        return v

class RuntimeConfig(BaseModel):
    """运行时配置主模型"""
    backend_port: int = Field(
        ..., 
        alias="backendPort",
        ge=1024, 
        le=65535,
        description="后端服务端口（1024-65535）"
    )
    app_mode: str = Field(
        "production",
        alias="appMode",
        pattern=r"^(development|production|staging)$",
        description="应用运行模式"
    )
    timestamp: int = Field(
        ...,
        description="配置更新时间戳"
    )
    security_keys: SecurityKeys = Field(
        ..., 
        alias="securityKeys",
        description="安全密钥配置"
    )
    is_packaged: bool = Field(
        ..., 
        alias="isPackaged",
        description="是否为打包环境"
    )
    version: str = Field(
        ..., 
        alias="version",
        description="应用版本"
    )
    build_id: str = Field(
        ..., 
        alias="buildId",
        description="应用构建ID"
    )
    class Config:
        # 允许通过字段别名加载
        populate_by_name = True
        # 禁止未声明的字段
        extra = "forbid"
        # 启用自动类型转换
        arbitrary_types_allowed = True

class RuntimeConfigManager:
    """运行时配置管理器（单例模式）"""
    _instance: Optional['RuntimeConfigManager'] = None
    _config: Optional[RuntimeConfig] = None
    _config_path: Optional[Path] = None

    def __init__(self, config_path: Path):
        if self._instance is not None:
            raise RuntimeError("请使用initialize()方法获取实例")
        
        self._config_path = config_path
        self._load_config()

    @classmethod
    def initialize(cls, config_path: str) -> 'RuntimeConfigManager':
        """初始化配置管理器"""
        if cls._instance is None:
            resolved_path = Path(config_path).resolve()
            cls._instance = cls(resolved_path)
        return cls._instance

    @classmethod
    def get_instance(cls) -> 'RuntimeConfigManager':
        """获取配置管理器实例"""
        if cls._instance is None:
            raise RuntimeError("配置管理器未初始化，请先调用initialize()")
        return cls._instance

    def _load_config(self) -> None:
        """加载并验证配置文件"""
        try:
            # 基础校验
            if not self._config_path.exists():
                raise FileNotFoundError(f"配置文件不存在: {self._config_path}")
            if not self._config_path.is_file():
                raise ValueError(f"配置路径不是文件: {self._config_path}")

            # 读取并解析
            config_data = json.loads(self._config_path.read_text(encoding='utf-8'))
            
            # 关键字段检查
            if "securityKeys" not in config_data:
                raise KeyError("配置缺少securityKeys字段")

            # 创建配置模型
            self._config = RuntimeConfig(**config_data)
            logger.info(f"成功加载运行时配置: {self._config_path}")

        except json.JSONDecodeError as e:
            logger.error(f"配置文件格式错误: {str(e)}")
            raise
        except ValidationError as e:
            logger.error(f"配置验证失败: {e.errors()}")
            raise
        except Exception as e:
            logger.error(f"加载配置失败: {str(e)}")
            raise

    @property
    def config(self) -> RuntimeConfig:
        """获取当前配置"""
        if self._config is None:
            self._load_config()
        return self._config

    def get_network_config(self) -> Tuple[int, str]:
        """获取网络配置"""
        return (
            self.config.backend_port,
            self.config.app_mode
        )

    def get_security_config(self) -> Tuple[str, str]:
        """获取安全配置"""
        return (
            self.config.security_keys.secret_key,
            self.config.security_keys.encryption_key
        )

    def refresh_config(self) -> None:
        """强制刷新配置"""
        logger.info("正在重新加载运行时配置...")
        self._load_config()

    def validate_config(self) -> bool:
        """验证配置完整性"""
        try:
            self._load_config()
            return True
        except Exception:
            return False

    def __repr__(self) -> str:
        return f"<RuntimeConfigManager(path={self._config_path})>"

# 辅助函数
def load_runtime_config(config_path: str) -> RuntimeConfig:
    """快速加载配置（独立于单例系统）"""
    return RuntimeConfigManager.initialize(config_path).config