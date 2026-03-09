from sqlalchemy import create_engine, text
from database import DATABASE_URL
import sys

def inspect_categories():
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            # 1. Get the manager user (assuming the user who reported this is likely rushichippa7350@gmail.com based on previous logs)
            # checking typical user
            print("--- Checking User ---")
            result = conn.execute(text("SELECT id, email, role, company_id FROM users WHERE role='manager' LIMIT 1"))
            user = result.fetchone()
            if not user:
                print("No manager found.")
            else:
                print(f"Manager: ID={user.id}, Email={user.email}, CompanyID={user.company_id}")
                company_id = user.company_id

                # 2. List categories for this company
                print(f"\n--- Checking Categories for Company {company_id} ---")
                cats = conn.execute(text("SELECT id, name, company_id FROM categories WHERE company_id = :cid"), {"cid": company_id})
                categories = list(cats)
                if not categories:
                    print("No categories found for this company.")
                else:
                    for c in categories:
                        print(f"Category: ID={c.id}, Name={c.name}, CompanyID={c.company_id}")

                # 3. Check if there are categories with NULL company_id (global?)
                print("\n--- Checking Categories with NULL Company ---")
                null_cats = conn.execute(text("SELECT id, name, company_id FROM categories WHERE company_id IS NULL"))
                for c in null_cats:
                    print(f"Category: ID={c.id}, Name={c.name}, CompanyID={c.company_id}")

                # 4. Check all categories just in case
                print("\n--- All Categories Sample ---")
                all_cats = conn.execute(text("SELECT id, name, company_id FROM categories LIMIT 5"))
                for c in all_cats:
                    print(f"Category: ID={c.id}, Name={c.name}, CompanyID={c.company_id}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_categories()
