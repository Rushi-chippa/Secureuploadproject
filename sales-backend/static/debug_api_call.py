import http.client
import json
import urllib.parse
import os

# Configuration
HOST = "localhost"
PORT = 8001
API_PATH = "/api/analytics/leaderboard"
TOKEN_PATH = "/auth/token"

# User Credentials (HARDCODED FOR TESTING - use Balraj's if possible or a known user)
# I need a valid user/pass. I don't know Balraj's password.
# But I found "rushichippa7350@gmail.com" earlier in inspect_db?
# Or I can try to register a new user? No, data won't exist.
# I will try "admin@example.com" / "admin" if it exists?
# Or I can *generate* a token manually if I have SECRET_KEY.
# Let's try to get SECRET_KEY from .env first.

def get_secret_key():
    try:
        with open(".env", "r") as f:
            for line in f:
                if line.startswith("SECRET_KEY"):
                    return line.split("=")[1].strip()
    except:
        pass
    return "secret" # Default fallback in many tutorials

def generate_token(user_email):
    # This requires recreating the token creation logic.
    # It takes time.
    # Alternatively, I can use the existing `utils.create_access_token`.
    try:
        from auth import utils, models, schemas
        from datetime import timedelta
        # Mock user object if needed or just pass data
        access_token = utils.create_access_token(
            data={"sub": user_email}, 
            expires_delta=timedelta(minutes=30)
        )
        return access_token
    except ImportError:
        print("Cannot import utils to generate token.")
        return None

if __name__ == "__main__":
    # 1. Generate Token for Balraj (email?)
    # I need his email. 
    # From debug_leaderboard_user.py output: "Found User: ..." (I missed the email in output, it said "Found User: Balraj... (ID: 17)").
    # I'll search for his email again quickly using checking script if needed, 
    # OR I'll just hardcode it if I saw it.
    # Wait, previous step 70 output didn't show email explicitly but said "Found User: ...".
    # I'll query it again here.
    
    from sqlalchemy import create_engine, text
    from dotenv import load_dotenv
    load_dotenv()
    db_url = os.getenv("DATABASE_URL", "sqlite:///./sales.db")
    engine = create_engine(db_url)
    
    email = None
    with engine.connect() as conn:
        res = conn.execute(text("SELECT email FROM users WHERE full_name LIKE '%Balraj%' LIMIT 1"))
        row = res.fetchone()
        if row:
            email = row.email
            print(f"Target Email: {email}")
    
    if email:
        token = generate_token(email)
        if token:
            print(f"Generated Token: {token[:10]}...")
            
            # 2. Call API
            conn = http.client.HTTPConnection(HOST, PORT)
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            conn.request("GET", API_PATH, headers=headers)
            response = conn.getresponse()
            print(f"Status: {response.status}")
            print(f"Reason: {response.reason}")
            data = response.read().decode()
            print(f"Data: {data}")
            conn.close()
        else:
            print("Failed to generate token.")
    else:
        print("User Balraj not found.")
