# app/core/jwt.py
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict

import jwt
from fastapi import Request, HTTPException
from jwt.exceptions import PyJWTError, ExpiredSignatureError
from pydantic import BaseModel

from app.core.config import settings


class AuthJWT(BaseModel):
    _secret_key: str = settings.SECRET_KEY
    _algorithm: str = settings.JWT_ALGORITHM
    _access_token_expire_minutes: int = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    _refresh_token_expire_minutes: int = settings.JWT_REFRESH_TOKEN_EXPIRE_MINUTES
    _access_token_expires: timedelta = timedelta(minutes=_access_token_expire_minutes)
    _refresh_token_expires: timedelta = timedelta(minutes=_refresh_token_expire_minutes)
    _decode_leeway: int = 0

    def create_access_token(
        self,
        subject: str,
        expires_time: Optional[timedelta] = None,
        user_claims: Optional[Dict] = None,
    ) -> str:
        """
        创建访问令牌。
        """
        if expires_time is None:
            expires_time = self._access_token_expires

        now = datetime.now(timezone.utc)
        token_data = {
            "sub": str(subject),
            "iat": now,
            "exp": now + expires_time,
            "type": "access",
        }
        if user_claims:
            token_data.update(user_claims)
        encoded_token = jwt.encode(
            token_data, self._secret_key, algorithm=self._algorithm
        )
        return encoded_token
    def get_access_token_expires(self) -> timedelta:
        """
        获取访问令牌的过期时间。
        """
        e = self._access_token_expires
        return datetime.now(timezone.utc) + e
    def get_refresh_token_expires(self) -> timedelta:
        """
        获取刷新令牌的过期时间。
        """
        e = self._refresh_token_expires
        return datetime.now(timezone.utc) + e
    def create_refresh_token(
        self, subject: str, expires_time: Optional[timedelta] = None
    ) -> str:
        """
        创建刷新令牌。
        """
        if expires_time is None:
            expires_time = self._refresh_token_expires

        now = datetime.now(timezone.utc)
        token_data = {
            "sub": str(subject),
            "iat": now,
            "exp": now + expires_time,
            "type": "refresh",
        }

        encoded_token = jwt.encode(
            token_data, self._secret_key, algorithm=self._algorithm
        )
        return encoded_token

    def verify_and_read_token(self, token: str, token_type: str) -> Dict[str, str]:
        try:
            decoded_token = jwt.decode(
                token,
                self._secret_key,
                algorithms=[self._algorithm],
                leeway=self._decode_leeway,
            )
            self._check_token_type(decoded_token, token_type)
            return decoded_token
        except ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

    def _check_token_type(self, decoded_token: dict, token_type: str):
        if decoded_token.get("type") != token_type:
            raise HTTPException(
                status_code=401, detail=f"Invalid token type, expected {token_type}"
            )

    def _get_token_from_headers(self, request: Request) -> str:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Missing Authorization header")

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=401, detail="Invalid Authorization header format"
            )

        return parts[1]

    def jwt_required(self, request: Request):
        """
        检查是否存在有效的访问令牌。
        """
        token = self._get_token_from_headers(request)
        self.verify_and_read_token(token, "access")

    def jwt_refresh_token_required(self, request: Request):
        """
        检查是否存在有效的刷新令牌。
        """
        token = self._get_token_from_headers(request)
        self.verify_and_read_token(token, "refresh")

    def get_jwt_subject(self, request: Request, token_type: str = "access") -> str:
        """
        获取当前令牌的主题。
        """
        token = self._get_token_from_headers(request)
        decoded_token = self.verify_and_read_token(token, token_type)
        return decoded_token.get("sub")

    def get_raw_jwt(self, request: Request, token_type: str = "access") -> Dict:
        """
        获取原始 JWT 数据。
        """
        token = self._get_token_from_headers(request)
        decoded_token = self.verify_and_read_token(token, token_type)
        return decoded_token
auth_jwt = AuthJWT()