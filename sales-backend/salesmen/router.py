from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import utils, models as auth_models

# --- Schemas ---
class SalesmanBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    region: Optional[str] = None
    target: Optional[int] = None
    joinDate: Optional[str] = None # For frontend compatibility, though we store created_at

class SalesmanCreate(SalesmanBase):
    pass

class SalesmanResponse(SalesmanBase):
    id: int
    created_at: datetime
    monthly_targets: List[Dict[str, Any]] = []
    
    class Config:
        from_attributes = True

# --- Router ---
router = APIRouter(
    prefix="/api/salesmen",
    tags=["Salesmen"]
)

@router.get("/", response_model=List[SalesmanResponse])
def get_salesmen(
    db: Session = Depends(get_db), 
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    # Fetch Users with role 'salesman' in the same company
    users = db.query(auth_models.User).filter(
        auth_models.User.company_id == current_user.company_id,
        auth_models.User.role == "salesman"
    ).all()
    
    # Map Users to SalesmanResponse
    salesmen = []
    for user in users:
        monthly_targets_list = [{"month": t.month, "target_amount": t.target_amount} for t in user.monthly_targets]
        salesmen.append({
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "region": user.region,
            "target": user.sales_target,
            "monthly_targets": monthly_targets_list,
            "joinDate": user.created_at.strftime("%Y-%m-%d"),
            "created_at": user.created_at
        })
    
    return salesmen

@router.post("/", response_model=SalesmanResponse)
def create_salesman(
    salesman: SalesmanCreate, 
    db: Session = Depends(get_db), 
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    # Only Managers can add salesmen?
    if current_user.role != "manager":
         raise HTTPException(status_code=403, detail="Only managers can add salesmen")

    # Check email uniqueness
    user_exists = db.query(auth_models.User).filter(auth_models.User.email == salesman.email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Create User with role 'salesman'
    # We need a default password or generate one?
    # For now, let's set a default password 'password123' which they should change
    hashed_password = utils.get_password_hash("password123")
    
    new_user = auth_models.User(
        email=salesman.email,
        full_name=salesman.name,
        hashed_password=hashed_password,
        role="salesman",
        company_id=current_user.company_id,
        phone=salesman.phone,
        region=salesman.region,
        sales_target=salesman.target
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Set the monthly target for the current month if target is provided
    if salesman.target is not None:
        current_month = datetime.utcnow().strftime("%Y-%m")
        mt = auth_models.MonthlyTarget(user_id=new_user.id, month=current_month, target_amount=salesman.target)
        db.add(mt)
        db.commit()

    monthly_targets_list = [{"month": t.month, "target_amount": t.target_amount} for t in new_user.monthly_targets]
    
    return {
        "id": new_user.id,
        "name": new_user.full_name,
        "email": new_user.email,
        "phone": new_user.phone,
        "region": new_user.region,
        "target": new_user.sales_target,
        "monthly_targets": monthly_targets_list,
        "joinDate": new_user.created_at.strftime("%Y-%m-%d"),
        "created_at": new_user.created_at
    }

@router.put("/{salesman_id}", response_model=SalesmanResponse)
def update_salesman(
    salesman_id: int,
    salesman_data: SalesmanCreate,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    # Allow Manager OR the Salesman themselves to update
    if current_user.role != "manager" and current_user.id != salesman_id:
         raise HTTPException(status_code=403, detail="Only managers or the user themselves can update profile")
         
    user = db.query(auth_models.User).filter(
        auth_models.User.id == salesman_id,
        auth_models.User.company_id == current_user.company_id,
        auth_models.User.role == "salesman"
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Salesman not found")
        
    user.full_name = salesman_data.name
    user.email = salesman_data.email
    user.phone = salesman_data.phone
    user.region = salesman_data.region
    user.sales_target = salesman_data.target
    
    db.commit()
    db.refresh(user)

    monthly_targets_list = [{"month": t.month, "target_amount": t.target_amount} for t in user.monthly_targets]
    
    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "region": user.region,
        "target": user.sales_target,
        "monthly_targets": monthly_targets_list,
        "joinDate": user.created_at.strftime("%Y-%m-%d"),
        "created_at": user.created_at
    }

class TargetUpdate(BaseModel):
    month: str
    target: int

@router.post("/{salesman_id}/target")
def set_monthly_target(
    salesman_id: int,
    target_data: TargetUpdate,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    if current_user.role != "manager" and current_user.id != salesman_id:
         raise HTTPException(status_code=403, detail="Only managers or users themselves can set targets")
    
    user = db.query(auth_models.User).filter(auth_models.User.id == salesman_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    mt = db.query(auth_models.MonthlyTarget).filter(
        auth_models.MonthlyTarget.user_id == salesman_id,
        auth_models.MonthlyTarget.month == target_data.month
    ).first()
    
    if mt:
        mt.target_amount = target_data.target
    else:
        mt = auth_models.MonthlyTarget(user_id=salesman_id, month=target_data.month, target_amount=target_data.target)
        db.add(mt)
        
    db.commit()
    return {"message": "Success", "month": target_data.month, "target_amount": target_data.target}

@router.delete("/{salesman_id}")
def delete_salesman(
    salesman_id: int,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    if current_user.role != "manager":
         raise HTTPException(status_code=403, detail="Only managers can delete salesmen")
         
    user = db.query(auth_models.User).filter(
        auth_models.User.id == salesman_id,
        auth_models.User.company_id == current_user.company_id,
        auth_models.User.role == "salesman"
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Salesman not found")
        
    db.delete(user)
    db.commit()
    
    return {"message": "Salesman deleted"}
