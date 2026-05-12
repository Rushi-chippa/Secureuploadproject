from pydantic import BaseModel
from typing import Optional

class CompanyCreate(BaseModel):
    company_name: str
    industry: str
    company_size: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    
    # Admin User Data
    full_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

class SalesmanRegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    employee_id: str
    company_id: int

class CompanyResponse(BaseModel):
    name: str
    id: int
    logo_url: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    company: Optional[CompanyResponse] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    otp: str
    new_password: str
