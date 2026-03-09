from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from auth import utils, models as auth_models
from sales.router import Sale
from products.router import Product
from datetime import datetime, timedelta
import pandas as pd
from sales_predictor import SalesPredictor

router = APIRouter(
    prefix="/salesman",
    tags=["Salesman Analytics"]
)

@router.get("/dashboard")
def get_salesman_dashboard_data(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    # Ensure role is salesman (or manager viewing as salesman?)
    # For now assume current user is the salesman
    user_id = current_user.id
    
    # 1. Total Sales & Earnings
    total_sales_query = db.query(func.sum(Sale.amount)).filter(Sale.user_id == user_id)
    total_sales = total_sales_query.scalar() or 0.0
    
    # Commission Calculation (e.g., 5% of sales)
    commission_rate = 0.05
    earnings = total_sales * commission_rate
    
    # 2. Target vs Achieved
    target = current_user.sales_target or 0
    achieved_percent = (total_sales / target * 100) if target > 0 else 0
    
    # 3. Rank (within company)
    # Get total sales for all salesmen in company
    company_salesmen_sales = db.query(
        Sale.user_id, func.sum(Sale.amount).label("total")
    ).filter(
        Sale.company_id == current_user.company_id
    ).group_by(Sale.user_id).order_by(func.sum(Sale.amount).desc()).all()
    
    rank = 1
    for s_id, amount in company_salesmen_sales:
        if s_id == user_id:
            break
        rank += 1
        
    # 4. Product-wise Distribution
    product_dist = db.query(
        Product.name, func.sum(Sale.amount).label("value")
    ).join(Sale).filter(
        Sale.user_id == user_id
    ).group_by(Product.name).all()
    
    product_data = [{"name": p[0], "value": p[1]} for p in product_dist]
    
    # 5. Region-wise Sales
    region_dist = db.query(
        Sale.region, func.sum(Sale.amount).label("value")
    ).filter(
        Sale.user_id == user_id,
        Sale.region != None
    ).group_by(Sale.region).all()
    
    region_data = [{"name": r[0], "value": r[1]} for r in region_dist]
    
    # 6. Sales Trend (Daily/Monthly)
    # Get sales for last 30 days for chart
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_sales = db.query(
        func.date(Sale.date).label("date"), func.sum(Sale.amount).label("amount")
    ).filter(
        Sale.user_id == user_id,
        Sale.date >= thirty_days_ago
    ).group_by(func.date(Sale.date)).order_by("date").all()
    
    trend_data = [{"date": str(d[0]), "amount": d[1]} for d in daily_sales]
    
    # 7. Prediction
    # Use the advanced SalesPredictor but filtered for this user
    try:
        predictor = SalesPredictor()
        forecast_data = predictor.get_full_forecast(user_id=user_id)
        prediction_summary = forecast_data.get('summary', {"message": "Not enough data"})
        
        # Dashboard expects predicted_next_month, but predictor returns forecast_1m
        if 'forecast_1m' in prediction_summary:
            prediction_summary['predicted_next_month'] = prediction_summary['forecast_1m']
    except Exception as e:
        print(f"Error in salesman prediction: {e}")
        prediction_summary = {"message": "Error calculating prediction"}

    return {
        "kpi": {
            "total_sales": total_sales,
            "earnings": earnings,
            "target": target,
            "achieved_percent": round(achieved_percent, 1),
            "rank": rank
        },

        "charts": {
            "product_distribution": product_data,
            "region_distribution": region_data,
            "sales_trend": trend_data
        },
        "prediction": prediction_summary
    }
