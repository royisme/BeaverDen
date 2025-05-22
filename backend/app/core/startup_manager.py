import logging
import os
import sys
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List
from fastapi import FastAPI
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.db.session import get_db_status
from app.db.init_db import init_db
from app.db.migrations import check_and_upgrade_db

logger = logging.getLogger(__name__)

class StartupError(Exception):
    """Base exception for startup errors"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(message)


class DatabaseError(StartupError):
    """Exception for database-related startup errors"""
    pass


class ConfigurationError(StartupError):
    """Exception for configuration-related startup errors"""
    pass


class StartupManager:
    """
    Manages the application startup process, including:
    - Database initialization and migration
    - Configuration validation
    - System readiness checks
    """
    
    def __init__(self, app: FastAPI):
        self.app = app
        self.startup_errors: List[StartupError] = []
        self.is_ready = False
        
    async def initialize_system(self) -> bool:
        """
        Initialize the system components in the correct order.
        Returns True if initialization was successful, False otherwise.
        """
        try:
            logger.info("Starting system initialization...")
            
            # Step 1: Validate configuration
            self._validate_configuration()
            
            # Step 2: Initialize database
            await self._initialize_database()
            
            # Step 3: Perform additional setup tasks
            await self._perform_additional_setup()
            
            # Mark system as ready
            self.is_ready = True
            logger.info("System initialization completed successfully")
            return True
            
        except StartupError as e:
            self.startup_errors.append(e)
            logger.error(f"System initialization failed: {e.message}")
            logger.debug(f"Error details: {e.details}")
            return False
        except Exception as e:
            error = StartupError(f"Unexpected error during system initialization: {str(e)}")
            self.startup_errors.append(error)
            logger.exception("Unexpected error during system initialization")
            return False
    
    def _validate_configuration(self) -> None:
        """
        Validate the application configuration.
        Raises ConfigurationError if validation fails.
        """
        logger.info("Validating configuration...")
        
        # Check for required directories
        try:
            self._ensure_required_directories()
        except Exception as e:
            raise ConfigurationError(
                "Failed to create required directories",
                {"error": str(e)}
            )
        
        # Check for required environment variables
        missing_vars = []
        if not settings.SECRET_KEY:
            missing_vars.append("SECRET_KEY")
        
        if missing_vars:
            raise ConfigurationError(
                "Missing required configuration variables",
                {"missing_variables": missing_vars}
            )
        
        logger.info("Configuration validation completed")
    
    def _ensure_required_directories(self) -> None:
        """Ensure all required directories exist"""
        # Ensure data directory exists
        if settings.DATABASE_URL.startswith("sqlite:///"):
            db_path = settings.DATABASE_URL.replace("sqlite:///", "")
            if not os.path.isabs(db_path):
                db_path = os.path.join(settings.PROJECT_ROOT, db_path)
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            logger.info(f"Ensured database directory exists: {os.path.dirname(db_path)}")
        
        # Ensure logs directory exists
        logs_dir = os.path.join(settings.PROJECT_ROOT, "logs")
        os.makedirs(logs_dir, exist_ok=True)
        logger.info(f"Ensured logs directory exists: {logs_dir}")
    
    async def _initialize_database(self) -> None:
        """
        Initialize the database, including:
        - Checking connection
        - Creating tables if needed
        - Running migrations
        - Seeding initial data
        
        Raises DatabaseError if initialization fails.
        """
        logger.info("Initializing database...")
        
        # Check database connection and status
        from app.db.session import SessionLocal
        db = SessionLocal()
        try:
            db_connected, db_initialized, migration_completed, db_version = get_db_status(db)
            
            if not db_connected:
                raise DatabaseError(
                    "Failed to connect to database",
                    {"database_url": settings.DATABASE_URL}
                )
            
            # Initialize database if needed
            if not db_initialized:
                logger.info("Database not initialized, creating tables and initial data...")
                try:
                    await init_db(db)
                    logger.info("Database initialized successfully")
                except Exception as e:
                    raise DatabaseError(
                        "Failed to initialize database",
                        {"error": str(e)}
                    )
            
            # Run migrations if needed
            if not migration_completed:
                logger.info("Database migrations not up to date, running migrations...")
                try:
                    await check_and_upgrade_db()
                    logger.info("Database migrations completed successfully")
                except Exception as e:
                    raise DatabaseError(
                        "Failed to run database migrations",
                        {"error": str(e), "current_version": db_version}
                    )
            
        except DatabaseError:
            raise
        except Exception as e:
            raise DatabaseError(
                "Unexpected error during database initialization",
                {"error": str(e)}
            )
        finally:
            db.close()
        
        logger.info("Database initialization completed")
    
    async def _perform_additional_setup(self) -> None:
        """Perform any additional setup tasks"""
        logger.info("Performing additional setup tasks...")
        # Add any additional setup tasks here
        logger.info("Additional setup tasks completed")
    
    def get_system_status(self) -> Dict[str, Any]:
        """
        Get the current system status.
        Returns a dictionary with status information.
        """
        # Get database status
        from app.db.session import SessionLocal
        db = SessionLocal()
        try:
            db_connected, db_initialized, migration_completed, db_version = get_db_status(db)
        except Exception as e:
            logger.error(f"Error getting database status: {str(e)}")
            db_connected = False
            db_initialized = False
            migration_completed = False
            db_version = None
        finally:
            db.close()
        
        # Compile status information
        status = {
            "isSystemReady": self.is_ready,
            "backendStatus": {
                "status": "healthy" if self.is_ready else "initializing",
                "version": settings.VERSION,
                "environment": settings.ENV,
                "errors": [
                    {"message": err.message, "details": err.details}
                    for err in self.startup_errors
                ]
            },
            "databaseStatus": {
                "isConnected": db_connected,
                "isInitialized": db_initialized,
                "migrationCompleted": migration_completed,
                "version": db_version
            }
        }
        
        return status
