# backend/app/core/runtime_config.py
from pathlib import Path
import json
from typing import Optional
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class RuntimeConfig(BaseModel):
    backendPort: int
    appMode: str
    timestamp: int

class RuntimeConfigManager:
    _instance: Optional['RuntimeConfigManager'] = None
    _config: Optional[RuntimeConfig] = None

    def __init__(self, config_path: str):
        self.config_path = Path(config_path)
        self._load_config()

    @classmethod
    def initialize(cls, config_path: str) -> 'RuntimeConfigManager':
        if cls._instance is None:
            cls._instance = cls(config_path)
        return cls._instance

    @classmethod
    def get_instance(cls) -> 'RuntimeConfigManager':
        if cls._instance is None:
            raise RuntimeError("RuntimeConfigManager not initialized")
        return cls._instance

    def _load_config(self) -> None:
        try:
            config_data = json.loads(self.config_path.read_text())
            self._config = RuntimeConfig(**config_data)
            logger.info(f"Loaded runtime config from {self.config_path}")
        except Exception as e:
            logger.error(f"Failed to load runtime config: {e}")
            raise

    @property
    def config(self) -> RuntimeConfig:
        if self._config is None:
            self._load_config()
        return self._config

    def get_port(self) -> int:
        return self.config.backendPort

    def get_mode(self) -> str:
        return self.config.appMode