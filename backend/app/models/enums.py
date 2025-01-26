from enum import Enum
from typing import Optional

class Language(str, Enum):
    """supported languages"""
    EN = "en"
    ZH = "zh"

class Currency(str, Enum):
    """supported currencies"""
    USD = "USD"
    CNY = "CNY"
    CAD = "CAD"
    EUR = "EUR"
    GBP = "GBP"
    JPY = "JPY"

class Theme(str, Enum):
    """supported themes"""
    FRESH = "fresh"
    NATURAL = "natural"
    OCEAN = "ocean"
    SUNSET = "sunset"

class FinanceBankName(str, Enum):
    """supported bank names"""
    RBC = "RBC"
    BMO = "BMO"
    TD = "TD"
    CIBC = "CIBC"
    SCOTIA = "Scotia Bank"
    HSBC = "HSBC"
    TANGERINE = "Tangerine"
    SIMPLII = "Simplii"
    OTHER = "Other"

class FinanceAccountType(str, Enum):
    """supported account types"""
    CHECKING = "checking"
    SAVINGS = "savings"
    CREDIT = "credit"
    INVESTMENT = "investment"
    CASH = "cash"
    OTHER = "other"

class FinanceAccountCardType(str, Enum):
    """supported card types"""
    VISA = "visa"
    MASTERCARD = "mastercard"
    AMEX = "amex"
    DEBIT = "debit"
    OTHER = "other"

class FinanceAccountStatus(str, Enum):
    """supported account statuses"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    CLOSED = "closed"
    FROZEN = "frozen"

class TransactionType(str, Enum):
    """交易类型"""
    EXPENSE = "expense"          # 支出
    INCOME = "income"           # 收入
    TRANSFER_OUT = "transfer_out"  # 转出
    TRANSFER_IN = "transfer_in"   # 转入
    REFUND = "refund"           # 退款
    ADJUSTMENT = "adjustment"    # 调整

class TransactionStatus(str, Enum):
    """交易状态"""
    PENDING = "pending"         # 待处理
    COMPLETED = "completed"     # 已完成
    FAILED = "failed"          # 失败
    CANCELLED = "cancelled"    # 已取消
    RECURRING = "recurring"    # 周期性
    CLEARED = "cleared"        # 已清算

class RecurringPeriod(str, Enum):
    """周期类型"""
    DAILY = "daily"           # 每天
    WEEKLY = "weekly"         # 每周
    BIWEEKLY = "biweekly"     # 每两周
    MONTHLY = "monthly"       # 每月
    QUARTERLY = "quarterly"   # 每季度
    YEARLY = "yearly"         # 每年

class ImportSource(str, Enum):
    """导入来源"""
    CSV = "csv"               # CSV文件
    EXCEL = "excel"           # Excel文件
    BANK_SYNC = "bank_sync"   # 银行同步
    MANUAL = "manual"         # 手动输入
    API = "api"               # API导入

class SubscriptionTier(str, Enum):
    """supported subscription tiers"""
    FREE = 'free'
    STANDARD = 'standard'
    PREMIUM = 'premium'

class AccountStatus(str, Enum):
    """用户账户状态"""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"

class FinanceFinanceAccountStatus(str, Enum):
    """用户财务账户状态"""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"
    EXPIRED = "expired"
    LOCKED = "locked"
    INACTIVE = "inactive"

class BankStatementFormat(str, Enum):
    """银行对账单格式"""
    CIBC_CREDIT = "cibc_credit"    # CIBC信用卡
    CIBC_DEBIT = "cibc_debit"      # CIBC借记卡
    RBC_CHECKING = "rbc_checking"   # RBC支票账户
    RBC_CREDIT = "rbc_credit"      # RBC信用卡
    RBC_SAVING = "rbc_saving"      # RBC储蓄账户

class TransactionDirection(str, Enum):
    """交易方向"""
    INFLOW = "inflow"      # 收入/转入
    OUTFLOW = "outflow"    # 支出/转出

class SystemTransactionCategory(str, Enum):
    """系统预定义的交易分类（用于自动分类和初始化默认分类）
    
    命名规则：
    1. 顶级分类：CATEGORY
    2. 二级分类：CATEGORY_SUBCATEGORY
    3. 三级分类：CATEGORY_SUBCATEGORY_DETAIL
    """
    # 收入类
    INCOME = "income"                           # 收入
    INCOME_SALARY = "income_salary"             # 工资收入
    INCOME_BONUS = "income_bonus"               # 奖金
    INCOME_INVESTMENT = "income_investment"      # 投资收入
    INCOME_REFUND = "income_refund"             # 退款
    INCOME_OTHER = "income_other"               # 其他收入

    # 交通出行
    TRANSPORT = "transport"                     # 交通出行
    TRANSPORT_FUEL = "transport_fuel"           # 加油
    TRANSPORT_PARKING = "transport_parking"     # 停车费
    TRANSPORT_PUBLIC = "transport_public"       # 公共交通
    TRANSPORT_TAXI = "transport_taxi"           # 出租车
    TRANSPORT_MAINTENANCE = "transport_maintenance"  # 车辆维护

    # 餐饮
    DINING = "dining"                          # 餐饮
    DINING_RESTAURANT = "dining_restaurant"    # 餐厅
    DINING_TAKEOUT = "dining_takeout"         # 外卖
    DINING_CAFE = "dining_cafe"               # 咖啡茶饮
    
    # 购物
    SHOPPING = "shopping"                      # 购物
    SHOPPING_GROCERY = "shopping_grocery"      # 日用品
    SHOPPING_CLOTHES = "shopping_clothes"      # 服装
    SHOPPING_DIGITAL = "shopping_digital"      # 数码电子
    SHOPPING_FURNITURE = "shopping_furniture"  # 家居家装
    
    # 居住
    HOUSING = "housing"                        # 居住
    HOUSING_RENT = "housing_rent"              # 房租
    HOUSING_MORTGAGE = "housing_mortgage"      # 房贷
    HOUSING_UTILITIES = "housing_utilities"    # 水电煤
    HOUSING_PROPERTY = "housing_property"      # 物业费
    
    # 娱乐
    ENTERTAINMENT = "entertainment"            # 娱乐
    ENTERTAINMENT_MOVIE = "entertainment_movie"  # 电影
    ENTERTAINMENT_GAME = "entertainment_game"    # 游戏
    ENTERTAINMENT_SPORTS = "entertainment_sports"  # 运动健身
    
    # 医疗健康
    HEALTHCARE = "healthcare"                  # 医疗健康
    HEALTHCARE_MEDICAL = "healthcare_medical"  # 医疗
    HEALTHCARE_INSURANCE = "healthcare_insurance"  # 保险
    
    # 教育
    EDUCATION = "education"                    # 教育
    EDUCATION_TUITION = "education_tuition"    # 学费
    EDUCATION_BOOKS = "education_books"        # 书籍
    EDUCATION_COURSE = "education_course"      # 课程

    # 转账
    TRANSFER = "transfer"                      # 转账
    TRANSFER_IN = "transfer_in"                # 转入
    TRANSFER_OUT = "transfer_out"              # 转出
    
    # 其他
    OTHER = "other"                            # 其他

    @property
    def id(self) -> str:
        """获取系统分类的ID"""
        return f"system_{self.value}"

    @property
    def display_name(self) -> str:
        """获取显示名称"""
        return self.value.replace('_', ' ').title()

    @property
    def parent(self) -> Optional['SystemTransactionCategory']:
        """获取父分类"""
        if '_' not in self.value:
            return None
        parent_value = self.value.rsplit('_', 1)[0]
        try:
            return SystemTransactionCategory(parent_value)
        except ValueError:
            return None
