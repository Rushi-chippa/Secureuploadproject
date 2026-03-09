from sqlalchemy import create_engine, text
from database import DATABASE_URL

def check_specific_user():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        email = "rushichippa7350@gmail.com"
        result = conn.execute(text("SELECT id, email, role, company_id FROM users WHERE email = :email"), {"email": email})
        user = result.fetchone()
        if user:
            print(f"User: {user.email}, Role: {user.role}, Company: {user.company_id}")
            
            # Check categories for this company
            cats = conn.execute(text("SELECT * FROM categories WHERE company_id = :cid"), {"cid": user.company_id})
            print(f"Categories for Company {user.company_id}:")
            for c in cats:
                print(f" - {c.id}: {c.name}")
        else:
            print(f"User {email} not found")

if __name__ == "__main__":
    check_specific_user()
