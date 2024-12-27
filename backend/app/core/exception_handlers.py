# app/core/exception_handlers.py
from fastapi import status
from fastapi.responses import JSONResponse
from jwt.exceptions import PyJWTError, ExpiredSignatureError, DecodeError
from fastapi.exceptions import HTTPException, RequestValidationError
from pydantic import ValidationError

def jwt_exception_handler(exc: PyJWTError):
    if isinstance(exc, ExpiredSignatureError):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Token has expired"},
        )
    elif isinstance(exc, DecodeError):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Token decoding error"},
        )
    else:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Invalid token"},
        )


def http_exception_handler(exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

def validation_exception_handler(exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )

def pydantic_validation_exception_handler(exc: ValidationError):
    return JSONResponse(
        status_code=status.HTTP_423_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )