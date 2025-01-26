import logging
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException

from app.models.transaction import Transaction, TransactionCategory
from app.models.user import User
from app.api.v1.endpoints.api_models import CategoryCreate, CategoryUpdate

logger = logging.getLogger(__name__)

class CategoryService:
    def __init__(self, db: Session):
        self.db = db

    def create_category(self, user: User, category_data: CategoryCreate) -> TransactionCategory:
        """创建新分类"""
        try:
            # 检查父分类
            if category_data.parent_id:
                parent = self.db.query(TransactionCategory).filter(
                    TransactionCategory.id == category_data.parent_id,
                    TransactionCategory.user_id == user.id
                ).first()
                if not parent:
                    raise HTTPException(status_code=404, detail="Parent category not found")

            # 检查名称是否重复
            existing = self.db.query(TransactionCategory).filter(
                TransactionCategory.user_id == user.id,
                TransactionCategory.name == category_data.name,
                TransactionCategory.parent_id == category_data.parent_id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Category name already exists")

            category = TransactionCategory(
                user_id=user.id,
                is_system=False,
                **category_data.dict()
            )
            self.db.add(category)
            self.db.commit()
            self.db.refresh(category)
            return category

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating category: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create category")

    def get_category(self, user: User, category_id: str) -> TransactionCategory:
        """获取分类详情"""
        category = self.db.query(TransactionCategory).filter(
            TransactionCategory.id == category_id,
            TransactionCategory.user_id == user.id
        ).first()
        
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category

    def list_categories(
        self,
        user: User,
        parent_id: Optional[str] = None,
        include_system: bool = True
    ) -> List[TransactionCategory]:
        """获取分类列表"""
        query = self.db.query(TransactionCategory).filter(
            TransactionCategory.parent_id == parent_id
        )

        if include_system:
            query = query.filter(
                (TransactionCategory.user_id == user.id) | 
                (TransactionCategory.is_system == True)
            )
        else:
            query = query.filter(TransactionCategory.user_id == user.id)

        return query.all()

    def update_category(
        self,
        user: User,
        category_id: str,
        update_data: CategoryUpdate
    ) -> TransactionCategory:
        """更新分类"""
        category = self.get_category(user, category_id)
        
        if category.is_system:
            raise HTTPException(status_code=400, detail="Cannot modify system category")

        try:
            # 检查父分类
            if update_data.parent_id:
                parent = self.db.query(TransactionCategory).filter(
                    TransactionCategory.id == update_data.parent_id,
                    TransactionCategory.user_id == user.id
                ).first()
                if not parent:
                    raise HTTPException(status_code=404, detail="Parent category not found")

            # 检查名称是否重复
            if update_data.name:
                existing = self.db.query(TransactionCategory).filter(
                    TransactionCategory.user_id == user.id,
                    TransactionCategory.name == update_data.name,
                    TransactionCategory.parent_id == category.parent_id,
                    TransactionCategory.id != category_id
                ).first()
                if existing:
                    raise HTTPException(status_code=400, detail="Category name already exists")

            for field, value in update_data.dict(exclude_unset=True).items():
                setattr(category, field, value)

            self.db.commit()
            self.db.refresh(category)
            return category

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating category: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to update category")

    def delete_category(self, user: User, category_id: str) -> None:
        """删除分类"""
        category = self.get_category(user, category_id)
        
        if category.is_system:
            raise HTTPException(status_code=400, detail="Cannot delete system category")

        # 检查是否有子分类
        has_children = self.db.query(TransactionCategory).filter(
            TransactionCategory.parent_id == category_id
        ).first() is not None
        if has_children:
            raise HTTPException(status_code=400, detail="Cannot delete category with children")

        # 检查是否有关联的交易
        has_transactions = self.db.query(Transaction).filter(
            Transaction.category_id == category_id,
            Transaction.user_id == user.id
        ).first()
        if has_transactions:
            raise HTTPException(status_code=400, detail="Cannot delete category with transactions")

        try:
            self.db.delete(category)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting category: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to delete category")

    def get_category_tree(self, user: User, include_system: bool = True) -> List[Dict]:
        """获取分类树形结构"""
        categories = self.list_categories(user, parent_id=None, include_system=include_system)
        return [self._build_category_tree(cat) for cat in categories]

    def _build_category_tree(self, category: TransactionCategory) -> Dict:
        """递归构建分类树"""
        children = self.db.query(TransactionCategory).filter(
            TransactionCategory.parent_id == category.id
        ).all()
        
        return {
            "id": category.id,
            "name": category.name,
            "icon": category.icon,
            "color": category.color,
            "is_system": category.is_system,
            "children": [self._build_category_tree(child) for child in children]
        }

    def create_default_categories(self, user: User) -> None:
        """创建默认分类"""
        default_categories = [
            # 支出分类
            {"name": "Food & Dining", "icon": "", "color": "#FF9800"},
            {"name": "Shopping", "icon": "", "color": "#E91E63"},
            {"name": "Transportation", "icon": "", "color": "#2196F3"},
            {"name": "Bills & Utilities", "icon": "", "color": "#4CAF50"},
            {"name": "Entertainment", "icon": "", "color": "#9C27B0"},
            {"name": "Health & Fitness", "icon": "", "color": "#00BCD4"},
            {"name": "Education", "icon": "", "color": "#795548"},
            {"name": "Travel", "icon": "", "color": "#607D8B"},
            
            # 收入分类
            {"name": "Salary", "icon": "", "color": "#4CAF50"},
            {"name": "Investment", "icon": "", "color": "#2196F3"},
            {"name": "Business", "icon": "", "color": "#FF9800"},
            {"name": "Gifts", "icon": "", "color": "#E91E63"},
            {"name": "Other Income", "icon": "", "color": "#9E9E9E"},
        ]

        try:
            for cat_data in default_categories:
                category = TransactionCategory(
                    user_id=user.id,
                    is_system=True,
                    **cat_data
                )
                self.db.add(category)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating default categories: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create default categories")
