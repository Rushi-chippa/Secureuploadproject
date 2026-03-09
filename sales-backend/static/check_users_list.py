from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import DATABASE_URL
from auth.models import User

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

users = db.query(User).all()
print(f"Total Users: {len(users)}")
for user in users:
    print(f"ID: {user.id} | Name: {user.full_name} | Role: {user.role} | Company: {user.company_id}")
