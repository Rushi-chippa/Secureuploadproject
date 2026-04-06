from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        try:
            # PostgreSQL syntax to check column
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='products' AND column_name='low_stock_threshold'")).fetchone()
            if not result:
                print("Adding column low_stock_threshold to products table...")
                conn.execute(text("ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER DEFAULT 10"))
                conn.commit()
                print("Migration successful.")
            else:
                print("Column low_stock_threshold already exists.")
        except Exception as e:
            print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
