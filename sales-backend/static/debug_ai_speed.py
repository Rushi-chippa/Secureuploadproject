
import asyncio
import time
import os
import sys
from database import SessionLocal
from ai_assistant.service import AIService
from auth import models

# Redirect stdout to file to avoid truncation
sys.stdout = open('debug_log.txt', 'w', encoding='utf-8')
sys.stderr = sys.stdout

if not os.getenv("GEMINI_API_KEY"):
    print("Warning: GEMINI_API_KEY not found in env.")

async def main():
    db = SessionLocal()
    try:
        user = db.query(models.User).first()
        if not user:
            print("No user found.")
            return

        print(f"Testing with user: {user.email}")
        service = AIService(db, user)

        print("Measuring get_context() (First Call)...", flush=True)
        # get_context is sync again
        start = time.time()
        context = service.get_context()
        print(f"Context generation took: {time.time() - start:.4f}s", flush=True)
        print(f"Context length: {len(context)} chars", flush=True)

        print("Measuring get_context() (Second Call - Cached)...", flush=True)
        start = time.time()
        context = service.get_context()
        print(f"Cached context generation took: {time.time() - start:.4f}s", flush=True)

        print("Measuring get_response()...", flush=True)
        # get_response is async
        start = time.time()
        response = await service.get_response("Hi")
        print(f"Response generation took: {time.time() - start:.4f}s", flush=True)
        print(f"Response length: {len(response)} chars", flush=True)
        print(f"Response: {response}", flush=True)

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(main())
