from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from typing import List

import models, schemas, crud, auth, database, ai_engine

# Create DB tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="AI-Powered Personal Finance Advisor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Auth Endpoints ---
@app.post("/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Account already exists")
    return crud.create_user(db=db, user=user)

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wrong email",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wrong password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

from pydantic import BaseModel
class ForgotPasswordRequest(BaseModel):
    email: str

@app.post("/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    # In a real app, this would generate a token and send an email
    # For now, we return success to simulate the flow without exposing if the email exists
    return {"message": "Password reset link sent"}
@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- User Details ---
@app.get("/users/details", response_model=schemas.UserDetailResponse)
def get_details(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    details = crud.get_user_detail(db, current_user.id)
    if not details:
        raise HTTPException(status_code=404, detail="Details not found")
    return details

@app.put("/users/details", response_model=schemas.UserDetailResponse)
def update_details(details: schemas.UserDetailCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return crud.update_user_detail(db, current_user.id, details)

# --- Transactions ---
@app.post("/transactions/", response_model=schemas.TransactionResponse)
def create_transaction(transaction: schemas.TransactionCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return crud.create_transaction(db=db, transaction=transaction, user_id=current_user.id)

@app.get("/transactions/", response_model=List[schemas.TransactionResponse])
def read_transactions(skip: int = 0, limit: int = 100, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return crud.get_transactions(db, user_id=current_user.id, skip=skip, limit=limit)

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    success = crud.delete_transaction(db, transaction_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"detail": "Transaction deleted"}

# --- Goals Endpoints ---
@app.post("/goals/", response_model=schemas.GoalResponse)
def create_goal(goal: schemas.GoalCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return crud.create_goal(db=db, goal=goal, user_id=current_user.id)

@app.get("/goals/", response_model=List[schemas.GoalResponse])
def read_goals(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return crud.get_goals(db, user_id=current_user.id)

@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    success = crud.delete_goal(db, goal_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"detail": "Goal deleted"}

# --- ML / Recommendations Endpoints ---
import ml

class RecommendationRequest(schemas.BaseModel):
    goal: str

@app.post("/recommendations/")
def get_recommendation(req: RecommendationRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    details = crud.get_user_detail(db, current_user.id)
    if not details:
        raise HTTPException(status_code=400, detail="User details not found. Update profile first.")
    
    # Gather the user's full financial picture from transactions
    transactions = crud.get_transactions(db, user_id=current_user.id, skip=0, limit=10000)
    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expense = sum(t.amount for t in transactions if t.type == "expense")
    total_savings = sum(t.amount for t in transactions if t.type == "savings")
    
    # ML prediction using dataset model + user's actual financial data
    result = ml.predict_investment(
        age=details.age or 30,
        monthly_income=details.monthly_income or 5000,
        risk_tolerance=details.risk_tolerance or "Medium",
        goal=req.goal,
        total_income=total_income,
        total_expense=total_expense,
        total_savings=total_savings
    )
    
    # Get real-time market data for the top recommended instrument
    top_instrument = result["instruments"][0]["name"] if result["instruments"] else "Stocks"
    real_time_data = ml.get_real_time_data(top_instrument)
    
    return {
        "instruments": result["instruments"],
        "analysis": result["analysis"],
        "risk_profile": result["risk_profile"],
        "factors_considered": result["factors_considered"],
    }

# --- AI Assistant Endpoints ---
class ChatRequest(schemas.BaseModel):
    message: str

@app.post("/ai/chat")
def ai_chat(req: ChatRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    details = crud.get_user_detail(db, current_user.id)
    transactions = crud.get_transactions(db, user_id=current_user.id, skip=0, limit=1000)
    response = ai_engine.process_chat(req.message, details.__dict__ if details else {}, transactions)
    return {"reply": response}

@app.get("/ai/spending-analysis")
def get_spending_analysis(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    transactions = crud.get_transactions(db, user_id=current_user.id, skip=0, limit=1000)
    analysis = ai_engine.analyze_spending(transactions)
    return {"analysis": analysis}

class BudgetRequest(schemas.BaseModel):
    income: float

@app.post("/ai/generate-budget")
def generate_ai_budget(req: BudgetRequest, current_user: models.User = Depends(auth.get_current_user)):
    budget = ai_engine.generate_budget(req.income)
    return {"budget": budget}

@app.get("/ai/goal-suggestions/{goal_id}")
def get_goal_suggestions(goal_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id, models.Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    transactions = crud.get_transactions(db, user_id=current_user.id, skip=0, limit=1000)
    suggestion = ai_engine.suggest_goal_acceleration(goal.__dict__, transactions)
    return {"suggestion": suggestion}

@app.get("/ai/risk-analysis")
def get_risk_analysis(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    details = crud.get_user_detail(db, current_user.id)
    if not details:
        raise HTTPException(status_code=400, detail="Profile details missing")
    analysis = ai_engine.analyze_risk(details.__dict__)
    return analysis
