from pydantic import BaseModel
from datetime import date

class MilkEntryCreate(BaseModel):
    customer_no: int
    date: date
    session: str
    liters: float
    rate: float