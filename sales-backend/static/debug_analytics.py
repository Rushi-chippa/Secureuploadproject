import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from database import SessionLocal
from auth import models as auth_models
from sales.router import Sale
from products.router import Product
from analytics import advanced
import pandas as pd

def debug_analytics():
    db = SessionLocal()
    try:
        print("--- Debugging Analytics ---")
        
        # 1. Get a user (Salesman or Manager)
        # defaulting to first user
        user = db.query(auth_models.User).first()
        if not user:
            print("No users found!")
            return

        print(f"Using User: {user.full_name} (Role: {user.role}, Company ID: {user.company_id})")

        # 2. Fetch Sales
        sales = db.query(Sale).filter(Sale.company_id == user.company_id).all()
        print(f"Total Sales Found: {len(sales)}")
        
        if not sales:
            print("No sales data found. This is likely the reason for empty charts.")
            return

        # 3. Check Data Quality
        sales_with_customer = [s for s in sales if s.customer_name]
        print(f"Sales with Customer Name: {len(sales_with_customer)}")
        
        if len(sales_with_customer) == 0:
            print("WARNING: No sales have customer_name. RFM Analysis will fail.")

        # 4. Run Advanced Analytics manually
        print("\n--- Running get_sales_df ---")
        sales_df = advanced.get_sales_df(sales)
        print(sales_df.head())
        print(f"DataFrame Shape: {sales_df.shape}")

        print("\n--- Running ABC Analysis ---")
        products = db.query(Product).filter(Product.company_id == user.company_id).all()
        products_list = [{"id": p.id, "name": p.name} for p in products]
        products_df = pd.DataFrame(products_list) if products_list else pd.DataFrame()
        
        abc = advanced.calculate_abc_analysis(sales_df, products_df)
        print(f"ABC Results: {abc}")

        print("\n--- Running RFM Analysis ---")
        rfm = advanced.calculate_rfm(sales_df)
        print(f"RFM Results ({len(rfm)} segments):")
        print(rfm[:5])

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_analytics()
