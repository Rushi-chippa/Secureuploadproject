import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine
from sqlalchemy import text

def add_avatar_column():
    db = SessionLocal()
    try:
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR"))
            print("Added avatar_url column to users table successfully")
        except Exception as e:
            print(f"avatar_url column might already exist: {e}")
            db.rollback()
            
        db.commit()
        print("Migration completed successfully")
    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_avatar_column()
