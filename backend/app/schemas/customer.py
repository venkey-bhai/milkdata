from pydantic import BaseModel

class CustomerCreate(BaseModel):
    customer_no: int
    name: str
    address: str
    phone: str
    milk_type: str
    price_per_liter: float