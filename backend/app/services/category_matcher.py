import re
import logging
from typing import Dict, List, Optional, Set, Tuple
from sqlalchemy.orm import Session

from app.models.transaction import TransactionCategory
from app.models.user import User
from app.models.category_rule import CategoryRule

logger = logging.getLogger(__name__)

class CategoryMatcher:
    """
    Service for automatically matching transaction descriptions to categories
    based on keyword matching.
    """

    def __init__(self, db: Session):
        self.db = db
        self._keyword_cache = {}  # Cache for keyword mappings
        self._user_rules_cache = {}  # Cache for user-defined rules

    def match_category(self, user: User, description: str, merchant: Optional[str] = None) -> Optional[str]:
        """
        Match a transaction description to a category ID.

        Args:
            user: The user who owns the transaction
            description: The transaction description
            merchant: The merchant name (if available)

        Returns:
            The category ID if a match is found, None otherwise
        """
        # Try to match using user-defined rules first
        category_id = self._match_user_rules(user.id, description, merchant)
        if category_id:
            return category_id

        # Fall back to system keyword matching
        return self._match_keywords(description, merchant)

    def _match_user_rules(self, user_id: str, description: str, merchant: Optional[str] = None) -> Optional[str]:
        """Match using user-defined rules"""
        # Load user rules if not in cache
        if user_id not in self._user_rules_cache:
            self._load_user_rules(user_id)

        rules = self._user_rules_cache.get(user_id, [])

        # Convert inputs to lowercase for case-insensitive matching
        description_lower = description.lower()
        merchant_lower = merchant.lower() if merchant else ""

        # Try exact matches first
        for rule in rules:
            pattern = rule["pattern"].lower()
            if rule["match_type"] == "exact":
                if (rule["field"] == "description" and pattern == description_lower) or \
                   (rule["field"] == "merchant" and merchant and pattern == merchant_lower):
                    return rule["category_id"]

        # Then try contains matches
        for rule in rules:
            pattern = rule["pattern"].lower()
            if rule["match_type"] == "contains":
                if (rule["field"] == "description" and pattern in description_lower) or \
                   (rule["field"] == "merchant" and merchant and pattern in merchant_lower):
                    return rule["category_id"]

        # Finally try regex matches
        for rule in rules:
            if rule["match_type"] == "regex":
                try:
                    pattern = re.compile(rule["pattern"], re.IGNORECASE)
                    if (rule["field"] == "description" and pattern.search(description)) or \
                       (rule["field"] == "merchant" and merchant and pattern.search(merchant)):
                        return rule["category_id"]
                except re.error:
                    # Skip invalid regex patterns
                    continue

        return None

    def _match_keywords(self, description: str, merchant: Optional[str] = None) -> Optional[str]:
        """Match using system-defined keywords"""
        # Load keyword mappings if not cached
        if not self._keyword_cache:
            self._load_keyword_mappings()

        # Convert inputs to lowercase for case-insensitive matching
        description_lower = description.lower()
        merchant_lower = merchant.lower() if merchant else ""

        # Check merchant first (more specific)
        if merchant:
            for keyword, category_id in self._keyword_cache.items():
                if keyword in merchant_lower:
                    return category_id

        # Then check description
        for keyword, category_id in self._keyword_cache.items():
            if keyword in description_lower:
                return category_id

        return None

    def _load_user_rules(self, user_id: str) -> None:
        """Load user-defined categorization rules from database"""
        # Query active rules for this user, ordered by priority
        rules = self.db.query(CategoryRule).filter(
            CategoryRule.user_id == user_id,
            CategoryRule.is_active == True
        ).order_by(
            CategoryRule.priority.desc()
        ).all()

        # Convert to dictionary format for the cache
        self._user_rules_cache[user_id] = [
            {
                "field": rule.field.value,
                "pattern": rule.pattern,
                "match_type": rule.match_type.value,
                "category_id": rule.category_id
            }
            for rule in rules
        ]

    def _load_keyword_mappings(self) -> None:
        """Load system-defined keyword to category mappings"""
        # Query all system categories
        system_categories = self.db.query(TransactionCategory).filter(
            TransactionCategory.is_system == True
        ).all()

        # Create keyword mappings
        for category in system_categories:
            category_id = category.id

            # Add keywords based on category name
            keywords = self._generate_keywords_for_category(category.name)

            # Add the keywords to the cache
            for keyword in keywords:
                self._keyword_cache[keyword] = category_id

        # Add additional common keywords for specific categories
        self._add_common_keywords()

    def _generate_keywords_for_category(self, category_name: str) -> List[str]:
        """Generate keywords based on category name"""
        # Split by underscore for system categories like "income_salary"
        parts = category_name.lower().split('_')

        # Add the full name and each part as keywords
        keywords = [category_name.lower()]
        keywords.extend(parts)

        return keywords

    def _add_common_keywords(self) -> None:
        """Add common keywords for specific categories"""
        # This is where we define common keywords for each category
        # These are based on common merchant names and transaction descriptions

        # Example mappings - these would be expanded based on real-world data
        common_keywords = {
            # Dining
            "dining_restaurant": [
                "restaurant", "café", "cafe", "diner", "grill", "steakhouse",
                "pizzeria", "sushi", "bistro", "eatery"
            ],
            "dining_takeout": [
                "doordash", "ubereats", "grubhub", "seamless", "postmates",
                "delivery", "takeout", "take-out", "to-go"
            ],
            "dining_cafe": [
                "starbucks", "tim hortons", "coffee", "espresso", "latte"
            ],

            # Shopping
            "shopping_grocery": [
                "grocery", "supermarket", "market", "food", "walmart", "costco",
                "safeway", "kroger", "publix", "aldi", "trader joe", "whole foods"
            ],
            "shopping_clothes": [
                "clothing", "apparel", "fashion", "shoes", "footwear", "nike", "adidas",
                "h&m", "zara", "gap", "old navy", "nordstrom", "macy"
            ],

            # Transport
            "transport_fuel": [
                "gas", "fuel", "petrol", "shell", "exxon", "mobil", "chevron", "bp"
            ],
            "transport_parking": [
                "parking", "garage", "lot", "meter"
            ],
            "transport_public": [
                "transit", "subway", "metro", "bus", "train", "rail", "fare", "ticket"
            ],
            "transport_taxi": [
                "uber", "lyft", "taxi", "cab", "ride"
            ],

            # Housing
            "housing_rent": [
                "rent", "lease", "apartment", "housing"
            ],
            "housing_mortgage": [
                "mortgage", "loan payment", "home loan"
            ],
            "housing_utilities": [
                "utility", "electric", "water", "gas", "hydro", "power", "energy",
                "internet", "cable", "phone", "telecom"
            ],

            # Income
            "income_salary": [
                "salary", "payroll", "direct deposit", "income", "wage", "pay", "earnings"
            ],
            "income_investment": [
                "dividend", "interest", "investment", "return", "capital gain"
            ]
        }

        # Add these keywords to the cache
        for category_key, keywords in common_keywords.items():
            # Find the category ID for this category key
            category = self.db.query(TransactionCategory).filter(
                TransactionCategory.system_category == category_key
            ).first()

            if category:
                for keyword in keywords:
                    self._keyword_cache[keyword.lower()] = category.id

    def add_user_rule(self, user_id: str, field: str, pattern: str, match_type: str, category_id: str) -> bool:
        """
        Add a new user-defined categorization rule

        Args:
            user_id: The user ID
            field: 'description' or 'merchant'
            pattern: The pattern to match
            match_type: 'exact', 'contains', or 'regex'
            category_id: The category ID to assign

        Returns:
            True if successful, False otherwise
        """
        # Validate inputs
        if field not in ["description", "merchant"]:
            return False

        if match_type not in ["exact", "contains", "regex"]:
            return False

        # Validate regex pattern if applicable
        if match_type == "regex":
            try:
                re.compile(pattern)
            except re.error:
                return False

        # Load user rules if not already loaded
        if user_id not in self._user_rules_cache:
            self._load_user_rules(user_id)

        # Add the new rule
        self._user_rules_cache[user_id].append({
            "field": field,
            "pattern": pattern,
            "match_type": match_type,
            "category_id": category_id
        })

        # In a real implementation, we would also save this to the database

        return True
