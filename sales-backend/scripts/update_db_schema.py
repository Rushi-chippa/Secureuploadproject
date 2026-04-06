from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

def update_schema():
    with engine.connect() as conn:
        print("Checking for missing columns in 'users' table...")
        
        # Check if reset_token already exists
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='reset_token'"))
        if not result.fetchone():
            print("Adding 'reset_token' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR"))
            conn.commit()
            print("reset_token added.")
        
        # Check if reset_token_expires already exists
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='reset_token_expires'"))
        if not result.fetchone():
            print("Adding 'reset_token_expires' column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP"))
            conn.commit()
            print("reset_token_expires added.")

if __name__ == "__main__":
    try:
        update_schema()
        print("Schema update complete!")
    except Exception as e:
        print(f"Error updating schema: {e}")
