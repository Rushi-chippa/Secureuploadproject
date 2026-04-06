import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
# Import all models to ensure they are registered with SQLAlchemy Base
from auth import models as auth_models
from salesmen import router as salesmen_models # Salesman is in router.py?? No, it was in salesmen/router.py but I should move models to models.py if I want clean structure. 
# Wait, I defined standard structure: salesmen/router.py has the model inside it? 
# In my write_to_file for salesmen/router.py, I included "class Salesman(Base): ..."
# So importing the router module will register the model.
# I will import routers
from auth import router as auth_router
from products import router as products_router
from salesmen import router as salesmen_router
from sales import router as sales_router
from analytics import router as analytics_router
from dashboard import router as dashboard_router
from categories import router as categories_router
from customers import router as customers_router
from ai_assistant import router as ai_assistant
from auth import utils

# Create Tables
# This will create tables for all imported models (Auth, Salesmen, Products, Sales)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sales Portal Backend", version="1.0.0")

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Debug Middleware
from fastapi import Request
import sys

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"DEBUG MIDDLEWARE: {request.method} {request.url}")
    sys.stdout.flush()
    
    # Try to consume body
    # transform body to bytes to print it, then restore it for the next handler
    # Note: Consuming body in middleware can be tricky in FastAPI/Starlette
    # But for debugging 400s it's useful.
    
    response = await call_next(request)
    return response

# Include Routers
app.include_router(auth_router.router)
app.include_router(products_router.router)
app.include_router(salesmen_router.router)
app.include_router(sales_router.router)
app.include_router(analytics_router.router)
app.include_router(dashboard_router.router)
app.include_router(categories_router.router)
app.include_router(customers_router.router)
app.include_router(ai_assistant.router)

from fastapi.staticfiles import StaticFiles
import os

# Create static/logos directory if not exists
os.makedirs("static/logos", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def read_root():

    return {
        "message": "Sales Portal Backend is running with DB!", 
        "docs": "/docs"
    }

@app.get("/api/predict-sales")
def get_prediction(
    month: str = None,
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    """
    Returns historical data and future predictions based on DB data for the user's company or individual user.
    """
    try:
        from sales_predictor import SalesPredictor
        import datetime
        from calendar import monthrange

        predictor = SalesPredictor()
        user_id = current_user.id if current_user.role == "salesman" else None

        pass_end_date = None
        if month:
            try:
                year, m = map(int, month.split('-'))
                end_date_day = monthrange(year, m)[1]
                pass_end_date = datetime.datetime(year, m, end_date_day, 23, 59, 59)
            except Exception as e:
                print(f"Invalid month forecast format: {month}")

        return predictor.get_full_forecast(company_id=current_user.company_id, user_id=user_id, end_date=pass_end_date)
    except Exception as e:
        print(f"Error generating prediction: {e}")
        return {
            'history': [],
            'forecast': [],
            'summary': {'message': f"Error generating prediction: {str(e)}"}
        }
    



if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
