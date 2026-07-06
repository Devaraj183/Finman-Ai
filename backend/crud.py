from sqlalchemy.orm import Session
import models, schemas
from auth import get_password_hash

# --- Users ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    # create default user details
    db_detail = models.UserDetail(user_id=db_user.id)
    db.add(db_detail)
    db.commit()
    return db_user

# --- User Details ---
def get_user_detail(db: Session, user_id: int):
    return db.query(models.UserDetail).filter(models.UserDetail.user_id == user_id).first()

def update_user_detail(db: Session, user_id: int, detail: schemas.UserDetailCreate):
    db_detail = get_user_detail(db, user_id)
    if not db_detail:
        return None
    for key, value in detail.dict(exclude_unset=True).items():
        setattr(db_detail, key, value)
    db.commit()
    db.refresh(db_detail)
    return db_detail

# --- Transactions ---
def create_transaction(db: Session, transaction: schemas.TransactionCreate, user_id: int):
    db_transaction = models.Transaction(**transaction.dict(), user_id=user_id)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def get_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Transaction).filter(models.Transaction.user_id == user_id).offset(skip).limit(limit).all()

def delete_transaction(db: Session, transaction_id: int, user_id: int):
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id, models.Transaction.user_id == user_id).first()
    if db_transaction:
        db.delete(db_transaction)
        db.commit()
        return True
    return False

# --- Goals ---
def create_goal(db: Session, goal: schemas.GoalCreate, user_id: int):
    db_goal = models.Goal(**goal.dict(), user_id=user_id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def get_goals(db: Session, user_id: int):
    return db.query(models.Goal).filter(models.Goal.user_id == user_id).all()

def delete_goal(db: Session, goal_id: int, user_id: int):
    db_goal = db.query(models.Goal).filter(models.Goal.id == goal_id, models.Goal.user_id == user_id).first()
    if db_goal:
        db.delete(db_goal)
        db.commit()
        return True
    return False
