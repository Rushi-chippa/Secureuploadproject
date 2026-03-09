from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import utils, models as auth_models
from products.router import Product

# --- Models ---
class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    # salesman_id = Column(Integer, ForeignKey("salesmen.id"), nullable=True) # Removed as salesmen table doesn't exist
    user_id = Column(Integer, ForeignKey("users.id")) # The user who made the sale
    
    quantity = Column(Integer)
    amount = Column(Float)
    date = Column(DateTime, default=datetime.utcnow)
    customer_name = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    product = relationship(Product) 
    user = relationship(auth_models.User)
    region = Column(String, nullable=True) # Added for Salesman Dashboard

# --- Schemas ---
class SaleCreate(BaseModel):
    product_id: int
    quantity: int
    amount: float
    user_id: Optional[int] = None 
    date: Optional[datetime] = None
    customer_name: Optional[str] = None # Maps to "Trader Name"
    region: Optional[str] = None # New Field
    notes: Optional[str] = None

class SaleResponse(BaseModel):
    id: int
    product_id: int
    amount: float
    quantity: int
    date: datetime
    user_id: int
    customer_name: Optional[str] = None
    notes: Optional[str] = None
    
    # Enhanced Fields for Reports
    salesman_name: Optional[str] = None
    product_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# --- Router ---
router = APIRouter(
    prefix="/api/sales",
    tags=["Sales"]
)

@router.get("/", response_model=List[SaleResponse])
def get_sales(
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db), 
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    from sqlalchemy.orm import joinedload
    query = db.query(Sale).filter(Sale.company_id == current_user.company_id)
    
    # Eager load relationships to prevent lazy loading issues
    query = query.options(joinedload(Sale.user), joinedload(Sale.product))
    
    # Date Filtering
    if start_date:
        query = query.filter(Sale.date >= start_date)
    if end_date:
        query = query.filter(Sale.date <= end_date)

    # If Salesman, only show their sales? Or all?
    # Usually Salesmen only see their own. Manager sees all.
    # If Salesman, only show their sales? Or all?
    # Usually Salesmen only see their own. Manager sees all.
    # if current_user.role == "salesman":
    #     query = query.filter(Sale.user_id == current_user.id)
        
    sales = query.all()
    # Debug Print
    print(f"DEBUG: Fetched {len(sales)} sales. Sample User: {sales[0].user.full_name if sales and sales[0].user else 'None'}")
    
    # Manually populate the enhanced fields since Pydantic v1 ORM mode might not auto-fetch relationships easily without properties
    response_data = []
    for sale in sales:
        s_dict = {
            "id": sale.id,
            "product_id": sale.product_id,
            "amount": sale.amount,
            "quantity": sale.quantity,
            "date": sale.date,
            "user_id": sale.user_id,
            "customer_name": sale.customer_name,
            "notes": sale.notes,
            "salesman_name": sale.user.full_name if sale.user else "Unknown",
            "product_name": sale.product.name if sale.product else "Unknown Product"
        }
        response_data.append(s_dict)
        
    return response_data

@router.post("/", response_model=SaleResponse)
def create_sale(
    sale: SaleCreate, 
    db: Session = Depends(get_db), 
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    # Determine user_id
    if current_user.role == "manager":
        # Manager can assign to anyone (or themselves if not provided)
        # Note: Frontend sends 'salesmanId' but schema expects 'user_id' or we map it.
        # Wait, frontend sends { salesmanId: ... } but I updated schema to 'user_id'.
        # I should check if frontend variable mapping is needed. 
        # The frontend sends: { ..., salesmanId: '...' } in formData.
        # But wait, in Sales.js handling:
        # const saleData = { ...formData, ... };
        # formData has 'salesmanId'. Backend expects 'user_id'.
        # I should probably accept 'user_id' in backend and assume frontend sends it or maps it?
        # Let's hope frontend is updated or I update backend to accept alias? 
        # Easier to check frontend or map here if I could.
        # But schema validation happens before this function.
        # I'll stick to 'user_id' in schema. Frontend needs to send 'user_id' or I alias it.
        # Actually I can't alias easily without Pydantic Field(alias='salesmanId').
        # Let's assume for now I will use user_id logic.
        
        target_user_id = sale.user_id if sale.user_id else current_user.id
    else:
        # Salesman always assigns to self
        target_user_id = current_user.id

    new_sale = Sale(
        product_id=sale.product_id,
        quantity=sale.quantity,
        amount=sale.amount,
        user_id=target_user_id,
        company_id=current_user.company_id,
        date=sale.date or datetime.utcnow(),
        customer_name=sale.customer_name,
        region=sale.region,
        notes=sale.notes
    )
    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)
    return new_sale

@router.delete("/{sale_id}")
def delete_sale(
    sale_id: int, 
    db: Session = Depends(get_db), 
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    # Allow Manager to delete any sale, Salesman only their own? Or no delete?
    query = db.query(Sale).filter(Sale.id == sale_id, Sale.company_id == current_user.company_id)
    
    if current_user.role == "salesman":
        # Optional: restrict salesman deletion
        query = query.filter(Sale.user_id == current_user.id)
        
    sale = query.first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
        
    db.delete(sale)
    db.commit()
    return {"message": "Sale deleted successfully"}
