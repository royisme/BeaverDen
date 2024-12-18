from __future__ import annotations

from typing import List, Optional
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Enum, JSON, case, select
from sqlalchemy.orm import  Mapped, mapped_column, relationship, column_property

from app.models.base import Base
import enum


class SubscriptionTier(enum.Enum):
    FREE = 'free'
    STANDARD = 'standard'
    PREMIUM = 'premium'

class Permission(Base):
    """permission model"""
    
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    permission_key: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    description: Mapped[str] = mapped_column(String(255))

    def __repr__(self) -> str:
        return f"<Permission(key={self.permission_key}, description={self.description})>"

class Feature(Base):
    """feature model"""
    
    __tablename__ = "features"

    id: Mapped[int] = mapped_column(primary_key=True)
    feature_key: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    subscription_tier: Mapped[SubscriptionTier] = mapped_column(Enum(SubscriptionTier))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    custom_config: Mapped[Optional[dict]] = mapped_column(JSON)
    required_permissions: Mapped[List["Permission"]] = relationship(secondary="feature_permissions")
    module_key: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="", 
        comment="feature module key"
    )
    config_schema: Mapped[Optional[dict]] = mapped_column(
        JSON,
        comment="feature config schema"
    )
    def __repr__(self) -> str:
        return f"<Feature(key={self.feature_key}, tier={self.subscription_tier}, module_key={self.module_key}, config_schema={self.config_schema}, active={self.is_active})>"

class FeaturePermission(Base):
    """feature permission model"""
    
    __tablename__ = "feature_permissions"
    feature_id: Mapped[int] = mapped_column(ForeignKey("features.id"), primary_key=True)
    permission_id: Mapped[int] = mapped_column(ForeignKey("permissions.id"), primary_key=True)

class MenuType(enum.Enum):
    """menu type, distinguish feature menu and setting menu"""
    FEATURE = "feature"    # feature menu, such as dashboard, transaction, etc.
    SETTING = "setting"    # setting menu, such as user setting, system setting, etc.

class MenuGroup(enum.Enum):
    """menu group, distinguish main function area and system area"""
    MAIN = "main"        # main function area, contains core function menu
    SYSTEM = "system"    # system area, contains setting and configuration menu

class MenuConfig(Base):
    """menu config model"""
    
    __tablename__ = "menu_configs"

    id: Mapped[int] = mapped_column(primary_key=True)
    menu_key: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    custom_order: Mapped[Optional[int]] = mapped_column(Integer)
    
    # add new category field
    type: Mapped[MenuType] = mapped_column(
        Enum(MenuType),
        default=MenuType.FEATURE,
        nullable=False,
        comment="menu type: feature menu or setting menu"
    )
    group: Mapped[MenuGroup] = mapped_column(
        Enum(MenuGroup),
        default=MenuGroup.MAIN,
        nullable=False,
        comment="menu group: main function area or system area"
    )
    
    # add display related fields
    name: Mapped[str] = mapped_column(
        String(255), 
        nullable=False,
        default="",
        comment="menu display name"
    )
    icon: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=False,
        default="",
        comment="menu icon identifier"
    )
    
    # add hierarchy relation field
    parent_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("menu_configs.id"),
        comment="parent menu id"
    )
    
    # keep original feature relation
    required_features: Mapped[List["Feature"]] = relationship(
        secondary="menu_required_features"
    )
    
    # add parent-child relation
    parent: Mapped[Optional["MenuConfig"]] = relationship(
        "MenuConfig",
        remote_side=[id],
        backref=relationship(
            "MenuConfig",
            cascade="all, delete-orphan",
            order_by=custom_order
        )
    )
    order = column_property(
        select(case((custom_order != None, custom_order), else_=id)).scalar_subquery()
    )
    def __repr__(self) -> str:
        return f"<MenuConfig(key={self.menu_key},name={self.name}, type={self.type.value}, group={self.group.value}, visible={self.is_visible}, order={self.order})>"

class MenuRequiredFeature(Base):
    """menu required feature model"""
    
    __tablename__ = "menu_required_features"
    menu_config_id: Mapped[int] = mapped_column(ForeignKey("menu_configs.id"), primary_key=True)
    feature_id: Mapped[int] = mapped_column(ForeignKey("features.id"), primary_key=True)