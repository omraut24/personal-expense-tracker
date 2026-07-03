from pydantic import BaseModel
from typing import List


class MonthlySummary(BaseModel):
    year: int
    month: int
    total_income: float
    total_expenses: float
    balance: float
    savings_rate: float


class CategoryBreakdown(BaseModel):
    category_name: str
    category_type: str
    total: float
    percentage: float


class MonthlyTrend(BaseModel):
    year: int
    month: int
    label: str
    income: float
    expenses: float


class SummaryResponse(BaseModel):
    monthly: MonthlySummary
    by_category: List[CategoryBreakdown]
    trend: List[MonthlyTrend]
