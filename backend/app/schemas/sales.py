from pydantic import BaseModel
from datetime import date

class SaleItemCreate(BaseModel):
    product_name: str
    quantity: float
    rate: float

class SaleBillCreate(BaseModel):
    customer_name: str
    bill_date: date
    rate_perliter: float
    items: list[SaleItemCreate]