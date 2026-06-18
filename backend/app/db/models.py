
import datetime

from sqlalchemy import Column, DateTime, Integer, String, Float, Date, ForeignKey,Boolean
from .database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, nullable=False)

    password = Column(String, nullable=False)

    # NEW FIELD
    role = Column(String, default="user")

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True)
    customer_no = Column(Integer, unique=True, index=True)  # NEW FIELD
    name = Column(String)
    address = Column(String)
    phone = Column(String)
    milk_type = Column(String)
    price_per_liter = Column(Float)
    
    status = Column(String(20), default="active")
    is_active = Column(Boolean, default=True)

class MilkEntry(Base):
    __tablename__ = "milk_entries"
    id = Column(Integer, primary_key=True)
    customer_id = Column( Integer,ForeignKey("customers.id", ondelete="CASCADE")) 
    date = Column(Date)
    session = Column(String)  # Morning / Evening
    liters = Column(Float)
    rate = Column(Float)
    total = Column(Float)
    customer = relationship("Customer")
    
class SaleBill(Base):
    __tablename__ = "sale_bills"

    id = Column(Integer, primary_key=True)
    customer_name = Column(String)

    bill_date = Column(Date)
    rate_perliter = Column(Float)
    total_amount = Column(Float)
    session = Column(String(20))

    items = relationship(
        "SaleItem",
        back_populates="bill",
        cascade="all, delete-orphan"
    )
    
class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True)

    bill_id = Column(
        Integer,
        ForeignKey("sale_bills.id")
    )

    product_name = Column(String)
    quantity = Column(Float)
    rate = Column(Float)
    amount = Column(Float)

    bill = relationship(
        "SaleBill",
        back_populates="items"
    )

    
class Loan(Base): 
    __tablename__ = "loans" 
    id = Column(Integer, primary_key=True, index=True)
    customer_no = Column( Integer, ForeignKey("customers.customer_no"), nullable=False ) 
    total_loan = Column( Float, default=0 )
    deducted_amount = Column( Float, default=0 )
    remaining_balance = Column( Float, default=0 ) 
    milk_sale_amount = Column( Float, default=0 ) 
    final_payable = Column( Float, default=0 ) 
    created_at = Column( DateTime, default=datetime.datetime.utcnow )