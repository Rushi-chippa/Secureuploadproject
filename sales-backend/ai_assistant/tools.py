from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from auth import models as auth_models
from sales.router import Sale
from products.router import Product
import pandas as pd
from analytics import advanced 
from sales_predictor import SalesPredictor

def get_leaderboard_context(db: Session, company_id: int):
    """
    Fetches the leaderboard for the company and returns it as a string context.
    """
    results = db.query(
        auth_models.User,
        func.sum(Sale.amount).label("total_revenue"),
        func.sum(Sale.quantity).label("total_quantity")
    ).join(Sale, Sale.user_id == auth_models.User.id).filter(
        Sale.company_id == company_id
    ).group_by(auth_models.User.id).order_by(func.sum(Sale.amount).desc()).all()

    if not results:
        return "No sales data available for leaderboard."

    context = "Leaderboard:\n"
    rank = 1
    for user, revenue, quantity in results:
        context += f"{rank}. {user.full_name}: ₹{revenue:,.2f} ({quantity} sales)\n"
        rank += 1
    
    return context

def get_sales_summary_context(db: Session, company_id: int):
    """
    Fetches sales summary (total revenue, orders, avg order value).
    """
    sales_query = db.query(Sale).filter(Sale.company_id == company_id)
    total_revenue = sales_query.with_entities(func.sum(Sale.amount)).scalar() or 0
    total_orders = sales_query.count()
    avg_order_value = (total_revenue / total_orders) if total_orders > 0 else 0

    return f"Company Sales Summary:\nTotal Revenue: ₹{total_revenue:,.2f}\nTotal Orders: {total_orders}\nAvg Order Value: ₹{avg_order_value:,.2f}"

def get_product_performance_context(db: Session, company_id: int):
    """
    Fetches top selling products.
    """
    results = db.query(
        Product.name,
        func.sum(Sale.amount).label("total_revenue")
    ).join(Sale, Sale.product_id == Product.id).filter(
        Sale.company_id == company_id
    ).group_by(Product.id).order_by(func.sum(Sale.amount).desc()).limit(5).all()

    if not results:
        return "No product sales data."

    context = "Top 5 Products by Revenue:\n"
    for name, revenue in results:
        context += f"- {name}: ₹{revenue:,.2f}\n"
    
    return context

def get_low_stock_context(db: Session, company_id: int, threshold: int = 10):
    """
    Fetches products with low stock.
    """
    results = db.query(Product.name, Product.quantity).filter(
        Product.company_id == company_id,
        Product.quantity <= threshold
    ).limit(5).all()

    if not results:
        return "No low stock alerts."

    context = "Low Stock Alerts (Qty <= 10):\n"
    for name, quantity in results:
        context += f"- {name}: {quantity} remaining\n"
    
    return context

def get_regional_sales_context(db: Session, company_id: int):
    """
    Fetches sales summary by region.
    """
    results = db.query(
        Sale.region,
        func.sum(Sale.amount).label("total_revenue")
    ).filter(
        Sale.company_id == company_id,
        Sale.region.isnot(None)
    ).group_by(Sale.region).order_by(func.sum(Sale.amount).desc()).limit(5).all()

    if not results:
        return "No regional sales data."

    context = "Top 5 Regions by Revenue:\n"
    for region, revenue in results:
        context += f"- {region}: ₹{revenue:,.2f}\n"
    
    return context

def get_prediction_context(company_id: int, user_id: int = None):
    """
    Fetches sales predictions and returns them as a string context.
    """
    try:
        predictor = SalesPredictor()
        forecast_data = predictor.get_full_forecast(company_id=company_id, user_id=user_id)
        summary = forecast_data.get('summary', {})
        
        if 'message' in summary and "Not enough data" in summary['message']:
            return "Future Sales Forecast: Not enough historical data yet to generate an AI prediction."

        context = "Future Sales Forecast (AI Predictions):\n"
        context += f"- Next 1 Month: ₹{summary.get('forecast_1m', 0):,.2f}\n"
        context += f"- Next 3 Months: ₹{summary.get('forecast_3m', 0):,.2f}\n"
        context += f"- Next 6 Months: ₹{summary.get('forecast_6m', 0):,.2f}\n"
        context += f"- Predicted Trend: {summary.get('predicted_growth', 'Unknown')}\n"
        
        return context
    except Exception as e:
        print(f"Error generating AI prediction context: {e}")
        return "Future Sales Forecast: Currently unavailable due to a technical error."

