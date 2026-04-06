from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from auth import utils, models as auth_models
from sales.router import Sale

from products.router import Product
import pandas as pd

from . import salesman_stats
from . import advanced

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)

router.include_router(salesman_stats.router)

@router.get("/dashboard-stats")
def get_dashboard_stats(
    month: str = None,
    db: Session = Depends(get_db), 
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    stats = {
        "total_revenue": 0,
        "total_orders": 0,
        "avg_order_value": 0,
        "recent_sales": []
    }

    # Base query for Sales
    sales_query = db.query(Sale).filter(Sale.company_id == current_user.company_id)
    
    # Filter for Salesman
    if current_user.role == "salesman":
        sales_query = sales_query.filter(Sale.user_id == current_user.id)

    if month:
        import datetime
        from calendar import monthrange
        try:
            year, m = map(int, month.split('-'))
            start_date = datetime.datetime(year, m, 1, 0, 0, 0)
            end_date_day = monthrange(year, m)[1]
            end_date = datetime.datetime(year, m, end_date_day, 23, 59, 59)
            sales_query = sales_query.filter(Sale.date >= start_date, Sale.date <= end_date)
        except Exception as e:
            print(f"Invalid month format: {month}, error: {e}")

    # Execute Aggregations
    total_revenue = sales_query.with_entities(func.sum(Sale.amount)).scalar() or 0
    total_orders = sales_query.count()
    avg_order_value = (total_revenue / total_orders) if total_orders > 0 else 0

    # Recent Sales
    recent_sales = sales_query.order_by(Sale.date.desc()).limit(5).all()
    
    # Formatting recent sales (joining with Product and Salesman/User)
    # Using simple iteration to format response
    formatted_sales = []
    for sale in recent_sales:
        # Fetch product name (inefficient N+1 but ok for 5 items)
        product = db.query(Product).filter(Product.id == sale.product_id).first()
        product_name = product.name if product else "Unknown Product"
        
        # User/Salesman name
        salesman_name = current_user.full_name # default if self
        if current_user.role == "manager":
            # If manager, fetch the salesman name
            s_user = db.query(auth_models.User).filter(auth_models.User.id == sale.user_id).first()
            salesman_name = s_user.full_name if s_user else "Unknown"

        formatted_sales.append({
            "id": sale.id,
            "product": product_name,
            "salesman": salesman_name,
            "amount": sale.amount,
            "date": sale.date
        })

    # Total Company Target for the month
    all_salesmen = db.query(auth_models.User).filter(
        auth_models.User.company_id == current_user.company_id,
        auth_models.User.role == "salesman"
    ).all()
    
    total_company_target = 0
    current_month_now = datetime.datetime.utcnow().strftime("%Y-%m")
    target_month_now = month if month else current_month_now
    
    # Pre-fetch monthly targets for all salesmen
    mts = db.query(auth_models.MonthlyTarget).filter(auth_models.MonthlyTarget.month == target_month_now).all()
    target_map = {t.user_id: t.target_amount for t in mts}
    
    for sm in all_salesmen:
        if sm.id in target_map:
            total_company_target += target_map[sm.id]
        elif target_month_now < current_month_now:
            total_company_target += sm.sales_target or 0
        else:
            total_company_target += 0

    stats["total_revenue"] = total_revenue
    stats["total_orders"] = total_orders
    stats["avg_order_value"] = round(avg_order_value, 2)
    stats["total_company_target"] = total_company_target
    stats["achieved_percent"] = round((total_revenue / total_company_target * 100), 1) if total_company_target > 0 else 0
    stats["recent_sales"] = formatted_sales

    return stats

@router.get("/reports")
def get_reports_data(
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    from sqlalchemy.orm import joinedload
    # Base query
    query = db.query(Sale).filter(Sale.company_id == current_user.company_id)
    
    # Eager load
    query = query.options(joinedload(Sale.user), joinedload(Sale.product))
    
    if current_user.role == "salesman":
        query = query.filter(Sale.user_id == current_user.id)
        
    if start_date:
        query = query.filter(Sale.date >= start_date)
    if end_date:
        query = query.filter(Sale.date <= end_date)
        
    sales = query.all()
    
    # Aggregations
    sales_by_salesman = {}
    sales_by_product = {}
    sales_by_month = {}
    
    for sale in sales:
        # Salesman
        # Fetch name if not already loaded (ideally use eager loading)
        s_name = "Unknown"
        if sale.user:
            s_name = sale.user.full_name
        elif sale.user_id:
             # Fallback if relationship not loaded? (It should be if lazy='joined' or just accessed)
             # But let's be safe
             u = db.query(auth_models.User).filter(auth_models.User.id == sale.user_id).first()
             if u: s_name = u.full_name
             
        if s_name not in sales_by_salesman:
            sales_by_salesman[s_name] = {"amount": 0, "count": 0}
        sales_by_salesman[s_name]["amount"] += sale.amount
        sales_by_salesman[s_name]["count"] += 1
        
        # Product
        p_name = "Unknown Product"
        if sale.product:
            p_name = sale.product.name
        elif sale.product_id:
             p = db.query(Product).filter(Product.id == sale.product_id).first()
             if p: p_name = p.name
             
        if p_name not in sales_by_product:
            sales_by_product[p_name] = {"amount": 0, "count": 0}
        sales_by_product[p_name]["amount"] += sale.amount
        sales_by_product[p_name]["count"] += sale.quantity
        
        # Month
        month_key = sale.date.strftime("%Y-%m") if sale.date else "Unknown"
        if month_key not in sales_by_month:
            sales_by_month[month_key] = 0
        sales_by_month[month_key] += sale.amount
        
    return {
        "sales_by_salesman": sales_by_salesman,
        "sales_by_product": sales_by_product,
        "sales_by_month": sales_by_month
    }

@router.get("/leaderboard")
def get_leaderboard(
    month: str = None,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    import datetime
    from calendar import monthrange
    
    query = db.query(
        auth_models.User,
        func.sum(Sale.amount).label("total_revenue"),
        func.sum(Sale.quantity).label("total_quantity")
    ).join(Sale, Sale.user_id == auth_models.User.id).filter(
        Sale.company_id == current_user.company_id
    )

    if month:
        try:
            year, m = map(int, month.split('-'))
            start_date = datetime.datetime(year, m, 1, 0, 0, 0)
            end_date_day = monthrange(year, m)[1]
            end_date = datetime.datetime(year, m, end_date_day, 23, 59, 59)
            query = query.filter(Sale.date >= start_date, Sale.date <= end_date)
        except Exception as e:
            pass

    results = query.group_by(auth_models.User.id).order_by(func.sum(Sale.amount).desc()).all()

    leaderboard = []
    rank = 1
    
    current_month_str = datetime.datetime.utcnow().strftime("%Y-%m")
    target_month_str = month if month else current_month_str
    mts = db.query(auth_models.MonthlyTarget).filter(auth_models.MonthlyTarget.month == target_month_str).all()
    target_dict = {t.user_id: t.target_amount for t in mts}

    for user, revenue, quantity in results:
        mt_target = target_dict.get(user.id)
        if mt_target is not None:
            user_target = mt_target
        elif target_month_str < current_month_str:
            user_target = user.sales_target or 0
        else:
            user_target = 0
            
        leaderboard.append({
            "rank": rank,
            "name": user.full_name,
            "avatar": user.full_name[0] if user.full_name else "?",
            "revenue": revenue,
            "quantity": quantity,
            "sales_target": user_target,
            "achieved_percent": (revenue / user_target * 100) if user_target > 0 else 0
        })
        rank += 1
            
    return {
        "company_name": current_user.company.name if current_user.company else "Your Company",
        "leaderboard": leaderboard
    }

@router.get("/kpi/executive")
def get_executive_kpis(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    # Fetch all sales for company
    sales = db.query(Sale).filter(Sale.company_id == current_user.company_id).all()
    # Fetch salesman count
    salesmen_count = db.query(auth_models.User).filter(
        auth_models.User.company_id == current_user.company_id,
        auth_models.User.role == "salesman"
    ).count()
    
    df = advanced.get_sales_df(sales)
    return advanced.calculate_kpis(df, salesmen_count)

@router.get("/products/abc")
def get_abc_analysis(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    sales = db.query(Sale).filter(Sale.company_id == current_user.company_id).all()
    products = db.query(Product).filter(Product.company_id == current_user.company_id).all()
    
    sales_df = advanced.get_sales_df(sales)
    # simple product list
    products_list = [{"id": p.id, "name": p.name} for p in products]
    products_df = pd.DataFrame(products_list) if products_list else pd.DataFrame()
    
    return advanced.calculate_abc_analysis(sales_df, products_df)

@router.get("/customers/rfm")
def get_rfm_analysis(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    sales = db.query(Sale).filter(Sale.company_id == current_user.company_id).all()
    sales_df = advanced.get_sales_df(sales)
    return advanced.calculate_rfm(sales_df)

@router.get("/salesmen/consistency")
def get_salesman_consistency(
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    sales = db.query(Sale).filter(Sale.company_id == current_user.company_id).all()
    sales_df = advanced.get_sales_df(sales)
    scores = advanced.calculate_consistency_score(sales_df)
    
    # Map user_id to name
    user_ids = [s['user_id'] for s in scores]
    users = db.query(auth_models.User).filter(auth_models.User.id.in_(user_ids)).all()
    user_map = {u.id: u.full_name for u in users}
    
    for s in scores:
        s['name'] = user_map.get(s['user_id'], 'Unknown')
        
    return scores
