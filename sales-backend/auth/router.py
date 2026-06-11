from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from auth import models, utils, schemas
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import traceback
import shutil
import os
import uuid
from database import engine
from utils import dynamic_tables

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Shared Dependency for getting current user (Circular dependency avoidance)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = utils.jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except utils.JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=schemas.Token)
def register(
    company_name: str = Form(...),
    industry: str = Form(...),
    email: str = Form(...),
    full_name: str = Form(...),
    password: str = Form(...),
    phone: str = Form(None),
    address: str = Form(None),
    company_size: str = Form(None),
    logo: UploadFile = File(None),
    plan: str = Form("free"),
    db: Session = Depends(get_db)
):
    try:
        # 1. Check if user already exists
        user_exists = db.query(models.User).filter(models.User.email == email).first()
        if user_exists:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        
        # 2. Handle Logo Upload
        logo_url = None
        print(f"DEBUG: Received logo: {logo}")
        if logo:
            print(f"DEBUG: Logo filename: {logo.filename}")
            try:
                # Create static/logos directory if not exists (redundant if main.py does it but safe)
                os.makedirs("static/logos", exist_ok=True)
                
                file_extension = logo.filename.split(".")[-1]
                filename = f"{uuid.uuid4()}.{file_extension}"
                file_path = f"static/logos/{filename}"
                
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(logo.file, buffer)
                
                logo_url = f"/static/logos/{filename}"
            except Exception as e:
                print(f"Error saving logo: {e}")
                # Continue without logo if upload fails? Or raise error? 
                # Let's log and continue for now.

        # 3. Create Company
        new_company = models.Company(
            name=company_name,
            industry=industry,
            phone=phone,
            address=address,
            company_size=company_size,
            logo_url=logo_url,
            subscription_plan=plan
        )
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        
        # 4. Create Admin User (Manager)
        hashed_password = utils.get_password_hash(password)
        new_user = models.User(
            email=email,
            full_name=full_name,
            hashed_password=hashed_password,
            role="manager",
            company_id=new_company.id
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Send subscription confirmation & welcome invoice email
        try:
            from utils.email_utils import send_welcome_invoice_email
            if plan == "enterprise":
                plan_name = "Enterprise Plan"
                amount_str = "₹2,999.00/mo"
            elif plan == "professional":
                plan_name = "Professional Plan"
                amount_str = "₹999.00/mo"
            else:
                plan_name = "Free Plan"
                amount_str = "₹0.00 (Forever Free)"
                
            send_welcome_invoice_email(
                email=new_user.email,
                full_name=new_user.full_name,
                company_name=new_company.name,
                plan_name=plan_name,
                amount=amount_str
            )
        except Exception as email_err:
            print(f"ERROR sending welcome email invoice: {email_err}")

        # Simulate SMS text notification
        print("\n" + "="*60)
        print(f"📱 [SIMULATED SMS to {phone or 'N/A'}]")
        print(f"Congratulations {full_name}! Your company '{company_name}' has successfully registered on the '{plan.upper()}' plan.")
        print(f"A welcome email with your active receipt/invoice has been dispatched to {email}.")
        print("="*60 + "\n")
        
        # Dynamic table creation removed. Salesmen reuse Users table.

        # 6. Generate Token
        access_token = utils.create_access_token(
            data={"sub": new_user.email, "role": new_user.role, "company_id": new_company.id}
        )
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": {
                "id": new_user.id,
                "name": new_user.full_name,
                "email": new_user.email,
                "role": new_user.role,
                "avatar": new_user.avatar_url
            },
            "company": {
                "name": new_company.name,
                "id": new_company.id,
                "logo_url": new_company.logo_url
            }
        }
    except HTTPException:
        raise 
    except Exception as e:
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Internal Server Error: {str(e)}"
        )

import sys

@router.post("/login")
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    print(f"DEBUG: Login attempt for {login_data.email}")
    print(f"DEBUG: Login payload: {login_data.dict()}")
    sys.stdout.flush()
    
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user:
        print(f"DEBUG: User not found: {login_data.email}")
        sys.stdout.flush()
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not utils.verify_password(login_data.password, user.hashed_password):
        print(f"DEBUG: Password verification failed for {login_data.email}")
        print(f"DEBUG: Hashed in DB: {user.hashed_password}")
        print(f"DEBUG: Input Password: {login_data.password}")
        sys.stdout.flush()
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token = utils.create_access_token(
        data={"sub": user.email, "role": user.role, "company_id": user.company_id}
    )
    
    company_data = None
    if user.company:
        company_data = {
            "name": user.company.name,
            "id": user.company.id,
            "logo_url": user.company.logo_url
        }

    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
            "avatar": user.avatar_url
        },
        "company": company_data
    }

@router.get("/public-stats")
def get_public_stats(db: Session = Depends(get_db)):
    try:
        from sales.router import Sale
        from sqlalchemy import func
        companies_count = db.query(models.Company).count()
        salesmen_count = db.query(models.User).filter(models.User.role == "salesman").count()
        total_sales_amount = db.query(func.sum(Sale.amount)).scalar() or 0.0
        return {
            "companies_count": companies_count,
            "salesmen_count": salesmen_count,
            "total_sales_amount": float(total_sales_amount),
            "uptime": "99.9%"
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "companies_count": 0,
            "salesmen_count": 0,
            "total_sales_amount": 0.0,
            "uptime": "99.9%"
        }

@router.get("/companies", response_model=list[schemas.CompanyResponse])
def get_companies(db: Session = Depends(get_db)):
    return db.query(models.Company).all()

@router.post("/register-salesman", response_model=schemas.Token)
def register_salesman(salesman_data: schemas.SalesmanRegisterRequest, db: Session = Depends(get_db)):
    try:
        # Check if user already exists
        user_exists = db.query(models.User).filter(models.User.email == salesman_data.email).first()
        if user_exists:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        # Check if Company exists
        company = db.query(models.Company).filter(models.Company.id == salesman_data.company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        # Create Salesman User
        hashed_password = utils.get_password_hash(salesman_data.password)
        new_user = models.User(
            email=salesman_data.email,
            full_name=salesman_data.full_name,
            hashed_password=hashed_password,
            role="salesman",
            employee_id=salesman_data.employee_id,
            company_id=salesman_data.company_id
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Dynamic table insertion removed. Salesmen reuse Users table.

        # Generate Token
        access_token = utils.create_access_token(
            data={"sub": new_user.email, "role": new_user.role, "company_id": new_user.company_id}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": new_user.id,
                "name": new_user.full_name,
                "email": new_user.email,
                "role": new_user.role,
                "avatar": new_user.avatar_url
            },
            "company": {
                "name": company.name,
                "id": company.id,
                "logo_url": company.logo_url
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

from utils.email_utils import send_reset_password_email
import secrets
import random
from datetime import datetime, timedelta

@router.post("/forgot-password")
def forgot_password(request: schemas.ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Clean email to prevent whitespace or case issues
    clean_email = request.email.strip().lower()
    
    user = db.query(models.User).filter(models.User.email == clean_email).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account found with this email address. Please check and try again."
        )
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    user.reset_token = otp  # Reusing reset_token column to store OTP
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=10)
    
    db.commit()
    
    # Send Email in Background
    from utils.email_utils import send_reset_password_email
    background_tasks.add_task(send_reset_password_email, user.email, otp)
    
    return {"message": "If this email is registered, an OTP will be sent shortly."}

@router.post("/reset-password")
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.reset_token == request.otp,
        models.User.reset_token_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Update Password
    user.hashed_password = utils.get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    
    db.commit()
    
    return {"message": "Password updated successfully"}

@router.put("/profile")
def update_profile(
    full_name: str = Form(None),
    phone: str = Form(None),
    avatar: UploadFile = File(None),
    remove_avatar: str = Form("false"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_active_user)
):
    try:
        if full_name is not None:
            current_user.full_name = full_name
        if phone is not None:
            current_user.phone = phone
            
        if remove_avatar.lower() == 'true':
            current_user.avatar_url = None
            
        if avatar:
            os.makedirs("static/avatars", exist_ok=True)
            file_extension = avatar.filename.split(".")[-1]
            filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = f"static/avatars/{filename}"
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(avatar.file, buffer)
            
            current_user.avatar_url = f"/static/avatars/{filename}"
            
        db.commit()
        db.refresh(current_user)
        
        return {
            "message": "Profile updated successfully",
            "user": {
                "id": current_user.id,
                "name": current_user.full_name,
                "email": current_user.email,
                "role": current_user.role,
                "phone": current_user.phone,
                "company_id": current_user.company_id,
                "avatar": current_user.avatar_url
            }
        }
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
