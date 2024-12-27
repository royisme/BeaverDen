import enum



class Language(enum.Enum):
    """supported languages"""
    EN = "en"
    ZH = "zh"

class Currency(enum.Enum):
    """supported currencies"""
    CAD = "CAD"
    USD = "USD"
    CNY = "CNY"

class Theme(enum.Enum):
    """supported themes"""
    FRESH = "fresh"
    NATURAL = "natural"
    OCEAN = "ocean"
    SUNSET = "sunset"

class SubscriptionTier(enum.Enum):
    """supported subscription tiers"""
    FREE = 'free'
    STANDARD = 'standard'
    PREMIUM = 'premium'
class AccountStatus(enum.Enum):
    """用户账户状态"""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"