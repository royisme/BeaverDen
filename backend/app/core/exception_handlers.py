# app/core/exception_handlers.py
from fastapi import status, Request
from fastapi.responses import JSONResponse
from jwt.exceptions import PyJWTError, ExpiredSignatureError, DecodeError
from fastapi.exceptions import HTTPException, RequestValidationError
from pydantic import ValidationError
from typing import Union

def jwt_exception_handler(request: Request, exc: PyJWTError) -> JSONResponse:
    """统一JWT异常处理"""
    error_map = {
        ExpiredSignatureError: ("Token expired", status.HTTP_401_UNAUTHORIZED),
        DecodeError: ("Invalid token format", status.HTTP_401_UNAUTHORIZED),
    }
    
    detail, status_code = error_map.get(type(exc), ("Invalid token", status.HTTP_401_UNAUTHORIZED))
    
    return JSONResponse(
        status_code=status_code,
        content={"detail": detail},
        headers={"WWW-Authenticate": "Bearer"}
    )

def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """HTTP异常统一处理"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers
    )

def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """请求参数验证异常处理"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )

def pydantic_validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """Pydantic模型验证异常处理"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,  # 修正状态码
        content={"detail": exc.errors()},
    )