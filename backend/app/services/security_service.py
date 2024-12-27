# backend/app/core/security.py
import base64
from typing import Optional
from app.core.runtime_config import RuntimeConfigManager
import json
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class SecurityService:
    _instance: Optional['SecurityService'] = None
    
    def __init__(self, runtime_config: RuntimeConfigManager):
        self.runtime_config = runtime_config
    
    @classmethod
    def initialize(cls, runtime_config: RuntimeConfigManager) -> 'SecurityService':
        if cls._instance is None:
            cls._instance = cls(runtime_config)
        return cls._instance

    @classmethod
    def get_instance(cls) -> 'SecurityService':
        if cls._instance is None:
            raise RuntimeError("SecurityService not initialized")
        return cls._instance

    def get_secret_key(self) -> str:
        """获取用于 JWT 的密钥"""
        return self.runtime_config.config.security["secretKey"]

    def get_encryption_key(self) -> bytes:
        """获取用于数据加密的密钥"""
        return base64.b64decode(self.runtime_config.config.security["encryptionKey"])

    def encrypt_message(self, message: str) -> str:
        """加密消息"""
        key = self.get_encryption_key()
        aesgcm = AESGCM(key)
        nonce = os.urandom(12)
        
        # 转换消息为字节
        message_bytes = message.encode()
        
        # 加密
        ciphertext = aesgcm.encrypt(nonce, message_bytes, None)
        
        # 构建加密结果
        encrypted_data = {
            "nonce": base64.b64encode(nonce).decode('utf-8'),
            "ciphertext": base64.b64encode(ciphertext).decode('utf-8')
        }
        
        return json.dumps(encrypted_data)

    def decrypt_message(self, encrypted_data: str) -> str:
        """解密消息"""
        key = self.get_encryption_key()
        aesgcm = AESGCM(key)
        
        # 解析加密数据
        data = json.loads(encrypted_data)
        nonce = base64.b64decode(data["nonce"])
        ciphertext = base64.b64decode(data["ciphertext"])
        
        # 解密
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        
        return plaintext.decode()