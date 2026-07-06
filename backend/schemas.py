from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TransactionTypeEnum(str, Enum):
    income = "income"
    expense = "expense"
    savings = "savings"

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

# --- User Detail Schemas ---
class UserDetailBase(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    monthly_income: Optional[float] = 0.0
    risk_tolerance: Optional[str] = "Medium"
    photo: Optional[str] = None

class UserDetailCreate(UserDetailBase):
    pass

class UserDetailResponse(UserDetailBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

# --- Transaction Schemas ---
class TransactionBase(BaseModel):
    type: TransactionTypeEnum
    amount: float
    category: str
    description: Optional[str] = None
    date: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

# --- Goal Schemas ---
class GoalBase(BaseModel):
    goal_name: str
    target_amount: float
    current_amount: Optional[float] = 0.0
    target_date: Optional[datetime] = None

class GoalCreate(GoalBase):
    pass

class GoalResponse(GoalBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True
