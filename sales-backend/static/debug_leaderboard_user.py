# import requests
import json
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    db_url = os.getenv("DATABASE_URL", "sqlite:///./sales.db")
    engine = create_engine(db_url)
    
    print(f"Connecting to DB: {db_url}")

    with engine.connect() as conn:
        print("Searching for user Balraj...")
        # Try case insensitive search just in case
        result = conn.execute(text("SELECT id, email, full_name, company_id, role FROM users WHERE full_name LIKE :name"), {"name": "%Balraj%"})
        user = result.fetchone()
        
        if user:
            print(f"Found User: {user.full_name} (ID: {user.id})")
            print(f"Email: {user.email}")
            print(f"Role: {user.role}")
            print(f"Company ID: {user.company_id}")
            
            # Check sales for this user
            sales_res = conn.execute(text("SELECT count(*), sum(amount) FROM sales WHERE user_id = :uid"), {"uid": user.id})
            sales_row = sales_res.fetchone()
            count = sales_row[0]
            total_amount = sales_row[1] if sales_row[1] else 0.0
            print(f"User Sales: Count={count}, Sum={total_amount}")
            
            # Check company sales (Leaderboard source)
            print(f"Checking Leaderboard Source (Company ID: {user.company_id})...")
            comp_res = conn.execute(text("SELECT count(*) FROM sales WHERE company_id = :cid"), {"cid": user.company_id})
            print(f"Total Company Sales: {comp_res.scalar()}")
            
            # Check if any other users in this company have sales
            print("Top 5 Sales in this company:")
            top_sales = conn.execute(text("SELECT user_id, amount FROM sales WHERE company_id = :cid ORDER BY amount DESC LIMIT 5"), {"cid": user.company_id})
            for row in top_sales:
                print(f"User {row.user_id}: {row.amount}")

        else:
            print("User Balraj not found in DB")
