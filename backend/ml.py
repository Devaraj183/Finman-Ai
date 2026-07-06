import pandas as pd
import pickle
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "investment_model.pkl")

# ─── Investment descriptions based on dataset knowledge ───
INSTRUMENT_DESCRIPTIONS = {
    "Mutual Funds": {
        "short": "Diversified, professionally managed fund pooling money from many investors.",
        "why_low_risk": "Mutual funds spread risk across many assets, making them ideal for conservative investors who want steady growth without heavy market exposure.",
        "why_medium_risk": "A balanced mutual fund portfolio can offer moderate growth with manageable risk, perfect for investors building long-term wealth.",
        "why_high_risk": "Aggressive equity mutual funds can deliver high returns, suitable for risk-tolerant investors with a long time horizon.",
        "best_for": "Long-term wealth building, retirement planning"
    },
    "PPF": {
        "short": "Public Provident Fund — a government-backed, tax-free savings scheme with guaranteed returns.",
        "why_low_risk": "PPF offers guaranteed 7-8% annual returns with zero market risk and tax benefits, ideal for safety-first investors.",
        "why_medium_risk": "PPF provides a rock-solid foundation in any portfolio, ensuring part of your savings grows with guaranteed returns.",
        "why_high_risk": "Even aggressive investors benefit from a PPF allocation as a safety net with compounding, tax-free returns.",
        "best_for": "Tax saving, retirement, guaranteed returns"
    },
    "NPS": {
        "short": "National Pension System — a market-linked retirement savings scheme with tax benefits.",
        "why_low_risk": "NPS with a high debt allocation offers stable retirement growth with additional tax deductions under Section 80CCD.",
        "why_medium_risk": "A balanced NPS allocation between equity and debt provides solid retirement growth with manageable volatility.",
        "why_high_risk": "Maximizing NPS equity allocation allows aggressive growth for retirement, combined with significant tax advantages.",
        "best_for": "Retirement planning, tax benefits"
    },
    "Stocks": {
        "short": "Direct equity — buying shares of individual companies for ownership and potential high growth.",
        "why_low_risk": "Investing in blue-chip, dividend-paying stocks provides steady income with moderate capital appreciation for cautious investors.",
        "why_medium_risk": "A mix of growth and value stocks offers strong return potential while maintaining a diversified risk profile.",
        "why_high_risk": "Direct stock investing offers the highest return potential, perfect for investors who can handle market volatility.",
        "best_for": "Capital appreciation, long-term wealth creation"
    },
    "Real Estate": {
        "short": "Investment in property — land, residential, or commercial — for rental income and appreciation.",
        "why_low_risk": "Real estate provides tangible asset security with steady rental income and long-term price appreciation.",
        "why_medium_risk": "Property investment diversifies your portfolio beyond financial markets and offers both income and growth potential.",
        "why_high_risk": "Real estate can be leveraged for amplified returns, offering both rental yield and significant capital gains.",
        "best_for": "Wealth preservation, rental income, house purchase goals"
    },
    "Real Estate Investment Trusts (REITs)": {
        "short": "REITs let you invest in real estate without buying property — like a stock for buildings.",
        "why_low_risk": "REITs offer real estate exposure with high liquidity and regular dividend income, without the hassle of managing property.",
        "why_medium_risk": "REITs provide portfolio diversification with steady dividends and the growth potential of commercial real estate.",
        "why_high_risk": "REITs in commercial or specialty sectors can offer high yields, adding real estate growth to an aggressive portfolio.",
        "best_for": "Passive real estate income, portfolio diversification"
    },
    "Home Loans": {
        "short": "Leverage a home loan to purchase property — build equity while living in your own home.",
        "why_low_risk": "A home loan at current low interest rates lets you build equity in a tangible asset while preserving liquid savings.",
        "why_medium_risk": "Strategic use of home loans allows you to own property while keeping capital free for other investments.",
        "why_high_risk": "Leveraging a home loan frees up capital for higher-return investments, using low-cost debt to build wealth faster.",
        "best_for": "Home purchase, building equity"
    },
    "Education Bonds": {
        "short": "Government or corporate bonds specifically designed to fund educational expenses with stable returns.",
        "why_low_risk": "Education bonds offer guaranteed returns with minimal risk, perfectly aligned with the fixed timeline of education goals.",
        "why_medium_risk": "Education bonds provide certainty for education funding while allowing other portfolio components to pursue growth.",
        "why_high_risk": "Even aggressive investors should secure education goals with bonds, ensuring children's future is not subject to market risk.",
        "best_for": "Education funding, children's future"
    },
    "Education Loans": {
        "short": "Borrow to fund education with favorable terms — invest in your future earning potential.",
        "why_low_risk": "Education loans with tax-deductible interest allow you to fund education without depleting savings.",
        "why_medium_risk": "Strategic use of education loans preserves your investment capital while investing in higher earning potential.",
        "why_high_risk": "Leverage education loans to maintain your investment positions while funding career-boosting education.",
        "best_for": "Higher education, skill development"
    },
    "National Scholarship Scheme": {
        "short": "Government scholarship and education savings programs with guaranteed benefits.",
        "why_low_risk": "Government-backed schemes offer zero-risk education funding with additional benefits and tax advantages.",
        "why_medium_risk": "Combining scholarships with education savings provides a secure foundation for education funding.",
        "why_high_risk": "Securing education through government schemes frees up capital for higher-return investments elsewhere.",
        "best_for": "Education funding, government benefits"
    }
}


def get_description(instrument_name, risk_tolerance):
    """Get a tailored description for an instrument based on risk tolerance."""
    risk_key = f"why_{risk_tolerance.lower()}_risk" if risk_tolerance else "why_medium_risk"
    
    # Try exact match first
    if instrument_name in INSTRUMENT_DESCRIPTIONS:
        info = INSTRUMENT_DESCRIPTIONS[instrument_name]
        return {
            "short": info["short"],
            "reason": info.get(risk_key, info["why_medium_risk"]),
            "best_for": info["best_for"]
        }
    
    # Try partial match
    for key, info in INSTRUMENT_DESCRIPTIONS.items():
        if key.lower() in instrument_name.lower() or instrument_name.lower() in key.lower():
            return {
                "short": info["short"],
                "reason": info.get(risk_key, info["why_medium_risk"]),
                "best_for": info["best_for"]
            }
    
    return {
        "short": f"A recommended financial instrument based on your profile.",
        "reason": "This asset class aligns with your financial goals and risk profile as determined by our ML model.",
        "best_for": "Portfolio diversification"
    }


def get_real_time_data(instrument: str):
    """Fetch real-time market data for the recommended instrument."""
    ticker_map = {
        "Stocks": "^NSEI",          # Nifty 50 (Indian market)
        "Mutual Funds": "0P0000XVAP.BO",  # SBI Bluechip Fund
        "PPF": "^TNX",              # 10-Year Treasury Yield as proxy
        "NPS": "^TNX",
        "Real Estate": "VNQ",
        "Real Estate Investment Trusts": "VNQ",
        "Home Loans": "^TNX",
        "Education Bonds": "TIP",
        "Education Loans": "^TNX",
        "National Scholarship Scheme": "^TNX"
    }
    
    instrument_lower = str(instrument).lower()
    selected_ticker = "^NSEI"
    ticker_label = "Nifty 50"
    
    for key, ticker in ticker_map.items():
        if key.lower() in instrument_lower:
            selected_ticker = ticker
            ticker_label = key
            break
    
    try:
        import yfinance as yf
        stock = yf.Ticker(selected_ticker)
        hist = stock.history(period="5d")
        if hist.empty:
            return {"ticker": selected_ticker, "ticker_label": ticker_label, "current_price": "N/A", "change_pct": 0, "error": "No data found"}
        
        current_price = hist['Close'].iloc[-1]
        prev_price = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
        change_pct = ((current_price - prev_price) / prev_price) * 100
        
        return {
            "ticker": selected_ticker,
            "ticker_label": ticker_label,
            "current_price": round(current_price, 2),
            "change_pct": round(change_pct, 2),
            "error": None
        }
    except Exception as e:
        return {"ticker": selected_ticker, "ticker_label": ticker_label, "current_price": "N/A", "change_pct": 0, "error": str(e)}


def predict_investment(age: int, monthly_income: float, risk_tolerance: str, goal: str,
                       total_income: float = 0, total_expense: float = 0, total_savings: float = 0):
    """
    Predict investment using the ML model trained on the Kaggle dataset,
    and enhance the recommendation with user's actual financial data.
    """
    if not os.path.exists(MODEL_PATH):
        return {"instruments": [], "analysis": "Model not trained yet. Please run train_model.py first."}

    with open(MODEL_PATH, 'rb') as f:
        model_data = pickle.load(f)

    clf = model_data['model']
    le_goals = model_data['le_goals']
    le_gender = model_data['le_gender']
    le_risk = model_data['le_risk']
    goals_classes = model_data['goals_classes']
    gender_classes = model_data['gender_classes']
    risk_classes = model_data['risk_classes']

    # Encode goal
    try:
        if goal in goals_classes:
            goal_encoded = le_goals.transform([goal])[0]
        else:
            goal_encoded = le_goals.transform([goals_classes[0]])[0]
            for c in goals_classes:
                if goal.lower() in c.lower() or c.lower() in goal.lower():
                    goal_encoded = le_goals.transform([c])[0]
                    break
    except:
        goal_encoded = 0

    # Encode risk
    try:
        if risk_tolerance in risk_classes:
            risk_encoded = le_risk.transform([risk_tolerance])[0]
        else:
            risk_encoded = le_risk.transform([risk_classes[0]])[0]
    except:
        risk_encoded = 0

    gender_encoded = le_gender.transform(['Male'])[0] if 'Male' in gender_classes else 0
    financial_literacy = 3

    X_pred = pd.DataFrame([{
        'Individual Goals Encoded': goal_encoded,
        'Age': age,
        'Gender Encoded': gender_encoded,
        'Risk Tolerance Encoded': risk_encoded,
        'Financial Literacy': financial_literacy
    }])

    try:
        prediction = clf.predict(X_pred)[0]
    except Exception as e:
        prediction = "Mutual Funds, Stocks"

    # Parse the comma-separated instrument list from the model
    instruments = [i.strip() for i in prediction.split(',')]
    
    # Calculate financial health metrics
    net_monthly = monthly_income - (total_expense / max(1, 1)) if total_expense > 0 else monthly_income
    savings_rate = (total_savings / max(total_income, 1)) * 100 if total_income > 0 else 0
    
    # Build analysis narrative considering user's actual financial data
    analysis_parts = []
    
    if total_income > 0 and total_expense > 0:
        expense_ratio = (total_expense / total_income) * 100
        if expense_ratio > 80:
            analysis_parts.append(f"Your expense-to-income ratio is high at {expense_ratio:.0f}%. We recommend focusing on low-risk, liquid instruments first to build an emergency fund before aggressive investing.")
            # Prioritize safer instruments
            safe_instruments = ["PPF", "Mutual Funds", "NPS"]
            instruments = [i for i in instruments if any(s.lower() in i.lower() for s in safe_instruments)] + \
                          [i for i in instruments if not any(s.lower() in i.lower() for s in safe_instruments)]
        elif expense_ratio > 50:
            analysis_parts.append(f"Your expense-to-income ratio is {expense_ratio:.0f}%, which is moderate. A balanced approach mixing safe and growth instruments is recommended.")
        else:
            analysis_parts.append(f"Your expense-to-income ratio is healthy at {expense_ratio:.0f}%. You have good capacity for growth-oriented investments.")
    
    if total_savings > 0:
        analysis_parts.append(f"You have saved ₹{total_savings:,.0f} so far. This savings history demonstrates financial discipline, which supports our recommendation.")
    
    if age and age < 30:
        analysis_parts.append("Your young age gives you a longer investment horizon, allowing you to recover from market dips and benefit from compounding.")
    elif age and age >= 30 and age < 50:
        analysis_parts.append("At your age, a balanced portfolio with a mix of growth and stability is ideal for maximizing returns while managing risk.")
    elif age and age >= 50:
        analysis_parts.append("Given your age, we lean towards capital preservation and stable income-generating instruments to protect your accumulated wealth.")
    
    if monthly_income > 0:
        if monthly_income < 30000:
            analysis_parts.append(f"With a monthly income of ₹{monthly_income:,.0f}, we prioritize instruments with low minimum investment requirements and high liquidity.")
        elif monthly_income < 100000:
            analysis_parts.append(f"With a monthly income of ₹{monthly_income:,.0f}, you have flexibility to diversify across multiple asset classes for optimal growth.")
        else:
            analysis_parts.append(f"With a monthly income of ₹{monthly_income:,.0f}, you can access premium investment options and build a well-diversified portfolio.")

    analysis = " ".join(analysis_parts) if analysis_parts else "Based on your profile, here are the recommended investment instruments."

    # Build detailed instrument list with descriptions
    instrument_details = []
    for i, inst in enumerate(instruments):
        desc = get_description(inst, risk_tolerance)
        instrument_details.append({
            "name": inst,
            "rank": i + 1,
            "description": desc["short"],
            "reason": desc["reason"],
            "best_for": desc["best_for"]
        })
    
    return {
        "instruments": instrument_details,
        "analysis": analysis,
        "risk_profile": risk_tolerance or "Medium",
        "factors_considered": {
            "age": age,
            "monthly_income": monthly_income,
            "risk_tolerance": risk_tolerance,
            "goal": goal,
            "total_income": total_income,
            "total_expense": total_expense,
            "total_savings": total_savings
        }
    }
