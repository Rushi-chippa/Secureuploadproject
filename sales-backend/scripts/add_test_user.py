import os
from dotenv import load_dotenv
from database import SessionLocal
from auth.models import User, Company
from auth.utils import get_password_hash

load_dotenv()

def add_test_user():
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "endhungernow24@gmail.com").first()
        if existing_user:
            print("User 'endhungernow24@gmail.com' already exists in the database.")
            return

        # Get first company
        company = db.query(Company).first()
        if not company:
            print("No company found in the database. Creating a placeholder company...")
            company = Company(name="Test Company", industry="Software")
            db.add(company)
            db.commit()
            db.refesh(company)

        # Create new user
        new_user = User(
            email="endhungernow24@gmail.com",
            full_name="Test User (Resend Signup)",
            hashed_password=get_password_hash("Password123!"), 
            role="manager",
            company_id=company.id
        )
        db.add(new_user)
        db.commit()
        print(f"SUCCESS: Added test user 'endhungernow24@gmail.com' to Database (Company: {company.name}).")
    except Exception as e:
        print(f"ERROR: Failed to add test user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_test_user()
