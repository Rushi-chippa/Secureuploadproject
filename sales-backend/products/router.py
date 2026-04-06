from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import utils, models as auth_models

# --- Models ---
class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, index=True, nullable=True)
    category = Column(String)
    price = Column(Float)
    quantity = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=10)
    status = Column(String, default="active")
    description = Column(String, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

# --- Schemas ---
class ProductBase(BaseModel):
    name: str
    sku: Optional[str] = None
    category: str
    price: float
    quantity: int = 0
    low_stock_threshold: int = 10
    status: str = "active"
    description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Router ---
router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)

@router.get("/", response_model=List[ProductResponse])
def get_products(
    db: Session = Depends(get_db), 
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    return db.query(Product).filter(Product.company_id == current_user.company_id).all()

@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate, 
    db: Session = Depends(get_db), 
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    if current_user.role != "manager":
         raise HTTPException(status_code=403, detail="Only managers can add products")

    new_product = Product(**product.dict(), company_id=current_user.company_id)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_update: ProductCreate,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can update products")
    
    product = db.query(Product).filter(Product.id == product_id, Product.company_id == current_user.company_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_update.dict().items():
        setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: auth_models.User = Depends(utils.get_current_active_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can delete products")
    
    product = db.query(Product).filter(Product.id == product_id, Product.company_id == current_user.company_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}
