from sqlalchemy import create_engine, text
from database import DATABASE_URL

def check_user():
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            target_email = "rushichippa7350@gmail.com"
            result = conn.execute(text("SELECT id, email, role, company_id, hashed_password FROM users WHERE email = :email"), {"email": target_email})
            user = result.fetchone()
            
            with open("user_check_result.txt", "w") as f:
                if user:
                    f.write(f"USER_FOUND: YES\n")
                    f.write(f"ID: {user.id}\n")
                    f.write(f"Email: {user.email}\n")
                    f.write(f"Role: {user.role}\n")
                    f.write(f"CompanyID: {user.company_id}\n")
                    f.write(f"HashStart: {user.hashed_password[:15]}...\n")
                else:
                    f.write(f"USER_FOUND: NO\n")
                    f.write(f"Target: {target_email}\n")
                    
                    f.write("\nFirst 5 Users:\n")
                    users = conn.execute(text("SELECT id, email FROM users LIMIT 5"))
                    for u in users:
                        f.write(f"ID: {u.id}, Email: {u.email}\n")
                        
    except Exception as e:
        with open("user_check_result.txt", "w") as f:
            f.write(f"ERROR: {str(e)}\n")

if __name__ == "__main__":
    check_user()
