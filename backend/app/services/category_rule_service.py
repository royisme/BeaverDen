import logging
import re
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.category_rule import CategoryRule, MatchType, MatchField
from app.models.transaction import TransactionCategory
from app.models.user import User

logger = logging.getLogger(__name__)

class CategoryRuleService:
    """Service for managing category rules"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_rule(self, user: User, rule_data: Dict[str, Any]) -> CategoryRule:
        """Create a new category rule"""
        try:
            # Validate category exists and belongs to user
            category_id = rule_data.get("category_id")
            category = self.db.query(TransactionCategory).filter(
                TransactionCategory.id == category_id,
                (TransactionCategory.user_id == user.id) | (TransactionCategory.is_system == True)
            ).first()
            
            if not category:
                raise HTTPException(status_code=404, detail="Category not found")
            
            # Validate match type
            match_type = rule_data.get("match_type")
            if match_type not in [e.value for e in MatchType]:
                raise HTTPException(status_code=400, detail="Invalid match type")
            
            # Validate field
            field = rule_data.get("field")
            if field not in [e.value for e in MatchField]:
                raise HTTPException(status_code=400, detail="Invalid field")
            
            # Validate regex pattern if applicable
            if match_type == MatchType.REGEX.value:
                pattern = rule_data.get("pattern", "")
                try:
                    re.compile(pattern)
                except re.error:
                    raise HTTPException(status_code=400, detail="Invalid regex pattern")
            
            # Create rule
            rule = CategoryRule(
                user_id=user.id,
                category_id=category_id,
                field=field,
                pattern=rule_data.get("pattern", ""),
                match_type=match_type,
                is_active=rule_data.get("is_active", True),
                priority=rule_data.get("priority", 0)
            )
            
            self.db.add(rule)
            self.db.commit()
            self.db.refresh(rule)
            return rule
            
        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating category rule: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create category rule")
    
    def get_rules(self, user: User, skip: int = 0, limit: int = 100) -> List[CategoryRule]:
        """Get all category rules for a user"""
        return self.db.query(CategoryRule).filter(
            CategoryRule.user_id == user.id
        ).order_by(
            CategoryRule.priority.desc(),
            CategoryRule.created_at.desc()
        ).offset(skip).limit(limit).all()
    
    def get_rule(self, user: User, rule_id: str) -> Optional[CategoryRule]:
        """Get a specific category rule"""
        return self.db.query(CategoryRule).filter(
            CategoryRule.id == rule_id,
            CategoryRule.user_id == user.id
        ).first()
    
    def update_rule(self, user: User, rule_id: str, rule_data: Dict[str, Any]) -> Optional[CategoryRule]:
        """Update a category rule"""
        rule = self.get_rule(user, rule_id)
        if not rule:
            return None
        
        try:
            # Validate category if provided
            if "category_id" in rule_data:
                category_id = rule_data["category_id"]
                category = self.db.query(TransactionCategory).filter(
                    TransactionCategory.id == category_id,
                    (TransactionCategory.user_id == user.id) | (TransactionCategory.is_system == True)
                ).first()
                
                if not category:
                    raise HTTPException(status_code=404, detail="Category not found")
            
            # Validate match type if provided
            if "match_type" in rule_data:
                match_type = rule_data["match_type"]
                if match_type not in [e.value for e in MatchType]:
                    raise HTTPException(status_code=400, detail="Invalid match type")
            
            # Validate field if provided
            if "field" in rule_data:
                field = rule_data["field"]
                if field not in [e.value for e in MatchField]:
                    raise HTTPException(status_code=400, detail="Invalid field")
            
            # Validate regex pattern if applicable
            if ("match_type" in rule_data and rule_data["match_type"] == MatchType.REGEX.value) or \
               (rule.match_type == MatchType.REGEX and "pattern" in rule_data):
                pattern = rule_data.get("pattern", rule.pattern)
                try:
                    re.compile(pattern)
                except re.error:
                    raise HTTPException(status_code=400, detail="Invalid regex pattern")
            
            # Update rule fields
            for field, value in rule_data.items():
                if hasattr(rule, field):
                    setattr(rule, field, value)
            
            self.db.commit()
            self.db.refresh(rule)
            return rule
            
        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating category rule: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to update category rule")
    
    def delete_rule(self, user: User, rule_id: str) -> bool:
        """Delete a category rule"""
        rule = self.get_rule(user, rule_id)
        if not rule:
            return False
        
        try:
            self.db.delete(rule)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting category rule: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to delete category rule")
