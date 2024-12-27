import os
import sys
import pytest
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, List
import uuid
import enum

from sqlalchemy.orm import Mapped, mapped_column, relationship, Session, DeclarativeBase
from sqlalchemy import String, ForeignKey, DateTime, Enum as SQLEnum, create_engine
from app.models.base import Base
from app.models.user import User, UserSettings, UserSession
from app.models.enums import AccountStatus
# 添加项目根目录到Python路径 (如果需要)
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))


def engine():
    """
    Creates a temporary in-memory SQLite engine for testing.
    """
    engine = create_engine("sqlite:///:memory:", echo=True)  # Adjust connection string if needed
    yield engine
    engine.dispose() 

class TestBaseData:
    metadata = Base.metadata


def test_user_creation(engine):
    """测试用户创建及其关联对象"""
    print("开始测试用户创建...")
    try:
        with Session(engine) as session:
            user = User(username="testuser", password_hash="test_hash", email="test@example.com", account_status=AccountStatus.ACTIVE)
            session.add(user)
            session.flush()  # 获取 user.id
            print("用户对象创建成功！ID:", user.id)



            settings = UserSettings(user_id=user.id, language="en", theme="default")
            session.add(settings)
            print("用户设置对象创建成功！")
            # session1 = UserSession(user_id=user.id, device_id="test-device")
            # session.add(session1)
            # print("用户会话对象创建成功！")
            session.commit()
        return True
    except Exception as e:
        print(f"测试过程中发生错误: {str(e)}")
        import traceback
        print(f"详细错误信息:\n{traceback.format_exc()}")
        return False

if __name__ == "__main__":
    print("=== 开始运行用户模型测试 ===")
    engine = create_engine("sqlite:///:memory:", echo=True) # echo=True 可以输出 SQL 语句

    TestBaseData.metadata.create_all(engine)
    success = test_user_creation(engine)
    print(f"\n测试结果: {'成功' if success else '失败'}")