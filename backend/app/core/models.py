from pydantic import BaseModel
from typing import Dict

class SecurityConfig(BaseModel):
    secretKey: str
    encryptionKey: str

class RuntimeConfig(BaseModel):
    backendPort: int
    appMode: str
    timestamp: int
    security: Dict[str, str]  # 包含 secretKey 和 encryptionKey