import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException, Request, Depends
from pydantic import BaseModel
import jwt
from jwt.exceptions import PyJWTError, ExpiredSignatureError

from app.core.config import settings
from app.db.session import get_session
from app.models.user import User

# 配置日志
logger = logging.getLogger('app.core.auth_jwt')

class TokenData(BaseModel):
    sub: str
    exp: datetime
    type: str

class AuthJWT:
    """JWT认证处理类"""
    def __init__(self):
        self._secret_key = settings.SECRET_KEY
        self._algorithm = settings.JWT_ALGORITHM
        self._access_token_expire_minutes = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        self._refresh_token_expire_minutes = settings.JWT_REFRESH_TOKEN_EXPIRE_MINUTES
        self._token_data = None
        
    async def __call__(self, request: Request):
        """处理请求中的JWT令牌"""
        logger.info("================== AuthJWT.__call__ executed ==================")
        
        # 获取认证头
        authorization: str = request.headers.get("Authorization", "")
        logger.info(f"Authorization header: {authorization}")
        
        if not authorization:
            logger.warning("No Authorization header found")
            return self
            
        try:
            scheme, token = authorization.split(maxsplit=1)
            if scheme.lower() != "bearer":
                logger.warning(f"Invalid auth scheme: {scheme}")
                return self
                
            self._token_data = self.verify_token(token)
            logger.info(f"Token verified for user {self._token_data.sub}")
        except Exception as e:
            logger.error(f"Failed to process Authorization header: {str(e)}")
            
        return self

    def create_access_token(self, subject: str) -> str:
        """创建访问令牌"""
        expires_delta = timedelta(minutes=self._access_token_expire_minutes)
        expires_at = datetime.now(timezone.utc) + expires_delta
        expires_timestamp = int(expires_at.timestamp())
        
        to_encode = {
            "sub": str(subject),
            "exp": expires_timestamp,
            "type": "access"
        }
        logger.info(f"Creating access token for user {subject}")
        logger.debug(f"Token expiration: {expires_at} (timestamp: {expires_timestamp})")
        return jwt.encode(to_encode, self._secret_key, algorithm=self._algorithm)

    def create_refresh_token(self, subject: str) -> str:
        """创建刷新令牌"""
        expires_delta = timedelta(minutes=self._refresh_token_expire_minutes)
        expires_at = datetime.now(timezone.utc) + expires_delta
        expires_timestamp = int(expires_at.timestamp())
        
        to_encode = {
            "sub": str(subject),
            "exp": expires_timestamp,
            "type": "refresh"
        }
        logger.info(f"Creating refresh token for user {subject}")
        logger.debug(f"Token expiration: {expires_at} (timestamp: {expires_timestamp})")
        return jwt.encode(to_encode, self._secret_key, algorithm=self._algorithm)

    def get_access_token_expires(self) -> datetime:
        """获取访问令牌的过期时间"""
        return datetime.now(timezone.utc) + timedelta(minutes=self._access_token_expire_minutes)

    def jwt_required(self):
        """验证当前请求是否包含有效的JWT令牌"""
        logger.debug("Checking JWT requirement")
        if not self._token_data:
            logger.warning("JWT required but no valid token data found")
            raise HTTPException(status_code=401, detail="JWT token required")
        logger.info(f"JWT requirement satisfied for user {self._token_data.sub}")

    def verify_token(self, token: str, token_type: str = "access") -> TokenData:
        """验证JWT令牌"""
        try:
            logger.debug(f"Verifying token (type: {token_type})")
            payload = jwt.decode(token, self._secret_key, algorithms=[self._algorithm])
            logger.debug(f"Token payload: {payload}")
            
            # 确保exp是时区感知的datetime
            if 'exp' in payload and isinstance(payload['exp'], (int, float)):
                exp_dt = datetime.fromtimestamp(payload['exp'], tz=timezone.utc)
                payload['exp'] = exp_dt
                logger.debug(f"Token expiration: {exp_dt}")
            
            token_data = TokenData(**payload)
            
            # 验证令牌类型
            if token_data.type != token_type:
                logger.warning(f"Invalid token type. Got {token_data.type}, expected {token_type}")
                raise HTTPException(
                    status_code=401,
                    detail=f"Invalid token type. Expected {token_type}"
                )
            
            # 验证令牌是否过期
            now = datetime.now(timezone.utc)
            logger.debug(f"Current time: {now}, Token expiration: {token_data.exp}")
            if token_data.exp < now:
                logger.warning(f"Token expired at {token_data.exp}")
                raise HTTPException(status_code=401, detail="Token has expired")
            
            logger.debug("Token verification successful")
            return token_data
            
        except ExpiredSignatureError:
            logger.error("Token signature has expired")
            raise HTTPException(status_code=401, detail="Token has expired")
        except PyJWTError as e:
            logger.error(f"JWT verification failed: {str(e)}")
            raise HTTPException(status_code=401, detail="Could not validate credentials")
        except Exception as e:
            logger.error(f"Unexpected error during JWT verification: {str(e)}")
            raise HTTPException(status_code=401, detail="Could not validate credentials")

    def get_jwt_subject(self) -> str:
        """获取JWT令牌的subject（用户ID）"""
        if not self._token_data:
            logger.error("Attempting to get JWT subject but no token data available")
            raise HTTPException(status_code=401, detail="JWT token required")
        logger.debug(f"Retrieved JWT subject: {self._token_data.sub}")
        return self._token_data.sub

# 新增依赖项提供函数
async def get_authorize(request: Request) -> AuthJWT:
    authorize = AuthJWT()
    await authorize(request)  # 显式调用__call__方法
    return authorize

# 修改后的获取当前用户函数
async def get_current_user(
    Authorize: AuthJWT = Depends(get_authorize),  # 使用显式依赖
    session = Depends(get_session)
) -> User:
    """获取当前认证用户的依赖函数"""
    # 验证JWT令牌（已通过__call__处理）
    Authorize.jwt_required()
    
    # 获取用户ID
    user_id = Authorize.get_jwt_subject()
    logger.debug(f"Got user_id from token: {user_id}")
    
    # 从数据库获取用户
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user