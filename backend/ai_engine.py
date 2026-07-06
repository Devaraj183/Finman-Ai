import re
from datetime import datetime, timedelta
import g4f
import nest_asyncio

nest_asyncio.apply()

def process_chat(query: str, user_details: dict, transactions: list):
    """
    Uses g4f to communicate with a free LLM for financial advice.
    """
    try:
        # Context building
        context = "You are an AI Financial Advisor named Finman. You give brief, practical financial advice. Keep your response under 3 sentences.\n"
        
        # Avoid passing raw datetime objects or complex structures, simplify it
        profile_str = f"Age: {user_details.get('age', 'N/A')}, Risk Tolerance: {user_details.get('risk_tolerance', 'N/A')}, Monthly Income: {user_details.get('monthly_income', 'N/A')}"
        context += f"User Profile: {profile_str}\n"
        
        # Summarize transactions for prompt
        total_income = sum(t.amount for t in transactions if t.type == "income")
        total_expense = sum(t.amount for t in transactions if t.type == "expense")
        total_savings = sum(t.amount for t in transactions if t.type == "savings")
        balance = total_income - total_expense
        
        context += f"Financial Status: Total Income: ₹{total_income}, Total Expenses: ₹{total_expense}, Total Savings: ₹{total_savings}, Current Balance: ₹{balance}\n"
        
        messages = [
            {"role": "system", "content": context},
            {"role": "user", "content": query}
        ]
        
        response = g4f.ChatCompletion.create(
            model=g4f.models.gpt_4, # Using GPT-4 proxy
            messages=messages,
            timeout=30
        )
        return response
    except Exception as e:
        return f"AI connection error: {str(e)}. Please try again."

def analyze_spending(transactions: list):
    """
    Generates text-based insights comparing current vs previous month spending.
    """
    now = datetime.utcnow()
    current_month_tx = [t for t in transactions if t.type == 'expense' and t.date.month == now.month and t.date.year == now.year]
    
    prev_month_date = now.replace(day=1) - timedelta(days=1)
    prev_month_tx = [t for t in transactions if t.type == 'expense' and t.date.month == prev_month_date.month and t.date.year == prev_month_date.year]
    
    if not current_month_tx or not prev_month_tx:
        return "You need at least two months of transaction history for comparative AI spending analysis."
        
    current_cats = {}
    for t in current_month_tx:
        current_cats[t.category] = current_cats.get(t.category, 0) + t.amount
        
    prev_cats = {}
    for t in prev_month_tx:
        prev_cats[t.category] = prev_cats.get(t.category, 0) + t.amount
        
    insights = []
    for cat, curr_amount in current_cats.items():
        prev_amount = prev_cats.get(cat, 0)
        if prev_amount > 0:
            increase = ((curr_amount - prev_amount) / prev_amount) * 100
            if increase > 20:
                insights.append(f"Your {cat.lower()} expenses increased by {increase:.0f}% compared to last month. Reducing {cat.lower()} by ₹{curr_amount - prev_amount:,.0f} could help you achieve your savings goals faster.")
                
    if not insights:
        return "Great job! Your spending is stable compared to last month across all categories."
        
    return " ".join(insights[:2]) # Return top 2 insights

def generate_budget(income: float):
    """
    Generates a 50/30/20 budget breakdown.
    """
    return {
        "Needs (50%)": income * 0.50,
        "Wants/Entertainment (30%)": income * 0.30,
        "Savings & Investments (20%)": income * 0.20
    }

def suggest_goal_acceleration(goal: dict, transactions: list):
    """
    Provides suggestions to achieve a goal faster based on spending habits.
    """
    target = goal['target_amount']
    current = goal['current_amount']
    remaining = target - current
    
    if remaining <= 0:
        return "You have already achieved this goal!"
        
    expenses = [t for t in transactions if t.type == 'expense']
    if not expenses:
        return "I need more expense data to suggest cost-cutting measures."
        
    cats = {}
    for t in expenses:
         cats[t.category] = cats.get(t.category, 0) + t.amount
         
    # Find the highest discretionary spending category
    discretionary = ["Entertainment", "Shopping", "Dining", "Food", "Travel"]
    top_discretionary = None
    max_amount = 0
    
    for cat, amt in cats.items():
        if any(d.lower() in cat.lower() for d in discretionary) and amt > max_amount:
            top_discretionary = cat
            max_amount = amt
            
    if top_discretionary and max_amount > 1000:
        reduction = max_amount * 0.20 # Suggest cutting 20%
        return f"If you reduce your {top_discretionary.lower()} spending by ₹{reduction:,.0f}/month, you can accelerate your progress and achieve this goal significantly faster."
        
    return "Keep up your current savings rate! Make sure to log your savings transactions regularly."

def analyze_risk(user_details: dict):
    """
    Provides a simple AI risk analysis based on user profile.
    """
    risk = user_details.get('risk_tolerance', 'Medium')
    age = user_details.get('age', 30)
    
    if risk == "High":
        if age > 50:
             return {
                 "level": "High",
                 "reason": "You selected a high risk tolerance, but given your age, preserving capital is usually recommended.",
                 "recommendation": "Consider shifting some allocation to fixed-income assets or index funds for better diversification and safety near retirement."
             }
        else:
             return {
                 "level": "High",
                 "reason": "You are heavily focused on aggressive growth, which matches your younger age profile.",
                 "recommendation": "Ensure you maintain a 3-6 month emergency fund in liquid assets before committing fully to high-volatility investments."
             }
    elif risk == "Low":
         return {
             "level": "Low",
             "reason": "Your portfolio leans heavily towards safe, guaranteed-return assets.",
             "recommendation": "While safe, inflation might outpace your returns. Consider adding a small percentage of blue-chip equity for long-term growth."
         }
    else:
        return {
             "level": "Medium",
             "reason": "You have a balanced approach to risk and reward.",
             "recommendation": "Continue rebalancing your portfolio annually to maintain this healthy equilibrium."
         }
